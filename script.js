console.log('script.js loaded at:', new Date().toISOString());

// Global variable to store logo data URL
let companyLogoDataUrl = null;

// Set the initial Item No. for the first item on page load and initialize no-expiry checkbox
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing first item');

    // Handle logo upload
    const logoInput = document.querySelector('input[name="company_logo"]');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    companyLogoDataUrl = event.target.result;
                    console.log('Logo uploaded, data URL stored');
                };
                reader.readAsDataURL(file);
            } else {
                companyLogoDataUrl = null;
                console.log('No logo uploaded');
            }
        });
    } else {
        console.warn('Warning: input[name="company_logo"] not found in DOM');
    }

    // Initialize first item
    const firstItem = document.querySelector('.item');
    if (!firstItem) {
        console.error('Error: No .item element found');
        return;
    }
    const firstItemNoInput = firstItem.querySelector('input[name="item_no[]"]');
    if (!firstItemNoInput) {
        console.error('Error: Item No. input not found in first item');
        return;
    }
    firstItemNoInput.value = 1;
    firstItemNoInput.readOnly = true;
    console.log('Set first item Item No. to 1');

    // Initialize no-expiry checkbox for the first item
    initializeNoExpiryCheckbox(firstItem);
});

// Function to initialize no-expiry checkbox behavior
function initializeNoExpiryCheckbox(item) {
    const noExpiryCheckbox = item.querySelector('input[name="no_expiry[]"]');
    const expiryDateInput = item.querySelector('input[name="expiry_date[]"]');
    if (!noExpiryCheckbox || !expiryDateInput) {
        console.error('Error: No expiry checkbox or expiry date input found in item');
        return;
    }
