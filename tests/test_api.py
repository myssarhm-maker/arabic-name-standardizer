from fastapi.testclient import TestClient

from name_standardizer.api import app


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_standardize_arabic_name():
    response = client.post(
        "/standardize",
        json={"name": "محمد"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "input": "محمد",
        "standardized": "Muhammad",
        "unknown": [],
        "matched": True,
    }


def test_standardize_english_variant():
    response = client.post(
        "/standardize",
        json={"name": "Mohammed"},
    )

    assert response.status_code == 200
    assert response.json()["standardized"] == "Muhammad"
    assert response.json()["matched"] is True


def test_standardize_compound_name():
    response = client.post(
        "/standardize",
        json={"name": "Mohammed Ali"},
    )

    assert response.status_code == 200
    assert response.json()["standardized"] == "Muhammad Ali"
    assert response.json()["matched"] is True

def test_unknown_name():
    response = client.post(
        "/standardize",
        json={"name": "Xyzabc"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "input": "Xyzabc",
        "standardized": "Xyzabc",
        "unknown": ["Xyzabc"],
        "matched": False,
    }

def test_standardize_compound_arabic_name():
    response = client.post(
        "/standardize",
        json={"name": "محمد حسين علي"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "input": "محمد حسين علي",
        "standardized": "Muhammad Hussein Ali",
        "unknown": [],
        "matched": True,
    }


def test_standardize_compound_english_name_with_variants():
    response = client.post(
        "/standardize",
        json={"name": "Mohammed Hussain Ali"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "input": "Mohammed Hussain Ali",
        "standardized": "Muhammad Hussein Ali",
        "unknown": [],
        "matched": True,
    }


def test_compound_name_with_unknown_token():
    response = client.post(
        "/standardize",
        json={"name": "Mohammed Xyzabc Ali"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "input": "Mohammed Xyzabc Ali",
        "standardized": "Muhammad Xyzabc Ali",
        "unknown": ["Xyzabc"],
        "matched": False,
    }
