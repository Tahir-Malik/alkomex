const userModel = require('../models/user');

exports.create = (req, res) => {
    const userObj = new userModel({
        user_name: req.body.user_name,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
    })
    userObj.save()
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "User created Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}


exports.login = (req, res) => {

    userModel.findOne({ email: req.body.email, password: req.body.password })
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "LoggedIn Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}
exports.get = (req, res) => {
    userModel.find()
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "User data fetched Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}

exports.getOne = (req, res) => {
    userModel.findById(req.params.id)
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "User data fetched Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}

exports.update = (req, res) => {
    let dataBody = JSON.parse(req.body)
    let data = {
        user_name: dataBody.user_name,
        email: dataBody.email,
        firstName: dataBody.firstName,
        lastName: dataBody.lastName,
        profile_pic: req.file.filename,
    }
    userModel.findByIdAndUpdate(req.params.id, { $set: data }, { new: true })
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "User data updated Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}

exports.delete = (req, res) => {
    userModel.findByIdAndRemove(req.params.id)
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ message: "User deleted successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}


exports.updateProfilePic = (req, res) => {
    let data = {
        profile_pic: req.file.filename,
    }
    userModel.findByIdAndUpdate(req.params.id, { $set: data }, { new: true })
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "Profile Picture uploaded Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}


exports.updatePassword = (req, res) => {
    let data = {
        password: req.body.password,
    }
    userModel.findByIdAndUpdate(req.params.id, { $set: data }, { new: true })
        .then(user => {
            if (!user || user == null) {
                return res.status(200).send({
                    response: 'User not added.',
                });
            }
            res.status(200).send({ data: user, message: "Password changed Successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: "Internal Server Error" })
        })
}