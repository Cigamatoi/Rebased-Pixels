/**
 * Konfigurationsdatei für das NFT-Admin-System
 * Optimiert für echte Blockchain-Interaktionen auf Heroku
 */

const path = require('path');

// Basisverzeichnisse
const BASE_DIR = path.join(__dirname, '..');
const TEMP_DIR = process.env.TEMP_DIR || path.join(BASE_DIR, 'temp');
const LOGS_DIR = process.env.LOGS_DIR || path.join(BASE_DIR, 'logs');

// IOTA-Konfiguration
const IOTA_CLI_PATH = process.env.IOTA_CLI_PATH || 'iota'; // Auf Heroku durch Buildpack bereitgestellt
const MOVE_ANALYZER_PATH = process.env.MOVE_ANALYZER_PATH || 'move-analyzer';

// Blockchain-Konfiguration
const NETWORK = process.env.IOTA_NETWORK || 'testnet';
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || '0x0'; // Muss als Umgebungsvariable gesetzt werden
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY; // Muss als Umgebungsvariable gesetzt werden

// NFT-Konfiguration
const NFT_PACKAGE_ID = process.env.NFT_PACKAGE_ID || '0x6e70c6c7d3a652c54ec88d852857328d296a007e8abdfb143e943239a2ffbc31'; // Package ID des Smart Contracts
const NFT_MODULE_NAME = process.env.NFT_MODULE_NAME || 'rebased_pixels';
const NFT_MINT_FUNCTION = process.env.NFT_MINT_FUNCTION || 'mint_nft';
const NFT_RANDOM_FUNCTION = process.env.NFT_RANDOM_FUNCTION || 'get_random_winner';

// Setze dies auf false, um echte Blockchain-Interaktionen zu erzwingen
const USE_DATABASE = false; 
const DATABASE_URL = process.env.DATABASE_URL;

module.exports = {
  BASE_DIR,
  TEMP_DIR,
  LOGS_DIR,
  IOTA_CLI_PATH,
  MOVE_ANALYZER_PATH,
  NETWORK,
  ADMIN_ADDRESS,
  ADMIN_PRIVATE_KEY,
  NFT_PACKAGE_ID,
  NFT_MODULE_NAME,
  NFT_MINT_FUNCTION,
  NFT_RANDOM_FUNCTION,
  USE_DATABASE,
  DATABASE_URL
}; 