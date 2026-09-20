# DeskFlow — Technical Documentation

> DeskFlow technical documentation: architecture, persistence, data processing, contextual search, integrations, and limitations.

---

## 1. Architecture

DeskFlow is a web application designed to support technical support professionals in organizing and quickly retrieving phrases, scripts, and operational procedures.

The application adopts a Client-Side First approach, where core processing happens directly in the browser and does not depend on a custom backend for basic catalog operations.

The architecture can be represented as follows:

                          ┌──────────────────────┐
                          │        User          │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │      React / UI      │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌───────────┐   ┌────────────┐   ┌─────────────┐
              │  Search   │   │   Parser   │   │ Application │
              │  Engine   │   │ / Import   │   │    Logic    │
              └─────┬─────┘   └─────┬──────┘   └──────┬──────┘
                    │               │                 │
                    └───────────────┼─────────────────┘
                                    ▼
                          ┌──────────────────────┐
                          │     LocalStorage     │
                          └──────────┬───────────┘
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                       ┌────────────┐ ┌─────────────┐
                       │ Import /   │ │  Optional   │
                       │  Export    │ │    Sync     │
                       └────────────┘ └──────┬──────┘
                                             │
                                             ▼
                                         Firestore

The core of the application is designed to operate using local data. Features that rely on external services require connectivity and are subject to the availability and policies of those services.

---

## 2. Persistence and BYOD Model

DeskFlow uses a BYOD (Bring Your Own Data) approach, where the operational catalog belongs to the user and can be maintained locally within the browser.

Local storage uses `localStorage` to persist information required for the application to function. Stored data structures include:

* phrases and templates
* categories
* tags
* application configurations
* user signature
* configurations related to available integrations

DeskFlow does not rely on a mandatory central database to execute basic catalog operations.

### Portability
To reduce dependency on a single browser or device, DeskFlow provides data import and export mechanisms. These can be used to:

* perform backups
* transport the catalog
* restore data
* maintain external copies
* share compatible structures with other environments

### Optional Synchronization
When enabled, synchronization with external services allows the use of remote infrastructure to share or maintain a copy of the catalog. This functionality is complementary to local storage and does not replace the Client-Side First model.

Using external services means that transmitted data becomes subject to the configurations, availability, and policies of the respective provider.

---

## 3. Parser and Data Formats

DeskFlow uses local deterministic processing to interpret supported content formats. The parser is responsible for transforming structured content into objects usable by the application catalog.

Recognized elements include:

* title
* body
* category
* hashtags
* block delimiters
* structural fields defined by DeskFlow's format

Processing occurs locally in the browser and does not rely on a generative model to interpret content structure.

### Deterministic Processing
The parser uses predefined rules to identify and convert content elements. This ensures predictable behavior for inputs following the supported format and avoids sending documents to an AI service just for structural interpretation.

* Import: The application includes mechanisms to import content from supported formats. During import, content is converted into DeskFlow's internal structure.
* Export: Data can be exported into formats intended for backup, restoration, or external use. Structured formats preserve the data needed to rebuild the catalog, while textual formats provide a simpler, readable representation.

---

## 4. Search Engine and Contextual Search

The search mechanism is one of DeskFlow's core features. It allows operators to combine context and specific terms into a single query.

### Multi-Term Search
Search terms can be combined using logical `AND`. For example:

reset senha

The query restricts results to content matching the specified criteria.

### Hashtags as Context
Hashtags represent the operational context of a phrase (e.g., `#chat`, `#energia`, `#mfa`). A hashtag can be combined with additional terms:

#chat saudacao
#energia acesso
#mfa reset

In this model, the hashtag acts as a contextual filter while the remaining terms refine the results.

### Categories and Tags
The system also allows targeted queries using categories and tags (e.g., `categoria:energia`, `tag:chat`), giving operators a choice between freeform search or context-directed queries.

### Content Prioritization
Phrases marked as pinned receive priority in search results, keeping frequently used scripts accessible even when other filters are applied.

---

## 5. External Integrations

DeskFlow's core is built to operate without mandatory external dependencies. When enabled, optional integrations expand its capabilities, particularly for synchronization and sharing.

### Firestore
The project provides optional synchronization using **Firestore**, allowing remote storage for scenarios where users need their catalog available across different environments. Synchronization is not required for basic local operations.

### Considerations on External Services
Using any external service introduces dependencies outside DeskFlow's direct control, such as availability, connectivity, authentication, usage limits, and privacy policies. Therefore, these integrations are treated as optional components.

---

## 6. Security and Limitations

The Client-Side First model reduces the need for a central backend for basic operations, but it should not be viewed as an absolute guarantee of security or confidentiality.

* Local Data: Information stored in `localStorage` remains tied to the browser environment. Clearing browser data or cache may result in data loss (regular backups via export are strongly recommended).
* Sensitive Information: DeskFlow **must not** be treated as a password manager, secrets vault, enterprise identity system, or replacement for official IAM solutions. Credentials, passwords, or highly sensitive tokens should not be stored in the catalog.

### Application Scope

DeskFlow is primarily an operational productivity tool intended to replace generic text editors like Notepad and scratchpads during recurring support activities.

Instead of keeping phrases, scripts, procedures, and operational notes scattered across text files, DeskFlow organizes this content into a searchable catalog structured by categories, tags, and context.

The project does not aim to replace:

- official ticketing systems;
- ITSM platforms;
- identity management systems;
- credential management systems;
- official knowledge bases.

Its objective is to act as an operational layer between the professional and these tools, speeding up access and reuse of information during customer service interactions.

### Practical Usage

DeskFlow was also validated through a real-world support operational scenario for approximately one month. 

During this period, the user adopted the platform as the primary tool to store and retrieve phrases, scripts, and operational notes, completely phasing out Notepad and plain text blocks for those activities.

This practical experience directly shaped the development of contextual search, tags, pinned items, and catalog organization features.

---

## 7. Final Considerations

DeskFlow combines local processing, browser persistence, contextual search, category/tag organization, and optional integrations to create a tool focused on rapid operational knowledge retrieval.

The architecture prioritizes local processing, data portability, independence from central infrastructure, contextual search, and adaptability to real-world workflows.
