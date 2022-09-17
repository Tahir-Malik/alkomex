const productModel = require('../models/product');
const generateuid = require('../services/generateuid')
const piModel = require('../models/pi');
const path = require('path');
const XLSX = require('xlsx');

exports.create_registered_products = ({ file }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product_number = 0;
      const dir = `${path.dirname(process.mainModule.filename)}/upload/other`;
      const coolPath = dir + '/' + file;
      const workbook = XLSX.readFile(coolPath);
      const sheet_name_list = workbook.SheetNames;
      XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      let jsonArray = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      jsonArray = jsonArray.splice(1);
      let product_data = await productModel.find().sort('-product_number').limit(1).exec();
      if (product_data.length > 0) {
        product_number = product_data[0].product_number;
      }
      let docs = await addProductToDatabase(jsonArray, product_number);
      if (!docs || docs == null) {
        throw new Error('Data not loaded.');
      }
      resolve(docs)
    } catch (err) {
      reject(err)
    }
  })
}

const addProductToDatabase = async (jsonArray, product_number) => {
  let newJsonArray = []; let product_uid = 'RP-00001';
  await Promise.all(
    jsonArray.map(item => {
      if ((product_number + '').length < 6) {
        product_number = product_number + 1;
        product_uid = 'RP-' + pad(product_number, 5);
      } else {
        product_number = product_number + 1;
        product_uid = 'RP-' + product_number;
      }
      newJsonArray.push({
        product_number, product_uid, serial_no: item['Sr. No.'],
        type_of_product: item['Pharma or Food'], brand_name: item['Brand Name'], generic_name: item['Generic Name'],
        packaging: item['Packing'], unit_of_billing: item['Unit of billing'], active_ingredients: item['Active ingredients'],
        label_claim: item['Label claim'], therapeutic_category: item['Therapeutic Category '], speciality: item['Speciality'],
        dosage_form: item['Dosage form '], supplier: item['Supplier'], customer_uid: item['Customer UID'],
        customer_code_number: item['Customer Code Number'], complete_packaging_profile: item['Complete Packing Profile'],
        primary_packing: item['Primary packing '], secondary_carton_packing: item['Secondary packing / Carton packing'],
        inner_carton_shrink_packing: item['Inner Carton / Shrink packing'], shipping_packing: item['Shipper packing'],
        shipper_size_inner_dimension: item['Shipper size (Inner Dimension)'], purchase_rs: item['PURCHASE Rs'],
        insurance: item['INSURANCE'] ? item['INSURANCE'] : 0, frieght: item['FREIGHT'], interest: item['INTEREST'],
        admin_cost: item['ADMIN COST'], total_rs: item['TOTAL Rs'], ex_rate: item['EX RATE'], cost_price: item['Cost Price'],
        sales_price: item['Sales Price'], hsn_code: item['HSN CODE'], registration_no: item['Registration No.'], registration_date: item['Registration date'],
        shelf_life: item['Shelf Life'], biequivalvence: item['Bioequ-ivalence'], minimum_batch_size: item['Minimum Batch Size'],
        maximum_batch_size: item['Maximum Batch Size'], first_supply: item['First Supply'], first_year: {
          projection: item['1st year'], sales: item['__EMPTY']
        },
        second_year: { projection: item['2nd year'], sales: item['__EMPTY_1'] },
        third_year: { projection: item['3rd year'], sales: item['__EMPTY_2'] },
        artwork_barcode: { tube_label_foil: item['Artwork Barcode / date of approval'], carton: item['__EMPTY_3'], leaflet: item['__EMPTY_4'], shipper: item['__EMPTY_5'] }
      });
    })
  );
  return productModel.insertMany(newJsonArray);
};


function pad(num, size) {
  return ('000000000' + num).substr(-size);
}

exports.createSingle_Product = ({ }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pro_data = await productModel.find().sort('-product_number').limit(1).exec();
      let { product_uid, product_number } = await generateuid.generateuidtypes({ uiddata: pro_data, uidtype: 'product' })
      const productObj = new productModel({
        product_number, product_uid, product_type: 1,
        serial_no: body.serial_no,
        type_of_product: body.type_of_product,
        brand_name: body.brand_name,
        generic_name: body.generic_name,
        packaging: body.packaging,
        unit_of_billing: body.unit_of_billing,
        active_ingredients: body.active_ingredients,
        label_claim: body.label_claim,
        therapeutic_category: body.therapeutic_category,
        speciality: body.speciality,
        dosage_form: body.dosage_form,
        supplier: body.supplier,
        customer: body.customer,
        customer_code_number: body.customer_code_number,
        complete_packaging_profile: body.complete_packaging_profile,
        primary_packing: body.primary_packing,
        secondary_carton_packing: body.secondary_carton_packing,
        inner_carton_shrink_packing: body.inner_carton_shrink_packing,
        shipping_packing: body.shipping_packing,
        shipper_size_inner_dimension: body.shipper_size_inner_dimension,
        purchase_rs: body.purchase_rs,
        shipping_volume_in_cbm: body.shipping_volume_in_cbm,
        minimum_batch_size: body.minimum_batch_size,
        maximum_batch_size: body.maximum_batch_size,
        frieght: body.frieght,
        interest: body.interest,
        insurance: body.insurance,
        admin_cost: body.admin_cost,
        total_rs: body.total_rs,
        ex_rate: body.ex_rate,
        cost_price: body.cost_price,
        sales_price: body.sales_price,
        hsn_code: body.hsn_code,
        registration_no: body.registration_no,
        registration_date: body.registration_date,
        shelf_life: body.shelf_life,
        biequivalvence: body.biequivalvence,
        first_supply: body.first_supply,
        first_year: body.first_year,
        second_year: body.second_year,
        third_year: body.third_year,
        artwork_barcode: body.artwork_barcode
      });
      let product = await productObj.save()
      if (!product || product == null) {
        throw new Error('Product not saved.')
      }
      resolve(product);
    } catch (err) {
      reject(err)
    }
  });
}

exports.get_all_products = ({ query }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { customeruid } = query; let querydata = {};
      if (customeruid) {
        querydata = { customer_uid: customeruid }
      }
      var mysort = { customer_code_number: 1 };
      let products = await productModel.find(querydata, { product_uid: 1, type_of_product: 1, generic_name: 1, customer_uid: 1, customer_code_number: 1, sales_price: 1 }).sort(mysort);
      resolve(products);
    } catch (err) {
      reject(err);
    }
  });
}

exports.getOne_product = ({ productid }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await productModel.findById(productid);
      if (!product || product == null) {
        throw new Error('Product does not exist.');
      }
      resolve(product);
    } catch (err) {
      reject(err);
    }
  });
}

exports.update_product = ({ productid, body }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product_data = {
        serial_no: body.serial_no,
        type_of_product: body.type_of_product,
        brand_name: body.brand_name,
        generic_name: body.generic_name,
        packaging: body.packaging,
        unit_of_billing: body.unit_of_billing,
        active_ingredients: body.active_ingredients,
        label_claim: body.label_claim,
        therapeutic_category: body.therapeutic_category,
        speciality: body.speciality,
        dosage_form: body.dosage_form,
        supplier: body.supplier,
        customer: body.customer,
        customer_code_number: body.customer_code_number,
        complete_packaging_profile: body.complete_packaging_profile,
        primary_packing: body.primary_packing,
        secondary_carton_packing: body.secondary_carton_packing,
        inner_carton_shrink_packing: body.inner_carton_shrink_packing,
        shipping_packing: body.shipping_packing,
        shipper_size_inner_dimension: body.shipper_size_inner_dimension,
        purchase_rs: body.purchase_rs,
        shipping_volume_in_cbm: body.shipping_volume_in_cbm,
        minimum_batch_size: body.minimum_batch_size,
        maximum_batch_size: body.maximum_batch_size,
        frieght: body.frieght,
        interest: body.interest,
        insurance: body.insurance,
        admin_cost: body.admin_cost,
        total_rs: body.total_rs,
        ex_rate: body.ex_rate,
        cost_price: body.cost_price,
        sales_price: body.sales_price,
        hsn_code: body.hsn_code,
        registration_no: body.registration_no,
        registration_date: body.registration_date,
        shelf_life: body.shelf_life,
        biequivalvence: body.biequivalvence,
        first_supply: body.first_supply,
        first_year: body.first_year,
        second_year: body.second_year,
        third_year: body.third_year,
        artwork_barcode: body.artwork_barcode
      };
      let product = await productModel.findByIdAndUpdate(productid, { $set: product_data }, { new: true })
      if (!product || product == null) {
        throw new Error('Product not found.');
      }
      resolve(product);
    } catch (err) {
      reject(err);
    }
  });
};

exports.delete_product = ({ product_uid }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pi_data = await piModel.find({ 'products.product_uid': product_uid });
      if (pi_data.length > 0) {
        throw new Error("Product con't be removed, already in used");
      } else {
        await productModel.deleteOne({ product_uid: product_uid })
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
