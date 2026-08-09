const nameInput = document.getElementById("nameInput");
const standardizeButton = document.getElementById("standardizeButton");

const result = document.getElementById("result");
const standardizedName = document.getElementById("standardizedName");
const status = document.getElementById("status");


const NAME_RULES = {
    "mohammed": "Muhammad",
    "mohammad": "Muhammad",
    "mohamed": "Muhammad",
    "mohamad": "Muhammad",

    "ahmad": "Ahmad",
    "ahmed": "Ahmad",

    "hassan": "Hassan",
    "hasan": "Hassan",

    "hussein": "Hussein",
    "hussain": "Hussein",
    "husain": "Hussein",

    "ali": "Ali",

    "mustafa": "Mustafa",
    "mostafa": "Mustafa",

    "yusuf": "Yusuf",
    "yousef": "Yusuf",
    "youssef": "Yusuf"
};


function standardizeName(name) {

    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
        return {
            standardized: "",
            unknown: [],
            matched: false
        };
    }

    const tokens = normalized.split(" ");

    const output = [];
    const unknown = [];

    for (const token of tokens) {

        const key = token.toLowerCase();

        if (NAME_RULES[key]) {
            output.push(NAME_RULES[key]);
        } else {
            output.push(token);
            unknown.push(token);
        }
    }

    return {
        standardized: output.join(" "),
        unknown: unknown,
        matched: unknown.length === 0
    };
}


function runStandardization() {

    const input = nameInput.value;

    const response = standardizeName(input);

    standardizedName.textContent = response.standardized;

    if (response.matched) {

        status.textContent = "✓ Name standardized";

    } else {

        status.textContent =
            "Unknown: " + response.unknown.join(", ");
    }

    result.classList.remove("hidden");
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
