chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        // Standardize name
        if (message.type === "STANDARDIZE_NAME") {

            fetch("http://127.0.0.1:8000/standardize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: message.name
                })
            })
            .then(async (response) => {

                if (!response.ok) {
                    throw new Error(
                        `API returned ${response.status}`
                    );
                }

                return response.json();
            })
            .then((data) => {

                sendResponse({
                    success: true,
                    data: data
                });

            })
            .catch((error) => {

                console.error(
                    "Arabic Name Standardizer API error:",
                    error
                );

                sendResponse({
                    success: false,
                    error: error.message
                });

            });

            return true;
        }

        // Replace name in active tab
        if (message.type === "REPLACE_NAME") {

            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                (tabs) => {

                    if (
                        !tabs ||
                        !tabs[0] ||
                        !tabs[0].id
                    ) {
                        sendResponse({
                            success: false,
                            error: "No active tab."
                        });
                        return;
                    }

                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {
                            type: "REPLACE_NAME",
                            name: message.name
                        },
                        (response) => {

                            if (
                                chrome.runtime.lastError
                            ) {
                                sendResponse({
                                    success: false,
                                    error:
                                        chrome.runtime.lastError.message
                                });
                                return;
                            }

                            sendResponse(
                                response || {
                                    success: false,
                                    error:
                                        "No response from content script."
                                }
                            );
                        }
                    );
                }
            );

            return true;
        }
    }
);
