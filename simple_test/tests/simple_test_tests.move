/*
#[test_only]
module simple_test::simple_test_tests;
// uncomment this line to import the module
// use simple_test::simple_test;

const ENotImplemented: u64 = 0;

#[test]
fun test_simple_test() {
    // pass
}

#[test, expected_failure(abort_code = ::simple_test::simple_test_tests::ENotImplemented)]
fun test_simple_test_fail() {
    abort ENotImplemented
}
*/

#[test_only]
module simple_test::simple_test_tests {
    use simple_test::simple_test;
    use std::debug;
    
    #[test]
    fun test_get_value() {
        // Überprüfe, ob die get_value-Funktion 42 zurückgibt
        let value = simple_test::get_value();
        assert!(value == 42, 0);
        debug::print(&value);
    }
}
