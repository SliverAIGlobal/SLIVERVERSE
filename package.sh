#!/bin/bash
set -e

echo "=========================================================="
echo "SIPES SAT-AI :: BUILD & PACKAGING AUTOMATION"
echo "Epoch: 10/09/2026 | Target User: Heather Soares"
echo "=========================================================="

mkdir -p build

echo "[1/4] Compiling SML C++ Edge Native Module..."
g++ -Wall -Wextra -std=c++17 src/sml/sml_edge_native.cpp -I src/sml -o build/sml_edge_native
./build/sml_edge_native

echo "[2/4] Testing Termux Python Scripts..."
PYTHONPATH=. pytest tests/

echo "[3/4] Validating ADB Shell Scripts..."
bash -n mobile/adb/pixel8_overrides.sh

echo "[4/4] Generating ZIP Distribution Package..."
ZIP_NAME="slm_edge_native_arbitrage.zip"
rm -f "$ZIP_NAME"

zip -r "$ZIP_NAME" \
    src/ \
    mobile/ \
    contracts/ \
    interface/ \
    docs/ \
    README.md \
    LICENSE \
    -x "*.pyc" -x "*/__pycache__/*"

sha256sum "$ZIP_NAME" > "${ZIP_NAME}.sha256"
md5sum "$ZIP_NAME" > "${ZIP_NAME}.md5"

echo "----------------------------------------------------------"
echo "Package Created Successfully: $ZIP_NAME"
echo "SHA256 Checksum: $(cat ${ZIP_NAME}.sha256)"
echo "=========================================================="
