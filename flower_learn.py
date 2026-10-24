import json
import sys
from adaptive_ingestion_engine import AdaptiveIngestionEngine, IngestionConfig

class FlowerLearnEngine:
    def __init__(self, name: str = "Flower Learn", role: str = "Supreme Senior Instructional Architect & OMNI Synthesis Engine"):
        self.name = name
        self.role = role
        self.config = IngestionConfig(tx_threshold=0.9950)
        self.engine = AdaptiveIngestionEngine(config=self.config)

    def initialize_learning_session(self, topic_data: str) -> dict:
        metadata = {
            "target_type": "individual",
            "persona": "practitioner",
            "role": self.role,
            "gate": "T(x) >= 0.9950",
            "framework": "ELIP (Explain-Like-I'm-Professional)",
            "modules": ["Guidebook", "Self-Completion Worksheet", "Interactive Focus Mandala", "Delta Rubric"],
            "ledger": "SLIVER-GRAND_LEDGER via Proton CLI"
        }
        output = self.engine.process(topic_data, metadata)
        output["learning_engine_name"] = self.name
        output["role"] = self.role
        return output

if __name__ == "__main__":
    topic = "Quantum Information Theory & 81-Diremption Refraction Metamodels"
    fl_engine = FlowerLearnEngine()
    res = fl_engine.initialize_learning_session(topic)
    print(json.dumps(res, indent=2))
