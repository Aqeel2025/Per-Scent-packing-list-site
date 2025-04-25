console.log('script.js loaded');

// Set the initial Item No. for the first item on page load
document.addEventListener('DOMContentLoaded', () => {
    const firstItem = document.querySelector('.item');
    const firstItemNoInput = firstItem.querySelector('input[name="item_no[]"]');
    firstItemNoInput.value = 1;
    firstItemNoInput.readOnly = true; // Make the field read-only
});

// Add item functionality with auto-incrementing Item No.
document.getElementById('addItem').addEventListener('click', () => {
    console.log('Add Another Item clicked');
    const itemsContainer = document.getElementById('items');
    const firstItem = itemsContainer.querySelector('.item');
    const newItem = firstItem.cloneNode(true);

    // Clear all inputs in the new item except Item No.
    newItem.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else if (input.name !== 'item_no[]') {
            input.value = '';
        }
    });

    // Set the Item No. for the new item
    const currentItemCount = itemsContainer.querySelectorAll('.item').length;
    const newItemNoInput = newItem.querySelector('input[name="item_no[]"]');
    newItemNoInput.value = currentItemCount + 1;
    newItemNoInput.readOnly = true; // Make the field read-only

    itemsContainer.appendChild(newItem);
});

// Remove item functionality with renumbering
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        console.log('Remove Item clicked');
        const items = document.querySelectorAll('.item');
        if (items.length > 1) {
            e.target.parentElement.remove();
            // Renumber remaining items
            const remainingItems = document.querySelectorAll('.item');
            remainingItems.forEach((item, index) => {
                const itemNoInput = item.querySelector('input[name="item_no[]"]');
                itemNoInput.value = index + 1;
            });
        } else {
            alert('At least one item is required.');
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
    } else {
        otherCarrierLabel.style.display = 'none';
        otherCarrierInput.required = false;
        otherCarrierInput.value = '';
    }
});

// Generate CSV data (reused for multiple actions)
function generateCSVData(form) {
    console.log('Generating CSV data');
    try {
        if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS (XLSX) is not loaded');
        }
        // Collect Shipment Details
        const shipmentData = {
            "Supplier Name": form.querySelector('input[name="supplier_name"]').value,
            "Supplier Address": form.querySelector('textarea[name="supplier_address"]').value,
            "Ship to Customer Name and Details": form.querySelector('textarea[name="ship_to_customer"]').value,
            "Goods Description": form.querySelector('textarea[name="goods_description"]').value,
            "Packing List No": form.querySelector('input[name="packing_list_no"]').value,
            "Invoice No": form.querySelector('input[name="invoice_no"]').value,
            "Carrier Name": form.querySelector('select[name="carrier_name"]').value === 'Other' 
                ? form.querySelector('input[name="other_carrier"]').value 
                : form.querySelector('select[name="carrier_name"]').value,
            "Total Pallets": form.querySelector('input[name="total_pallets"]').value,
            "Total Cartons": form.querySelector('input[name="total_cartons"]').value,
            "Total Net Weight (kg)": form.querySelector('input[name="total_net_weight"]').value,
            "Total Gross Weight (kg)": form.querySelector('input[name="total_gross_weight"]').value
        };
        console.log('Shipment Data:', shipmentData);

        // Collect Itemized Packing List
        const items = form.querySelectorAll('.item');
        const csvData = [];
        const headers = [
            "Supplier Name", "Supplier Address", "Ship to Customer Name and Details", 
            "Goods Description", "Packing List No", "Invoice No", "Carrier Name", 
            "Total Pallets", "Total Cartons", "Total Net Weight (kg)", "Total Gross Weight (kg)",
            "Purchase Order Number", "Item No.", "Product Name", "SKU", "Product EAN Code", 
            "Product HS Code", "Batch Code", "Manufacturing Date", "Expiry Date", "Quantity (Units)", 
            "Units per Carton", "Number of Cartons", "Packaging Type", 
            "Net Weight per Carton (විත්‍රැපුටුන් බලන්න, අපි ගැන දැනගන්න, ෆේස්බුක් හරහා බෙදාගන්න, ට්විටර් හරහා බෙදාගන්න, වට්සැප් හරහා බෙදාගන්න, ටෙලිග්‍රාම් හරහා බෙදාගන්න, ශෙයා ලින්ක්ඩ්ඉන් හි.

            items.forEach((item, index) => {
                console.log(`Processing item ${index + 1}`);
                const itemData = {
                    "Purchase Order Number": item.querySelector('input[name="purchase_order_number[]"]').value,
                    "Item No.": item.querySelector('input[name="item_no[]"]').value,
                    "Product Name": item.querySelector('input[name="product_name[]"]').value,
                    "SKU": item.querySelector('input[name="sku[]"]').value,
                    "Product EAN Code": item.querySelector('input[name="ean_code[]"]').value,
                    "Product HS Code": item.querySelector('input[name="hs_code[]"]').value,
                    "Batch Code": item.querySelector('input[name="batch_code[]"]').value,
                    "Manufacturing Date": item.querySelector('input[name="manufacturing_date[]"]').value,
                    "Expiry Date": item.querySelector('input[name="expiry_date[]"]').value,
                    "Quantity (Units)": item.querySelector('input[name="quantity[]"]').value,
                    "Units per Carton": item.querySelector('input[name="units_per_carton[]"]').value,
                    "Number of Cartons": item.querySelector('input[name="number_of_cartons[]"]').value,
                    "Packaging Type": item.querySelector('select[name="packaging_type[]"]').value,
                    "Net Weight per Carton (kg)": item.querySelector('input[name="net_weight_carton[]"]').value,
                    "Gross Weight per Carton (kg)": item.querySelector('input[name="gross_weight_carton[]"]').value,
                    "Storage Instructions": item.querySelector('textarea[name="storage_instructions[]"]').value,
                    "Notes": item.querySelector('textarea[name="notes[]"]').value
                };
                csvData.push({ ...shipmentData, ...itemData });
            });
            console.log('CSV Data:', csvData);

            // Convert to CSV
            console.log('Converting to CSV');
            const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers, skipHeader: false });
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            console.log('CSV generated:', csv);

            return { csv, filename: `packing_list_${shipmentData["Packing List No"] || 'export'}.csv` };
        } catch (error) {
            console.error('CSV Error:', error.message);
            throw new Error('Error generating CSV: ' + error.message);
        }
    }

    // Form submission handler
    document.getElementById('packingListForm').addEventListener('submit', (e) => {
        console.log('Form submitted');
        e.preventDefault();
        const form = e.target;
        const action = form.querySelector('button[type="submit"]:focus').value;
        console.log('Action:', action);

        try {
            const { csv, filename } = generateCSVData(form);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

            if (action === 'csv') {
                // Download CSV
                console.log('Creating download link');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('CSV download triggered');
            } else if (action === 'email') {
                // Basic client-side email with mailto (limited attachment support)
                console.log('Preparing email');
                const recipient = prompt('Enter recipient email address:', 'recipient@example.com');
                if (!recipient) {
                    alert('Email address is required.');
                    return;
                }
                const subject = `Packing List ${form.querySelector('input[name="packing_list_no"]').value}`;
                const body = `Attached is the packing list for ${form.querySelector('input[name="packing_list_no"]').value}.`;
                
                // Note: mailto does not reliably support attachments, so we warn the user
                alert('Your email client will open. Please manually attach the CSV file or use a server-side email solution for reliable attachments.');
                const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoLink;

                // Optionally, download the CSV for manual attachment
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (action === 'google_drive') {
                // Placeholder for Google Drive upload
                console.log('Preparing Google Drive upload');
                alert('Google Drive upload requires server-side integration. Please implement the server-side code or use an automation tool like Zapier.');
                
                // Example placeholder for server-side API call
                /*
                fetch('https://your-server-endpoint/upload-to-drive', {
                    method: 'POST',
                    body: blob,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Filename': filename
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Upload successful:', data);
                    alert('File uploaded to Google Drive successfully!');
                })
                .catch(error => {
                    console.error('Upload error:', error);
                    alert('Error uploading to Google Drive: ' + error.message);
                });
                */
                
                // For now, download the CSV for manual upload
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('CSV download triggered for manual Google Drive upload');
            }
        } catch (error) {
            console.error('Error:', error.message);
            alert(error.message);
        }
    });
