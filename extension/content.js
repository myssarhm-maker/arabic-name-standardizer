const API_URL = "http://127.0.0.1:8000/standardize";

let lastFocusedInput = null;


// Track the input currently being edited.
document.addEventListener("focusin", (event) => {
    const element = event.target;

    if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
    ) {
        lastFocusedInput = element;
    }
});


// Create the small suggestion box.
function createSuggestionBox() {

    let box = document.getElementById(
        "arabic-name-standardizer-box"
    );

    if (box) {
        return box;
    }

    box = document.createElement("div");

    box.id = "arabic-name-standardizer-box";

    box.style.position = "fixed";
    box.style.zIndex = "2147483647";
    box.style.display = "none";
    box.style.background = "#ffffff";
    box.style.border = "1px solid #d1d5db";
    box.style.borderRadius = "10px";
    box.style.padding = "10px";
    box.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.fontSize = "14px";
    box.style.color = "#111827";

    document.body.appendChild(box);

    return box;
}


// Ask the API to standardize a name.
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


// Show the result near the selected input.
async function showStandardization(input) {

    const value = input.value.trim();

    if (!value) {
        return;
    }

    try {

        const data = await standardizeName(value);

        const box = createSuggestionBox();

        box.innerHTML = "";

        const title = document.createElement("div");

        title.textContent = "Standardized name:";

        title.style.fontWeight = "bold";
        title.style.marginBottom = "6px";

        box.appendChild(title);


        const name = document.createElement("div");

        name.textContent = data.standardized;

        name.style.fontSize = "16px";
        name.style.marginBottom = "8px";

        box.appendChild(name);


        if (data.matched) {

            const button = document.createElement("button");

            button.textContent = "Use this name";

            button.style.cursor = "pointer";
            button.style.padding = "6px 10px";
            button.style.border = "none";
            button.style.borderRadius = "6px";

            button.addEventListener("click", () => {

                input.value = data.standardized;

                input.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );

                box.style.display = "none";
            });

            box.appendChild(button);

        } else {

            const unknown = document.createElement("div");

            unknown.textContent =
                "Unknown: " +
                data.unknown.join(", ");

            unknown.style.fontSize = "12px";
            unknown.style.marginTop = "5px";

            box.appendChild(unknown);
        }


        const rect = input.getBoundingClientRect();

        box.style.left = `${rect.left}px`;
        box.style.top = `${rect.bottom + 6}px`;
        box.style.display = "block";

    } catch (error) {

        console.error(
            "Arabic Name Standardizer:",
            error
        );
    }
}


// Add a keyboard shortcut.
//
// Ctrl + Shift + S on Windows/Linux
// Command + Shift + S on Mac
document.addEventListener("keydown", (event) => {

    const isMac =
        navigator.platform
            .toUpperCase()
            .includes("MAC");

    const shortcut =
        isMac
            ? event.metaKey && event.shiftKey && event.key === "S"
            : event.ctrlKey && event.shiftKey && event.key === "S";


    if (!shortcut) {
        return;
    }

    if (!lastFocusedInput) {
        return;
    }

    event.preventDefault();

    showStandardization(lastFocusedInput);
});


// Hide the suggestion box when clicking elsewhere.
document.addEventListener("click", (event) => {

    const box = document.getElementById(
        "arabic-name-standardizer-box"
    );

    if (!box) {
        return;
    }

    if (
        event.target !== box &&
        !box.contains(event.target)
    ) {
        box.style.display = "none";
    }
});
