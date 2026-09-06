<div align="center">

<img src="https://raw.githubusercontent.com/riionansr/deskflow/main/assets/dflow_img.png" alt="DeskFlow" width="720">

# DeskFlow
**Produtividade operacional para Suporte de TI**

[🚀 Demo](https://deskflow-blush.vercel.app) · [📘 Manual do Usuário](https://github.com/riionansr/deskflow/blob/main/docs/DeskFlow_Manual_Completo.pdf) · [📦 Repositório](https://github.com/riionansr/deskflow)

</div>

---

## O problema

Analistas de N1/N2/N3 perdem tempo precioso reescrevendo as mesmas respostas, procurando o procedimento certo em wikis desatualizadas ou copiando trechos de chamados antigos — tudo isso no meio de um atendimento que já está correndo contra o SLA.

## A solução

O **DeskFlow** é um portal leve e ágil para centralizar, organizar e acelerar o uso de fraseologias, scripts e procedimentos operacionais durante o atendimento. Ele roda inteiramente no navegador, foi desenhado para ficar fixado na barra lateral ao lado do sistema de chamados, e devolve a resposta certa em segundos — com busca instantânea, tags e assinatura automática.

## Principais recursos

- 🔎 **Busca instantânea por título, categoria e hashtags** (`#VPN`, `#Senha`, `#Impressora`...)
- 📋 **Cópia em 1 clique** com assinatura pessoal anexada automaticamente
- 📌 **Fixação de frases** mais usadas no topo do catálogo
- 🗂️ **Categorias e tags** personalizáveis por fluxo de atendimento
- 📥 **Importação de documentos** (.txt, .docx, .json) com leitura estrutural 100% local
- 📤 **Exportação padronizada (.txt)** pronta para wikis, Git ou manuais operacionais
- 🧭 **Modo barra lateral** — uso lado a lado com o sistema de chamados e assistentes de IA do navegador

## Privacidade & BYOD

O DeskFlow segue o modelo **local-first (BYOD — Bring Your Own Data)**: por padrão, os dados residem no `localStorage` do navegador do analista. Não há BYOK nem qualquer integração com IA generativa — toda leitura e importação de documentos é feita por algoritmos determinísticos, sem enviar conteúdo a serviços externos. A sincronização em nuvem (Firestore) é **opcional** e serve apenas para compartilhar o catálogo entre a equipe.

> Detalhes completos de funcionamento, privacidade e integrações estão no [Manual do Usuário](https://github.com/riionansr/deskflow/blob/main/docs/DeskFlow_Manual_Completo.pdf).

## Stack

- **Frontend:** TypeScript, 100% client-side
- **Armazenamento:** `localStorage` (local-first)
- **Sincronização opcional:** Firestore
- **Deploy:** Vercel

## Documentação

Este README cobre a visão de produto e engenharia. Para o passo a passo operacional completo — workflow de atendimento, importação/exportação e configuração da barra lateral em Opera, Firefox, Edge e Chrome — consulte o manual em `/docs`:

```
docs/
└── DeskFlow_Manual_Completo.pdf   # Manual operacional + guia de produtividade (barra lateral)
```

## Roadmap

Ideias em avaliação para as próximas versões — acompanhe as *issues* do repositório para o status atualizado:

- [ ] Espaços/times com catálogos segmentados
- [ ] Exportação direta para Confluence/Notion
- [ ] Atalhos de teclado para busca e cópia

## Como usar

O DeskFlow é 100% web — basta acessar o [link da aplicação](https://deskflow-blush.vercel.app) e começar a usar. Para fixá-lo na barra lateral do seu navegador (recomendado), veja o passo a passo no manual acima.

---

<div align="center">
DeskFlow Community • Feito para quem vive de Service Desk
</div>
