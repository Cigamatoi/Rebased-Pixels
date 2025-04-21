# Rebased Pixels NFT-Admin

Eine Administrationsoberfläche zur Verwaltung von NFTs für das Rebased Pixels Projekt.

## Features

- Anzeige von Teilnehmerlisten für jede Epoche
- Automatisierte Zufallsauswahl eines Gewinners
- Automatisches Minting von NFTs für die Gewinner
- Integration mit IOTA CLI und MOVE VM

## Voraussetzungen

- Node.js 16+ 
- NPM 7+
- IOTA CLI installiert unter `C:\iota\iota.exe` (oder konfigurierbar über Umgebungsvariablen)
- MOVE Analyzer installiert unter `C:\iota\Move-analyzer.exe` (oder konfigurierbar)

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Die Anwendung ist dann unter http://localhost:3002 verfügbar.

## Automatisiertes NFT-Minting

Die Anwendung verfügt über einen vollautomatischen Prozess, der neue Epochendaten erkennt und NFTs mintet.

### Wie es funktioniert

1. Der automatisierte Prozess überprüft stündlich, ob neue Epochendaten (Teilnehmerlisten und Screenshots) verfügbar sind.
2. Wenn eine neue Epoche gefunden wird, wählt er automatisch einen zufälligen Gewinner aus der Teilnehmerliste.
3. Es wird automatisch ein NFT für den Gewinner geminted, wobei stets die Admin-Adresse (0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5) verwendet wird.
4. Der gesamte Prozess wird protokolliert und jede verarbeitete Epoche wird zur Vermeidung von Duplikaten markiert.

### Start des automatisierten Prozesses

Zum Starten des automatisierten Prozesses:

```bash
npm run cron
```

Der Prozess läuft dann im Hintergrund und führt stündliche Überprüfungen durch. Es wird empfohlen, den Prozess mit einem Process Manager wie PM2 oder als systemd-Service zu betreiben, um die Dauerhaftigkeit zu gewährleisten.

### Mit PM2 verwenden

```bash
# PM2 installieren (einmalig)
npm install -g pm2

# Den Cron-Job als Dienst starten
pm2 start npm --name "nft-automint" -- run cron

# Als Autostart einrichten
pm2 startup
pm2 save

# Logs anzeigen
pm2 logs nft-automint
```

### Konfiguration

Die Konfiguration erfolgt über Umgebungsvariablen:

```
MOVE_ANALYZER_PATH=C:\\iota\\Move-analyzer.exe
IOTA_CLI_PATH=C:\\iota\\iota.exe
NEXT_PUBLIC_ADMIN_ADDRESS=0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5
```

### Datenstruktur

Die Anwendung erwartet Teilnehmerdateien im Format:

```json
{
  "epochNumber": 1,
  "epochStartTime": "2023-01-01T00:00:00Z",
  "epochEndTime": "2023-01-08T00:00:00Z",
  "contributors": [
    "0x123...",
    "0x456...",
    "0x789..."
  ]
}
```

Die Dateien werden im Verzeichnis `data/exports` gesucht und sollten die Endung `.json` haben.

Screenshots sollten im Verzeichnis `public/api/screenshots` mit dem Namen `epoch-NUMMER.png` abgelegt werden.

## Fehlerbehebung

- Logs des automatisierten Prozesses befinden sich in `logs/auto-mint.log`
- Die Liste der bereits verarbeiteten Epochen wird in `data/processed_epochs.json` gespeichert

## Automatisiertes NFT-Minting unter Windows

Für Windows-Benutzer gibt es zwei Möglichkeiten, den automatisierten Prozess zu starten:

### Option 1: Manueller Start mit Batch-Datei

1. Doppelklicken Sie auf die Datei `start-auto-mint.bat`
2. Ein Konsolenfenster öffnet sich und führt den Prozess aus
3. Lassen Sie das Fenster geöffnet, um den Prozess am Laufen zu halten

### Option 2: Windows Task Scheduler (empfohlen)

Diese Option richtet eine geplante Aufgabe ein, die stündlich ausgeführt wird:

1. Doppelklicken Sie auf die Datei `setup-task-scheduler.bat`
2. Folgen Sie den Anweisungen auf dem Bildschirm
3. Die Aufgabe wird automatisch im Windows Task Scheduler eingerichtet
4. Der Prozess wird stündlich ausgeführt, auch wenn kein Benutzer angemeldet ist

Sie können die geplante Aufgabe in der Windows-Aufgabenplanung unter dem Namen "Rebased Pixels NFT Minting" finden.

## Automatisiertes NFT-Minting unter Linux/macOS

## Automatisierter NFT-Minting-Prozess

Dieses Verzeichnis enthält die notwendigen Skripte für den automatisierten NFT-Minting-Prozess für Rebased Pixels.

### Voraussetzungen

- Node.js (Version 14 oder höher)
- NPM (wird mit Node.js installiert)
- Zugriff auf die Admin-Wallet und API-Endpunkte

### Ersteinrichtung

1. Stellen Sie sicher, dass alle Abhängigkeiten installiert sind:
   ```
   npm install
   ```

2. Konfigurieren Sie Ihre Umgebungsvariablen in einer `.env`-Datei:
   ```
   ADMIN_ADDRESS=Ihre_Admin_Wallet_Adresse
   ADMIN_PRIVATE_KEY=Ihr_Private_Key
   ```

3. Erstellen Sie das `data/mint-exports`-Verzeichnis, falls es noch nicht existiert.

### Automatisierte Ausführung mit Windows Task Scheduler

Für die regelmäßige automatische Ausführung des Minting-Prozesses stehen zwei Skripte zur Verfügung:

#### Option 1: Einfache manuelle Ausführung

Die Datei `start-auto-mint.bat` kann manuell ausgeführt werden, um den Minting-Prozess zu starten:

1. Doppelklicken Sie auf `start-auto-mint.bat`
2. Der Prozess wird ausgeführt und die Ergebnisse werden im Konsolenfenster angezeigt
3. Die Logs werden in `logs/auto-mint.log` gespeichert

#### Option 2: Einrichtung einer wiederkehrenden Aufgabe (empfohlen)

Um den Prozess automatisch in regelmäßigen Abständen auszuführen:

1. Führen Sie `schedule-auto-mint.ps1` mit Administratorrechten aus (Rechtsklick -> "Als Administrator ausführen")
2. Das Skript erstellt eine stündliche Aufgabe im Windows Task Scheduler
3. Die Aufgabe wird unter dem Namen "RebasedPixels-NFT-AutoMint" angelegt

### Manuelles Einrichten im Task Scheduler

Alternativ können Sie die Aufgabe auch manuell einrichten:

1. Öffnen Sie den Task Scheduler (Aufgabenplanung)
2. Klicken Sie auf "Aufgabe erstellen..."
3. Geben Sie einen Namen ein (z.B. "RebasedPixels-NFT-AutoMint")
4. Wählen Sie unter "Trigger" eine stündliche Wiederholung
5. Unter "Aktionen" fügen Sie `start-auto-mint.bat` als Programm hinzu
6. Stellen Sie das Arbeitsverzeichnis auf den Pfad ein, in dem sich die Batch-Datei befindet

### Funktionsweise

Der automatisierte Prozess:

1. Überprüft, ob neue Export-Dateien im `data/mint-exports`-Verzeichnis vorhanden sind
2. Verarbeitet jede neue Datei und führt den Minting-Prozess für jede Adresse durch
3. Verschiebt verarbeitete Dateien ins `data/mint-exports/processed`-Verzeichnis
4. Protokolliert alle Aktionen in der Logdatei

### Protokollierung

Alle Aktionen werden in `logs/auto-mint.log` protokolliert. Bei Problemen überprüfen Sie diese Datei auf Fehler oder Warnungen.

### Exportdatei-Format

Die Export-Dateien sollten im folgenden Format vorliegen:
```json
{
  "epoch": 1,
  "addresses": [
    "0x123...",
    "0x456..."
  ]
}
```

### Fehlerbehebung

- **Node.js nicht gefunden**: Installieren Sie Node.js von [nodejs.org](https://nodejs.org/)
- **Fehler beim Minting**: Überprüfen Sie die Logdatei und stellen Sie sicher, dass die Admin-Wallet korrekt konfiguriert ist
- **Task Scheduler-Fehler**: Stellen Sie sicher, dass Sie Administratorrechte haben und der Pfad zur Batch-Datei korrekt ist 