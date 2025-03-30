// dashboardAdmins.js

document.addEventListener("DOMContentLoaded", () => {
    const validPasswords = ["admin123", "securePass", "password2023"]; // Replace with your actual password validation logic

    // Create the popup container
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "1000";

    // Create the password input field
    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = "Enter Password";
    input.style.padding = "10px";
    input.style.fontSize = "16px";
    input.style.marginBottom = "10px";

    // Create the error message
    const errorMessage = document.createElement("div");
    errorMessage.textContent = "";
    errorMessage.style.color = "red";
    errorMessage.style.marginBottom = "10px";
    errorMessage.style.fontSize = "14px";

    // Create the submit button
    const button = document.createElement("button");
    button.textContent = "Submit";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";

    // Append elements to the popup
    popup.appendChild(errorMessage);
    popup.appendChild(input);
    popup.appendChild(button);
    document.body.appendChild(popup);

    // Handle button click
    button.addEventListener("click", () => {
        const password = input.value;
        if (validPasswords.includes(password)) {
            document.body.removeChild(popup); // Remove the popup
        } else {
            errorMessage.textContent = "Invalid password. Please try again.";
        }
    });

    // Prevent closing the popup
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
        }
    });
});