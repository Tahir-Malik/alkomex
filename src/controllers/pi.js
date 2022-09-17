const piModel = require('../models/pi');
const packinglistModel = require('../models/packinglist');
const PDFConverter = require("phantom-html-to-pdf")({});
const customerModel = require('../models/customer')
const Mailer = require('../services/mailer')
const generateuid = require('../services/generateuid')
const fs = require('fs')
const path = require('path');
const async = require("async");
var mongoose = require('mongoose')
var moment = require('moment');
const ObjectId = mongoose.Types.ObjectId;


exports.create_proformainvoice = ({ res, body, file }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = JSON.parse(body.data);
      let pi_data = await piModel.find().sort('-pi_number').limit(1).exec();
      let { pi_uid, pi_number } = await generateuid.generateuidtypes({ uiddata: pi_data, uidtype: 'pi' })
      const piObj = new piModel({
        pi_uid: pi_uid, pi_number: pi_number,
        client_po_document: file.filename,
        client_po_number: data.client_po_number,
        date_of_issue_of_po: data.doi_of_po,
        client: data.client,
        products: data.product,
        gross_price: data.gross_price,
        discount_type: data.discount_type,
        discount_on_gross_price: data.discount_on_total_price,
        total_price: data.total_price,
        estimated_dispatch_date: data.estimated_dispatch_date,
        mode_of_shipping: data.mode_of_shipping,
        comments: data.comments
      });
      let pi = await piObj.save();
      await generateandsentPIdoc(res, pi.pi_uid, 'Admin');
      resolve(pi)
    } catch (err) {
      reject(err)
    }
  })
}

exports.sendEmailProformaInvoice = ({ res, pi_uid }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pidoc = await generateandsentPIdoc(res, pi_uid, 'User');
      resolve(pidoc)
    } catch (err) {
      reject(err)
    }
  })
}

exports.uploadsignedpidoc = ({ pi_uid, file }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pi = await piModel.findOneAndUpdate({ pi_uid: pi_uid }, { $set: { signed_pi_document: file.filename, status: 'OpenOrder' } }, { new: true })
      if (!pi || pi == null) {
        throw new Error('PI does not exists.');
      }
      resolve(pi)
    } catch (err) {
      reject(err)
    }
  })
}

exports.getallPIs = ({ query }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let piquery = await piQuery(query);
      let pi = await piModel.aggregate(piquery);
      let { pilisttype, listviewtype } = query;
      if (pilisttype && pilisttype != '' && pilisttype == 'shippedorderlist' && listviewtype && listviewtype != '' && listviewtype == 'poview') {
        if (pi.length > 0) {
          let pilist = [];
          async.each(pi, function (pidata, callback) {
            if (pidata.status == 'OpenOrder' && pidata.products.length > 0) {
              pilist.push(pidata)
            } else if (pidata.status == 'ShippedOrder') {
              pilist.push(pidata)
            }
            callback(null);
          }, function (err) {
            resolve(pilist)
          })
        } else {
          resolve(pi)
        }
      } else {
        resolve(pi)
      }
    } catch (err) {
      reject(err)
    }
  })
}

exports.getallpri_post_order = ({ }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pri_order = 0, post_order = 0;
      let pri_orders = await piModel.aggregate([{ $match: { $or: [{ status: 'OpenOrder' }, { status: 'ShippedOrder' }] } }, { "$group": { "_id": 0, "openorder_count": { "$sum": { "$cond": [{ "$eq": ["$status", "OpenOrder"] }, 1, 0] } }, "shippedorder_count": { "$sum": { "$cond": [{ "$eq": ["$status", "ShippedOrder"] }, 1, 0] } } } }, { "$project": { "_id": 0, "total_priorder": { "$add": ["$openorder_count", "$shippedorder_count"] } } }]);
      if (pri_orders && pri_orders[0]) {
        pri_order = pri_orders[0].total_priorder;
      }
      let post_orders = await packinglistModel.aggregate([{ $match: { $or: [{ status: 'OpenInvoice' }, { status: 'CloseInvoice' }] } }, { "$group": { "_id": 0, "openinvoice_count": { "$sum": { "$cond": [{ "$eq": ["$status", "OpenInvoice"] }, 1, 0] } }, "closeinvoice_count": { "$sum": { "$cond": [{ "$eq": ["$status", "CloseInvoice"] }, 1, 0] } } } }, { "$project": { "_id": 0, "total_postorder": { "$add": ["$openinvoice_count", "$closeinvoice_count"] } } }]);
      if (post_orders && post_orders[0]) {
        post_order = post_orders[0].total_postorder;
      }
      let total_orders = { pri_order: pri_order, post_order: post_order };
      resolve(total_orders)
    } catch (err) {
      reject(err)
    }
  })
}

exports.getPIdetails = ({ pi_uid, piordertype }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pi;
      if (piordertype == 'OpenOrder') {
        pi = await piModel.aggregate([{ $match: { pi_uid: pi_uid } }, {
          $project: {
            _id: 1, client: 1, createdAt: 1, customerCodeNumber: 1, date_of_issue_of_po: 1, gross_price: 1, discount_type: 1, discount_on_gross_price: 1, total_price: 1, status: 1, pi_uid: 1, client_po_document: 1, client_po_number: 1, estimated_dispatch_date: 1, mode_of_shipping: 1, comments: 1, approved_date: 1, signed_pi_document: 1,
            products: { $filter: { input: '$products', as: 'product', cond: { $or: [{ $and: [{ "$eq": ["$$product.artwork.status", false] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, { $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, { $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, { $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }] } } },
            "artworkcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", false] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "manufacturecount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "testingcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "dispatchcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "shippedcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }
          }
        }])
      } else if (piordertype == 'ShippedOrder') {
        pi = await piModel.aggregate([{ $match: { pi_uid: pi_uid } }, {
          $project: {
            _id: 1, client: 1, createdAt: 1, customerCodeNumber: 1, date_of_issue_of_po: 1, gross_price: 1, discount_type: 1, discount_on_gross_price: 1, total_price: 1, status: 1, pi_uid: 1, client_po_document: 1, client_po_number: 1, estimated_dispatch_date: 1, mode_of_shipping: 1, comments: 1, approved_date: 1, signed_pi_document: 1,
            products: { $filter: { input: '$products', as: 'product', cond: { $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] } } },
            "artworkcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", false] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "manufacturecount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "testingcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "dispatchcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } },
            "shippedcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }
          }
        }])
      } else {
        pi = await piModel.aggregate([{ $match: { pi_uid: pi_uid } }, {
          $project: {
            _id: 1, client: 1, createdAt: 1, date_of_issue_of_po: 1, gross_price: 1, discount_type: 1, discount_on_gross_price: 1, total_price: 1, status: 1, pi_uid: 1, client_po_document: 1, client_po_number: 1, estimated_dispatch_date: 1, mode_of_shipping: 1, comments: 1, approved_date: 1, signed_pi_document: 1, products: 1
          }
        }])
      }
      if (!pi[0] || pi[0] == null) {
        throw new Error('PI does not exists.');
      } else {
        resolve(pi[0])
      }
    } catch (err) {
      reject(err)
    }
  })
}

exports.update_proformainvoice = ({ res, body, file, pi_uid }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = JSON.parse(body.data);
      let pidata = {
        client_po_number: data.client_po_number,
        date_of_issue_of_po: data.doi_of_po,
        client: data.client,
        gross_price: data.gross_price,
        discount_type: data.discount_type,
        discount_on_gross_price: data.discount_on_total_price,
        total_price: data.total_price,
        estimated_dispatch_date: data.estimated_dispatch_date,
        mode_of_shipping: data.mode_of_shipping,
        comments: data.comments,
        products: data.product
      };
      if (data.status) {
        pidata = Object.assign({ status: 'Approved', approved_date: new Date() }, pidata);
      }
      if (file && file.filename) {
        let oldpi = await piModel.findOne({ _id: ObjectId(pi_uid) }).select('client_po_document')
        if (oldpi) {
          const dir = `${path.dirname(process.mainModule.filename)}/upload/podoc`
          var imagepath = dir + '/' + oldpi.client_po_document;
          fs.unlinkSync(imagepath);
          pidata = Object.assign({ client_po_document: file.filename }, pidata);
        }
      }
      let pi = await piModel.findByIdAndUpdate(pi_uid, { $set: pidata }, { new: true })
      if (!pi || pi == null) {
        throw new Error('PI does not exists.');
      }
      await generateandsentPIdoc(res, pi.pi_uid, 'Admin');
      resolve(pi)
    } catch (err) {
      reject(err)
    }
  })
}

exports.updateOrderStatus = ({ body, files, coa_doc, productId, actiontype }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { pi_uid, product_uid, shipped_onboard_date, estimated_arrival_date, redTick, greenTick, remark } = JSON.parse(body.data);
      let workstatus = ''; let statusfiles = []; let greentickType = ''; let status = '';
      let artwork = false, manufacturing = false, testing = false, dispatch = false, shipped = false, shipped_status = false;
      if (greenTick == 1) {
        (artwork = false), (manufacturing = false), (testing = false), (dispatch = false), (shipped = false), (workstatus = 'IssuedOn'), (greentickType = 'issuedon'), (status = 'OpenOrder');
      }
      if (greenTick == 2) {
        (artwork = true), (manufacturing = false), (testing = false), (dispatch = false), (shipped = false), (workstatus = 'Artwork'), (greentickType = 'artwork'), (status = 'OpenOrder');
        if (files) {
          for (const file of files) {
            statusfiles.push({ file_name: file.filename, uploaded_date: new Date() })
          }
        }
      }
      if (greenTick == 3) {
        (artwork = true), (manufacturing = true), (testing = false), (dispatch = false), (shipped = false), (workstatus = 'Manufacture'), (greentickType = 'manufacture'), (status = 'OpenOrder');
        if (files) {
          for (const file of files) {
            statusfiles.push({ file_name: file.filename, uploaded_date: new Date() })
          }
        }
      }
      if (greenTick == 4) {
        (artwork = true), (manufacturing = true), (testing = true), (dispatch = false), (shipped = false), (workstatus = 'Testing'), (greentickType = 'testing'), (status = 'OpenOrder');
        if (files) {
          for (const file of files) {
            statusfiles.push({ file_name: file.filename, uploaded_date: new Date() })
          }
        }
      }
      if (greenTick == 5) {
        let pidata = await piModel.aggregate([{ $match: { $and: [{ status: 'OpenOrder' }, { pi_uid: pi_uid }] } }, { $project: { client: 1, total_products: { $size: "$products" }, "dispatchcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }] }, 1, 0] } } } } } }]);
        if (pidata && pidata[0]) {
          await packinglistModel.findOneAndUpdate({ $and: [{ 'client.client_uid': pidata[0].client.client_uid }, { 'products.pi_uid': pi_uid }, { 'products.product_id': product_uid }] }, { $set: { 'admin_document.CoA_doc': coa_doc } }, { new: true })
          if (parseInt(pidata[0].total_products) == parseInt(pidata[0].dispatchcount) + 1) {
            status = 'ShippedOrder';
            shipped_status = false;
          } else {
            shipped_status = true;
            status = 'OpenOrder';
          }
        } else {
          shipped_status = true;
          status = 'OpenOrder';
        }
        (artwork = true), (manufacturing = true), (testing = true), (dispatch = true), (shipped = false), (workstatus = 'Dispatch'), (greentickType = 'dispatch');
        if (files) {
          for (const file of files) {
            statusfiles.push({ file_name: file.filename, uploaded_date: new Date() })
          }
        }
      }
      if (greenTick == 6) {
        let pidata = await piModel.aggregate([{ $match: { $and: [{ $or: [{ status: 'ShippedOrder' }, { status: 'OpenOrder' }] }, { pi_uid: pi_uid }] } }, { $project: { client: 1, status: 1, products: { $filter: { input: '$products', as: 'product', cond: { $or: [{ $and: [{ "$eq": ["$$product.product_uid", product_uid] }, { "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] }] } } } } }]);
        if (pidata && pidata[0]) {
          if (pidata[0].products.length > 0) {
            await packinglistModel.findOneAndUpdate({ $and: [{ 'client.client_uid': pidata[0].client.client_uid }, { 'products.pi_uid': pi_uid }, { 'products.product_id': product_uid }] }, { $set: { "status": "OpenInvoice", shipped_onboard_date: shipped_onboard_date, estimated_arrival_date: estimated_arrival_date, payment_due_date: shipped_onboard_date, 'workstatus_date.artwork_uploaded_date': pidata[0].products[0].artwork.uploaded_date, 'workstatus_date.manufacture_uploaded_date': pidata[0].products[0].manufacture.uploaded_date, 'workstatus_date.testing_uploaded_date': pidata[0].products[0].testing.uploaded_date, 'workstatus_date.dispatch_uploaded_date': pidata[0].products[0].dispatch.uploaded_date, 'workstatus_date.shipped_uploaded_date': new Date() } }, { new: true })
          } else {
            await packinglistModel.findOneAndUpdate({ $and: [{ 'client.client_uid': pidata[0].client.client_uid }, { 'products.pi_uid': pi_uid }, { 'products.product_id': product_uid }] }, { $set: { "status": "OpenInvoice", shipped_onboard_date: shipped_onboard_date, estimated_arrival_date: estimated_arrival_date, payment_due_date: shipped_onboard_date, } }, { new: true })
          }
        }
        if (pidata.status == 'ShippedOrder') {
          shipped_status = false;
          status = 'ShippedOrder';
        } else {
          shipped_status = true;
          status = 'OpenOrder';
        }
        (artwork = true), (manufacturing = true), (testing = true), (dispatch = true), (shipped = true), (workstatus = 'Shipped'), (greentickType = 'shipped');
        if (files) {
          for (const file of files) {
            statusfiles.push({ file_name: file.filename, uploaded_date: new Date() })
          }
        }
      }
      let pi;
      if (actiontype == 'viewdetails') {
        if (statusfiles.length > 0) {
          pi = await piModel.findOneAndUpdate({ $and: [{ pi_uid: pi_uid }, { 'products._id': ObjectId(productId) }] }, { $set: { [`products.$.${greentickType}.remark`]: remark, [`products.$.${greentickType}.files`]: statusfiles, [`products.$.${greentickType}.CoA_doc`]: coa_doc, [`products.$.${greentickType}.shipped_onboard_date`]: shipped_onboard_date } }, { new: true })
        } else {
          pi = await piModel.findOneAndUpdate({ $and: [{ pi_uid: pi_uid }, { 'products._id': ObjectId(productId) }] }, { $set: { [`products.$.${greentickType}.remark`]: remark, [`products.$.${greentickType}.CoA_doc`]: coa_doc, [`products.$.${greentickType}.shipped_onboard_date`]: shipped_onboard_date } }, { new: true })
        }
      } else if (actiontype == 'back') {
        pi = await piModel.findOneAndUpdate({ $and: [{ pi_uid: pi_uid }, { 'products._id': ObjectId(productId) }] }, { $set: { 'products.$.artwork.status': artwork, 'products.$.manufacture.status': manufacturing, 'products.$.testing.status': testing, 'products.$.dispatch.status': dispatch, 'products.$.shipped.status': shipped, [`products.$.${greentickType}.uploaded_date`]: new Date(), 'products.$.workstatus': workstatus, 'products.$.greenTick': greenTick, 'products.$.redTick': redTick, status: status, shipped_status: shipped_status } }, { new: true })
      } else {
        pi = await piModel.findOneAndUpdate({ $and: [{ pi_uid: pi_uid }, { 'products._id': ObjectId(productId) }] }, { $set: { 'products.$.artwork.status': artwork, 'products.$.manufacture.status': manufacturing, 'products.$.testing.status': testing, 'products.$.dispatch.status': dispatch, 'products.$.shipped.status': shipped, [`products.$.${greentickType}.remark`]: remark, [`products.$.${greentickType}.uploaded_date`]: new Date(), 'products.$.workstatus': workstatus, 'products.$.greenTick': greenTick, 'products.$.redTick': redTick, [`products.$.${greentickType}.files`]: statusfiles, [`products.$.${greentickType}.CoA_doc`]: coa_doc, [`products.$.${greentickType}.shipped_onboard_date`]: shipped_onboard_date, status: status, shipped_status: shipped_status } }, { new: true })
      }
      if (!pi || pi == null) {
        throw new Error('Performa Invoice not updated');
      }
      resolve(pi);
    } catch (err) {
      reject(err)
    }
  })
}

exports.deletepi = ({ pi_uid }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payments = await piModel.find({}).sort({ "createdAt": -1 });
      resolve(payments)
    } catch (err) {
      reject(err)
    }
  })
}

function generateandsentPIdoc(res, pi_uid, sender_type) {
  return new Promise(async (resolve, reject) => {
    try {
      let pidata = await piModel.findOne({ pi_uid: pi_uid });
      if (!pidata || pidata == null) {
        throw new Error('PI does not exists.');
      }
      let customerdata = await customerModel.findOne({ customer_uid: pidata.client.client_uid })
      if (!customerdata || customerdata == null) {
        throw new Error('customer does not exists.');
      }
      let dir = `${path.dirname(process.mainModule.filename)}/upload/proformainvoice`
      let pi_document = `proformainvoice_${pidata.pi_uid}_${new Date().getTime()}.pdf`
      let invoice = `${dir}/${pi_document}`;
      let total_price = await inWords((pidata.total_price).toFixed(2));
      await piModel.findOneAndUpdate({ pi_uid: pi_uid }, { $set: { 'pi_document': pi_document } }, { new: true })
      res.render('proformainvoice', { pi: pidata, customerdata: customerdata, total_price: total_price }, async (err, html) => {
        if (err) {
          throw new Error('html is not generated.');
        } else {
          PDFConverter({ html: html, printDelay: 0, fitToPage: false, allowLocalFilesAccess: true }, async (err, pdf) => {
            if (err) {
              console.log('PDF Err :---->', err);
              throw new Error('pdf is not generated.');
            } else {
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }
              let stream = fs.createWriteStream(invoice);
              pdf.stream.pipe(stream);
              attachments = [{
                filename: pi_document,
                contentType: 'application/pdf',
                path: `${path.dirname(process.mainModule.filename)}/upload/proformainvoice/${pi_document}`
              }]
              if (sender_type == 'Admin') {
                await Mailer.send(process.env.ADMINEMAIL, 'Proforma Invoice', `Please find the below attachment for ${pidata.pi_uid}`, attachments);
              } else {
                await Mailer.send(customerdata.basic_details.email, 'Proforma Invoice', `Please find the below attachment for ${pidata.pi_uid}`, attachments);
              }
              resolve(pidata)
            }
          })
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}


async function piQuery(query) {
  return new Promise(async (resolve, reject) => {
    try {
      let { pilisttype, listviewtype } = query; let querydata;
      if (pilisttype && pilisttype != '' && pilisttype == 'pilist') {
        querydata = [{ $match: { $or: [{ status: 'Pending' }, { status: 'Approved' }] } }, { $project: { client_po_number: 1, createdAt: 1, pi_uid: 1, client: 1, date_of_issue_of_po: 1, total_products: { $size: "$products" }, status: 1, pi_document: 1 } }]
      } else if (pilisttype && pilisttype != '' && pilisttype == 'orderlistcount') {
        querydata = [{ $match: { $or: [{ status: 'OpenOrder' }, { status: 'ShippedOrder' }] } }, { "$group": { "_id": 0, "openorder_count": { "$sum": { "$cond": [{ "$eq": ["$status", "OpenOrder"] }, 1, 0] } }, "shippedorder_count": { "$sum": { "$cond": { "if": { "$eq": ["$status", "ShippedOrder"] }, "then": { "$cond": [{ "$gt": [{ "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $or: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }, 1] }, 1, 0] }, "else": 0 } } }, "shippedcount": { "$sum": { "$cond": { "if": { "$eq": ["$status", "OpenOrder"] }, "then": { "$cond": [{ "$gt": [{ "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $or: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }, 1] }, 1, 0] }, "else": 0 } } } } }, { "$project": { "_id": 0, "OpenOrder": "$openorder_count", "ShippedOrder": { "$sum": ["$shippedorder_count", "$shippedcount"] } } }]
      } else if (pilisttype && pilisttype != '' && pilisttype == 'openorderlist' && listviewtype && listviewtype != '' && listviewtype == 'poview') {
        querydata = [{ $match: { status: 'OpenOrder' } }, { $project: { client: 1, customerCodeNumber: 1, client_po_number: 1, pi_uid: 1, createdAt: 1, date_of_issue_of_po: 1, estimated_dispatch_date: 1, total_products: { $size: "$products" }, status: 1, "artworkcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", false] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }, "manufacturecount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", false] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }, "testingcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", false] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }, "dispatchcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", false] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } }, "shippedcount": { "$sum": { "$map": { "input": "$products", "as": "product", "in": { "$cond": [{ $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] }, 1, 0] } } } } } }]
      } else if (pilisttype && pilisttype != '' && pilisttype == 'openorderlist' && listviewtype && listviewtype != '' && listviewtype == 'productview') {
        querydata = [{ $match: { status: 'OpenOrder' } }, { $project: { client: 1, pi_uid: 1, createdAt: 1, client_po_number: 1, 'products.product_uid': 1, estimated_dispatch_date: 1, 'products.workstatus': 1, 'products.quantity': 1, 'products.flatDiscount': 1, 'products.price': 1, 'products.amount': 1 } }]
      } else if (pilisttype && pilisttype != '' && pilisttype == 'shippedorderlist' && listviewtype && listviewtype != '' && listviewtype == 'poview') {
        querydata = [{ $match: { $or: [{ status: 'ShippedOrder' }, { status: 'OpenOrder' }] } }, { $project: { client: 1, customerCodeNumber: 1, createdAt: 1, client_po_number: 1, pi_uid: 1, date_of_issue_of_po: 1, estimated_dispatch_date: 1, total_products: { $size: "$products" }, status: 1, products: { $filter: { input: '$products', as: 'product', cond: { $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] } } } } }]
      } else if (pilisttype && pilisttype != '' && pilisttype == 'shippedorderlist' && listviewtype && listviewtype != '' && listviewtype == 'productview') {
        querydata = [{ $match: { $or: [{ status: 'OpenOrder' }, { status: 'ShippedOrder' }] } }, { $project: { client: 1, pi_uid: 1, customerCodeNumber: 1, createdAt: 1, client_po_number: 1, estimated_dispatch_date: 1, status: 1, products: { $filter: { input: '$products', as: 'product', cond: { $and: [{ "$eq": ["$$product.artwork.status", true] }, { "$eq": ["$$product.manufacture.status", true] }, { "$eq": ["$$product.testing.status", true] }, { "$eq": ["$$product.dispatch.status", true] }, { "$eq": ["$$product.shipped.status", false] }] } } } } }]
      } else {
        querydata = [{ $match: { $or: [{ status: 'Pending' }, { status: 'Approved' }] } }, { $project: { client_po_number: 1, pi_uid: 1, createdAt: 1, client: 1, date_of_issue_of_po: 1, total_products: { $size: "$products" }, status: 1 } }]
      }
      resolve(querydata);
    } catch (err) {
      reject(err);
    }
  })
}

async function inWords(num) {
  var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Sighteen ', 'Nineteen '];
  var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  var numarray = num.toString().split('.');
  num = numarray[0];
  dot = numarray[1];
  n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  d = ('000' + dot).substr(-2).match(/^(\d{2})$/);
  if (!n) return; var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += (n[5] != 0) ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  str += (d[1] != 0) ? ((d[1] != '') ? 'And ' : '') + (a[Number(d[1])] || b[d[1][0]] + ' ' + a[d[1][1]]) + 'Cent Only ' : 'Only';
  return str;
}