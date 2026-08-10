const nameInput = document.getElementById("nameInput");
const standardizeButton = document.getElementById("standardizeButton");

const result = document.getElementById("result");
const standardizedName = document.getElementById("standardizedName");
const status = document.getElementById("status");

const API_URL = "http://127.0.0.1:8000/standardize";


async function standardizeName(name) {

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name
        })
    });

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`
        );
    }

    return await response.json();
}


async function runStandardization() {

    const input = nameInput.value.trim();

    if (!input) {
        standardizedName.textContent = "";
        status.textContent = "Please enter a name.";
        result.classList.remove("hidden");
        return;
    }

    standardizeButton.disabled = true;
    standardizeButton.textContent = "Standardizing...";

    try {

        const response = await standardizeName(input);

        standardizedName.textContent =
            response.standardized;

        if (response.matched) {

            status.textContent =
                "✓ Name standardized";

        } else {

            status.textContent =
                "Unknown: " +
                response.unknown.join(", ");
        }

        result.classList.remove("hidden");

    } catch (error) {

        console.error(error);

        standardizedName.textContent = "";

        status.textContent =
            "Unable to connect to the API.";

        result.classList.remove("hidden");

    } finally {

        standardizeButton.disabled = false;
        standardizeButton.textContent = "Standardize";
    }
}


standardizeButton.addEventListener(
    "click",
    runStandardization
);


nameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            runStandardization();
        }

    }
);
