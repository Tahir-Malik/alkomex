exports.generateuidtypes = ({ uiddata, uidtype }) => {
    return new Promise((resolve) => {
        if (uidtype == 'pi') {
            let pi_uid = 'PI-00001';
            let pi_number = 1;
            if (uiddata.length > 0 && (uiddata[0].pi_number + '').length < 6) {
                pi_number = uiddata[0].pi_number;
                pi_number = pi_number + 1;
                pi_uid = 'PI-' + pad(pi_number, 5);
            } else if (uiddata.length > 0 && (uiddata[0].pi_number + '').length > 5) {
                pi_number = uiddata[0].pi_number;
                pi_number = pi_number + 1;
                pi_uid = 'PI-' + pi_number;
            }
            resolve({ pi_uid: pi_uid, pi_number: pi_number });
        } else if (uidtype == 'packinglist') {
            let packing_list_uid = "PL-00001"
            let packing_list_number = 1
            if (uiddata.length > 0 && (uiddata[0].packing_list_number + "").length < 6) {
                packing_list_number = uiddata[0].packing_list_number
                packing_list_number = packing_list_number + 1;
                packing_list_uid = "PL-" + pad(packing_list_number, 5)
            } else if (uiddata.length > 0 && (uiddata[0].packing_list_number + "").length > 5) {
                packing_list_number = uiddata[0].packing_list_number
                packing_list_number = packing_list_number + 1
                packing_list_uid = "PL-" + packing_list_number
            }
            resolve({ packing_list_uid: packing_list_uid, packing_list_number: packing_list_number });
        } else if (uidtype == 'invoice') {
            let invoice_uid = "INV-00001"
            let invoice_number = 1
            if (uiddata.length > 0 && (uiddata[0].invoice_number + "").length < 6) {
                invoice_number = uiddata[0].invoice_number
                invoice_number = invoice_number + 1;
                invoice_uid = "INV-" + pad(invoice_number, 5)
            } else if (uiddata.length > 0 && (uiddata[0].invoice_number + "").length > 5) {
                invoice_number = uiddata[0].invoice_number
                invoice_number = invoice_number + 1
                invoice_uid = "INV-" + invoice_number
            }
            resolve({ invoice_uid: invoice_uid, invoice_number: invoice_number });
        } else if (uidtype == 'customer') {
            let customer_uid = "C-00001"
            let customer_number = 1
            if (uiddata.length > 0 && (uiddata[0].customer_number + "").length < 6) {
                customer_number = uiddata[0].customer_number
                customer_number = customer_number + 1;
                customer_uid = "C-" + pad(customer_number, 5)
            } else if (uiddata.length > 0 && (uiddata[0].customer_number + "").length > 5) {
                customer_number = uiddata[0].customer_number
                customer_number = customer_number + 1
                customer_uid = "C-" + customer_number
            }
            resolve({ customer_uid: customer_uid, customer_number: customer_number });
        } else if (uidtype == 'creditnote') {
            let credit_note_uid = "CN-00001"
            let credit_note_number = 1
            if (uiddata.length > 0 && (uiddata[0].credit_note_number + "").length < 6) {
                credit_note_number = uiddata[0].credit_note_number
                credit_note_number = credit_note_number + 1;
                credit_note_uid = "CN-" + pad(credit_note_number, 5)
            } else if (uiddata.length > 0 && (uiddata[0].credit_note_number + "").length > 5) {
                credit_note_number = uiddata[0].credit_note_number
                credit_note_number = credit_note_number + 1
                credit_note_uid = "CN-" + credit_note_number
            }
            resolve({ credit_note_uid: credit_note_uid, credit_note_number: credit_note_number });
        } else if (uidtype == 'paymentslip') {
            let payment_slip_UID = "PS-00001";
            let payment_UID = "PAY-00001";
            let payment_number = 1
            if (uiddata.length > 0 && (uiddata[0].payment_number + "").length < 6) {
                payment_number = uiddata[0].payment_number
                payment_number = payment_number + 1;
                payment_slip_UID = "PS-" + pad(payment_number, 5)
                payment_UID = "PAY-" + pad(payment_number, 5)
            } else if (uiddata.length > 0 && (uiddata[0].payment_number + "").length > 5) {
                payment_number = uiddata[0].payment_number
                payment_number = payment_number + 1
                payment_slip_UID = "PS-" + payment_number
                payment_UID = "PAY-" + payment_number
            }
            resolve({ payment_slip_UID: payment_slip_UID, payment_UID: payment_UID, payment_number: payment_number });
        } else if (uidtype == 'product') {
            let product_uid = 'RP-00001';
            let product_number = 1;
            if (pro_data.length > 0 && (pro_data[0].product_number + '').length < 6) {
                product_number = pro_data[0].product_number;
                product_number = product_number + 1;
                product_uid = 'RP-' + pad(product_number, 5);
            } else if (pro_data.length > 0 && (pro_data[0].product_number + '').length > 5) {
                product_number = pro_data[0].product_number;
                product_number = product_number + 1;
                product_uid = 'RP-' + product_number;
            }
            resolve({ product_uid: product_uid, product_number: product_number });
        }
    })
}

function pad(num, size) {
    return ('000000000' + num).substr(-size);
}