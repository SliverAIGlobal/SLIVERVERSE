import unittest
from adaptive_ingestion_engine import AdaptiveIngestionEngine, IngestionConfig


class TestAdaptiveIngestionPipeline(unittest.TestCase):

    def setUp(self):
        self.engine = AdaptiveIngestionEngine()
        self.sample_raw_data = (
            "ENTITY: SOL-998 VECTOR: RESONANCE SOURCE: Hana Maui INTENT: PONO COVENANT. "
            "This is a high-fidelity operational test payload for veridical data processing. "
            "Additional context for testing CKN extraction and density score evaluation."
        )

    def test_stage1_subtractive_parsing(self):
        signal = self.engine.stage1_subtractive_parsing(self.sample_raw_data)
        self.assertTrue(len(signal) > 0)
        self.assertLessEqual(len(signal.split()), len(self.sample_raw_data.split()))

    def test_stage2_context_profiling_individual(self):
        context = self.engine.stage2_context_profiling(
            self.sample_raw_data, {"target_type": "individual", "persona": "learner"}
        )
        self.assertEqual(context.target_type, "individual")
        self.assertEqual(context.persona, "learner")
        self.assertTrue(len(context.ckns) > 0)

    def test_stage2_context_profiling_business(self):
        context = self.engine.stage2_context_profiling(
            self.sample_raw_data, {"target_type": "business", "persona": "executive"}
        )
        self.assertEqual(context.target_type, "business")
        self.assertEqual(context.persona, "executive")

    def test_stage3_refraction_wavelengths(self):
        context = self.engine.stage2_context_profiling(self.sample_raw_data, {})
        wavelengths = self.engine.stage3_refract_81_diremptions(context)
        self.assertIn("400nm_violet_compute", wavelengths)
        self.assertIn("700nm_red_telos", wavelengths)
        self.assertGreaterEqual(wavelengths["700nm_red_telos"], 0.995)

    def test_stage4_and_stage5_individual_package(self):
        res = self.engine.process(self.sample_raw_data, {"target_type": "individual"})
        self.assertEqual(res["status"], "PONO VERIFIED")
        self.assertGreaterEqual(res["truth_score_tx"], 0.995)
        self.assertIn("_SLIVER_GRAND_LEDGER", res["ledger_hash"])
        self.assertEqual(res["package"]["package_type"], "Flower Learn Master Package")

    def test_stage4_and_stage5_business_package(self):
        res = self.engine.process(self.sample_raw_data, {"target_type": "business"})
        self.assertEqual(res["status"], "PONO VERIFIED")
        self.assertEqual(res["package"]["package_type"], "Hāna Runner 100-Channel Monetization Matrix")


if __name__ == "__main__":
    unittest.main()
