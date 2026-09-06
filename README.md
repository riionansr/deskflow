<div align="center">

<img src="assets/dflow_img.png" alt="DeskFlow" width="720">

# DeskFlow
**Operational productivity for IT Support**

[🚀 Demo](https://deskflow-blush.vercel.app) · [📘 User Manual](docs/DeskFlow_Manual_Completo.pdf) · [📦 Repository](https://github.com/riionansr/deskflow)

</div>

---

## The problem

N1/N2/N3 analysts lose precious time rewriting the same replies, digging through outdated wikis for the right procedure, or copy-pasting from old tickets — all while a live case is already running against the SLA clock.

## The solution

**DeskFlow** is a lightweight, fast portal to centralize, organize and speed up the use of standardized phrases, scripts and operational procedures during IT support. It runs entirely in the browser, is built to sit in your browser's sidebar next to your ticketing system, and gets you the right answer in seconds — with instant search, tags and automatic signature.

## Key features

- 🔎 **Instant search** by title, category and hashtags (`#VPN`, `#Password`, `#Printer`...)
- 📋 **One-click copy** with your personal signature attached automatically
- 📌 **Pin frequently used phrases** to the top of the catalog
- 🗂️ **Custom categories and tags** per support flow
- 📥 **Document import** (.txt, .docx, .json) with 100% local structural parsing
- 📤 **Standardized export (.txt)** ready for wikis, Git or operational manuals
- 🧭 **Sidebar mode** — use side-by-side with your ticketing system and browser AI assistants

## Privacy & BYOD

DeskFlow follows a **local-first (BYOD — Bring Your Own Data)** model: by default, data lives in the analyst's browser `localStorage`. There is no BYOK and no generative-AI integration — all document reading and importing is done through deterministic algorithms, with no content ever sent to external services. Cloud sync (Firestore) is **optional** and exists solely to share the catalog across a team.

> Full details on how it works, privacy and integrations are in the [User Manual](docs/DeskFlow_Manual_Completo.pdf).

## Stack

- **Frontend:** TypeScript, 100% client-side
- **Storage:** `localStorage` (local-first)
- **Optional sync:** Firestore
- **Deploy:** Vercel

## Documentation

This README covers the product/engineering overview. For the full operational walkthrough — support workflow, import/export and sidebar setup on Opera, Firefox, Edge and Chrome — check the manual in `/docs`:

```
docs/
└── DeskFlow_Manual_Completo.pdf   # Operational manual + productivity guide (sidebar setup)
```

## Getting started

DeskFlow is 100% web-based — just open the [live app](https://deskflow-blush.vercel.app) and start using it. To pin it to your browser's sidebar (recommended), check the step-by-step guide in the manual above.

---

<div align="center">
DeskFlow Community • Built for people who live in Service Desk
</div>
