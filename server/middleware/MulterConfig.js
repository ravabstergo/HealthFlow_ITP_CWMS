const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./CloudinaryConfig");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "HealthFlow",
      allowed_formats: ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
