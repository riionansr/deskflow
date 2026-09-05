import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
// @ts-expect-error - ZipArchive is natively exported in archiver v8 but missing in older @types declarations
import { ZipArchive } from "archiver";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import mammoth from "mammoth";

let firebaseDb: any = null;
let memoryDB = { accounts: [], phrases: [] };

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

  // Static assets from public folder (favicons, icons, web manifest)
  app.use(express.static(path.join(process.cwd(), "public")));
  app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public/favicon.ico"));
  });

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

  // Offline Document/Text Parser (No external AI dependency)
  app.post("/api/ai-import", async (req, res) => {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Por favor, forneça o arquivo em base64 e seu nome." });
    }

    try {
      let textContent = "";
      const buffer = Buffer.from(fileBase64, "base64");

      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "O arquivo excede o limite de tamanho de segurança de 5MB." });
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

      // Check if JSON
      const trimmed = textContent.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed);
          const list = Array.isArray(parsed) ? parsed : (parsed.phrases || [parsed]);
          if (Array.isArray(list) && list.length > 0) {
            const phrases = list.map((item: any) => ({
              title: item.title || item.nome || "Sem título",
              subtitle: item.subtitle || item.subtitulo || undefined,
              category: item.category || item.categoria || "Geral",
              content: item.content || item.texto || item.frase || "",
              tags: Array.isArray(item.tags) ? item.tags : []
            })).filter((p: any) => p.content.trim().length > 0);
            return res.json({ phrases });
          }
        } catch {
          // fallback to text splitting
        }
      }

      // Parse standard text blocks separated by dashed lines
      const blocks = textContent.split(/\r?\n\s*[-=_]{3,}\s*\r?\n/);
      const phrases: any[] = [];

      for (const block of blocks) {
        const lines = block.trim().split(/\r?\n/);
        if (lines.length === 0 || !lines[0].trim()) continue;

        let title = "";
        let category = "Geral";
        let subtitle: string | undefined = undefined;
        const tags: string[] = [];
        const contentLines: string[] = [];

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (/^===?\s*T[ÍI]TULO:\s*/i.test(trimmedLine)) {
            title = trimmedLine.replace(/^===?\s*T[ÍI]TULO:\s*/i, "").replace(/\s*===?$/, "").trim();
          } else if (/^CATEGORIA:\s*/i.test(trimmedLine)) {
            category = trimmedLine.replace(/^CATEGORIA:\s*/i, "").trim();
          } else if (/^SUBT[ÍI]TULO:\s*/i.test(trimmedLine)) {
            subtitle = trimmedLine.replace(/^SUBT[ÍI]TULO:\s*/i, "").trim();
          } else if (trimmedLine.startsWith("#")) {
            const foundHashtags = trimmedLine.match(/#[a-zA-Z0-9_\u00C0-\u00FF-]+/g) || [];
            foundHashtags.forEach(tag => {
              const clean = tag.replace(/^#/, "").trim();
              if (clean && !tags.includes(clean)) tags.push(clean);
            });
          } else {
            contentLines.push(line);
          }
        }

        const body = contentLines.join("\n").trim();
        if (body || title) {
          phrases.push({
            title: title || (body ? body.split("\n")[0].substring(0, 40) : "Sem título"),
            subtitle,
            category: category || "Geral",
            content: body,
            tags
          });
        }
      }

      res.json({ phrases });
    } catch (err: any) {
      console.error("Import Error:", err);
      res.status(500).json({ error: err.message || "Erro no processamento do arquivo." });
    }
  });

  // Offline export endpoint
  app.post("/api/ai-export", async (req, res) => {
    const { phrases } = req.body;
    if (!Array.isArray(phrases)) {
      return res.status(400).json({ error: "Por favor, forneça as fraseologias para exportar." });
    }

    try {
      let textOutput = "";
      phrases.forEach((p: any) => {
        const pTitle = p.title || "Sem título";
        const pCategory = p.category || "Outros";
        const pContent = p.content || "";
        const pTags = Array.isArray(p.tags) ? p.tags : [];

        textOutput += `=== TÍTULO: ${pTitle} ===\n`;
        if (p.subtitle) textOutput += `Subtítulo: ${p.subtitle}\n`;
        textOutput += `Categoria: ${pCategory}\n`;
        textOutput += `Tags: ${pTags.join(", ")}\n\n`;
        textOutput += `${pContent}\n`;
        
        const catHashtag = "#" + pCategory.normalize("NFD").replace(/[^a-zA-Z0-9]/g, "");
        const tagHashtags = pTags
          .filter((t: any) => typeof t === "string")
          .map((t: string) => "#" + t.normalize("NFD").replace(/[^a-zA-Z0-9]/g, ""))
          .join(" ");
        textOutput += `\n${catHashtag} ${tagHashtags}\n`;
        textOutput += `--------------------------------------------------\n\n`;
      });
      res.json({ content: textOutput });
    } catch (err: any) {
      console.error("Export Error:", err);
      res.status(500).json({ error: err.message || "Erro ao exportar fraseologias." });
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
