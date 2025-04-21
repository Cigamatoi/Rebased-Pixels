#[test_only]
module singleplayer_paid_nft::nft_test {
    use std::string::{Self, String};
    use iota::test_scenario;
    use iota::test_utils;
    use iota::coin::{Self};
    use iota::iota::{Self, IOTA};
    use singleplayer_paid_nft::singleplayer_paid_nft::{Self, PixelNFT};

    #[test]
    fun test_mint_nft() {
        // Erstelle Testbenutzer
        let admin = @0xADMIN;
        let user = @0xUSER;

        // Starte das Testzenario mit Admin
        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        {
            // Initialisiere das Modul
            singleplayer_paid_nft::init(test_scenario::ctx(scenario));
        };

        // Nächste Transaktion: Benutzer minted ein NFT
        test_scenario::next_tx(scenario, user);
        {
            // Erstelle IOTA-Coins für den Benutzer (5 IOTA)
            let payment = coin::mint_for_testing<IOTA>(5_000_000_000, test_scenario::ctx(scenario));
            
            // Erstelle NFT-Metadaten
            let name = string::utf8(b"Test NFT");
            let description = string::utf8(b"Ein Test-NFT für RebasedPixels");
            let image_reference = string::utf8(b"pixels_12345_user");
            
            // Mint das NFT
            singleplayer_paid_nft::mint_simple_nft(
                payment,
                name,
                description,
                image_reference,
                test_scenario::ctx(scenario)
            );
        };

        // Überprüfe, ob der Benutzer das NFT erhalten hat
        test_scenario::next_tx(scenario, user);
        {
            // Hole das NFT aus dem Benutzer-Wallet
            let nft = test_scenario::take_from_sender<PixelNFT>(scenario);
            
            // Überprüfe die NFT-Eigenschaften
            assert!(singleplayer_paid_nft::name(&nft) == string::utf8(b"Test NFT"), 1);
            assert!(singleplayer_paid_nft::description(&nft) == string::utf8(b"Ein Test-NFT für RebasedPixels"), 2);
            assert!(singleplayer_paid_nft::image_reference(&nft) == string::utf8(b"pixels_12345_user"), 3);
            assert!(singleplayer_paid_nft::creator(&nft) == user, 4);
            
            // Gib das NFT zurück
            test_scenario::return_to_sender(scenario, nft);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = singleplayer_paid_nft::EInsufficientPayment)]
    fun test_mint_nft_insufficient_payment() {
        // Erstelle Testbenutzer
        let admin = @0xADMIN;
        let user = @0xUSER;

        // Starte das Testzenario mit Admin
        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        {
            // Initialisiere das Modul
            singleplayer_paid_nft::init(test_scenario::ctx(scenario));
        };

        // Nächste Transaktion: Benutzer versucht, ein NFT mit zu wenig IOTA zu minten
        test_scenario::next_tx(scenario, user);
        {
            // Erstelle IOTA-Coins für den Benutzer (nur 4 IOTA)
            let payment = coin::mint_for_testing<IOTA>(4_000_000_000, test_scenario::ctx(scenario));
            
            // Erstelle NFT-Metadaten
            let name = string::utf8(b"Test NFT");
            let description = string::utf8(b"Ein Test-NFT für RebasedPixels");
            let image_reference = string::utf8(b"pixels_12345_user");
            
            // Dieser Aufruf sollte fehlschlagen
            singleplayer_paid_nft::mint_simple_nft(
                payment,
                name,
                description,
                image_reference,
                test_scenario::ctx(scenario)
            );
        };

        test_scenario::end(scenario_val);
    }
} 