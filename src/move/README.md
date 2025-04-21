# Rebased Pixels NFT-Admin Move Modul

Dieses Verzeichnis enthält das Move-Modul für die Rebased Pixels NFT-Admin-Anwendung. Es interagiert mit der IOTA Move VM und ermöglicht die Erstellung und Verwaltung von NFTs auf der IOTA-Blockchain.

## Installation

1. Stelle sicher, dass du die IOTA CLI installiert hast (siehe Hauptdokumentation)
2. Setze die Pfade in der `.env.local` Datei entsprechend deiner Installation:
   ```
   MOVE_ANALYZER_PATH=C:\\iota\\Move-analyzer.exe
   IOTA_CLI_PATH=C:\\iota\\iota.exe
   ```

## Module

### nft_module.move

Dieses Modul implementiert die grundlegenden NFT-Funktionen:

- `mint_nft`: Erstellt ein neues NFT und überträgt es an einen Empfänger
- `select_random_winner`: Wählt einen zufälligen Gewinner aus einer Liste von Adressen
- `get_nft_metadata`: Liest die Metadaten eines NFTs
- `update_image_url`: Aktualisiert die Bild-URL eines NFTs

Außerdem wurden folgende Upgrade-Funktionen implementiert:

- `add_authorized_upgrader`: Fügt einen autorisierten Upgrader zur UpgradePolicy hinzu
- `update_min_approvals`: Aktualisiert die Mindestzahl der erforderlichen Genehmigungen
- `make_package_immutable`: Macht das Paket unveränderlich (keine weiteren Upgrades möglich)

### Wichtige Move-Konzepte

- **Strings**: Move hat keinen nativen String-Typ. Strings werden als `vector<u8>` dargestellt und mit dem `string`-Modul in UTF-8-Strings konvertiert.
- **On-Chain Randomness**: Für die Zufallsauswahl wird das Random-Objekt an der Adresse `0x8` verwendet.
- **Ownership**: Move verwendet ein Ownership-Modell, das dem von Rust ähnelt. Objekte werden von einem Besitzer "besessen" und können übertragen werden.
- **Abilities (Fähigkeiten)**: Move nutzt ein System von Fähigkeiten, um Eigenschaften von Typen zu definieren:
  - `key`: Ermöglicht die Verwendung als Objekt im globalen Speicher
  - `store`: Erlaubt die Speicherung innerhalb anderer Objekte
  - `copy`: Ermöglicht das Kopieren von Werten
  - `drop`: Erlaubt das Verwerfen von Werten ohne explizites Entpacken

## Paket-Aktualisierungen

Das Projekt implementiert eine sichere Upgrade-Politik mit folgenden Eigenschaften:

1. **Mehrere Upgrader**: Anstatt nur einen einzelnen Schlüssel für Upgrades zu verwenden, können mehrere autorisierte Adressen für Upgrades zugelassen werden.
2. **Mindestanzahl an Genehmigungen**: Es kann eine Mindestanzahl an Zustimmungen festgelegt werden, bevor ein Upgrade durchgeführt wird.
3. **Immutabilität-Option**: Es besteht die Möglichkeit, das Paket unveränderlich zu machen, wodurch keine weiteren Upgrades möglich sind.

### Upgrade-Prozess

1. Zuerst wird bei der Veröffentlichung die `UpgradePolicy` mit dem Admin als einzigem autorisierten Upgrader erstellt
2. Der Admin kann weitere autorisierte Upgrader mit `add_authorized_upgrader` hinzufügen
3. Die erforderliche Anzahl an Genehmigungen kann mit `update_min_approvals` angepasst werden
4. Wenn notwendig, kann das Paket mit `make_package_immutable` unveränderlich gemacht werden

## Kompilieren und Veröffentlichen

Um das Modul zu kompilieren und zu veröffentlichen:

```bash
# Wechsle ins src/move Verzeichnis
cd src/move

# Kompiliere das Modul
iota.exe client compile

# Veröffentliche das Modul
iota.exe client publish --gas-budget 100000000
```

## Verwendung in TypeScript/JavaScript

```typescript
import { TransactionBlock } from '@iota/dapp-kit';

// Erstelle eine Transaktion
const txb = new TransactionBlock();

// Rufe die mint_nft Funktion auf
txb.moveCall({
  target: `${PACKAGE_ID}::nft_module::mint_nft`,
  arguments: [
    txb.pure(recipient),
    txb.pure(name),
    txb.pure(description),
    txb.pure(imageUrl),
    txb.pure(epochNumber),
    txb.pure(contributorsCount)
  ]
});

// Rufe die select_random_winner Funktion auf
txb.moveCall({
  target: `${PACKAGE_ID}::nft_module::select_random_winner`,
  arguments: [
    txb.object('0x8'), // Das Random-Objekt
    txb.pure(addresses)
  ]
});
```

## One-Time Witness (OTW)

Für zukünftige Erweiterungen kann ein One-Time Witness (OTW) implementiert werden:

- Ein OTW ist ein eindeutiger Typ, der sicherstellt, dass bestimmte Aktionen nur einmal ausgeführt werden können
- Dies ist besonders für Aktionen wie die Erstellung von Tokens nützlich
- Ein Typ qualifiziert sich als OTW, wenn sein Name mit dem Modulnamen in Großbuchstaben übereinstimmt und er die `drop`-Fähigkeit hat
- Der einzige Fall dieses Typs wird automatisch an die `init`-Funktion des Moduls während der Paketveröffentlichung übergeben 