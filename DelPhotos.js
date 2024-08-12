// How many photos to delete?
// Put a number value, like this
// const maxImageCount = 5896
const maxImageCount = "ALL_PHOTOS";

// Selector for Images and buttons
const ELEMENT_SELECTORS = {
    checkboxClass: '.ckGgle',
    languageAgnosticDeleteButton: 'div[data-delete-origin] button',
    deleteButton: 'button[aria-label="Delete"]',
    confirmationButton: 'button span:contains("Move to bin")'  // Updated selector for confirmation button based on text content
}

// Time Configuration (in milliseconds)
const TIME_CONFIG = {
    delete_cycle: 10000,
    press_button_delay: 3000,  // Increased delay
    find_button_delay: 5000    // Added delay before finding the button
};

const MAX_RETRIES = 1000;

let imageCount = 0;

let checkboxes;
let buttons = {
    deleteButton: null,
    confirmationButton: null
};

let deleteTask = setInterval(async () => {
    let attemptCount = 1;

    do {
        checkboxes = document.querySelectorAll(ELEMENT_SELECTORS['checkboxClass']);
        await new Promise(r => setTimeout(r, 1000));
    } while (checkboxes.length <= 0 && attemptCount++ < MAX_RETRIES);

    if (checkboxes.length <= 0) {
        console.log("[INFO] No more images to delete.");
        clearInterval(deleteTask);
        console.log("[SUCCESS] Tool exited.");
        return;
    }

    attemptCount = 1;
    imageCount += checkboxes.length;

    checkboxes.forEach((checkbox) => { checkbox.click(); });
    console.log("[INFO] Deleting", checkboxes.length, "images");

    setTimeout(async () => {
        try {
            buttons.deleteButton = document.querySelector(ELEMENT_SELECTORS['languageAgnosticDeleteButton']);
            if (buttons.deleteButton) {
                buttons.deleteButton.click();
            } else {
                throw new Error("Language-agnostic delete button not found");
            }
        } catch (error) {
            buttons.deleteButton = document.querySelector(ELEMENT_SELECTORS['deleteButton']);
            if (buttons.deleteButton) {
                buttons.deleteButton.click();
            } else {
                console.error("[ERROR] Delete button not found.");
                clearInterval(deleteTask);
                return;
            }
        }

        // Added delay before finding the confirmation button
        await new Promise(r => setTimeout(r, TIME_CONFIG['find_button_delay']));

        setTimeout(() => {
            buttons.confirmationButton = document.querySelector(ELEMENT_SELECTORS['confirmationButton']);
            if (buttons.confirmationButton && buttons.confirmationButton.offsetParent !== null) {
                buttons.confirmationButton.click();

                console.log(`[INFO] ${imageCount}/${maxImageCount} Deleted`);
                if (maxImageCount !== "ALL_PHOTOS" && imageCount >= parseInt(maxImageCount)) {
                    console.log(`${imageCount} photos deleted as requested`);
                    clearInterval(deleteTask);
                    console.log("[SUCCESS] Tool exited.");
                    return;
                }
            } else {
                console.error("[ERROR] Confirmation button not found or not visible.");
            }
        }, TIME_CONFIG['press_button_delay']);
    }, TIME_CONFIG['press_button_delay']);
}, TIME_CONFIG['delete_cycle']);
