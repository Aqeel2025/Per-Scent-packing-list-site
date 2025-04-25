console.log('script.js loaded at:', new Date().toISOString());

// Initialize first item number
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing first item');
    const firstItem = document.querySelector('#items .item');
    if (!firstItem) {
        console.error('Error: No .item element found in #items');
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
});

// Add another item
const addItemButton = document.getElementById('addItem');
if (!addItemButton) {
    console.error('Error: #addItem button not found');
} else {
    addItemButton.addEventListener('click', () => {
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

        // Clear inputs except Item No.
        newItem.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else if (input.name !== 'item_no[]') {
                input.value = '';
            }
        });

        // Set new Item No.
        const items = itemsContainer.querySelectorAll('.item');
        const newItemNoInput = newItem.querySelector('input[name="item_no[]"]');
        if (!newItemNoInput) {
            console.error('Error: Item No. input not found in new item');
            return;
        }
        newItemNoInput.value = items.length + 1;
        newItemNoInput.readOnly = true;
        console.log('Created new item with Item No:', items.length + 1);

        itemsContainer.appendChild(newItem);
        console.log('Appended new item to #items');
    });
}

// Remove item
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        console.log('Remove Item clicked');
        const items = document.querySelectorAll('#items .item');
        if (items.length > 1) {
            e.target.parentElement.remove();
            console.log('Removed item');
            // Renumber items
            const remainingItems = document.querySelectorAll('#items .item');
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

// Carrier select toggle
const carrierSelect = document.getElementById('carrierSelect');
if (!carrierSelect) {
    console.error('Error: #carrierSelect not found');
} else {
    carrierSelect.addEventListener('change', (e) => {
        console.log('Carrier changed to:', e.target.value);
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
}

// Generate CSV data
function generateCSVData(form) {
    console.log('Generating CSV data');
    try {
        if (!window.XLSX) {
            console.error('Error: XLSX library not loaded');
            throw new Error('SheetJS library is not loaded. Ensure xlsx.full.min.js is in the project directory.');
        }

        // Collect shipment data
        const shipmentData = {
            "Supplier Name": form.querySelector('input[name="supplier_name"]').value || '',
            "Supplier Address": form.querySelector('textarea[name="supplier_address"]').value || '',
            "Ship to Customer Name and Details": form.querySelector('textarea[name="ship_to_customer"]').value || '',
            "Goods Description": form.querySelector('textarea[name="goods_description"]').value || '',
            "Packing List No": form.querySelector('input[name="packing_list_no"]').value || '',
            "Invoice No": form.querySelector('input[name="invoice_no"]').value || '',
            "Carrier Name": form.querySelector('select[name="carrier_name"]').value === 'Other'
                ? (form.querySelector('input[name="other_carrier"]').value || '')
                : form.querySelector('select[name="carrier_name"]').value || '',
            "Total Pallets": form.querySelector('input[name="total_pallets"]').value || '',
            "Total Cartons": form.querySelector('input[name="total_cartons"]').value || '',
            "Total Net Weight (kg)": form.querySelector('input[name="total_net_weight"]').value || '',
            "Total Gross Weight (kg)": form.querySelector('input[name="total_gross_weight"]').value || ''
        };
        console.log('Shipment Data:', shipmentData);

        // Collect item data
        const items = form.querySelectorAll('#items .item');
        const csvData = [];
        const headers = [
            "Supplier Name", "Supplier Address", "Ship to Customer Name and Details",
            "Goods Description", "Packing List No", "Invoice No", "Carrier Name",
            "Total Pallets", "Total Cartons", "Total Net Weight (kg)", "Total Gross Weight (kg)",
            "Purchase Order Number", "Item No.", "Product Name", "SKU", "Product EAN Code",
            "Product HS Code", "Batch Code", "Manufacturing Date", "Expiry Date", "Quantity (Units)",
            "Units per Carton", "Number of Cartons", "Packaging Type",
            "Net Weight per Carton (kg)", "Gross Weight per Carton (kg)",
            "Storage Instructions", "Notes"
        ];

        items.forEach((item, index) => {
            console.log(`Processing item ${index + 1}`);
            const itemData = {
                "Purchase Order Number": item.querySelector('input[name="purchase_order_number[]"]').value || '',
                "Item No.": item.querySelector('input[name="item_no[]"]').value || '',
                "Product Name": item.querySelector('input[name="product_name[]"]').value || '',
                "SKU": item.querySelector('input[name="sku[]"]').value || '',
                "Product EAN Code": item.querySelector('input[name="ean_code[]"]').value || '',
                "Product HS Code": item.querySelector('input[name="hs_code[]"]').value || '',
                "Batch Code": item.querySelector('input[name="batch_code[]"]').value || '',
                "Manufacturing Date": item.querySelector('input[name="manufacturing_date[]"]').value || '',
                "Expiry Date": item.querySelector('input[name="expiry_date[]"]').value || '',
                "Quantity (Units)": item.querySelector('input[name="quantity[]"]').value || '',
                "Units per Carton": item.querySelector('input[name="units_per_carton[]"]').value || '',
                "Number of Cartons": item.querySelector('input[name="number_of_cartons[]"]').value || '',
                "Packaging Type": item.querySelector('select[name="packaging_type[]"]').value || '',
                "Net Weight per Carton (kg)": item.querySelector('input[name="net_weight_carton[]"]').value || '',
                "Gross Weight per Carton (kg)": item.querySelector('input[name="gross_weight_carton[]"]').value || '',
                "Storage Instructions": item.querySelector('textarea[name="storage_instructions[]"]').value || '',
                "Notes": item.querySelector('textarea[name="notes[]"]').value || ''
            };
            csvData.push({ ...shipmentData, ...itemData });
        });
        console.log('CSV Data:', csvData);

        // Generate CSV
        console.log('Converting to CSV');
        const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers, skipHeader: false });
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        console.log('CSV content generated, length:', csv.length);

        const filename = `packing_list_${shipmentData["Packing List No"] || 'export'}.csv`;
        console.log('CSV filename:', filename);
        return { csv, filename };
    } catch (error) {
        console.error('CSV generation error:', error.message);
        throw new Error('Failed to generate CSV: ' + error.message);
    }
}

// Form submission
const form = document.getElementById('packingListForm');
if (!form) {
    console.error('Error: #packingListForm not found');
} else {
    form.addEventListener('submit', (e) => {
        console.log('Form submitted');
        e.preventDefault();
        const action = e.submitter ? e.submitter.value : 'csv';
        console.log('Action:', action);

        try {
            const { csv, filename } = generateCSVData(form);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

            if (action === 'csv') {
                console.log('Starting CSV download');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('CSV download triggered');
            } else if (action === 'email') {
                console.log('Starting email action');
                const recipient = prompt('Enter recipient email address:', 'recipient@example.com');
                if (!recipient) {
                    console.log('Email cancelled: No recipient');
                    alert('Email address is required.');
                    return;
                }
                const subject = `Packing List ${form.querySelector('input[name="packing_list_no"]').value || 'Export'}`;
                const body = `Attached is the packing list for ${form.querySelector('input[name="packing_list_no"]').value || 'export'}.`;
                alert('Opening email client. Please manually attach the CSV file.');
                const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoLink;
                console.log('Email client opened');

                // Download CSV for attachment
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('CSV downloaded for email');
            } else if (action === 'google_drive') {
                console.log('Starting Google Drive action');
                alert('Google Drive upload requires server-side integration. Downloading CSV for manual upload.');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('CSV downloaded for Google Drive');
            }
        } catch (error) {
            console.error('Form error:', error.message);
            alert('Error: ' + error.message);
        }
    });
}
