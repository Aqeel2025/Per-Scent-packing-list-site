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

// Form Submission Handler
document.getElementById('packingListForm').addEventListener('submit', (e) => {
    console.log('Form submitted');
    e.preventDefault();
    const form = e.target;
    const action = form.querySelector('button[type="submit"]:focus').value;
    console.log('Action:', action);

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
        "Net Weight per Carton (kg)", "Gross Weight per Carton (kg)", 
        "Storage Instructions", "Notes"
    ];

    let totalQuantity = 0;
    items.forEach((item, index) => {
        console.log(`Processing item ${index + 1}`);
        const quantity = parseInt(item.querySelector('input[name="quantity[]"]').value) || 0;
        totalQuantity += quantity;
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
            "Quantity (Units)": quantity,
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

    if (action === 'csv') {
        console.log('CSV generation started');
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS (XLSX) is not loaded');
            }
            // Convert to CSV
            console.log('Converting to CSV');
            const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers, skipHeader: false });
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            console.log('CSV generated:', csv);

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
    } else if (action === 'pdf') {
        console.log('PDF generation started');
        try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF || !jsPDF.AutoTable) {
                throw new Error('jsPDF or autoTable not loaded');
            }
            const doc = new jsPDF({ orientation: 'landscape' });

            // Title
            doc.setFontSize(16);
            doc.text('Per-Scent Supplier Packing List', 14, 20);

            // Table
            doc.autoTable({
                head: [headers],
                body: csvData.map(row => headers.map(header => row[header] || '')),
                startY: 30,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [44, 62, 80] },
                margin: { left: 14, right: 14 }
            });

            // Grand Total
            const finalY = doc.lastAutoTable.finalY || 30;
            doc.setFontSize(10);
            doc.text(`Grand Total Quantity: ${totalQuantity}`, 14, finalY + 10);

            // Received By Section
            doc.text('Received By Name: __________________________', 14, finalY + 20);
            doc.text('Signature: __________________________', 14, finalY + 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, finalY + 40);

            // Save PDF
            doc.save(`packing_list_${shipmentData["Packing List No"] || 'export'}.pdf`);
            console.log('PDF download triggered');
        } catch (error) {
            console.error('PDF Error:', error.message);
            alert('Error generating PDF: ' + error.message);
        }
    }
});
