const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

function assertConfigured() {
  if (!env.cloudinary.configured) {
    throw new ApiError(503, "Image uploads are not configured on this server");
  }
}

/** Upload an in-memory buffer; returns { url, publicId }. */
function uploadImage(buffer, folder) {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `forge/${folder}`,
        resource_type: "image",
        transformation: [{ width: 1200, height: 1200, crop: "limit" }, { quality: "auto" }],
      },
      (err, result) => {
        if (err) return reject(new ApiError(502, "Image upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

async function deleteImage(publicId) {
  if (!publicId || !env.cloudinary.configured) return;
  await cloudinary.uploader.destroy(publicId).catch(() => {}); // orphan tolerable
}

module.exports = { uploadImage, deleteImage };
