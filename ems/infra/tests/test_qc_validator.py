import importlib.util
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / 'scripts' / 'ci' / 'qc_validator.py'
spec = importlib.util.spec_from_file_location('qc_validator', MODULE_PATH)
qc_validator = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(qc_validator)


class QcValidatorTests(unittest.TestCase):
    def test_all_checks_pass(self):
        scores = qc_validator.run_all_checks()
        self.assertTrue(scores)
        self.assertTrue(all(score == 10 for score in scores.values()))

    def test_api_protection_markers_present(self):
        qc_validator.validate_api_protection()

    def test_infrastructure_resilience_markers_present(self):
        qc_validator.validate_infrastructure_resilience()


if __name__ == '__main__':
    unittest.main()
