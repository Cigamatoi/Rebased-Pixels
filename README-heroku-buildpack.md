# Heroku Buildpack für IOTA CLI

Dieses Buildpack installiert die IOTA CLI auf Heroku für RebasedPixels.

## Erstellung des Buildpacks

1. Erstelle ein neues Repository `heroku-buildpack-iota-cli` mit folgender Struktur:

```
bin/
  compile
  detect
  release
```

2. Inhalt der Datei `bin/detect`:

```bash
#!/usr/bin/env bash
# Prüft, ob dieses Buildpack für die Anwendung geeignet ist
# Eine erfolgreiche Erkennung ist hier immer gegeben
echo "IOTA CLI"
exit 0
```

3. Inhalt der Datei `bin/compile`:

```bash
#!/usr/bin/env bash
# Kompilierungsschritt für das Buildpack

BUILD_DIR=$1
CACHE_DIR=$2
ENV_DIR=$3

# Installationsverzeichnis
INSTALL_DIR="$BUILD_DIR/.heroku/iota-cli"
mkdir -p $INSTALL_DIR

echo "-----> Installing IOTA CLI"

# Herunterladen der Linux-Version der IOTA CLI
IOTA_CLI_VERSION="0.12.0-rc"
IOTA_CLI_URL="https://github.com/iotaledger/iota-sdk/releases/download/v${IOTA_CLI_VERSION}/iota-cli-linux-x64.tar.gz"

# Erstelle temporäres Verzeichnis
TMP_DIR=$(mktemp -d)
cd $TMP_DIR

# Lade die Datei herunter
echo "-----> Downloading IOTA CLI v${IOTA_CLI_VERSION}"
curl -L --silent $IOTA_CLI_URL -o iota-cli.tar.gz

# Entpacke die Datei
echo "-----> Extracting IOTA CLI"
tar -xzf iota-cli.tar.gz

# Kopiere die Binärdatei in das Installationsverzeichnis
cp iota-cli $INSTALL_DIR/

# Mache die Binärdatei ausführbar
chmod +x $INSTALL_DIR/iota-cli

# Erstelle einen Symlink im PATH
mkdir -p "$BUILD_DIR/.profile.d"
cat << EOF > "$BUILD_DIR/.profile.d/iota-cli.sh"
export PATH="\$PATH:$INSTALL_DIR"
export IOTA_CLI_PATH="$INSTALL_DIR/iota-cli"
EOF

echo "-----> IOTA CLI Installation completed"
```

4. Inhalt der Datei `bin/release`:

```bash
#!/usr/bin/env bash
# Release-Hook für das Buildpack
cat << EOF
---
default_process_types:
  web: npm start
EOF
```

5. Mache die Skripte ausführbar:

```bash
chmod +x bin/compile bin/detect bin/release
```

6. Commit und Push zu GitHub:

```bash
git init
git add .
git commit -m "Initial commit for IOTA CLI Buildpack"
git remote add origin https://github.com/yourusername/heroku-buildpack-iota-cli.git
git push -u origin master
```

## Verwendung mit deiner Heroku-App

```bash
heroku buildpacks:add https://github.com/yourusername/heroku-buildpack-iota-cli --app deine-app-name
```

Nach dem Deployment wird die IOTA CLI im Pfad `/app/.heroku/iota-cli/iota-cli` verfügbar sein und die Umgebungsvariable `IOTA_CLI_PATH` wird automatisch gesetzt. 