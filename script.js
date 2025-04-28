console.log('script.js loaded at:', new Date().toISOString());

// Set the initial Item No. for the first item on page load and initialize no-expiry checkbox
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing first item');
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
    noExpiryCheckbox.addEventListener('change', () => {
        if (noExpiryCheckbox.checked) {
            expiryDateInput.disabled = true;
            expiryDateInput.required = false;
            expiryDateInput.value = '';
            console.log('Expiry date disabled for item');
        } else {
            expiryDateInput.disabled = false;
            expiryDateInput.required = true;
            console.log('Expiry date enabled for item');
        }
    });
}

// Add item functionality with auto-incrementing Item No. and no-expiry checkbox initialization
document.getElementById('addItem').addEventListener('click', () => {
    console.log('Add Another Item clicked');
    const itemsContainer = document.getElementById('items');
    if (!itemsContainer) {
        console.error('Error: #items container not found');
        return;
    }
    const firstItem = itemsContainer.querySelector('.item');
    if (!firstItem) {
        console.error('Error: No .item element to clone');
        return;
    }
    const newItem = firstItem.cloneNode(true);

    // Clear all inputs in the new item except Item No.
    newItem.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else if (input.name !== 'item_no[]') {
            input.value = '';
        }
        // Reset checkbox and expiry date states
        if (input.name === 'no_expiry[]') {
            input.checked = false;
        }
        if (input.name === 'expiry_date[]') {
            input.disabled = false;
            input.required = true;
        }
    });

    // Set the Item No. for the new item
    const currentItemCount = itemsContainer.querySelectorAll('.item').length;
    const newItemNoInput = newItem.querySelector('input[name="item_no[]"]');
    if (!newItemNoInput) {
        console.error('Error: Item No. input not found in new item');
        return;
    }
    newItemNoInput.value = currentItemCount + 1;
    newItemNoInput.readOnly = true;
    console.log('Created new item with Item No:', currentItemCount + 1);

    itemsContainer.appendChild(newItem);
    console.log('Appended new item to #items');

    // Initialize no-expiry checkbox for the new item
    initializeNoExpiryCheckbox(newItem);
});

// Remove item functionality with renumbering
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        console.log('Remove Item clicked');
        const items = document.querySelectorAll('.item');
        if (items.length > 1) {
            e.target.parentElement.remove();
            console.log('Removed item');
            // Renumber remaining items
            const remainingItems = document.querySelectorAll('.item');
            remainingItems.forEach((item, index) => {
                const itemNoInput = item.querySelector('input[name="item_no[]"]');
                if (itemNoInput) {
                    itemNoInput.value = index + 1;
                    console.log(`Renumbered item to ${index + 1}`);
                }
            });
        } else {
            alert('At least one item is required.');
            console.log('Cannot remove last item');
        }
    }
});

// Show/hide other carrier input
document.getElementById('carrierSelect').addEventListener('change', (e) => {
    console.log('Carrier Name changed to:', e.target.value);
    const otherCarrierLabel = document.getElementById('otherCarrierLabel');
    const otherCarrierInput = otherCarrierLabel.querySelector('input');
    if (e.target.value === 'Other') {
        otherCarrierLabel.style.display = 'block';
        otherCarrierInput.required = true;
        console.log('Showed other carrier input');
    } else {
        otherCarrierLabel.style.display = 'none';
        otherCarrierInput.required = false;
        otherCarrierInput.value = '';
        console.log('Hid other carrier input');
    }
});

// CSV Export Functionality
document.getElementById('packingListForm').addEventListener('submit', (e) => {
    console.log('Form submitted');
    e.preventDefault();
    const action = e.submitter ? e.submitter.value : 'csv';
    console.log('Action:', action);

    if (action === 'csv') {
        console.log('CSV generation started');
        try {
            if (typeof XLSX === 'undefined') {
                console.error('Error: SheetJS (XLSX) is not loaded');
                throw new Error('SheetJS library is not loaded. Ensure xlsx.full.min.js is in the project directory or CDN is accessible.');
            }
            // Collect Shipment Details
            const shipmentData = {
                "Supplier Name": document.querySelector('input[name="supplier_name"]').value || '',
                "Supplier Address": document.querySelector('textarea[name="supplier_address"]').value || '',
                "Ship to Customer Name and Details": document.querySelector('textarea[name="ship_to_customer"]').value || '',
                "Goods Description": document.querySelector('textarea[name="goods_description"]').value || '',
                "Packing List No": document.querySelector('input[name="packing_list_no"]').value || '',
                "Invoice No": document.querySelector('input[name="invoice_no"]').value || '',
                "Carrier Name": document.querySelector('select[name="carrier_name"]').value === 'Other' 
                    ? (document.querySelector('input[name="other_carrier"]').value || '')
                    : document.querySelector('select[name="carrier_name"]').value || '',
                "Total Pallets": document.querySelector('input[name="total_pallets"]').value || '',
                "Total Cartons": document.querySelector('input[name="total_cartons"]').value || '',
                "Total Net Weight (kg)": document.querySelector('input[name="total_net_weight"]').value || '',
                "Total Gross Weight (kg)": document.querySelector('input[name="total_gross_weight"]').value || ''
            };
            console.log('Shipment Data:', shipmentData);

            // Collect Itemized Packing List
            const items = document.querySelectorAll('.item');
            const csvData = [];
            const headers = [
                "Supplier Name", "Supplier Address", "Ship to Customer Name and Details", 
                "Goods Description", "Packing List No", "Invoice No", "Carrier Name", 
                "Total Pallets", "Total Cartons", "Total Net Weight (kg)", "Total Gross Weight (kg)",
                "Purchase Order Number", "Item No.", "Product Name", "SKU", "Product EAN Code", 
                "Product HS Code", "Batch Code", "Manufacturing Date", "Expiry Date", "Quantity (Units)", 
                "Units per Carton", "Number of Cartons", "Packaging Type", 
                "Net Weight per Carton (kg)", "Gross Weight per Carton (kg)", 
                "Product Origin", "Carton Dimensions (LxWxH cm)",
                "Storage Instructions", "Notes"
            ];

            items.forEach((item, index) => {
                console.log(`Processing item ${index + 1}`);
                const noExpiryCheckbox = item.querySelector('input[name="no_expiry[]"]');
                const expiryDateInput = item.querySelector('input[name="expiry_date[]"]');
                const itemData = {
                    "Purchase Order Number": item.querySelector('input[name="purchase_order_number[]"]').value || '',
                    "Item No.": item.querySelector('input[name="item_no[]"]').value || '',
                    "Product Name": item.querySelector('input[name="product_name[]"]').value || '',
                    "SKU": item.querySelector('input[name="sku[]"]').value || '',
                    "Product EAN Code": item.querySelector('input[name="ean_code[]"]').value || '',
                    "Product HS Code": item.querySelector('input[name="hs_code[]"]').value || '',
                    "Batch Code": item.querySelector('input[name="batch_code[]"]').value || '',
                    "Manufacturing Date": item.querySelector('input[name="manufacturing_date[]"]').value || '',
                    "Expiry Date": noExpiryCheckbox.checked ? 'Not Applicable' : (expiryDateInput.value || ''),
                    "Quantity (Units)": item.querySelector('input[name="quantity[]"]').value || '',
                    "Units per Carton": item.querySelector('input[name="units_per_carton[]"]').value || '',
                    "Number of Cartons": item.querySelector('input[name="number_of_cartons[]"]').value || '',
                    "Packaging Type": item.querySelector('select[name="packaging_type[]"]').value || '',
                    "Net Weight per Carton (kg)": item.querySelector('input[name="net_weight_carton[]"]').value || '',
                    "Gross Weight per Carton (kg)": item.querySelector('input[name="gross_weight_carton[]"]').value || '',
                    "Product Origin": item.querySelector('input[name="product_origin[]"]').value || '',
                    "Carton Dimensions (LxWxH cm)": item.querySelector('input[name="carton_dimensions[]"]').value || '',
                    "Storage Instructions": item.querySelector('textarea[name="storage_instructions[]"]').value || '',
                    "Notes": item.querySelector('textarea[name="notes[]"]').value || ''
                };
                csvData.push({ ...shipmentData, ...itemData });
            });
            console.log('CSV Data:', csvData);

            // Convert to CSV with headers only once
            console.log('Converting to CSV');
            const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers, skipHeader: false });
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            console.log('CSV generated, length:', csv.length);

            // Download file
            console.log('Creating download link');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `packing_list_${shipmentData["Packing List No"] || 'export'}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('CSV download triggered');
        } catch (error) {
            console.error('CSV Error:', error.message);
            alert('Error generating CSV: ' + error.message);
        }
    }
});
