const mongoose = require('mongoose');

const PackingListModel = mongoose.Schema({
    packing_list_uid: { type: String, unique: true },
    packing_list_number: { type: Number, unique: true },
    client: {
        client_name: { type: String },
        client_uid: { type: String }
    },
    mode_of_shipping: { type: String },
    place_of_receipt: { type: String },
    port_of_loading: { type: String },
    port_of_discharge: { type: String },
    products: [{
        product_id: { type: String },
        client_product_code: { type: String },
        customerCodeNumber: { type: String },
        hsn_code: { type: Number, default: 0 },
        shipper_size_inner_dimension: { type: String },
        batch_number: { type: String },
        manufacturing_date: { type: Date },
        expiry_date: { type: Date },
        number_of_packages: { type: Number, default: 0 },
        total_packing_carton: { type: Number, default: 0 },
        unit_of_billing: { type: String },
        complete_packaging_profile: { type: String },
        minimum_batch_size: { type: Number, default: 0 },
        maximum_batch_size: { type: Number, default: 0 },
        registration_no: { type: String },
        registration_date: { type: Date },
        shelf_life: { type: String },
        frieght: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        net_weight: { type: Number, default: 0 },
        gross_weight: { type: Number, default: 0 },
        pi_uid: { type: String },
        client_po_number: { type: String }
    }],
    shipping: {
        container_type: { type: String },
        container_number: { type: String },
        shipping_agency: { type: String },
        advanced_received: { type: String }
    },
    workstatus_date: {
        artwork_uploaded_date: { type: Date },
        manufacture_uploaded_date: { type: Date },
        testing_uploaded_date: { type: Date },
        dispatch_uploaded_date: { type: Date },
        shipped_uploaded_date: { type: Date }
    },
    shipped_onboard_date: { type: Date },
    estimated_arrival_date: { type: Date },
    payment_due_date: { type: Date },
    admin_document: {
        packinglist_doc: { type: String },
        productinvoice_doc: { type: String },
        CoA_doc: { type: String },
        certificate_of_origin_doc: { type: String },
        bill_of_lading_doc: { type: String },
        insurance_doc: { type: String },
        airway_bill_doc: { type: String }
    },
    client_document: {
        packinglist_doc: { type: String },
        productinvoice_doc: { type: String },
        CoA_doc: { type: String },
        certificate_of_origin_doc: { type: String },
        bill_of_lading_doc: { type: String },
        insurance_doc: { type: String },
        airway_bill_doc: { type: String }
    },
    shipped_info: {
        tracking_number: { type: String },
        date_of_courier: { type: Date },
        courires_agency: { type: String }
    },
    test_of_goods_info: [{
        product_id: { type: String },
        client_product_code: { type: String },
        batch_number: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        rejection_files: [{
            file_name: { type: String },
            uploaded_date: { type: Date, default: new Date() }
        }],
        signed_creditnote_info: {
            credit_note_uid: { type: String },
            doc_name: { type: String },
            uploaded_date: { type: Date, default: new Date() }
        }
    }],
    CAPA_sheet_doc: { type: String },
    special_comments: { type: String },
    invoice_number: { type: Number },
    invoice_uid: { type: String },
    gross_price: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    freight: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    credit_price: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'OpenInvoice', 'CloseInvoice'], default: 'Pending' },
}, {
        timestamps: true
    })
module.exports = mongoose.model('packinglist', PackingListModel, 'packinglists')
