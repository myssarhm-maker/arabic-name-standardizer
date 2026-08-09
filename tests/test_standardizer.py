import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from name_standardizer import NameStandardizer


def test_muhammad():
    result = NameStandardizer().standardize("محمد")

    assert result["standardized"] == "Muhammad"
    assert result["matched"] is True


def test_compound_name():
    result = NameStandardizer().standardize("محمد علي")

    assert result["standardized"] == "Muhammad Ali"
    assert result["matched"] is True


def test_abdulrahman_variants():
    standardizer = NameStandardizer()

    result1 = standardizer.standardize("عبدالرحمن")
    result2 = standardizer.standardize("عبد الرحمن")

    assert result1["standardized"] == "Abdulrahman"
    assert result2["standardized"] == "Abdulrahman"


def test_arabic_diacritics():
    result = NameStandardizer().standardize("مُحَمَّد")

    assert result["standardized"] == "Muhammad"


def test_unknown_name_is_reported():
    result = NameStandardizer().standardize("اسمغيرموجود")

    assert result["unknown"] == ["اسمغيرموجود"]
    assert result["matched"] is False


def test_empty_name():
    result = NameStandardizer().standardize("")

    assert result["standardized"] == ""
    assert result["matched"] is False
