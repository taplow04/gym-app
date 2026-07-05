const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Memory storage → buffer streams straight to Cloudinary; nothing ever
// touches local disk.

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest("Only JPEG, PNG or WebP images are allowed"));
    }
    cb(null, true);
  },
});

module.exports = upload;
