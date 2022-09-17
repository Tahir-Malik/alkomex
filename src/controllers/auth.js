const customerModel = require('../models/customer')
const adminModel = require('../models/admin')
const OTPModel = require('../models/otp')
const Mailer = require('../services/mailer')
const ms = require('ms');
const constants = require('../constants');
const jwt = require('jsonwebtoken')

exports.login = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customerCredentials = await customerModel.findOne({ 'basic_details.email': body.email, status: 'Active' })
            if (!customerCredentials) {
                throw new Error('Invalid Customer')
            } else {
                let model = new customerModel();
                let validatePass = await model.compare(body.password, customerCredentials.basic_details.password);
                if (!validatePass) {
                    throw new Error('Invalid Credentials')
                }
                resolve({
                    customerCredentials: {
                        id: customerCredentials._id,
                        uid: customerCredentials.customer_uid,
                        userType: 'Customer',
                        name: customerCredentials.basic_details.registered_name,
                        profileimage: customerCredentials.basic_details.profileimage,
                        email: customerCredentials.basic_details.email
                    },
                    token: jwt.sign({
                        id: customerCredentials._id,
                        uid: customerCredentials.customer_uid,
                        userType: 'Customer',
                        name: customerCredentials.basic_details.registered_name,
                        profileimage: customerCredentials.basic_details.profileimage,
                        email: customerCredentials.basic_details.email
                    }, constants.jwtSecret, { expiresIn: constants.tokenExpiresIn })
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

exports.forgot = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customerCredentials = await customerModel.findOne({ 'basic_details.email': body.email }, { customer_uid: 1, basic_details: 1 })
            if (!customerCredentials) {
                throw new Error('No account with that email address exists.')
            } else {
                await forgetPasswordOtp(customerCredentials, 'Customer');
                resolve(customerCredentials)
            }
        } catch (error) {
            reject(error)
        }
    });
}

exports.resetpassword = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userCredentials = await customerModel.findOne({ 'basic_details.email': body.email }, { basic_details: 1, customer_uid: 1, status: 1 })
            if (!userCredentials) {
                throw new Error('Customer not found.')
            } else {
                await otpVerify(userCredentials._id, body.otp, 'Customer');
                let model = new customerModel();
                userCredentials.basic_details.password = await model.hash(body.password);
                await userCredentials.save();
                resolve(userCredentials)
            }
        } catch (error) {
            reject(error)
        }
    });
}

exports.adminlogin = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const adminCredentials = await adminModel.findOne({ email: body.email, status: 'Active' })
            if (!adminCredentials) {
                throw new Error('Invalid Admin')
            } else {
                let model = new customerModel();
                let validatePass = await model.compare(body.password, adminCredentials.password);
                if (!validatePass) {
                    throw new Error('Invalid Credentials')
                }
                resolve({
                    adminCredentials: {
                        id: adminCredentials._id,
                        userType: 'Admin',
                        name: (adminCredentials.firstName + adminCredentials.lastName),
                        profileimage: adminCredentials.profileimage,
                        email: adminCredentials.email
                    },
                    token: jwt.sign({
                        id: adminCredentials._id,
                        userType: 'Admin',
                        name: (adminCredentials.firstName + adminCredentials.lastName),
                        profileimage: adminCredentials.profileimage,
                        email: adminCredentials.email
                    }, constants.jwtSecret, { expiresIn: constants.tokenExpiresIn })
                })
            }
        } catch (error) {
            reject(error)
        }
    });
}

exports.adminforgot = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const adminCredentials = await adminModel.findOne({ 'email': body.email }, { firstName: 1, lastName: 1, email: 1 })
            if (!adminCredentials) {
                throw new Error('No account with that email address exists.')
            } else {
                await forgetPasswordOtp(adminCredentials, 'Admin');
                resolve(adminCredentials)
            }
        } catch (error) {
            reject(error)
        }
    });
}

exports.adminresetpassword = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const adminCredentials = await adminModel.findOne({ email: body.email }, { firstName: 1, lastName: 1, email: 1 })
            if (!adminCredentials) {
                throw new Error('Admin not found.')
            } else {
                await otpVerify(adminCredentials._id, body.otp, 'Admin');
                let model = new adminModel();
                adminCredentials.password = await model.hash(body.password);
                await adminCredentials.save();
                resolve(adminCredentials)
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function forgetPasswordOtp(userdata, type) {
    try {
        let otp = Math.floor(1000 + Math.random() * 9000);
        if (type == 'Admin') {
            let check = await OTPModel.findOne({ $and: [{ adminid: userdata._id }, { type: 'Admin' }] });
            if (check) {
                check.otp = otp;
                check.createdAt = new Date();
                await check.save();
            } else {
                let model = new OTPModel({ adminid: userdata._id, otp, type: 'Admin' });
                await model.save();
            }
            console.log('Admin Email :----->', userdata.email);
            let message = `Your verification code is ${otp}. It will expire in ${ms(constants.otpExpiresIn, { long: true })}.`;
            await Mailer.send(userdata.email, 'OTP', message, '');
        } else {
            let check = await OTPModel.findOne({ $and: [{ customerid: userdata._id }, { type: 'Customer' }] });
            if (check) {
                check.otp = otp;
                check.createdAt = new Date();
                await check.save();
            } else {
                let model = new OTPModel({ customerid: userdata._id, otp, type: 'Customer' });
                await model.save();
            }
            console.log('Customer Email :----->', userdata.basic_details.email);
            let message = `Your verification code is ${otp}. It will expire in ${ms(constants.otpExpiresIn, { long: true })}.`;
            await Mailer.send(userdata.basic_details.email, 'OTP', message);
        }
        return;
    } catch (err) {
        return;
    }
}

async function otpVerify(_id, otp, type) {
    try {
        let model = new OTPModel();
        if (type == 'Admin') {
            let otpDB = await OTPModel.findOne({ $and: [{ adminid: _id }, { type: 'Admin' }] });
            if (!otpDB) {
                return Promise.reject('Invalid OTP.');
            } else if (otpDB.otp != otp) {
                return Promise.reject('OTP is incorrect.');
            } else if (await model.isExpired(_id, 'Admin')) {
                await OTPModel.deleteOne({ adminid: _id });
                return Promise.reject('OTP expired.');
            } else {
                await OTPModel.deleteOne({ adminid: _id });
                return true;
            }
        } else {
            let otpDB = await OTPModel.findOne({ $and: [{ customerid: _id }, { type: 'Customer' }] });
            if (!otpDB) {
                return Promise.reject('Invalid OTP.');
            } else if (otpDB.otp != otp) {
                return Promise.reject('OTP is incorrect.');
            } else if (await model.isExpired(_id, 'Customer')) {
                await OTPModel.deleteOne({ customerid: _id });
                return Promise.reject('OTP expired.');
            } else {
                await OTPModel.deleteOne({ customerid: _id });
                return true;
            }
        }
    } catch (err) {
        return err;
    }
}


