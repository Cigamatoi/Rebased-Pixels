/*
/// Module: testmove
module testmove::testmove;
*/

// For Move coding conventions, see
// https://docs.iota.org/developer/iota-101/move-overview/conventions

/// Testmodul für IOTA
module testmove::testmove {
    use iota::object::{Self, UID};
    use iota::tx_context::TxContext;
    use iota::transfer;
    
    /// Ein einfaches Testobjekt
    public struct TestObject has key, store {
        id: UID,
        value: u64
    }
    
    /// Initialisierungsfunktion
    fun init(ctx: &mut TxContext) {
        // Erstelle ein Testobjekt
        let test_obj = TestObject {
            id: object::new(ctx),
            value: 42
        };
        
        // Übertrage das Objekt an den Sender
        transfer::transfer(test_obj, ctx.sender());
    }
    
    /// Erstellt ein neues Testobjekt
    public entry fun create_test_object(value: u64, ctx: &mut TxContext) {
        let test_obj = TestObject {
            id: object::new(ctx),
            value
        };
        transfer::transfer(test_obj, ctx.sender());
    }
    
    /// Gibt den Wert eines Testobjekts zurück
    public fun get_value(obj: &TestObject): u64 {
        obj.value
    }
}


