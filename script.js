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

// Form submission handling for CSV, PDF, and Excel export
document.getElementById('packingListForm').addEventListener('submit', (e) => {
    console.log('Form submitted');
    e.preventDefault();
    const action = e.submitter ? e.submitter.value : 'csv';
    console.log('Action:', action);

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
            : document.query venne('select[name="carrier_name"]').value || '',
        "Total Pallets": document.querySelector('input[name="total_pallets"]').value || '',
        "Total Cartons": document.querySelector('input[name="total_cartons"]').value || '',
        "Total Net Weight (kg)": document.querySelector('input[name="total_net_weight"]').value || '',
        "Total Gross Weight (kg)": document.querySelector('input[name="total_gross_weight"]').value || ''
    };
    console.log('Shipment Data:', shipmentData);

    // Collect Itemized Packing List
    const items = document.querySelectorAll('.item');
    const itemDataArray = [];
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
        itemDataArray.push(itemData);
    });

    if (action === 'csv') {
        console.log('CSV generation started');
        try {
            if (typeof XLSX === 'undefined') {
                console.error('Error: SheetJS (XLSX) is not loaded');
                throw new Error('SheetJS library is not loaded. Ensure xlsx.full.min.js is in the project directory or CDN is accessible.');
            }
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
            const csvData = itemDataArray.map(item => ({ ...shipmentData, ...item }));
            console.log('CSV Data:', csvData);

            const worksheet = XLSX.utils.json_to_sheet(csvData, { header: headers, skipHeader: false });
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            console.log('CSV generated, length:', csv.length);

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
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            console.log('PDF initialized with landscape orientation (297mm x 210mm)');

            // Define margins and starting position
            const margin = 15;
            const pageWidth = 297; // A4 landscape width in mm
            let y = margin;

            // Header: Logo and Supplier Info
            if (companyLogoDataUrl) {
                try {
                    // Position logo on the right side
                    doc.addImage(companyLogoDataUrl, 'PNG', pageWidth - margin - 50, y, 50, 0); // 50mm width, auto-scale height
                    console.log('Logo added at x=232mm (right-aligned), y=15mm');
                    y += 25; // Adjust for logo height
                } catch (error) {
                    console.error('Error adding logo to PDF:', error.message);
                }
            } else {
                console.log('No logo provided, skipping logo addition');
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(shipmentData["Supplier Name"], margin, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(shipmentData["Supplier Address"], margin, y, { maxWidth: 120 });
            y += 10;

            // Shipment Details Section (two-column layout)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Shipment Details', margin, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const shipmentFieldsLeft = [
                { label: 'Ship to Customer:', value: shipmentData["Ship to Customer Name and Details"] },
                { label: 'Goods Description:', value: shipmentData["Goods Description"] },
                { label: 'Packing List No:', value: shipmentData["Packing List No"] },
                { label: 'Invoice No:', value: shipmentData["Invoice No"] }
            ];
            const shipmentFieldsRight = [
                { label: 'Carrier Name:', value: shipmentData["Carrier Name"] },
                { label: 'Total Pallets:', value: shipmentData["Total Pallets"] },
                { label: 'Total Cartons:', value: shipmentData["Total Cartons"] },
                { label: 'Total Net Weight (kg):', value: shipmentData["Total Net Weight (kg)"] },
                { label: 'Total Gross Weight (kg):', value: shipmentData["Total Gross Weight (kg)"] }
            ];
            const midPoint = pageWidth / 2;
            shipmentFieldsLeft.forEach((field, index) => {
                doc.setFont('helvetica', 'bold');
                doc.text(field.label, margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(field.value, margin + 40, y, { maxWidth: 80 });
                if (index < shipmentFieldsRight.length) {
                    const rightField = shipmentFieldsRight[index];
                    doc.setFont('helvetica', 'bold');
                    doc.text(rightField.label, midPoint, y);
                    doc.setFont('helvetica', 'normal');
                    doc.text(rightField.value, midPoint + 40, y, { maxWidth: 80 });
                }
                y += 7;
            });
            // Add remaining right-column fields if any
            for (let i = shipmentFieldsLeft.length; i < shipmentFieldsRight.length; i++) {
                const rightField = shipmentFieldsRight[i];
                doc.setFont('helvetica', 'bold');
                doc.text(rightField.label, midPoint, y);
                doc.setFont('helvetica', 'normal');
                doc.text(rightField.value, midPoint + 40, y, { maxWidth: 80 });
                y += 7;
            }
            y += 10;

            // Itemized Packing List Table
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Itemized Packing List', margin, y);
            y += 7;

            const tableHeaders = [
                "PO No.", "Item No.", "Product Name", "SKU", "EAN Code", "HS Code", "Batch Code",
                "Mfg Date", "Expiry Date", "Qty (Units)", "Units/Carton", "Cartons", "Packaging",
                "Net Wt/Carton (kg)", "Gross Wt/Carton (kg)", "Origin", "Dimensions (cm)",
                "Storage Instructions", "Notes"
            ];
            const tableData = itemDataArray.map(item => [
                item["Purchase Order Number"],
                item["Item No."],
                item["Product Name"],
                item["SKU"],
                item["Product EAN Code"],
                item["Product HS Code"],
                item["Batch Code"],
                item["Manufacturing Date"],
                item["Expiry Date"],
                item["Quantity (Units)"],
                item["Units per Carton"],
                item["Number of Cartons"],
                item["Packaging Type"],
                item["Net Weight per Carton (kg)"],
                item["Gross Weight per Carton (kg)"],
                item["Product Origin"],
                item["Carton Dimensions (LxWxH cm)"],
                item["Storage Instructions"],
                item["Notes"]
            ]);
            console.log('Table headers:', tableHeaders);
            console.log('Table data:', tableData);

            doc.autoTable({
                startY: y,
                head: [tableHeaders],
                body: tableData,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 7, // Reduced to fit more columns
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    cellPadding: 1
                },
                headStyles: {
                    fillColor: [52, 152, 219], // #3498db
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8
                },
                columnStyles: {
                    0: { cellWidth: 12 }, // PO No.
                    1: { cellWidth: 8 }, // Item No.
                    2: { cellWidth: 20 }, // Product Name
                    3: { cellWidth: 12 }, // SKU
                    4: { cellWidth: 12 }, // EAN Code
                    5: { cellWidth: 10 }, // HS Code
                    6: { cellWidth: 10 }, // Batch Code
                    7: { cellWidth: 12 }, // Mfg Date
                    8: { cellWidth: 12 }, // Expiry Date
                    9: { cellWidth: 8 }, // Qty (Units)
                    10: { cellWidth: 8 }, // Units/Carton
                    11: { cellWidth: 8 }, // Cartons
                    12: { cellWidth: 15 }, // Packaging
                    13: { cellWidth: 12 }, // Net Wt/Carton
                    14: { cellWidth: 12 }, // Gross Wt/Carton
                    15: { cellWidth: 10 }, // Origin
                    16: { cellWidth: 12 }, // Dimensions
                    17: { cellWidth: 15 }, // Storage Instructions
                    18: { cellWidth: 15 } // Notes
                },
                margin: { left: margin, right: margin }
            });
            console.log('Table added with 19 columns, total width ~213mm');

            // Save the PDF
            console.log('Saving PDF');
            doc.save(`packing_list_${shipmentData["Packing List No"] || 'export'}.pdf`);
            console.log('PDF download triggered');
        } catch (error) {
            console.error('PDF Error:', error.message);
            alert('Error generating PDF: ' + error.message);
        }
    } else if (action === 'excel') {
        console.log('Excel generation started');
        try {
            if (typeof XLSX === 'undefined') {
                console.error('Error: SheetJS (XLSX) is not loaded');
                throw new Error('SheetJS library is not loaded. Ensure xlsx.full.min.js is in the project directory or CDN is accessible.');
            }

            // Create a new workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet([], { skipHeader: true });

            // Shipment Details (two-column layout)
            const shipmentRows = [
                { A: 'Supplier Name', B: shipmentData["Supplier Name"] },
                { A: 'Supplier Address', B: shipmentData["Supplier Address"] },
                { A: 'Ship to Customer Name and Details', B: shipmentData["Ship to Customer Name and Details"] },
                { A: 'Goods Description', B: shipmentData["Goods Description"] },
                { A: 'Packing List No', B: shipmentData["Packing List No"] },
                { A: '', B: '' }, // Spacer row
                { A: 'Invoice No', B: shipmentData["Invoice No"] },
                { A: 'Carrier Name', B: shipmentData["Carrier Name"] },
                { A: 'Total Pallets', B: shipmentData["Total Pallets"] },
                { A: 'Total Cartons', B: shipmentData["Total Cartons"] },
                { A: 'Total Net Weight (kg)', B: shipmentData["Total Net Weight (kg)"] },
                { A: 'Total Gross Weight (kg)', B: shipmentData["Total Gross Weight (kg)"] }
            ];

            console.log('Shipment Rows:', shipmentRows);

            // Add Shipment Details to worksheet
            XLSX.utils.sheet_add_json(ws, shipmentRows, { origin: 'A1', skipHeader: true });

            // Itemized Packing List Table
            const tableHeaders = [
                "Item No.", "Purchase Order Number", "Product Name", "SKU", "Product EAN Code", 
                "Product HS Code", "Batch Code", "Manufacturing Date", "Expiry Date", 
                "Quantity (Units)", "Units per Carton", "Number of Cartons", "Packaging Type", 
                "Net Weight per Carton (kg)", "Gross Weight per Carton (kg)", 
                "Product Origin", "Carton Dimensions (LxWxH cm)", "Storage Instructions", "Notes"
            ];
            const tableData = itemDataArray.map(item => ({
                "Item No.": item["Item No."],
                "Purchase Order Number": item["Purchase Order Number"],
                "Product Name": item["Product Name"],
                "SKU": item["SKU"],
                "Product EAN Code": item["Product EAN Code"],
                "Product HS Code": item["Product HS Code"],
                "Batch Code": item["Batch Code"],
                "Manufacturing Date": item["Manufacturing Date"],
                "Expiry Date": item["Expiry Date"],
                "Quantity (Units)": item["Quantity (Units)"],
                "Units per Carton": item["Units per Carton"],
                "Number of Cartons": item["Number of Cartons"],
                "Packaging Type": item["Packaging Type"],
                "Net Weight per Carton (kg)": item["Net Weight per Carton (kg)"],
                "Gross Weight per Carton (kg)": item["Gross Weight per Carton (kg)"],
                "Product Origin": item["Product Origin"],
                "Carton Dimensions (LxWxH cm)": item["Carton Dimensions (LxWxH cm)"],
                "Storage Instructions": item["Storage Instructions"],
                "Notes": item["Notes"]
            }));

            console.log('Table Data:', tableData);

            // Add table headers and data (starting after shipment details)
            XLSX.utils.sheet_add_json(ws, [{}], { origin: `A${shipmentRows.length + 1}`, skipHeader: true }); // Spacer row
            XLSX.utils.sheet_add_json(ws, tableData, { origin: `A${shipmentRows.length + 2}`, header: tableHeaders });

            // Totals Section
            const totalQuantity = itemDataArray.reduce((sum, item) => sum + (parseFloat(item["Quantity (Units)"]) || 0), 0);
            const totalCartons = itemDataArray.reduce((sum, item) => sum + (parseFloat(item["Number of Cartons"]) || 0), 0);
            const totalNetWeight = itemDataArray.reduce((sum, item) => sum + (parseFloat(item["Net Weight per Carton (kg)"]) * parseFloat(item["Number of Cartons"]) || 0), 0);
            const totalGrossWeight = itemDataArray.reduce((sum, item) => sum + (parseFloat(item["Gross Weight per Carton (kg)"]) * parseFloat(item["Number of Cartons"]) || 0), 0);

            const totalsRows = [
                { A: 'Totals' },
                { A: 'Total Quantity (Units)', B: totalQuantity },
                { A: 'Total Cartons', B: totalCartons },
                { A: 'Total Net Weight (kg)', B: totalNetWeight },
                { A: 'Total Gross Weight (kg)', B: totalGrossWeight },
                { A: '' }, // Spacer row
                { A: 'Authorized By' },
                { A: 'Name: ___________________________' },
                { A: 'Signature: ________________________' },
                { A: 'Date: ____________________________' }
            ];

            console.log('Totals Rows:', totalsRows);

            // Add Totals and Authorized By sections
            XLSX.utils.sheet_add_json(ws, totalsRows, { origin: `A${shipmentRows.length + tableData.length + 3}`, skipHeader: true });

            // Apply basic formatting (column widths)
            const colWidths = [
                { wch: 10 }, // Item No.
                { wch: 20 }, // Purchase Order Number
                { wch: 30 }, // Product Name
                { wch: 20 }, // SKU
                { wch: 20 }, // Product EAN Code
                { wch: 15 }, // Product HS Code
                { wch: 15 }, // Batch Code
                { wch: 15 }, // Manufacturing Date
                { wch: 15 }, // Expiry Date
                { wch: 15 }, // Quantity (Units)
                { wch: 15 }, // Units per Carton
                { wch: 15 }, // Number of Cartons
                { wch: 20 }, // Packaging Type
                { wch: 20 }, // Net Weight per Carton (kg)
                { wch: 20 }, // Gross Weight per Carton (kg)
                { wch: 15 }, // Product Origin
                { wch: 20 }, // Carton Dimensions (LxWxH cm)
                { wch: 30 }, // Storage Instructions
                { wch: 30 }  // Notes
            ];
            ws['!cols'] = colWidths;

            // Apply bold formatting during data addition
            const boldCells = [
                'A1', 'A2', 'A3', 'A4', 'A5', // Left column shipment details
                'B7', 'B8', 'B9', 'B10', 'B11', 'B12', // Right column shipment details
                `A${shipmentRows.length + 2}`, // Table headers
                `A${shipmentRows.length + tableData.length + 3}`, // Totals
                `A${shipmentRows.length + tableData.length + 8}` // Authorized By
            ];

            boldCells.forEach(cell => {
                if (ws[cell]) {
                    ws[cell].s = { font: { bold: true } };
                } else {
                    console.warn(`Cell ${cell} does not exist in worksheet`);
                }
            });

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Packing List');

            // Generate and download Excel file
            console.log('Generating Excel file');
            XLSX.write(wb, `packing_list_${shipmentData["Packing List No"] || 'export'}.xlsx`);
            console.log('Excel download triggered');
        } catch (error) {
            console.error('Excel Error:', error.message);
            alert('Error generating Excel: ' + error.message);
        }
    }
});
