document.getElementById("Record").addEventListener("click", function() {
    // Show the hidden URL input field and button
    document.getElementById("loadurl").style.display = "block";
});

document.getElementById("loadUrlButton").addEventListener("click", function() {
    // Get the URL from the input field
    const url = document.getElementById("urlInput").value;
    
    // Check if the URL is not empty and starts with "http"
    if (url && url.startsWith("http")) {
        // Open the URL in a new tab
        chrome.tabs.create({ url: url });
    } else {
        alert("Please enter a valid URL starting with http or https.");
    }
});
let recordedInteractions = [];

// Function to start recording interactions
function startRecording() {
    // Listen for click events on the document
    document.addEventListener("click", handleClick);
}

// Handle mouse click events
function handleClick(event) {
    // Get the element that was clicked
    const element = event.target;
    
    // Get the type of the element (input, button, etc.)
    const elementType = element.tagName.toLowerCase();
    
    // Define the information we want to capture
    let elementInfo = {
        type: "click",
        element: elementType,
        xpath: getXPath(element),
        text: "", // Default empty text
        name: "", // Default empty name
    };

    // For radio buttons, checkboxes, and inputs with type text
    if (elementType === "input") {
        if (element.type === "radio" || element.type === "checkbox") {
            elementInfo.name = element.name;
            elementInfo.text = element.checked ? element.value : "";
        } else if (element.type === "text" || element.type === "password" || element.type === "email") {
            elementInfo.text = element.value;  // For text inputs, capture the entered text
        }
    }
    // For buttons or links, capture the text of the button or link
    else if (elementType === "button" || elementType === "a") {
        elementInfo.text = element.textContent.trim();
    } else if (elementType === "label") {
        // If the clicked element is a label, capture the label text
        elementInfo.text = element.textContent.trim();
    }

    // Record the interaction
    recordedInteractions.push(elementInfo);
    console.log("Click recorded: ", elementInfo);
}

// Function to stop recording interactions
function stopRecording() {
    document.removeEventListener("click", handleClick);
    console.log("Recording stopped");
}

// Start recording when the "Record" button is clicked
document.getElementById("Record").addEventListener("click", function() {
    startRecording();
    document.getElementById("loadurl").style.display = "none"; // Hide the URL input div when recording starts
});

// Stop recording when the "Stop" button is clicked
document.getElementById("Stop").addEventListener("click", function() {
    stopRecording();
    console.log("Recorded Clicks: ", recordedInteractions);
});

// Save the recorded clicks when the "Save" button is clicked
document.getElementById("Save").addEventListener("click", function() {
    const blob = new Blob([JSON.stringify(recordedInteractions)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_clicks.json";
    a.click();
    URL.revokeObjectURL(url);
    console.log("Clicks saved as JSON file");
});

// Function to get the XPath of an element
function getXPath(element) {
    if (element.id) {
        return `id("${element.id}")`;
    } else if (element === document.body) {
        return '/html/body';
    }

    const siblings = element.parentNode.children;
    let index = 0;
    for (let i = 0; i < siblings.length; i++) {
        if (siblings[i] === element) {
            index = i + 1; // XPath indices are 1-based
        }
    }

    return `${getXPath(element.parentNode)}/${element.tagName.toLowerCase()}[${index}]`;
}
