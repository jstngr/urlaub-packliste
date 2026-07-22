# Urlaub-Packliste – Design

**Datum:** 2026-07-22
**Ziel:** Geteilte Web-App, mit der eine Familie im gemeinsam gemieteten Ferienhaus organisiert, wer was mitbringt. Mobile-first, freundlich, ohne App-Install, ohne Login. Deutsch.

## Kontext

Familie fährt zusammen in ein gemietetes Haus. Bisheriger Versuch mit Google Sheets war für nicht-techy Eltern zu fummelig auf dem Handy. Lösung: eigene kleine Web-App, geteilt per Link, realtime.

## Nutzer

- Familienmitglieder unterschiedlicher Technik-Affinität (inkl. nicht-techy Eltern).
- Gemischte Handys (Android + iPhone) → Web-App im Browser, kein App-Store.

## Umfang (Scope)

Eine einzige geteilte Liste (der Familien-Link). Kein Multi-Haushalt, keine mehreren Listen.

## Anforderungen

### Zugang & Identität
- Öffnen per Link, **kein Login**.
- Beim ersten Öffnen wählt der Nutzer einmal seinen Namen; Gerät merkt sich ihn (`localStorage`).
- Danach gilt er automatisch als „du"; neue Einträge tragen ihn als Bringer vor.

### Kategorien
- 7 Start-Kategorien: **Allgemeine Essenszutaten, Getränke, Spielzeug/Unterhaltung, Küche/Haushalt, Hygiene/Bad, Erste Hilfe/Medizin, Sonstiges**.
- Nutzer können **eigene Kategorien anlegen**.
- (Umbenennen/Löschen von Kategorien: nicht im ersten Wurf — YAGNI. Kann später.)

### Eintrag (Item)
Felder:
- `was` (Text, Pflicht) – z.B. „Nudeln"
- `menge` (Text, optional) – z.B. „2 Packungen"
- `wer` (Liste von Namen, optional; **mehrere möglich**) – Default: aktueller Nutzer
- `notiz` (Text, optional)
- `erledigt` (bool) – Haken wenn gepackt/besorgt
- `kategorie` (Text)
- `erstelltAm` (timestamp)

### Rechte
- **Jeder darf alles** bearbeiten und löschen (Familie, Vertrauen). Keine Ownership-Logik.

### Sicherheit
- Firestore-Regeln **offen** (read+write für alle). Bewusste Entscheidung: geringe Sensibilität, schnellster Start.
- Bekanntes Restrisiko: Firebase-Config liegt öffentlich im JS-Bundle; wer den Link findet, kann die Liste verändern. Optionaler leichter Schutz (geheimer Code/Pfad) später möglich, nicht Teil v1.

## Technischer Ansatz

- **Frontend:** React + Vite + TypeScript, mobile-first.
- **Daten:** Firebase Firestore (Web-SDK, client-side), **realtime** via `onSnapshot`.
- **Hosting:** GitHub Pages (statischer `vite build`, Deploy in `gh-pages`).
  - Vite `base` = Repo-Name für korrekte Pfade auf GitHub Pages.

## Datenmodell (Firestore)

- Collection `items` – ein Dokument pro Eintrag mit den Feldern oben.
- Collection `categories` – Dokumente `{ name, reihenfolge, erstelltAm }`; wird mit den 7 Defaults geseedet, Nutzer können weitere hinzufügen.
- Collection `people` – `{ name }`; sammelt Namen der Teilnehmer für die „Wer"-Auswahl.

## UI / UX

Mobile-first, freundlich (runde Ecken, klare Kategorie-Farben, große Tap-Ziele).

**Aufbau (oben nach unten):**
1. Kopf: App-Titel + aktueller Name (antippbar zum Ändern).
2. **Tab-Leiste, horizontal scrollbar:** `Alle · Essen · Getränke · Spielzeug · Küche · Hygiene · Medizin · Sonstiges · +` (das `+` legt neue Kategorie an).
3. Inhalt des aktiven Tabs:
   - Bei einer Kategorie: deren Einträge.
   - Bei **„Alle"**: alle Einträge nach Kategorie gruppiert (Abschnittsüberschriften).
4. Eintrag-Karte: `[Haken] **Was** · Menge · Wer (Chips) · Notiz (klein) · ⋯` (⋯ = Bearbeiten/Löschen).
5. Fester „+ Eintrag"-Button unten → Dialog/Bottom-Sheet mit Feldern (Was, Menge, Wer-Auswahl mit Mehrfach + neuer Name, Notiz).

**Erst-Onboarding:** Beim ersten Öffnen ohne gemerkten Namen → einfacher Dialog „Wie heißt du?" (Auswahl aus `people` oder neuer Name).

**Verhalten:**
- Änderungen erscheinen bei allen sofort (realtime).
- Erledigte Einträge bleiben sichtbar, abgehakt/ausgegraut (nicht ausgeblendet).

## Nicht im Umfang (v1)

- Login / Authentifizierung
- Mehrere Listen / Haushalte
- Kategorien umbenennen/löschen
- Zugriffsschutz per Code
- Push-Benachrichtigungen

## Erfolgskriterien

- Eltern öffnen den Link auf dem Handy, wählen ihren Namen, fügen in < 30 Sek. einen Eintrag hinzu.
- Änderungen sind bei allen Teilnehmern sofort sichtbar.
- Übersichtlich: gewünschte Kategorie in einem Tap über Tabs erreichbar.
