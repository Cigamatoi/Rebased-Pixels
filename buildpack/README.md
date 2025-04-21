# Heroku Buildpack für IOTA CLI

Dieses Buildpack installiert die IOTA CLI auf Heroku für RebasedPixels.

## Was macht dieses Buildpack?

Dieses Buildpack installiert automatisch die IOTA CLI (Version 0.12.0-rc) in Heroku-Apps. Das ermöglicht die direkte Interaktion mit der IOTA-Blockchain innerhalb der Heroku-Umgebung.

## Verwendung

Füge das Buildpack zu deiner Heroku-App hinzu:

```bash
heroku buildpacks:add https://github.com/dein-username/heroku-buildpack-iota-cli
```

Nach der Installation ist die IOTA CLI im Pfad `/app/.heroku/iota-cli/iota-cli` verfügbar und die Umgebungsvariable `IOTA_CLI_PATH` ist automatisch gesetzt.

## Wichtige Umgebungsvariablen

In deiner Heroku-App sollten diese Umgebungsvariablen gesetzt sein:

```bash
heroku config:set NFT_PACKAGE_ID=0x6e70c6c7d3a652c54ec88d852857328d296a007e8abdfb143e943239a2ffbc31
heroku config:set ADMIN_ADDRESS=0x2814ed96c9c39ba01d2c4d164cdfbd8e272192dd1ae39d11aac49e352c11b3c5
heroku config:set ADMIN_PRIVATE_KEY=dein-privater-schlüssel
``` 