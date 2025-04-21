# Rebased Pixels - Auto-Mint-Prozess

Dieses Dokument enthält Anweisungen zur Verwendung des automatisierten NFT-Mint-Prozesses für das Rebased Pixels Projekt.

## Übersicht

Der Auto-Mint-Prozess ermöglicht das automatische Prägen von NFTs für Gewinner in regelmäßigen Intervallen. Dies kann entweder manuell ausgeführt oder als geplante Aufgabe eingerichtet werden.

## Voraussetzungen

- Windows 10 oder höher
- Node.js 14+ installiert
- Zugriff auf das Admin-Panel und die entsprechenden API-Schlüssel
- Move CLI und andere erforderliche Tools konfiguriert

## Dateien im Auto-Mint-Paket

- `start-auto-mint.bat` - Batch-Datei zur manuellen Ausführung des Auto-Mint-Prozesses
- `schedule-auto-mint.ps1` - PowerShell-Skript zur Einrichtung einer geplanten Aufgabe
- `scripts/autoMint.js` - JavaScript-Implementierung des Auto-Mint-Prozesses

## Manuelle Ausführung

Um den Auto-Mint-Prozess manuell zu starten, führen Sie die folgenden Schritte aus:

1. Öffnen Sie die Eingabeaufforderung (cmd) oder PowerShell
2. Navigieren Sie zum nft-admin-Verzeichnis
3. Führen Sie den Befehl aus: `start-auto-mint.bat`
4. Überprüfen Sie die Ausgabe auf Fehler und Status
5. Die Protokolldatei wird im Verzeichnis `logs/auto-mint.log` gespeichert

## Einrichtung als geplante Aufgabe

Für die automatische regelmäßige Ausführung:

1. Öffnen Sie PowerShell als Administrator
2. Navigieren Sie zum nft-admin-Verzeichnis
3. Führen Sie den Befehl aus: `.\schedule-auto-mint.ps1`
4. Folgen Sie den Anweisungen im Skript:
   - Wählen Sie den gewünschten Zeitplan (stündlich, täglich, wöchentlich)
   - Geben Sie die Ausführungszeit an
   - Wählen Sie das Benutzerkonto für die Ausführung

Das Skript erstellt eine Windows-Aufgabe, die den Auto-Mint-Prozess gemäß dem festgelegten Zeitplan ausführt.

## Anpassen des Zeitplans

Um den Zeitplan einer bestehenden Aufgabe zu ändern:

1. Öffnen Sie den Task Scheduler (`taskschd.msc`)
2. Suchen Sie die Aufgabe "RebasedPixels-AutoMint"
3. Klicken Sie mit der rechten Maustaste und wählen Sie "Eigenschaften"
4. Gehen Sie zum Tab "Trigger" und passen Sie die Einstellungen an
5. Klicken Sie auf "OK", um die Änderungen zu speichern

## Fehlerbehebung

Wenn Probleme auftreten:

1. Überprüfen Sie die Protokolldatei im Verzeichnis `logs/auto-mint.log`
2. Stellen Sie sicher, dass alle erforderlichen Tools installiert sind
3. Überprüfen Sie die Netzwerkverbindung und API-Zugriffsrechte
4. Stellen Sie sicher, dass das Benutzerkonto für die geplante Aufgabe die richtigen Berechtigungen hat

## Häufig gestellte Fragen

**F: Wie oft sollte der Auto-Mint-Prozess ausgeführt werden?**
A: Dies hängt von Ihren Anforderungen ab. Für die meisten Anwendungsfälle reicht eine tägliche Ausführung aus.

**F: Was passiert, wenn während des Prozesses ein Fehler auftritt?**
A: Fehler werden protokolliert und der Prozess wird beim nächsten geplanten Lauf erneut versucht.

**F: Kann ich mehrere Auto-Mint-Prozesse gleichzeitig ausführen?**
A: Es wird empfohlen, jeweils nur einen Prozess auszuführen, um Konflikte zu vermeiden.

**F: Wie kann ich überprüfen, ob der Auto-Mint-Prozess erfolgreich war?**
A: Überprüfen Sie die Protokolldatei im Verzeichnis `logs/auto-mint.log` auf die Meldung "Auto-Mint-Prozess erfolgreich abgeschlossen". 