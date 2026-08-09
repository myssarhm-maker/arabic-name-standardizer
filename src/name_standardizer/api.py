from fastapi import FastAPI
from pydantic import BaseModel, Field

from .standardizer import NameStandardizer


app = FastAPI(
    title="Arabic Name Standardizer API",
    version="0.1.0",
    description=(
        "Standardize Arabic names and English spelling variants "
        "into one canonical English spelling."
    ),
)

standardizer = NameStandardizer()


class StandardizeRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        description="Arabic or English name",
    )


class StandardizeResponse(BaseModel):
    input: str
    standardized: str
    unknown: list[str]
    matched: bool


@app.get("/health")
def health():
    return {
        "status": "ok",
    }


@app.post(
    "/standardize",
    response_model=StandardizeResponse,
)
def standardize(request: StandardizeRequest):
    return standardizer.standardize(request.name)
