document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("nameInput");
    const standardizeButton =
        document.getElementById("standardizeButton");

    const clearButton =
        document.getElementById("clearButton");

    const resultCard =
        document.getElementById("resultCard");

    const resultName =
        document.getElementById("resultName");

    const copyButton =
        document.getElementById("copyButton");

    const replaceButton =
        document.getElementById("replaceButton");

    let lastResult = "";

    function showResult(name) {
        lastResult = name;
        resultName.textContent = name;
        resultCard.classList.remove("hidden");
    }

    function hideResult() {
        resultCard.classList.add("hidden");
        lastResult = "";
    }

    function setLoading(loading) {
        standardizeButton.disabled = loading;

        const text =
            standardizeButton.querySelector("span");

        if (text) {
            text.textContent = loading
                ? "جاري التوحيد..."
                : "توحيد الاسم";
        }
    }

    function standardizeName() {
        const name = nameInput.value.trim();

        if (!name) {
            nameInput.focus();
            return;
        }

        setLoading(true);

        chrome.runtime.sendMessage(
            {
                type: "STANDARDIZE_NAME",
                name: name
            },
            (response) => {
                setLoading(false);

                if (chrome.runtime.lastError) {
                    console.error(
                        chrome.runtime.lastError.message
                    );

                    showResult(
                        "تعذر الاتصال بالخادم"
                    );

                    return;
                }

                if (!response || !response.success) {
                    console.error(
                        response?.error
                    );

                    showResult(
                        "تعذر الاتصال بالخادم"
                    );

                    return;
                }

                const data = response.data;

                if (data && data.standardized) {
                    showResult(data.standardized);
                } else {
                    showResult(name);
                }
            }
        );
    }

    standardizeButton.addEventListener(
        "click",
        standardizeName
    );

    nameInput.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                standardizeName();
            }
        }
    );

    nameInput.addEventListener(
        "input",
        () => {
            if (!nameInput.value.trim()) {
                hideResult();
            }
        }
    );

    clearButton.addEventListener(
        "click",
        () => {
            nameInput.value = "";
            hideResult();
            nameInput.focus();
        }
    );

    copyButton.addEventListener(
        "click",
        async () => {
            if (!lastResult) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    lastResult
                );

                const text =
                    copyButton.querySelector("span");

                if (text) {
                    const original =
                        text.textContent;

                    text.textContent = "تم النسخ ✓";

                    setTimeout(() => {
                        text.textContent = original;
                    }, 1400);
                }

            } catch (error) {
                console.error(
                    "Copy failed:",
                    error
                );
            }
        }
    );

    /*
     * Replace button
     * سيتم ربطه مع content.js في الخطوة التالية.
     */
    replaceButton.addEventListener(
        "click",
        async () => {
            if (!lastResult) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    lastResult
                );

                const text =
                    replaceButton.querySelector("span");

                if (text) {
                    const original =
                        text.textContent;

                    text.textContent = "تم النسخ ✓";

                    setTimeout(() => {
                        text.textContent = original;
                    }, 1400);
                }

            } catch (error) {
                console.error(
                    "Replace failed:",
                    error
                );
            }
        }
    );

    hideResult();
});
