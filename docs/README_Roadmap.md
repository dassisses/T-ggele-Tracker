# Project Roadmap

This roadmap tracks work toward a documented, JSON-backed tracker app that can be published via GitHub Pages.

## 1) Repository Restructuring
- [x] Add `/docs` with documentation templates and project overview.
- [ ] Align root README to point to documentation hub.
- [ ] Standardize formatting/linting configs across the app.
- [ ] Add CI checks (lint/typecheck/build) for pull requests.

## 2) GitHub Pages Setup
- [ ] Decide on publishing source: direct `/docs` folder or generated static site.
- [ ] Create GitHub Actions workflow to build (if needed) and deploy documentation to `gh-pages` branch.
- [ ] Configure custom domain or project URL if desired.
- [ ] Add badge/link in README pointing to the live Pages site.

## 3) JSON Database Implementation
- [x] Define schema and example data in `project/data/database.json`.
- [ ] Build lightweight data-access layer for reading/writing the JSON file.
- [ ] Add validation to enforce schema (e.g., zod or custom checks).
- [ ] Seed and migration scripts for evolving the JSON store safely.

## 4) Application Features (Short-Term)
- [ ] Display entries from the JSON store in the UI.
- [ ] Create/update/delete entries with status and tags.
- [ ] Filters/search by status, tags, and free text.
- [ ] Notes field supporting markdown formatting.

## 5) Documentation Enhancements
- [ ] Populate `docs/Protokolle.md` with session logs as work proceeds.
- [ ] Add architectural overview (component map, data flow, styling strategy).
- [ ] Author contribution guidelines and coding standards.

## 6) Future Improvements
- [ ] Authentication/authorization if collaboration is needed.
- [ ] Automated backups/versioning of the JSON store.
- [ ] Optional Supabase/Postgres backend for scalability.
- [ ] Analytics or activity timeline for changes to entries.
