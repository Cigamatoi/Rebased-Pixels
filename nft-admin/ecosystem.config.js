module.exports = {
  apps : [{
    name: 'nft-automint',
    script: 'src/scripts/autoMintCron.js',
    watch: false,
    env: {
      NODE_ENV: 'production',
      MOVE_ANALYZER_PATH: 'C:\\iota\\Move-analyzer.exe',
      IOTA_CLI_PATH: 'C:\\iota\\iota.exe',
      NEXT_PUBLIC_ADMIN_ADDRESS: '0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5'
    }
  }]
}; 