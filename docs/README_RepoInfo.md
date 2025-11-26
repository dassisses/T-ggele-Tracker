# Repository Information

## Purpose
This repository hosts the "T-ggele Tracker" application and its accompanying documentation. The long-term goal is to publish the documentation via GitHub Pages so contributors and stakeholders can easily browse the project context, roadmap, and decision history.

## Repository Structure
- `/docs` – Project documentation intended for GitHub Pages (templates, protocols, roadmap, repo info).
- `/project` – Vite + React + TypeScript application source code and build tooling.
  - `/project/src` – Application code.
  - `/project/public` – Static assets (if added later).
  - `/project/data/database.json` – JSON-backed data store (see **Data Model** below).
  - Configuration: `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`.
- Root files – Repository-level README and version control metadata.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS.
- **Data access:** Simple JSON file (see below) with the option to expand to APIs (e.g., Supabase) later.
- **Tooling:** ESLint, TypeScript for type checks.

## Local Setup
1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   cd project
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Additional commands:
   - `npm run build` – Production build.
   - `npm run lint` – Lint the codebase.
   - `npm run typecheck` – Static type checking.

## Data Model (JSON Store)
- **File:** `project/data/database.json`
- **Structure:**
  ```json
  {
    "meta": {
      "version": 1,
      "lastUpdated": "<ISO timestamp>",
      "description": "Lightweight tracker store"
    },
    "entries": [
      {
        "id": "<uuid>",
        "title": "<short title>",
        "status": "todo | in-progress | done",
        "tags": ["<tag>", "<tag>"] ,
        "createdAt": "<ISO timestamp>",
        "updatedAt": "<ISO timestamp>",
        "notes": "<rich text / markdown>"
      }
    ]
  }
  ```
- **Storage location:** Keep the file under version control at `project/data/database.json`. At runtime, the app can read and write to this file (or to a generated copy) depending on deployment constraints.
- **Example content:** See `project/data/database.json` for a populated example aligned with this schema.

## Documentation for GitHub Pages
The `/docs` directory is structured to serve as the source for a GitHub Pages site. Publish this directory (or a built variant) to GitHub Pages to share the workflow template, protocol history, repository overview, and roadmap.
