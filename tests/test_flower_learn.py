import pytest
import json
from adaptive_ingestion_engine import AdaptiveIngestionEngine, IngestionConfig
from flower_learn import FlowerLearnEngine

def test_subtractive_parsing():
    engine = AdaptiveIngestionEngine()
    raw = "word " * 1000
    signal = engine.stage1_subtractive_parsing(raw)
    words = signal.split()
    assert len(words) <= 20

def test_adaptive_ingestion_pipeline_individual():
    engine = AdaptiveIngestionEngine()
    raw_data = "Flower Learn engine initialization. Supreme Senior Instructional Architect. Gate T(x) >= 0.9950."
    metadata = {"target_type": "individual", "persona": "practitioner"}
    result = engine.process(raw_data, metadata)
    assert result["status"] == "PONO VERIFIED"
    assert result["truth_score_tx"] >= 0.9950
    assert "SLIVER_GRAND_LEDGER" in result["ledger_hash"]
    assert result["package"]["package_type"] == "Flower Learn Master Package"

def test_adaptive_ingestion_pipeline_business():
    engine = AdaptiveIngestionEngine()
    raw_data = "Hana Runner enterprise yield matrix deployment. DLRA litigation ready asset."
    metadata = {"target_type": "business", "persona": "executive"}
    result = engine.process(raw_data, metadata)
    assert result["status"] == "PONO VERIFIED"
    assert result["package"]["package_type"] == "Hāna Runner 100-Channel Monetization Matrix"

def test_flower_learn_engine():
    fl_engine = FlowerLearnEngine()
    result = fl_engine.initialize_learning_session("Quantum Refraction Logic")
    assert result["learning_engine_name"] == "Flower Learn"
    assert result["truth_score_tx"] >= 0.9950
    assert result["package"]["ratio"] == "40% Theory / 60% Active Application"
