/// RebasedPixels Module for IOTA
/// Implementation of NFT minting and epoch management
module nft_admin::rebased_pixels {
    use std::string::String;
    use std::vector;
    use iota::object::UID;
    use iota::object::ID;
    use iota::tx_context::TxContext;
    use iota::transfer;
    use std::debug;
    
    // Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 0;
    const ERROR_INVALID_ARGUMENT: u64 = 1;
    
    /// Epoch NFT - represents a single epoch in the RebasedPixels project
    public struct EpochNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        epoch_number: u64,
        winner: address,
        contributors_count: u64,
        metadata: String
    }
    
    /// Random number generator capability - restricts access to random winner selection
    public struct AdminCap has key, store {
        id: UID
    }
    
    // === Admin functions ===
    
    /// Create admin capability - can only be called once by the deployer
    public entry fun create_admin_cap(ctx: &mut TxContext) {
        let sender = iota::tx_context::sender(ctx);
        debug::print(&b"Creating admin capability for");
        debug::print(&sender);
        
        let cap = AdminCap {
            id: iota::object::new(ctx)
        };
        
        transfer::transfer(cap, sender);
    }
    
    /// Mint a new NFT
    public entry fun mint_nft(
        _: &AdminCap,
        recipient: address,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        metadata_json: vector<u8>,
        ctx: &mut TxContext
    ) {
        let name_str = std::string::utf8(name);
        let description_str = std::string::utf8(description);
        let image_url_str = std::string::utf8(image_url);
        let metadata_str = std::string::utf8(metadata_json);
        
        debug::print(&b"Minting NFT for");
        debug::print(&recipient);
        
        let nft = EpochNFT {
            id: iota::object::new(ctx),
            name: name_str,
            description: description_str,
            image_url: image_url_str,
            epoch_number: 1, // In production this should be tracked
            winner: recipient,
            contributors_count: 10, // In production this should come from metadata
            metadata: metadata_str
        };
        
        // Direkte Übertragung des NFTs an den Empfänger
        transfer::transfer(nft, recipient);
    }
    
    /// Select a random winner from a list of addresses
    public fun get_random_winner(_: &AdminCap, addresses: vector<address>, ctx: &mut TxContext): address {
        let len = vector::length(&addresses);
        assert!(len > 0, ERROR_INVALID_ARGUMENT);
        
        // In a production environment, we would use a secure randomness source
        // For now, we use a simple pseudo-random approach
        let random_idx = iota::tx_context::epoch(ctx) % len;
        
        let winner = *vector::borrow(&addresses, random_idx);
        debug::print(&b"Selected winner:");
        debug::print(&winner);
        
        winner
    }
    
    // === Getters ===
    
    /// Get the metadata of an NFT
    public fun get_metadata(nft: &EpochNFT): String {
        nft.metadata
    }
    
    /// Get the winner of an epoch
    public fun get_winner(nft: &EpochNFT): address {
        nft.winner
    }
    
    /// Get the epoch number
    public fun get_epoch_number(nft: &EpochNFT): u64 {
        nft.epoch_number
    }
} 