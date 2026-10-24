#!/usr/bin/env bash
# Package Compilation & Verification Pipeline for SLIVER VERITAS Edge Engine

set -e

REPO_ROOT="/app"
DIST_DIR="$REPO_ROOT/dist"
PACKAGE_NAME="sliver_edge_veritas_master.zip"

echo "=== Beginning Packaging Build Pipeline at $REPO_ROOT ==="

# 1. Clean build directory & previous artifacts
rm -rf "$DIST_DIR" "$REPO_ROOT/$PACKAGE_NAME" "$REPO_ROOT/$PACKAGE_NAME.sha256" "$REPO_ROOT/$PACKAGE_NAME.md5"
mkdir -p "$DIST_DIR"

# 2. Copy source artifacts into build distribution
cp "$REPO_ROOT/index.html" "$DIST_DIR/"
[ -d "$REPO_ROOT/docs" ] && cp -r "$REPO_ROOT/docs" "$DIST_DIR/"
[ -d "$REPO_ROOT/src" ] && cp -r "$REPO_ROOT/src" "$DIST_DIR/"

# 3. Zip package creation
cd "$DIST_DIR"
zip -r "$REPO_ROOT/$PACKAGE_NAME" .
cd "$REPO_ROOT"

# 4. Generate Cryptographic Checksums (Root & Internal Manifest Copy)
echo "=== Generating Cryptographic Checksums ==="
sha256sum "$PACKAGE_NAME" > "$PACKAGE_NAME.sha256"
md5sum "$PACKAGE_NAME" > "$PACKAGE_NAME.md5"

cp "$PACKAGE_NAME.sha256" "$DIST_DIR/"
cp "$PACKAGE_NAME.md5" "$DIST_DIR/"

echo "Build Complete: $REPO_ROOT/$PACKAGE_NAME"
echo "SHA256 Checksum: $(cat $PACKAGE_NAME.sha256)"
