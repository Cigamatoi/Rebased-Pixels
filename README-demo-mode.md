# RebasedPixels Demo-Modus

Der Demo-Modus ermöglicht das Testen der NFT-Mint-Funktionalität ohne tatsächliche IOTA-Zahlungen.

## Arten von Demo-Modi

RebasedPixels bietet zwei Demo-Modi an:

### 1. Smart Contract Demo-Modus

Dieser Modus nutzt den Smart Contract, erfordert aber keine Zahlungen, da er eine Admin-Capability verwendet.

Um diesen Modus zu aktivieren, setzen Sie folgende Umgebungsvariablen in der `.env.local` Datei:

```env
# Demo-Modus-Konfiguration
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ADMIN_CAP_ID=0x9ec4a3c35104f3fc85bf4fb427939208c5109f60747475dda838079b3d5f9dec
```

### 2. Lokaler Demo-Modus

Dieser Modus simuliert Transaktionen vollständig im Frontend und interagiert gar nicht mit der Blockchain. Er ist nützlich für Entwicklung und Testen, wenn keine Blockchain-Verbindung möglich ist.

Um diesen Modus zu aktivieren, stellen Sie sicher, dass in `src/pages/singleplayer.tsx` die Konstante `LOCAL_DEMO_MODE` auf `true` gesetzt ist:

```javascript
// Lokaler Demo-Modus, wenn wir den Smart Contract nicht veröffentlichen können
const LOCAL_DEMO_MODE = true;
```

Für die Produktion sollte dieser Wert auf `false` gesetzt werden.

## Funktionsweise des Smart Contract Demo-Modus

Im Demo-Modus werden folgende Änderungen aktiviert:

1. **Keine Zahlungen erforderlich**: Benutzer können NFTs minten, ohne die 5 IOTA-Gebühr zu bezahlen
2. **Admin-Capability**: Die Anwendung verwendet die Admin-Capability, um die NFTs über die `mint_simple_demo_nft`-Funktion zu erstellen
3. **Visuelle Hinweise**: Die Benutzeroberfläche zeigt an, dass der Demo-Modus aktiv ist

## Implementierungsdetails

Der Demo-Modus nutzt den Smart Contract `singleplayer_paid_nft.move`, der speziell für den Demo-Modus zusätzliche Funktionen bereitstellt:

- `mint_demo_nft`: Erstellt ein NFT ohne Zahlungsanforderung (benötigt Admin-Capability)
- `mint_simple_demo_nft`: Vereinfachte Version mit Standardwerten für Name und Beschreibung

## Voraussetzungen für den Smart Contract Demo-Modus

Um den Smart Contract Demo-Modus zu verwenden, müssen Sie:

1. Die Admin-Capability für den Smart Contract erstellen (sollte während der Bereitstellung bereits geschehen sein)
2. Die Admin-Cap-ID in der Umgebungsvariablen `NEXT_PUBLIC_ADMIN_CAP_ID` setzen
3. Den Smart Contract mit den Demo-Funktionen kompilieren und bereitstellen

## Deaktivierung der Demo-Modi

- Smart Contract Demo-Modus: Setzen Sie `NEXT_PUBLIC_DEMO_MODE=false` in der `.env.local` Datei
- Lokaler Demo-Modus: Setzen Sie `LOCAL_DEMO_MODE=false` in der Datei `src/pages/singleplayer.tsx` 