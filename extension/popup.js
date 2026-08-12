document.addEventListener("DOMContentLoaded", () => {
    const nameInput =
        document.getElementById("nameInput");

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


    // ==========================================
    // Show result
    // ==========================================

    function showResult(name) {
        lastResult = name;

        resultName.textContent = name;

        resultCard.classList.remove("hidden");
    }


    // ==========================================
    // Hide result
    // ==========================================

    function hideResult() {
        resultCard.classList.add("hidden");

        lastResult = "";
    }


    // ==========================================
    // Loading state
    // ==========================================

    function setLoading(loading) {

        standardizeButton.disabled = loading;

        const text =
            standardizeButton.querySelector("span");

        if (!text) {
            return;
        }

        text.textContent = loading
            ? "جاري التوحيد..."
            : "توحيد الاسم";
    }


    // ==========================================
    // Standardize name
    // ==========================================

    function standardizeName() {

        const name =
            nameInput.value.trim();

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


                // Chrome runtime error
                if (chrome.runtime.lastError) {

                    console.error(
                        "Extension error:",
                        chrome.runtime.lastError.message
                    );

                    showResult(
                        "تعذر الاتصال بالخادم"
                    );

                    return;
                }


                // No response
                if (!response) {

                    console.error(
                        "No response from background."
                    );

                    showResult(
                        "تعذر الاتصال بالخادم"
                    );

                    return;
                }


                // API / background error
                if (!response.success) {

                    console.error(
                        "API error:",
                        response.error
                    );

                    showResult(
                        "تعذر الاتصال بالخادم"
                    );

                    return;
                }


                const data =
                    response.data;


                // Successful result
                if (
                    data &&
                    data.standardized
                ) {

                    showResult(
                        data.standardized
                    );

                } else {

                    showResult(name);
                }
            }
        );
    }


    // ==========================================
    // Standardize button
    // ==========================================

    standardizeButton.addEventListener(
        "click",
        standardizeName
    );


    // ==========================================
    // Enter key
    // ==========================================

    nameInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                standardizeName();
            }
        }
    );


    // ==========================================
    // Input change
    // ==========================================

    nameInput.addEventListener(
        "input",
        () => {

            if (!nameInput.value.trim()) {

                hideResult();
            }
        }
    );


    // ==========================================
    // Clear button
    // ==========================================

    clearButton.addEventListener(
        "click",
        () => {

            nameInput.value = "";

            hideResult();

            nameInput.focus();
        }
    );


    // ==========================================
    // Copy button
    // ==========================================

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

                    text.textContent =
                        "تم النسخ ✓";


                    setTimeout(
                        () => {

                            text.textContent =
                                original;

                        },
                        1400
                    );
                }


            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );
            }
        }
    );


    // ==========================================
    // Replace button
    // ==========================================

    replaceButton.addEventListener(
        "click",
        () => {

            if (!lastResult) {
                return;
            }


            chrome.runtime.sendMessage(
                {
                    type: "REPLACE_NAME",
                    name: lastResult
                },

                (response) => {

                    // Chrome runtime error
                    if (
                        chrome.runtime.lastError
                    ) {

                        console.error(
                            "Replace error:",
                            chrome.runtime.lastError.message
                        );

                        return;
                    }


                    // No response
                    if (!response) {

                        console.error(
                            "Replace failed: no response."
                        );

                        return;
                    }


                    // Replace failed
                    if (!response.success) {

                        console.error(
                            "Replace failed:",
                            response.error
                        );

                        return;
                    }


                    // Replace successful
                    const text =
                        replaceButton.querySelector(
                            "span"
                        );


                    if (text) {

                        const original =
                            text.textContent;

                        text.textContent =
                            "تم الاستبدال ✓";


                        setTimeout(
                            () => {

                                text.textContent =
                                    original;

                            },
                            1400
                        );
                    }
                }
            );
        }
    );


    // ==========================================
    // Initial state
    // ==========================================

    hideResult();
});
