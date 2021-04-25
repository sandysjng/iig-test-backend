const multer = require("multer"),
    path = require("path"),
    util = require("util"),
    uuid = require("uuid");


let uploadFile = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(path.dirname('')) + "/public/profiles/");
        },
        filename: (req, file, cb) => {
            cb(null, uuid.v4());
        },
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;