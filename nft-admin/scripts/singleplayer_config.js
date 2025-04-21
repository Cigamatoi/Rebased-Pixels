/**
 * Konfiguration für den Singleplayer-Paid-NFT Smart Contract
 */

// IOTA CLI Pfad
const IOTA_CLI_PATH = process.env.IOTA_CLI_PATH || 'C:\\iota\\iota.exe';

// Smart Contract Konfiguration
const SINGLEPLAYER_PACKAGE_ID = process.env.SINGLEPLAYER_PACKAGE_ID || '0x2f7b8053ffde7173ce879022152ffadeb288e135ac50cb35552afb9376229bef';
const SINGLEPLAYER_MODULE_NAME = process.env.SINGLEPLAYER_MODULE_NAME || 'singleplayer_paid_nft';
const SINGLEPLAYER_MINT_FUNCTION = process.env.SINGLEPLAYER_MINT_FUNCTION || 'mint_singleplayer_nft';
const SINGLEPLAYER_SIMPLE_MINT_FUNCTION = process.env.SINGLEPLAYER_SIMPLE_MINT_FUNCTION || 'mint_simple_nft';

// Admin Capability
const ADMIN_CAP_ID = process.env.ADMIN_CAP_ID || '0x05b89cedd214165220b9ff44c8b92170469975639ba7ee500a6591f3215628e4';
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5';

// Benötigter Betrag für das NFT-Minting (5 IOTA)
const REQUIRED_PAYMENT = 5000000;

module.exports = {
  IOTA_CLI_PATH,
  SINGLEPLAYER_PACKAGE_ID,
  SINGLEPLAYER_MODULE_NAME,
  SINGLEPLAYER_MINT_FUNCTION,
  SINGLEPLAYER_SIMPLE_MINT_FUNCTION,
  ADMIN_CAP_ID,
  ADMIN_ADDRESS,
  REQUIRED_PAYMENT
}; 