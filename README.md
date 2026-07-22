# Urlaub – Wer bringt was 🏖️

Kleine geteilte Web-App, mit der eine Familie fürs gemeinsame Ferienhaus organisiert,
**wer was mitbringt**. Mobile-first, kein App-Install, kein Login.

## Link für die Familie

👉 **https://jstngr.github.io/urlaub-packliste/**

Einfach öffnen, einmal den eigenen Namen wählen — fertig. Das Gerät merkt sich den Namen.
Jeder kann Einträge hinzufügen, abhaken, bearbeiten und löschen. Änderungen erscheinen
bei allen sofort (realtime).

## Kategorien

Allgemeine Essenszutaten · Getränke · Spielzeug/Unterhaltung · Küche/Haushalt ·
Hygiene/Bad · Erste Hilfe/Medizin · Sonstiges — eigene Kategorien lassen sich anlegen.

## Technik

- React + Vite + TypeScript
- Firebase Firestore (realtime, Region europe/eur3)
- Hosting: GitHub Pages (automatischer Deploy via GitHub Actions bei Push auf `main`)

### Hinweis zu Zugang & Sicherheit

Kein Login. Die Firestore-Regeln sind **offen** (jeder mit dem Link kann lesen +
schreiben) — bewusste Wahl für eine kleine Familienliste ohne sensible Daten. Die
Firebase-Web-Config in `.env.production` sind client-öffentliche Kennungen, keine
Geheimnisse.

## Lokal entwickeln

```bash
npm install
npm run dev      # Dev-Server
npm test         # Tests (Vitest)
npm run build    # Produktions-Build
```
