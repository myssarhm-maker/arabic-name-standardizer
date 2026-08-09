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
