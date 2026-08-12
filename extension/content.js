(function () {
    "use strict";

    console.log("Arabic Name Standardizer: loaded");

    let currentField = null;
    let standardizeButton = null;

    function hasArabic(text) {
        return /[\u0600-\u06FF]/.test(text);
    }

    function isTextField(element) {
        if (!element) return false;

        if (element.tagName === "TEXTAREA") {
            return true;
        }

        if (element.tagName === "INPUT") {
            const type = (
                element.type || "text"
            ).toLowerCase();

            return [
                "text",
                "search",
                "email"
            ].includes(type);
        }

        return false;
    }

    function createButton() {
        if (standardizeButton) {
            return standardizeButton;
        }

        standardizeButton =
            document.createElement("button");

        standardizeButton.textContent =
            "توحيد الاسم";

        standardizeButton.type = "button";

        standardizeButton.style.position = "fixed";
        standardizeButton.style.zIndex = "999999999";
        standardizeButton.style.padding = "9px 16px";
        standardizeButton.style.border = "none";
        standardizeButton.style.borderRadius = "8px";
        standardizeButton.style.backgroundColor =
            "#1a73e8";
        standardizeButton.style.color = "#ffffff";
        standardizeButton.style.fontSize = "14px";
        standardizeButton.style.fontWeight = "bold";
        standardizeButton.style.cursor = "pointer";
        standardizeButton.style.boxShadow =
            "0 2px 8px rgba(0,0,0,0.25)";
        standardizeButton.style.display = "none";

        document.body.appendChild(
            standardizeButton
        );

        standardizeButton.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                standardizeName();
            }
        );

        return standardizeButton;
    }

    function showButton(field) {
        const button = createButton();

        const rect =
            field.getBoundingClientRect();

        let left = rect.left;
        let top = rect.bottom + 8;

        if (left + 150 > window.innerWidth) {
            left = window.innerWidth - 160;
        }

        if (top + 45 > window.innerHeight) {
            top = rect.top - 50;
        }

        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
        button.style.display = "block";
    }

    function hideButton() {
        if (standardizeButton) {
            standardizeButton.style.display =
                "none";
        }
    }

    function standardizeName() {
        if (!currentField) {
            return;
        }

        const name =
            currentField.value.trim();

        if (!name || !hasArabic(name)) {
            return;
        }

        standardizeButton.disabled = true;
        standardizeButton.textContent =
            "جاري التوحيد...";

        chrome.runtime.sendMessage(
            {
                type: "STANDARDIZE_NAME",
                name: name
            },
            function (response) {

                standardizeButton.disabled = false;
                standardizeButton.textContent =
                    "توحيد الاسم";

                if (chrome.runtime.lastError) {
                    console.error(
                        "Extension error:",
                        chrome.runtime.lastError.message
                    );
                    return;
                }

                if (!response) {
                    console.error(
                        "No response from background."
                    );
                    return;
                }

                if (!response.success) {
                    console.error(
                        "API error:",
                        response.error
                    );
                    return;
                }

                const result =
                    response.data;

                if (
                    result &&
                    result.standardized
                ) {
                    currentField.value =
                        result.standardized;

                    currentField.dispatchEvent(
                        new Event("input", {
                            bubbles: true
                        })
                    );

                    currentField.dispatchEvent(
                        new Event("change", {
                            bubbles: true
                        })
                    );

                    hideButton();
                }
            }
        );
    }

    /*
     * Track the active text field.
     */
    document.addEventListener(
        "focusin",
        function (event) {

            const field = event.target;

            if (!isTextField(field)) {
                return;
            }

            currentField = field;

            if (hasArabic(field.value)) {
                showButton(field);
            } else {
                hideButton();
            }
        }
    );

    document.addEventListener(
        "input",
        function (event) {

            const field = event.target;

            if (!isTextField(field)) {
                return;
            }

            currentField = field;

            if (hasArabic(field.value)) {
                showButton(field);
            } else {
                hideButton();
            }
        }
    );

    /*
     * Hide button when leaving the field.
     */
    document.addEventListener(
        "focusout",
        function (event) {

            if (
                standardizeButton &&
                event.relatedTarget ===
                    standardizeButton
            ) {
                return;
            }

            setTimeout(function () {

                if (
                    document.activeElement !==
                        currentField &&
                    document.activeElement !==
                        standardizeButton
                ) {
                    hideButton();
                }

            }, 200);
        }
    );

    /*
     * Move button when page scrolls.
     */
    window.addEventListener(
        "scroll",
        function () {

            if (
                currentField &&
                standardizeButton &&
                standardizeButton.style.display !==
                    "none"
            ) {
                showButton(currentField);
            }
        }
    );

    /*
     * Move button when window resizes.
     */
    window.addEventListener(
        "resize",
        function () {

            if (
                currentField &&
                standardizeButton &&
                standardizeButton.style.display !==
                    "none"
            ) {
                showButton(currentField);
            }
        }
    );

    /*
     * Receive replacement requests
     * from popup/background.
     */
    chrome.runtime.onMessage.addListener(
        function (
            message,
            sender,
            sendResponse
        ) {

            if (
                message.type !==
                "REPLACE_NAME"
            ) {
                return;
            }

            if (!currentField) {
                sendResponse({
                    success: false,
                    error:
                        "No active name field."
                });

                return;
            }

            if (
                !isTextField(currentField)
            ) {
                sendResponse({
                    success: false,
                    error:
                        "Active field is not a text field."
                });

                return;
            }

            const newName =
                message.name;

            if (!newName) {
                sendResponse({
                    success: false,
                    error:
                        "No name provided."
                });

                return;
            }

            /*
             * Replace the name.
             */
            currentField.value =
                newName;

            /*
             * Notify modern websites
             * such as React / Vue / Angular.
             */
            currentField.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            currentField.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );

            currentField.focus();

            hideButton();

            sendResponse({
                success: true
            });
        }
    );

})();
