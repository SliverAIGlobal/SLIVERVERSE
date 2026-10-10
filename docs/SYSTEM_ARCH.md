# SYSTEM ARCHITECTURE: SLM EDGE NATIVE ARBITRAGE
**USER:** Heather Soares
**EPOCH:** 10/09/2026
**9SM VERIFICATION:** 9SM-SEC-44 (PASSED)
**T(x) CONFIDENCE:** ≥ 0.995

---

## Overview

The `slm_edge_native_arbitrage` repository combines edge-native Small Machine Learning (SML) inference with mobile automated monitoring and EVM flash loan smart contract execution. It is optimized specifically for the Pixel 8 device running Linux terminal / Termux interfaces and Cake Wallet integrations.

---

## Directory & Subsystem Components

1. **`src/sml/` (Edge Native C++ Engine)**
   - `sml_logic_engine.h`: C++ header for Tensor Lite Micro (TFLM) initialization and T(x) audit logic.
   - `sml_edge_native.cpp`: Native implementation and logic verification entry point.

2. **`mobile/` (Pixel 8 & Termux Integrations)**
   - `mobile/termux/cake_monitor.py`: Monero/Crypto public node blockchain monitoring script designed for Cake Wallet integration on Termux.
   - `mobile/termux/requirements.txt`: Python package requirements (`requests`, `pytest`).
   - `mobile/adb/pixel8_overrides.sh`: Performance override shell script for Pixel 8 hardware (Tensor G3/G4 NPU, 120Hz LTPO force, camera parity, latency reduction).

3. **`contracts/solidity/` (DeFi Execution)**
   - `SipesArbitrageBot.sol`: Solidity smart contract for Flash Loan arbitrage execution (Aave V3 / PancakeSwap / Uniswap pathing) with atomic reversal protections.

4. **`interface/web/` (SIPES Terminal UI)**
   - `index.html`: Responsive, offline-capable single-file dark mode terminal interface for system monitoring and diagnostic readouts.

5. **`docs/` (Logs & Architectures)**
   - `SYSTEM_ARCH.md`: Complete system architecture specification.
   - `VERIFICATION_LOG.txt`: Epoch 10/09/2026 audit logs and T(x) verification sequence.
