/// A simple test module for IOTA Move
module simple_test::simple_test {
    use iota::object::{Self, UID};
    use iota::tx_context::TxContext;
    use iota::transfer;
    use std::debug;
    
    /// A simple test object
    public struct TestObject has key, store {
        id: UID,
        value: u64
    }
    
    /// Returns a default value
    public fun get_value(): u64 { 42 }
    
    /// Creates a new test object
    public entry fun create_test_object(value: u64, ctx: &mut TxContext) {
        debug::print(&value);
        
        let test_obj = TestObject {
            id: object::new(ctx),
            value
        };
        
        transfer::transfer(test_obj, ctx.sender());
        debug::print(&b"TestObject was created and transferred");
    }
    
    /// Returns the value of a test object
    public fun get_object_value(obj: &TestObject): u64 {
        obj.value
    }
}


