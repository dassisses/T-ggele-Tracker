# Apps Team Töggle Tracker

Ein premium Töggle (Tischfussball) Tracker mit Elo-Rating-System, Match-Historie und Statistiken. Jetzt mit Dark Mode und optimierter mobiler Erfahrung.

## 📋 Projektstruktur

- **`backend/`** - FastAPI Backend mit SQLite-Datenbank
- **`frontend/`** - React + TypeScript + Vite Frontend + Tailwind CSS
- **`render.yaml`** - Infrastruktur-Konfiguration für Render.com

## 🚀 Lokale Entwicklung

Der einfachste Weg ist das `dev.sh` Script im Root-Verzeichnis:
```bash
./dev.sh
```

## 🎮 Features & UI

- **Dark Mode**: Dynamischer Wechsel zwischen Hell- und Dunkel-Themen.
- **Mobile First**: Optimiert für Browser auf Laptops und Smartphones.
- **Saison-Archiv**: Saisons abschliessen, archivieren und historische Statistiken jederzeit einsehen.
- **Dynamisches Elo**: Voll konfigurierbare Punkte-Logik (Underdog-Bonus, Tor-Differenz-Multiplier, asymmetrischer Schutz).
- **Ränge**: Frei definierbare Ränge basierend auf Elo (vom "Employed" bis zum "Chief of Unemployment").

## ☁️ Deployment auf Render.com

Es gibt zwei Wege, die App auf Render zu hosten:

### Option A: Kostenloser Plan (Free Tier - Manuelles Setup)
*Hinweis: Im Free Tier werden Daten bei jedem Server-Neustart/Update gelöscht (keine Persistenz).*

1. Klicke auf Render auf **"New" -> "Web Service"** und verbinde dein Repository.
2. **Environment**: `Python`
3. **Build Command**: `cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt`
4. **Start Command**: `cd backend && gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`
5. **Advanced**: Füge eine Umgebungsvariable hinzu: `DATABASE_PATH` = `./toeggele.db`
6. **Instance Type**: Wähle `Free`.

### Option B: Dauerhafter Speicher (via Blueprint - Kostenpflichtig)
*Dieses Setup nutzt einen Persistent Disk (ca. $1/Monat), damit deine Daten NIE verloren gehen.*

1. Pushe den Code in dein Repository.
2. Klicke auf Render auf **"New" -> "Blueprint"**.
3. Verbinde dein Repository. Render erkennt die `render.yaml` automatisch und richtet alles (inkl. Festplatte) fertig ein.

## 🛠️ Technologie-Stack

**Backend:** FastAPI, SQLAlchemy (SQLite), Pydantic, Gunicorn
**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Lucide Icons
**Typografie:** Outfit (Google Fonts)
