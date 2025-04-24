```javascript
// Add item functionality
document.getElementById('addItem').addEventListener('click', () => {
    const itemsContainer = document.getElementById('items');
    const firstItem = itemsContainer.querySelector('.item');
    const newItem = firstItem.cloneNode(true);
    // Clear input values in the cloned item
    newItem.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.tagName === 'SELECT') {
            input.selectedIndex = 0; // Reset dropdown
        } else {
            input.value = ''; // Clear text/number/textarea
        }
    });
    itemsContainer.appendChild(newItem);
});

// Remove item functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        const items = document.querySelectorAll('.item');
        if (items.length > 1) {
            e.target.parentElement.remove();
        } else {
            alert('At least one item is required.');
        }
    }
});

// Show/hide other carrier input based on carrier selection
document.getElementById('carrierSelect').addEventListener('change', (e) => {
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

// CSV Export Functionality using SheetJS
document.getElementById('packingListForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission
    const form = e.target;
    const action = form.querySelector('button[type="submit"]:focus').value;

    if (action === 'csv') {
        try {
            // Collect Shipment Details
            const shipmentData = {
                supplier_name: form.querySelector('input[name="supplier_name"]').value,
                supplier_address: form.querySelector('textarea[name="supplier_address"]').value,
                ship_to_customer: form.querySelector('textarea[name="ship_to_customer"]').value,
                goods_description: form.querySelector('textarea[name="goods_description"]').value,
                packing_list_no: form.querySelector('input[name="packing_list_no"]').value,
                invoice_no: form.querySelector('input[name="invoice_no"]').value,
                carrier_name: form.querySelector('select[name="carrier_name"]').value === 'Other' 
                    ? form.querySelector('input[name="other_carrier"]').value 
                    : form.querySelector('select[name="carrier_name"]').value,
                total_pallets: form.querySelector('input[name="total_pallets"]').value,
                total_cartons: form.querySelector('input[name="total_cartons"]').value,
                total_net_weight: form.querySelector('input[name="total_net_weight"]').value,
                total_gross_weight: form.querySelector('input[name="total_gross_weight"]').value
            };

            // Collect Itemized Packing List
            const items = form.querySelectorAll('.item');
            const csvData = [];
            
            // Define CSV headers
            const headers = [
                'Supplier Name', 'Supplier Address', 'Ship to Customer Name and Details', 
                'Goods Description', 'Packing List No', 'Invoice No', 'Carrier Name', 
                'Total Pallets', 'Total Cartons', 'Total Net Weight (kg)', 'Total Gross Weight (kg)',
                'Purchase Order Number', 'Item No.', 'Product Name', 'SKU', 'Product EAN Code', 
                'Batch Code', 'Manufacturing Date', 'Expiry Date', 'Quantity (Units)', 
                'Units per Carton', 'Number of Cartons', 'Packaging Type', 
                'Net Weight per Carton (kg)', 'Gross Weight per Carton (kg)', 
                'Storage Instructions', 'Notes'
            ];

            // Add data rows
            items.forEach(item => {
                const itemData = {
                    purchase_order_number: item.querySelector('input[name="purchase_order_number[]"]').value,
                    item_no: item.querySelector('input[name="item_no[]"]').value,
                    product_name: item.querySelector('input[name="product_name[]"]').value,
                    sku: item.querySelector('input[name="sku[]"]').value,
                    ean_code: item.querySelector('input[name="ean_code[]"]').value,
                    batch_code: item.querySelector('input[name="batch_code[]"]').value,
                    manufacturing_date: item.querySelector('input[name="manufacturing_date[]"]').value,
                    expiry_date: item.querySelector('input[name="expiry_date[]"]').value,
                    quantity: item.querySelector('input[name="quantity[]"]').value,
                    units_per_carton: item.querySelector('input[name="units_per_carton[]"]').value,
                    number_of_cartons: item.querySelector('input[name="number_of_cartons[]"]').value,
                    packaging_type: item.querySelector('select[name="packaging_type[]"]').value,
                    net_weight_carton: item.querySelector('input[name="net_weight_carton[]"]').value,
                    gross_weight_carton: item.querySelector('input[name="gross_weight_carton[]"]').value,
                    storage_instructions: item.querySelector('textarea[name="storage_instructions[]"]').value,
                    notes: item.querySelector('textarea[name="notes[]"]').value
                };

                // Combine shipment and item data for each row
                csvData.push({
                    ...shipmentData,
                    ...itemData
                });
            });

            // Convert to CSV using SheetJS
            const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers });
            const csv = XLSX.utils.sheet_to_csv(worksheet);

            // Create a downloadable file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `packing_list_${shipmentData.packing_list_no || 'export'}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert('Error generating CSV: ' + error.message);
        }
    }
});
