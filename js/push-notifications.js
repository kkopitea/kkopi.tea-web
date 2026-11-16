import { auth } from "./firebase-config.js";

const publishEndpoint =
    "https://kkopiconnect-groq-chat.kkopiconnect-chat.workers.dev/notifications/publish";

export async function notifyPublishedContent(collection, documentId) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be signed in as an admin to send this alert.");
    }

    const response = await fetch(publishEndpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ collection, documentId })
    });

    if (!response.ok) {
        let errorMessage = `Push notification failed (${response.status}).`;

        try {
            const result = await response.json();
            if (typeof result.error === "string") {
                errorMessage = result.error;
            }
        } catch {
            // Keep the status-based error when the endpoint has no JSON body.
        }

        throw new Error(errorMessage);
    }
}
