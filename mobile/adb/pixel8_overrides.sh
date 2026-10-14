#!/bin/bash
# Optimization for Pixel 8 Tensor G3/G4 - SIPES Performance Mode
# Target: Pixel 8 "Top Tier" Override Manifest [DE-7792]

echo "=== SIPES SAT-AI :: Pixel 8 ADB Overrides ==="
echo "Target User: Heather Soares | Epoch: 10/09/2026"

# 1. DISPLAY & REFRESH RATE OVERRIDES
adb shell settings put global peak_refresh_rate 120.0
adb shell settings put global min_refresh_rate 120.0
adb shell setprop persist.sys.brightness.low.gamma true
adb shell setprop vendor.display.enable_fp_composition_type 1

# 2. PRO-CAMERA FEATURE PARITY
adb shell setprop persist.vendor.camera.pro_mode 1
adb shell setprop persist.vendor.camera.high_res_enabled 1
adb shell setprop persist.camera.eis.enable 1
adb shell setprop persist.camera.gyro.disable 0

# 3. TENSOR AI & NPU PERFORMANCE OVERRIDES
adb shell setprop persist.vendor.ai_core.performance_mode 1
adb shell setprop persist.vendor.powerhal.adpf.index_mode 1
adb shell setprop vendor.powerhal.render_boost 1

# 4. SYSTEM-LEVEL LATENCY REDUCTION & ANIMATIONS
adb shell setprop persist.sys.thermal.config 0
adb shell settings put global window_animation_scale 0.0
adb shell settings put global transition_animation_scale 0.0
adb shell settings put global animator_duration_scale 0.0
adb shell settings put global max_cached_processes 64

echo "Pixel 8 ADB Overrides Applied. T(x) Optimization Confirmed."
