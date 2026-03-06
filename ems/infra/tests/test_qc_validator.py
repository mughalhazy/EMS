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
        qc_validator.run_all_checks()

    def test_required_compose_services_present(self):
        qc_validator.validate_compose_stack()

    def test_observability_markers_present(self):
        qc_validator.validate_observability_and_secrets()


if __name__ == '__main__':
    unittest.main()
