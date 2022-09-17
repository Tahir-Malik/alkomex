const customerModel = require('../models/customer');
const UserModel = require('../models/user')
const generateuid = require('../services/generateuid')


exports.create_customer = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let customer_data = await customerModel.find().sort('-customer_number').limit(1).exec();
            let { customer_uid, customer_number } = await generateuid.generateuidtypes({ uiddata: customer_data, uidtype: 'customer' })
            const customerobj = new customerModel({
                customer_uid: customer_uid,
                customer_number: customer_number,
                basic_details: body.basic_details,
                notify_party: body.notify_party,
                client_poc: body.client_poc,
                additional_details: body.additional_details
            })
            customerobj.basic_details.password = customerobj.hash(customerobj.basic_details.password);
            let customer = await customerobj.save();
            if (!customer || customer == null) {
                throw new Error('User not added.');
            }
            resolve(customer)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getallcustomers = ({ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let customers = await customerModel.find({ status: 'Active' })
            resolve(customers);
        } catch (err) {
            reject(err)
        }
    })
}

exports.getcustomeruids = ({ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let customers = await customerModel.find({ status: 'Active' }, { _id: 0, customer_uid: 1, "basic_details.registered_name": 1, 'basic_details.ports_of_discharge': 1 })
            resolve(customers);
        } catch (err) {
            reject(err)
        }
    })
}

exports.getByFilter = (req, res) => {
    let data = req.body;
    if (!(typeof data == 'object')) {
        data = JSON.parse(data);
    }
    var where = { deleted: 0 };
    if (data.start_date && data.end_date) {
        var start = new Date(data.start_date);
        start.setHours(0, 0, 0, 0);
        var end = new Date(data.end_date);
        end.setHours(23, 59, 59, 999);
        where.createdAt = {
            '$gte': start,
            '$lte': end
        }
    }
    customerModel.find(where)
        .then(customer => {
            if (!(customer && customer.length > 0)) {
                return res.status(200).send({
                    message: 'User not found.',
                    success: false
                });
            }
            res.status(200).send({
                success: true,
                data: customer, message: "Customers data fetched Successfully"
            });
        })
        .catch(err => {
            res.status(500).send({ success: false, message: "Internal Server Error" })
        })
}

exports.getOne = (req, res) => {
    customerModel.findById(req.params.id)
        .then(customer => {
            if (!customer || customer == null) {
                return res.status(200).send({
                    message: 'User not added.',
                    success: false
                });
            }
            res.status(200).send({
                success: true,
                data: customer, message: "Customer data fetched Successfully"
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: "Internal Server Error"
            })
        })
}

exports.update = (req, res) => {
    let data = {
        customer_uid: req.body.additional_details.customer_uid,
        customer_number: req.body.additional_details.customer_number,
        basic_details: req.body.basic_details,
        notify_party: req.body.notify_party,
        client_poc: req.body.client_poc,
        additional_details: req.body.additional_details
    }
    customerModel.findByIdAndUpdate(req.params.id, { $set: data }, { new: true })
        .then(customer => {
            if (!customer || customer == null) {
                return res.status(200).send({
                    response: 'User not added.',
                    success: false
                });
            }
            res.status(200).send({
                data: customer,
                message: "Customer data fetched Successfully",
                success: true
            });
        })
        .catch(err => {
            console.log("Error", err)
            res.status(500).send({
                success: false,
                message: "Internal Server Error"
            })
        })
}

exports.delete = (req, res) => {
    customerModel.update({ _id: req.params.id }, { $set: { delete: 1 } })
        .then(customer => {
            if (!customer || customer == null) {
                return res.status(200).send({
                    response: 'User not added.',
                    success: false,
                });
            } else {
                if (customer.customer_uid && customer.deleted == 1) {
                    UserModel.update({ customer_uid: customer.customer_uid }, { deleted: 1 }).then(update => { });
                }
            }
            res.status(200).send({
                success: true,
                message: "Customer deleted successfully"
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
            });
        }
        )
}