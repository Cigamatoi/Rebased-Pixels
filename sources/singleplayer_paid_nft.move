module singleplayer_paid_nft::singleplayer_paid_nft {
    use std::string::{Self, String};
    use iota::tx_context::TxContext;
    use iota::object::{UID, ID};
    use iota::transfer;
    use iota::event;
    use iota::package;
    use iota::display;
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    use std::debug;

    // ===== Constants =====
    /// Mindestbetrag für das Minting eines NFTs (5 IOTA)
    const MIN_PAYMENT_AMOUNT: u64 = 5_000_000_000;

    // ===== Errors =====
    /// Fehler, wenn die Zahlung zu gering ist
    const EInsufficientPayment: u64 = 0;

    // ===== Events =====
    /// Event, das bei der Erstellung eines neuen NFTs ausgelöst wird
    public struct NFTMinted has copy, drop {
        nft_id: ID,
        creator: address,
        name: String,
        image_reference: String
    }

    // ===== NFT-Struktur =====
    /// Die NFT-Struktur, die die Metadaten des Pixel-Artworks enthält
    public struct PixelNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_reference: String,
        creator: address,
        created_at: u64
    }

    // ===== Publishing =====
    /// Publisher-Objekt für die Metadaten
    public struct SINGLEPLAYER_PAID_NFT has drop {}

    /// Initialisierung - wird einmal beim Deployment aufgerufen
    fun init(otw: SINGLEPLAYER_PAID_NFT, ctx: &mut TxContext) {
        debug::print(&string::utf8(b"Initialisiere SinglePlayer NFT-Modul"));
        
        // Publisher erstellen
        let publisher = package::claim(otw, ctx);

        // Display für die NFTs definieren
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"creator"),
            string::utf8(b"project_url")
        ];

        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_reference}"),
            string::utf8(b"{creator}"),
            string::utf8(b"https://rebasedpixels.io")
        ];

        // Display-Objekt erstellen und an das Publisher-Objekt binden
        let mut display = display::new_with_fields<PixelNFT>(
            &publisher, keys, values, ctx
        );

        debug::print(&string::utf8(b"Display für NFTs konfiguriert"));

        // Publisher und Display finalisieren
        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
        
        debug::print(&string::utf8(b"NFT-Modul initialisiert"));
    }

    // ===== Öffentliche Funktionen =====
    
    /// Funktion zum Minten eines NFTs für ein bestimmtes Pixel-Artwork
    /// Erfordert eine Zahlung von 5 IOTA
    public entry fun mint_simple_nft(
        payment: Coin<IOTA>,
        name: String,
        description: String,
        image_reference: String,
        ctx: &mut TxContext
    ) {
        debug::print(&string::utf8(b"NFT-Minting gestartet"));
        debug::print(&name);
        
        // Überprüfe, ob die Zahlung mindestens 5 IOTA beträgt
        let payment_amount = coin::value(&payment);
        debug::print(&payment_amount);
        
        assert!(payment_amount >= MIN_PAYMENT_AMOUNT, EInsufficientPayment);
        debug::print(&string::utf8(b"Zahlung verifiziert"));

        // Zahlung an das Modul-Konto senden
        transfer::public_transfer(payment, tx_context::sender(ctx));

        // Erstelle das NFT
        let nft = PixelNFT {
            id: object::new(ctx),
            name,
            description,
            image_reference,
            creator: tx_context::sender(ctx),
            created_at: tx_context::epoch(ctx)
        };
        
        debug::print(&string::utf8(b"NFT erstellt"));

        // Löse ein Event aus
        let nft_id = object::id(&nft);
        event::emit(NFTMinted {
            nft_id,
            creator: tx_context::sender(ctx),
            name,
            image_reference
        });
        
        debug::print(&string::utf8(b"NFT-Event ausgelöst"));
        debug::print(&nft_id);

        // Übertrage das NFT an den Sender
        transfer::public_transfer(nft, tx_context::sender(ctx));
        debug::print(&string::utf8(b"NFT an Ersteller übertragen"));
    }
    
    // ===== Accessor-Funktionen =====
    
    /// Gibt den Namen des NFTs zurück
    public fun name(nft: &PixelNFT): String {
        nft.name
    }
    
    /// Gibt die Beschreibung des NFTs zurück
    public fun description(nft: &PixelNFT): String {
        nft.description
    }
    
    /// Gibt die Bildreferenz des NFTs zurück
    public fun image_reference(nft: &PixelNFT): String {
        nft.image_reference
    }
    
    /// Gibt den Ersteller des NFTs zurück
    public fun creator(nft: &PixelNFT): address {
        nft.creator
    }
    
    /// Gibt den Erstellungszeitpunkt des NFTs zurück
    public fun created_at(nft: &PixelNFT): u64 {
        nft.created_at
    }
} 