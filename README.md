# DeskFlow

> Operational productivity for IT Support

[Live Demo](https://deskflow-blush.vercel.app/)
[React 18](https://react.dev/)
[TypeScript 5](https://www.typescriptlang.org/)
[Vite 5](https://vitejs.dev/)
[Tailwind CSS 3](https://tailwindcss.com/)

DeskFlow is a lightweight operational productivity tool designed for IT support teams and analysts who repeatedly search for, reuse, and adapt the same operational information during daily support activities.

[Live Demo](https://deskflow-blush.vercel.app/) .
[User Manual](./docs/DeskFlow_Manual_Completo.pdf) .
[Technical Documentation](./docs/technical.md) .
[Repository](https://github.com/riionansr/deskflow)

---

## The Problem

IT support analysts frequently need to provide the same types of information over and over again:

- Standard responses
- Troubleshooting procedures
- Operational instructions
- Access instructions
- Frequently used messages
- Internal workflows
- Support phrases and scripts

The problem is not necessarily the lack of documentation. 

The friction comes from finding and reusing the right information at the right moment.

When an analyst is already handling a ticket, chat, or operational request, switching between documents, notes, browser tabs, and other tools can interrupt the workflow.

---
## From Notepad to an Operational Workflow

DeskFlow was created around a simple observation: many support analysts use generic text editors and personal notes as an improvised operational knowledge base.

The project turns that workflow into something more structured.

Instead of keeping frequently used phrases, scripts and procedures scattered across Notepad files and personal notes, DeskFlow provides a searchable operational catalog with categories, tags, contextual search and pinned content.

The goal is not to replace enterprise ITSM platforms or official knowledge bases.

It is to replace the **"open a Notepad and keep everything here"** part of the support workflow.

### Proven in real use

DeskFlow was used in a real IT support operation for approximately one month.

During this period, the user completely abandoned Notepad and traditional note-taking applications for operational support content, using DeskFlow instead to store, search and reuse frequently needed information.

This practical usage directly influenced the development of features such as contextual search, tags, pinned items and the browser-sidebar workflow.

## The Solution

DeskFlow provides a focused operational catalog that stays close to the support workflow.

Instead of searching through a large document or navigating multiple systems, the analyst can search directly using terms, contexts, categories, and tags.

For example:

#chat
#chat greeting

#energia
#energia access

The idea is simple:

Identify the context -> search -> find the right information -> copy -> continue the interaction.

DeskFlow can also be used through a browser sidebar, keeping the catalog accessible while working in another application or support system.

---

## Key Features

- Contextual Search: Search is designed around the context in which the information will be used, supporting explicit prefixes like categoria:energia or tag:mfa.
- Context Tags: Catalog items can be associated with operational contexts and tags to mirror your actual support workflows.
- Pinned Phrases: Frequently used items can be pinned for faster access without requiring repeated searches.
- One-Click Copy: Operational content can be copied directly from the interface to minimize unnecessary interaction steps.
- Dynamic Signature: DeskFlow can append the configured analyst signature when copying supported content.
- Custom Categories: Organize catalog items into categories according to your specific environment and workflow.
- Document Import: Import existing content to reduce manual recreation effort.
- Data Export: Export catalog data for backup, portability, or migration purposes.
- Browser Sidebar Workflow: Keep the catalog available while working in another tab or system.

---

## Real-World Support Workflow

DeskFlow is designed around a simple operational loop:

Ticket -> Context -> Search -> Result -> Copy -> Ticket

For example, an analyst receives a request related to an access procedure. Instead of manually browsing through documentation, the analyst can identify the context and search directly:

#energia access

The relevant catalog entry can then be copied and adapted to the current interaction. (The examples used in the public documentation are fictional and intended only to demonstrate the workflow.)

---

## Privacy & BYOD

DeskFlow follows a local-first approach for its core catalog operations:

- Basic catalog usage is performed using data stored in the browser rather than requiring a centralized database.
- Ideal for BYOD (Bring Your Own Device) scenarios where analysts want to maintain their own operational catalog.
- Supports optional synchronization through external services (such as Firestore) when enabled by the user.

Important: DeskFlow is not intended to be a password manager, a secrets vault, an enterprise identity system, a replacement for official documentation, or a security management platform. Sensitive credentials, passwords, tokens, or other secrets should not be stored in the catalog.

---

## Architecture

At a high level, DeskFlow follows a client-side architecture:
```

┌───────────────────────────┐
│        React / UI         │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Application Logic     │
└─────────────┬─────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│ Search      │ │ Import /    │
│ Engine      │ │ Parser      │
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               ▼
       ┌───────────────┐
       │ Local Storage │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │ Optional Sync │
       │   Firestore   │
       └───────────────┘
```

The application is designed so that the core catalog experience does not depend on a mandatory centralized DeskFlow backend.

---

## Technology Stack

- React: User interface
- TypeScript: Application development and type safety
- Vite: Development and build tooling
- Tailwind CSS: Interface styling
- LocalStorage: Local catalog persistence
- Firestore: Optional synchronization
- Vercel: Deployment

---

## Project Structure

```

deskflow/
├── docs/
│   ├── DeskFlow_Manual_Completo.pdf
│   └── technical.md
├── public/
├── src/
│   ├── components/
│   └── ...
├── README.md
└── ...
```
---

## Documentation

- User Manual: The complete manual explains how to use DeskFlow, manage the catalog, configure browser sidebars, and integrate it into an IT support workflow.
- Technical Documentation: Explains the implementation and architectural decisions behind DeskFlow, including the search engine, local-first persistence, and security considerations.

---

## Getting Started

1. Clone the repository:
   git clone https://github.com/riionansr/deskflow.git
   cd deskflow

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

4. Build for production:
   npm run build

---

## Author

A RAR Project — Designed & developed by Renan Ramos
