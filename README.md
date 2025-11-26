# Apps Team Tögelle Tracker

Project workspace for a React + TypeScript application with accompanying documentation intended for GitHub Pages. See the documents under `docs/` for detailed workflows, roadmap, and repository information.

- [Repository Information](docs/README_RepoInfo.md)
- [Project Roadmap](docs/README_Roadmap.md)
- [Workflow Template](docs/README_Template.md)
- [Session Protocols](docs/Protokolle.md)

The application code lives in `project/`. To start local development:
```bash
cd project
npm install
npm run dev
```

## Lokales Hosting (nur JSON-Daten)
- Alle Daten liegen in einfachen JSON-Dateien unter `project/data/` (`players.json`, `matches.json`). Keine weitere Datenbank, kein Login, keine E-Mail/Passwort nötig – Spieler werden nur über den Namen geführt.
- App starten: `cd project && npm install && npm run dev` und im Browser den ausgegebenen Localhost-Link öffnen.
- Daten anpassen: JSON-Dateien direkt bearbeiten oder über die UI neue Spieler/Matches hinzufügen (wird zur Laufzeit im Speicher gehalten).
- Spielmodi: 1v1, 2v2 und 2v1 (bei 2v1 wird der Elo über Team-Durchschnitt berechnet; Solo-Sieg = doppelter Elo-Gewinn, Team-Sieg = halber Elo-Gewinn; Verluste analog).
- Persistenz: Änderungen via UI werden im Browser `localStorage` gesichert und bleiben nach Reload erhalten. Die JSON-Dateien dienen als Seeds und werden im Browser nicht überschrieben.
