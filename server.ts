import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
// @ts-expect-error - ZipArchive is natively exported in archiver v8 but missing in older @types declarations
import { ZipArchive } from "archiver";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";

let firebaseDb: any = null;
let aiClient: GoogleGenAI | null = null;
let memoryDB = { accounts: [], phrases: [] };

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave de API do Gemini (GEMINI_API_KEY) está ausente. Configure-a no menu Settings > Secrets para usar a importação por Inteligência Artificial.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const firebaseApp = initializeApp(config);
    firebaseDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase Firestore initialized on backend successfully.");
  } else {
    console.log("No firebase-applet-config.json found, running in local-only mock mode.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase backend support, falling back to local files:", error);
}

// Helper to read database
async function readDB() {
  if (firebaseDb) {
    try {
      const accountsRef = doc(firebaseDb, "portal_data", "accounts");
      const phrasesRef = doc(firebaseDb, "portal_data", "phrases");

      const [accountsSnap, phrasesSnap] = await Promise.all([
        getDoc(accountsRef),
        getDoc(phrasesRef)
      ]);

      const data: any = { accounts: [], phrases: [] };
      if (accountsSnap.exists()) {
        data.accounts = accountsSnap.data().accounts || [];
      }
      if (phrasesSnap.exists()) {
        data.phrases = phrasesSnap.data().phrases || [];
      }

      return data;
    } catch (err) {
      console.error("Firestore read failed:", err);
    }
  }
  return memoryDB;
}

// Helper to write database
async function writeDB(data: any) {
  if (firebaseDb) {
    try {
      const accountsRef = doc(firebaseDb, "portal_data", "accounts");
      const phrasesRef = doc(firebaseDb, "portal_data", "phrases");

      await Promise.all([
        setDoc(accountsRef, { accounts: data.accounts || [] }),
        setDoc(phrasesRef, { phrases: data.phrases || [] })
      ]);
      console.log("Firestore database write succeeded.");
    } catch (err) {
      console.error("Firestore write failed:", err);
    }
  } else {
    memoryDB = data;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/sync", async (req, res) => {
    try {
      const db = await readDB();
      res.json(db);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    const { accounts } = req.body;
    if (!Array.isArray(accounts)) {
      return res.status(400).json({ error: "Invalid accounts array" });
    }
    try {
      const db = await readDB();
      db.accounts = accounts;
      await writeDB(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/phrases", async (req, res) => {
    const { phrases } = req.body;
    if (!Array.isArray(phrases)) {
      return res.status(400).json({ error: "Invalid phrases array" });
    }
    try {
      const db = await readDB();
      db.phrases = phrases;
      await writeDB(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai-import", async (req, res) => {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Por favor, forneça o arquivo em base64 e seu nome." });
    }

    try {
      let textContent = "";
      const buffer = Buffer.from(fileBase64, "base64");

      if (buffer.length > 2 * 1024 * 1024) {
        return res.status(400).json({ error: "O arquivo excede o limite de tamanho de segurança de 2MB." });
      }

      if (fileName.toLowerCase().endsWith(".docx")) {
        const mammothResult = await mammoth.extractRawText({ buffer });
        textContent = mammothResult.value;
      } else {
        textContent = buffer.toString("utf-8");
      }

      if (!textContent.trim()) {
        return res.status(400).json({ error: "O arquivo importado está vazio ou não possui texto legível." });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          `Analise os modelos de texto ou respostas padrão de suporte de TI importados do arquivo (${fileName}).
          
          Suas tarefas obrigatórias:
          1. Identifique cada resposta rápida, fraseologia ou modelo contido no texto.
          2. Formate e embeleze os textos. Preserve as quebras de linha essenciais e mantenha campos variáveis em colchetes como '[Nome]' ou '[Senha]'.
          3. Crie um 'title' (Título) curto e representativo em Português para cada item.
          4. Crie um 'subtitle' (Subtítulo) de no máximo 10 palavras explicando o contexto de uso do modelo.
          5. Escolha a melhor categoria para o item de forma estrita. Ela DEVE ser uma destas: 'N2 / N3', 'VPN', 'Senha & Reset', 'Acessos & Redes', 'Impressoras', 'Software', 'Terceiros', 'Tentativas & Pendente' ou 'Outros'. NÃO invente nenhuma outra categoria.
          6. Gere de 2 a 3 tags associadas, como 'senha', 'e-mail', 'redes', 'suporte'.
          
          Texto extraído do arquivo para processar:
          ${textContent}`
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short descriptive title" },
                subtitle: { type: Type.STRING, description: "Brief context explanation" },
                content: { type: Type.STRING, description: "The beautiful formatted text body with placeholders" },
                category: { 
                  type: Type.STRING, 
                  description: "Must be: 'N2 / N3' or 'VPN' or 'Senha & Reset' or 'Acessos & Redes' or 'Impressoras' or 'Software' or 'Terceiros' or 'Tentativas & Pendente' or 'Outros'" 
                },
                tags: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "2 to 3 tags" 
                }
              },
              required: ["title", "content", "category", "tags"]
            }
          }
        }
      });

      const text = response.text || "[]";
      let phrases = JSON.parse(text);

      if (!Array.isArray(phrases)) {
        phrases = [];
      }

      res.json({ phrases });
    } catch (err: any) {
      console.error("AI Import Error:", err);
      res.status(500).json({ error: err.message || "Erro desconhecido no processamento de IA." });
    }
  });

  app.post("/api/ai-export", async (req, res) => {
    const { phrases, mode } = req.body;
    if (!Array.isArray(phrases)) {
      return res.status(400).json({ error: "Por favor, forneça as fraseologias para exportar." });
    }

    try {
      if (mode === "ai_optimized") {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            `Utilizando Inteligência Artificial (Gemini), consolide e embeleze esta lista de fraseologias de suporte de TI em um único arquivo de texto de formato limpo (.txt) exportado para compartilhamento.
            
            Para cada item da lista (representado por Título, Categoria, Tags e Corpo de Texto):
            1. Formate de forma limpa e legível para um humano ler. Comece cada item com o título, depois inclua uma linha com a categoria descrita.
            2. Mantenha marcadores de substituição em colchetes como '[Nome]'.
            3. No final de CADA texto, crie exatamente UMA linha simples contendo as hashtags que ajudarão o importador a categorizar e taguear este texto no futuro (ex: #vpn #365 #senha #acessos). A primeira hashtag DEVE ser a categoria adaptada (com '#' e sem espaços/caracteres especiais, por exemplo: #SenhaReset, #VPN, #N2N3, #AcessosRedes, #Impressoras, #Software, #Terceiros, #TentativasPendente, #Outros) e depois hashtags adicionais.
            4. Separe cada item claramente usando uma linha tracejada longa de "--------------------------------------------------".

            Lista de fraseologias para exportar:
            ${JSON.stringify(phrases, null, 2)}`
          ]
        });

        const textOutput = response.text || "";
        res.json({ content: textOutput });
      } else {
        let textOutput = "";
        phrases.forEach((p: any) => {
          textOutput += `=== TÍTULO: ${p.title} ===\n`;
          if (p.subtitle) textOutput += `Subtítulo: ${p.subtitle}\n`;
          textOutput += `Categoria: ${p.category}\n`;
          textOutput += `Tags: ${(p.tags || []).join(", ")}\n\n`;
          textOutput += `${p.content}\n`;
          
          const catHashtag = "#" + p.category.normalize("NFD").replace(/[^a-zA-Z0-9]/g, "");
          const tagHashtags = (p.tags || []).map((t: string) => "#" + t.normalize("NFD").replace(/[^a-zA-Z0-9]/g, "")).join(" ");
          textOutput += `\n${catHashtag} ${tagHashtags}\n`;
          textOutput += `--------------------------------------------------\n\n`;
        });
        res.json({ content: textOutput });
      }
    } catch (err: any) {
      console.error("AI Export Error:", err);
      res.status(500).json({ error: err.message || "Erro desconhecido ao exportar com IA." });
    }
  });

  app.get("/api/download-zip", (req, res) => {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=portal-de-fraseologia.zip");

    const archive = new ZipArchive({
      zlib: { level: 9 },
    });

    archive.on("error", (err: any) => {
      console.error("ZIP packaging error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    archive.glob("**/*", {
      cwd: process.cwd(),
      ignore: [
        "node_modules/**",
        "dist/**",
        ".git/**",
        "db.json",
        "portal-de-fraseologia.zip",
        "**/.DS_Store",
      ],
      dot: true,
    });

    archive.finalize();
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
