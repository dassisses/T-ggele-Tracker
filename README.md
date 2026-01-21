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

Dieses Projekt ist für ein **One-Click-Deployment** auf Render optimiert.

### Schritte:
1. **Repository**: Pushe den Code auf dein GitHub/GitLab Repository.
2. **Render Account**: Logge dich bei [Render](https://render.com) ein.
3. **Blueprint**: Klicke auf "New" -> "Blueprint".
4. **Link**: Wähle dein Repository aus.
5. **Configuration**: Render erkennt die `render.yaml` automatisch.
   - Es wird ein **Web Service** erstellt.
   - Es wird ein **Persistent Disk** (1GB) erstellt, damit die SQLite Datenbank (`toeggele.db`) bei Neustarts nicht gelöscht wird.
6. **Deploy**: Bestätige das Deployment.

**Wichtig**: Die `render.yaml` kümmert sich um den Build des Frontends (`npm run build`) und serviert dieses direkt über das FastAPI Backend. Du brauchst keine separate Static Site.

## 🛠️ Technologie-Stack

**Backend:** FastAPI, SQLAlchemy (SQLite), Pydantic, Gunicorn
**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Lucide Icons
**Typografie:** Outfit (Google Fonts)
