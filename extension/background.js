chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type !== "STANDARDIZE_NAME") {
            return;
        }

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
);
