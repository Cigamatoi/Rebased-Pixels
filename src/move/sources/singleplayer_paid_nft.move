/// SingleplayerPaidNFT Module für IOTA
/// Implementierung für das bezahlte NFT-Minting im Singleplayer-Modus
module nft_admin::singleplayer_paid_nft {
    use std::string::{Self, String};
    use iota::object::UID;
    use iota::tx_context::TxContext;
    use iota::transfer;
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    use std::debug;
    
    // Fehlercodes
    const ERROR_INSUFFICIENT_PAYMENT: u64 = 0;
    const ERROR_INVALID_METADATA: u64 = 1;
    const ERROR_NOT_AUTHORIZED: u64 = 2;
    
    // Konstanten
    const REQUIRED_PAYMENT: u64 = 5000000; // 5 IOTA in der kleinsten Einheit
    
    /// Treasury-Adresse, die die Zahlungen erhält
    const TREASURY_ADDRESS: address = @0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5; // Admin-Adresse

    /// Singleplayer bezahltes NFT - repräsentiert ein einzelnes Kunstwerk
    public struct SingleplayerPaidNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        creator: address,
        created_at: u64,
        metadata: String
    }
    
    /// Admin-Capability - erlaubt den Zugriff auf administrative Funktionen
    public struct AdminCap has key, store {
        id: UID
    }
    
    // === Admin-Funktionen ===
    
    /// Erstellt die Admin-Capability - kann nur einmal vom Deployer aufgerufen werden
    public entry fun create_admin_cap(ctx: &mut TxContext) {
        let sender = iota::tx_context::sender(ctx);
        debug::print(&b"Admin-Capability wird erstellt für");
        debug::print(&sender);
        
        let cap = AdminCap {
            id: iota::object::new(ctx)
        };
        
        transfer::transfer(cap, sender);
    }
    
    // === Haupt-Mint-Funktion ===
    
    /// Mintet ein bezahltes NFT im Singleplayer-Modus
    /// Erfordert eine Zahlung von genau 5 IOTA
    public entry fun mint_singleplayer_nft(
        mut payment: Coin<IOTA>,
        name: String,
        description: String,
        image_url: String,
        metadata_json: String,
        ctx: &mut TxContext
    ) {
        // Überprüfe, dass die Zahlung genau 5 IOTA beträgt
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= REQUIRED_PAYMENT, ERROR_INSUFFICIENT_PAYMENT);
        
        // Optional: Gib Wechselgeld zurück, falls mehr als 5 IOTA gesendet wurden
        if (payment_amount > REQUIRED_PAYMENT) {
            let change_amount = payment_amount - REQUIRED_PAYMENT;
            let change = coin::split(&mut payment, change_amount, ctx);
            transfer::public_transfer(change, iota::tx_context::sender(ctx));
        };
        
        // Transferiere die Zahlung an die Treasury
        transfer::public_transfer(payment, TREASURY_ADDRESS);
        
        let sender = iota::tx_context::sender(ctx);
        debug::print(&b"Bezahltes NFT wird geminted für");
        debug::print(&sender);
        
        // Erstelle das NFT
        let nft = SingleplayerPaidNFT {
            id: iota::object::new(ctx),
            name,
            description,
            image_url,
            creator: sender,
            created_at: iota::tx_context::epoch(ctx),
            metadata: metadata_json
        };
        
        // Sende das NFT an den Ersteller
        transfer::transfer(nft, sender);
    }
    
    // === Vereinfachte Mint-Funktion mit Standardwerten ===
    
    /// Vereinfachte Version zum Minten eines NFTs mit Standardwerten für Name und Beschreibung
    public entry fun mint_simple_nft(
        mut payment: Coin<IOTA>,
        image_url: String,
        ctx: &mut TxContext
    ) {
        let name = string::utf8(b"RebasedPixels Artwork");
        let description = string::utf8(b"Pixel art created on RebasedPixels Platform");
        let metadata = string::utf8(b"{}");  // Leeres JSON-Objekt
        
        mint_singleplayer_nft(payment, name, description, image_url, metadata, ctx);
    }
    
    // === Demo-Mint-Funktion (nur für Admin) ===
    
    /// Mintet ein Demo-NFT ohne Zahlung (nur für Admin)
    public entry fun mint_demo_nft(
        _admin_cap: &AdminCap,
        name: String,
        description: String,
        image_url: String,
        metadata_json: String,
        ctx: &mut TxContext
    ) {
        let sender = iota::tx_context::sender(ctx);
        debug::print(&b"Demo NFT wird geminted für");
        debug::print(&sender);
        
        // Erstelle das NFT
        let nft = SingleplayerPaidNFT {
            id: iota::object::new(ctx),
            name,
            description,
            image_url,
            creator: sender,
            created_at: iota::tx_context::epoch(ctx),
            metadata: metadata_json
        };
        
        // Sende das NFT an den Ersteller
        transfer::transfer(nft, sender);
    }
    
    /// Vereinfachte Demo-Version zum Minten eines NFTs (nur für Admin)
    public entry fun mint_simple_demo_nft(
        admin_cap: &AdminCap,
        image_url: String,
        ctx: &mut TxContext
    ) {
        let name = string::utf8(b"RebasedPixels Demo Artwork");
        let description = string::utf8(b"Demo pixel art created on RebasedPixels Platform");
        let metadata = string::utf8(b"{}");  // Leeres JSON-Objekt
        
        mint_demo_nft(admin_cap, name, description, image_url, metadata, ctx);
    }
    
    // === Getter-Funktionen ===
    
    /// Gibt die Metadaten eines NFTs zurück
    public fun get_metadata(nft: &SingleplayerPaidNFT): String {
        nft.metadata
    }
    
    /// Gibt den Ersteller eines NFTs zurück
    public fun get_creator(nft: &SingleplayerPaidNFT): address {
        nft.creator
    }
    
    /// Gibt die Erstellungszeit eines NFTs zurück
    public fun get_created_at(nft: &SingleplayerPaidNFT): u64 {
        nft.created_at
    }
    
    /// Gibt den Namen eines NFTs zurück
    public fun get_name(nft: &SingleplayerPaidNFT): String {
        nft.name
    }
    
    /// Gibt die Beschreibung eines NFTs zurück
    public fun get_description(nft: &SingleplayerPaidNFT): String {
        nft.description
    }
    
    /// Gibt die Bild-URL eines NFTs zurück
    public fun get_image_url(nft: &SingleplayerPaidNFT): String {
        nft.image_url
    }
} 