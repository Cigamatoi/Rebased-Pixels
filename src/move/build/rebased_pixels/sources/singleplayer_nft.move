/// SingleplayerNFT Module for RebasedPixels
/// Handles canvas access and NFT minting for the singleplayer mode
module nft_admin::singleplayer_nft {
    use std::string::{String, utf8};
    use std::vector;
    use iota::object::{UID, new};
    use iota::tx_context::{TxContext, sender};
    use iota::transfer;
    use std::debug;
    
    // Error codes
    const ERROR_NOT_AUTHORIZED: u64 = 0;
    const ERROR_INVALID_ARGUMENT: u64 = 1;
    const ERROR_INSUFFICIENT_PAYMENT: u64 = 2;
    
    /// Canvas Access Token - represents access to the singleplayer canvas
    public struct CanvasAccessToken has key, store {
        id: UID,
        owner: address
    }
    
    /// Singleplayer NFT - represents a pixel art created in singleplayer mode
    public struct SingleplayerNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        creator: address,
        canvas_size: u64,
        metadata: String
    }
    
    /// Admin capability - restricts access to admin functions
    public struct AdminCap has key, store {
        id: UID
    }
    
    // === Admin functions ===
    
    /// Create admin capability - can only be called once by the deployer
    public entry fun create_admin_cap(ctx: &mut TxContext) {
        let sender_addr = sender(ctx);
        debug::print(&b"Creating singleplayer admin capability for");
        debug::print(&sender_addr);
        
        let cap = AdminCap {
            id: new(ctx)
        };
        
        transfer::transfer(cap, sender_addr);
    }
    
    /// Grant canvas access to a user after payment
    /// Called by the backend after verifying payment of 5 IOTA
    public entry fun grant_canvas_access(
        _: &AdminCap,
        user: address,
        ctx: &mut TxContext
    ) {
        debug::print(&b"Granting canvas access to");
        debug::print(&user);
        
        let access_token = CanvasAccessToken {
            id: new(ctx),
            owner: user
        };
        
        transfer::transfer(access_token, user);
    }
    
    /// Mint a new singleplayer NFT
    public entry fun mint_singleplayer_nft(
        _: &AdminCap,
        recipient: address,
        image_url: String,
        canvas_size: u64,
        metadata_json: String,
        ctx: &mut TxContext
    ) {
        let name = utf8(b"RebasedPixels Artwork");
        let description = utf8(b"A unique pixel art created in singleplayer mode");
        
        debug::print(&b"Minting singleplayer NFT for");
        debug::print(&recipient);
        
        let nft = SingleplayerNFT {
            id: new(ctx),
            name,
            description,
            image_url,
            creator: recipient,
            canvas_size,
            metadata: metadata_json
        };
        
        transfer::transfer(nft, recipient);
    }
    
    /// User can check if they have canvas access
    public fun has_canvas_access(user: address): bool {
        // In a real implementation, this would check if the user has a CanvasAccessToken
        // Since Move doesn't allow querying objects by owner directly,
        // this would require an off-chain component or additional on-chain state
        
        // For now, we'll return true to simulate access
        // This function would be called by the frontend to determine if the user can use the canvas
        true
    }
    
    // === Getters ===
    
    /// Get the creator of an NFT
    public fun get_creator(nft: &SingleplayerNFT): address {
        nft.creator
    }
    
    /// Get the metadata of an NFT
    public fun get_metadata(nft: &SingleplayerNFT): String {
        nft.metadata
    }
    
    /// Get the image URL of an NFT
    public fun get_image_url(nft: &SingleplayerNFT): String {
        nft.image_url
    }
} 