const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    product_uid                 : { type: String },
    product_number              : { type: Number },
    product_type                : { type: Number, default: "0"},
    serial_no                   : { type: Number },
    type_of_product             : { type: String },
    brand_name                  : { type: String },
    generic_name                : { type: String },
    packaging                   : { type: String },
    unit_of_billing             : { type: String },
    active_ingredients          : { type: String },
    label_claim                 : { type: String },
    therapeutic_category        : { type: String },
    speciality                  : { type: String },
    dosage_form                 : { type: String },
    supplier                    : { type: String },
    customer_uid                : { type: String },
    customer_code_number        : { type: String },
    complete_packaging_profile  : { type: String },
    primary_packing             : { type: String },
    secondary_carton_packing    : { type: String },
    inner_carton_shrink_packing : { type: String },
    shipping_packing            : { type: String },
    shipper_size_inner_dimension: { type: String },
    purchase_rs                 : { type: Number },
    frieght                     : { type: Number },
    interest                    : { type: Number },
    admin_cost                  : { type: Number },
    total_rs                    : { type: Number },
    ex_rate                     : { type: Number },
    insurance                   : { type: Number },
    cost_price                  : { type: Number },
    sales_price                 : { type: Number },
    hsn_code                    : { type: Number },
    registration_no             : { type: String },
    registration_date           : { type: Date },
    shelf_life                  : { type: String },
    biequivalvence              : { type: String },
    minimum_batch_size          : { type: Number },
    shipping_volume_in_cbm      : { type: String },
    maximum_batch_size          : { type: Number },
    first_supply                : { type: String },
    deleted                     : { type: Number, default: "0" },
    first_year: {
        projection : { type: String },
        sales      : { type: String }
    },
    second_year: {
        projection : { type: String },
        sales      : { type: String }
    },
    third_year: {
        projection  : { type: String },
        sales       : { type: String }
    },
    artwork_barcode: {
        tube_label_foil : { type: String },
        carton          : { type: String },
        leaflet         : { type: String },
        shipper         : { type: String }
    }
    }, {
    timestamps: true
});
module.exports = mongoose.model('Products', ProductSchema)
