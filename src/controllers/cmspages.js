const cmsModel = require('../models/cmspages');
const util = require('../util/index');

exports.createAndUpdate = ({ body }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let pageName = util.initCap(body.pageName);
            let _content = await cmsModel.findOne({ pageName: { '$regex': pageName, '$options': 'i' } });
            if (_content) {
                let cms = await cmsModel.findByIdAndUpdate(_content._id, body, { new: true });
                if (!cms || cms == null) {
                    throw new Error('CMS Page is not updated');
                }
                resolve(cms)
            } else {
                let cms = await cmsModel.create(body)
                if (!cms || cms == null) {
                    throw new Error('CMS Page is not added.');
                }
                resolve(cms)
            }
        } catch (err) {
            reject(err)
        }
    })
}

exports.getOne = ({ params }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { pageName, status } = params;
            let query = {
                ...(pageName && { pageName: { $regex: ".*" + pageName + ".*", $options: 'i' } }),
                ...(status && { status: 'Active' }),
            }
            let cmspage = await cmsModel.findOne(query);
            resolve(cmspage)
        } catch (err) {
            reject(err)
        }
    })
}