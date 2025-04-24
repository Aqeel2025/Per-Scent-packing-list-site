console.log('script.js loaded');

// Add item functionality
document.getElementById('addItem').addEventListener('click', () => {
    console.log('Add Another Item clicked');
    const itemsContainer = document.getElementById('items');
    const firstItem = itemsContainer.querySelector('.item');
    const newItem = firstItem.cloneNode(true);
    newItem.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else {
            input.value = '';
        }
    });
    itemsContainer.appendChild(newItem);
});

// Remove item functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        console.log('Remove Item clicked');
        const items = document.querySelectorAll('.item');
        if (items.length > 1) {
            e.target.parentElement.remove();
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

// CSV Export Functionality
document.getElementById('packingListForm').addEventListener('submit', (e) => {
    console.log('Form submitted');
    e.preventDefault();
    const form = e.target;
    const action = form.querySelector('button[type="submit"]:focus').value;
    console.log('Action:', action);

    if (action === 'csv') {
        console.log('CSV generation started');
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
                "Batch Code", "Manufacturing Date", "Expiry Date", "Quantity (Units)", 
                "Units per Carton", "Number of Cartons", "Packaging Type", 
                "Net Weight per Carton (kg)", "Gross Weight per Carton (kg)", 
                "Storage Instructions", "Notes"
            ];

            items.forEach((item, index) => {
                console.log(`Processing item ${index + 1}`);
                const itemData = {
                    "Purchase Order Number": item.querySelector('input[name="purchase_order_number[]"]').value,
                    "Item No.": item.querySelector('input[name="item_no[]"]').value,
                    "Product Name": item.querySelector('input[name="product_name[]"]').value,
                    "SKU": item.querySelector('input[name="sku[]"]').value,
                    "Product EAN Code": item.querySelector('input[name="ean_code[]"]').value,
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

            // Convert to CSV with headers only once
            console.log('Converting to CSV');
            const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers, skipHeader: false });
            const csv
