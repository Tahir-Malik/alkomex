const mongoose = require('mongoose');

const PISchema = mongoose.Schema(
  {
    pi_uid: { type: String, unique: true },
    pi_number: { type: Number, unique: true },
    client_po_document: { type: String },
    client_po_number: { type: String },
    date_of_issue_of_po: { type: Date, default: Date.now() },
    client: {
      client_uid: { type: String },
      client_name: { type: String }
    },
    products: [
      {
        product_uid: { type: String },
        client_product_code: { type: String },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        flatDiscount: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        customerCodeNumber: { type: String },
        complete_packaging_profile: { type: String },
        unit_of_billing: { type: String },
        registration_no: { type: String },
        registration_date: { type: Date },
        shelf_life: { type: String },
        frieght: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        hsn_code: { type: Number, default: 0 },
        shipper_size_inner_dimension: { type: String },
        minimum_batch_size: { type: Number, default: 0 },
        maximum_batch_size: { type: Number, default: 0 },
        greenTick: { type: Number, default: 1 },
        redTick: { type: Number, default: 6 },
        artwork: {
          status: { type: Boolean, default: false },
          remark: { type: String },
          uploaded_date: { type: Date },
          files: [
            {
              file_name: { type: String }
            }
          ]
        },
        manufacture: {
          status: { type: Boolean, default: false },
          remark: { type: String },
          uploaded_date: { type: Date },
          files: [
            {
              file_name: { type: String }
            }
          ]
        },
        testing: {
          status: { type: Boolean, default: false },
          remark: { type: String },
          uploaded_date: { type: Date },
          files: [
            {
              file_name: { type: String }
            }
          ]
        },
        dispatch: {
          status: { type: Boolean, default: false },
          remark: { type: String },
          CoA_doc: { type: String },
          uploaded_date: { type: Date },
          files: [
            {
              file_name: { type: String }
            }
          ]
        },
        shipped: {
          status: { type: Boolean, default: false },
          remark: { type: String },
          shipped_onboard_date: { type: Date },
          uploaded_date: { type: Date },
          files: [
            {
              file_name: { type: String }
            }
          ]
        },
        workstatus: { type: String, enum: ['IssuedOn', 'Artwork', 'Manufacture', 'Testing', 'Dispatch', 'Shipped'], default: 'IssuedOn' }
      }
    ],
    shipped_status: { type: Boolean, enum: [false, true], default: false },
    gross_price: { type: Number, default: 0 },
    discount_type: { type: String, enum: ['Percentage', 'Flat', ''], default: '' },
    discount_on_gross_price: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    estimated_dispatch_date: { type: Date, default: Date.now },
    mode_of_shipping: { type: String },
    comments: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'OpenOrder', 'ShippedOrder'], default: 'Pending' },
    approved_date: { type: Date },
    pi_document: { type: String },
    signed_pi_document: { type: String }
  },
  {
    timestamps: true
  }
);


module.exports = mongoose.model('PIs', PISchema, 'PIs');
