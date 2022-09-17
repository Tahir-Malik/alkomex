const path = require('path');
const multer = require('multer');
const fs = require('fs')

var storage = multer.diskStorage({
    destination: function (req, file, next) {
        var dir; var pathToFile;
        if (file.fieldname === 'profileimage') {
            dir = path.dirname(require.main.filename) + "/upload/profileimage";
            pathToFile = "upload/profileimage";
        } else if (file.fieldname === 'media') {
            dir = path.dirname(require.main.filename) + "/upload/podoc";
            pathToFile = "upload/podoc";
        } else if (file.fieldname === 'signedpi') {
            dir = path.dirname(require.main.filename) + "/upload/signedpi";
            pathToFile = "upload/signedpi";
        } else if (file.fieldname === 'file') {
            dir = path.dirname(require.main.filename) + "/upload/other";
            pathToFile = "upload/other";
        } else if (file.fieldname === 'files') {
            dir = path.dirname(require.main.filename) + "/upload/orderstatusfiles";
            pathToFile = "upload/orderstatusfiles";
        } else if (file.fieldname === 'coa_doc') {
            dir = path.dirname(require.main.filename) + "/upload/CoA_doc";
            pathToFile = "upload/CoA_doc";
        } else if (file.fieldname === 'certificate_of_origin_doc') {
            dir = path.dirname(require.main.filename) + "/upload/certificate_of_origin_doc";
            pathToFile = "upload/certificate_of_origin_doc";
        } else if (file.fieldname === 'bill_of_lading_doc') {
            dir = path.dirname(require.main.filename) + "/upload/bill_of_lading_doc";
            pathToFile = "upload/bill_of_lading_doc";
        } else if (file.fieldname === 'insurance_doc') {
            dir = path.dirname(require.main.filename) + "/upload/insurance_doc";
            pathToFile = "upload/insurance_doc";
        } else if (file.fieldname === 'airway_bill_doc') {
            dir = path.dirname(require.main.filename) + "/upload/airwaybill_doc";
            pathToFile = "upload/airwaybill_doc";
        } else if (file.fieldname === 'invoice_doc') {
            dir = path.dirname(require.main.filename) + "/upload/invoice";
            pathToFile = "upload/invoice";
        } else if (file.fieldname === 'packing_doc') {
            dir = path.dirname(require.main.filename) + "/upload/packinglist";
            pathToFile = "upload/packinglist";
        } else if (file.fieldname === 'rejection_docs') {
            dir = path.dirname(require.main.filename) + "/upload/rejection_docs";
            pathToFile = "upload/rejection_docs";
        } else if (file.fieldname === 'signed_creditnote_doc') {
            dir = path.dirname(require.main.filename) + "/upload/signed_creditnote_doc";
            pathToFile = "upload/signed_creditnote_doc";
        }
        if (!fs.existsSync(dir)) {
            var dirName = path.dirname(require.main.filename);
            var filePathSplit = pathToFile.split('/');
            for (var index = 0; index < filePathSplit.length; index++) {
                dirName += '/' + filePathSplit[index]
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, '0777');
                    fs.chmodSync(dirName, '777');
                }
            }
            next(null, dir)
        } else {
            next(null, dir)
        }
    },
    filename: function (req, file, next) {
        const ext = file.mimetype.split('/')[1];
        const filename = file.originalname.substr(0, file.originalname.lastIndexOf('.')) + '_' + new Date().getTime() + '.' + ext;
        next(null, filename)
    }
    // onFileUploadComplete: function (file, req, res) {
    //     console.log(file.name + ' uploading is ended ...');
    //     console.log("File name : " + file.name + "\n" + "FilePath: " + file.path)
    // }
})
exports.upload = multer({ storage: storage, limits: { fileSize: 7 * 1024 * 1024 } })

exports.validate = (req, res, next) => {
    if (!req.file) {
        return res
            .status(500)
            .send({ success: false, message: "file can't be empty" })
    }
    next();
}

exports.validates = (req, res, next) => {
    if (!req.files) {
        return res
            .status(500)
            .send({ success: false, message: "file(s) can't be empty" })
    }
    next();
}

// const storage = multer({ storage: storeimage }).single("media")
// storage(req, res, function (err) {
//     if (err) {
//         console.log("Error", err)
//     }
//     // console.log(req.body)
//     // req.body = req.body
//     next()
// })





