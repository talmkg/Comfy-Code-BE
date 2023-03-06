import { fileURLToPath } from "url";

import multer from "multer";

import { v2 as cloudinary } from "cloudinary";

import { CloudinaryStorage } from "multer-storage-cloudinary";

const { CLOUDINARY_URL } = process.env;

cloudinary.config({
  cloudinary_url: CLOUDINARY_URL,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ComfyCode",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});
export const cloudinaryUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "ComfyCode/groups-covers",
      allowedFormats: ["jpeg", "png", "jpg"],
    },
  }),
}).single("cover");
export const cloudinaryUploadPFP = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "ComfyCode/users-pfps",
      allowedFormats: ["jpeg", "png", "jpg"],
    },
  }),
}).single("pfp");
export const cloudinaryUploadBackground = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "ComfyCode/users-backgrounds",
      allowedFormats: ["jpeg", "png", "jpg"],
    },
  }),
}).single("background");
export const cloudinaryUploadPostImages = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "ComfyCode/post-images",
      allowedFormats: ["jpeg", "png", "jpg"],
    },
  }),
}).single("postImage");
const __filename = fileURLToPath(import.meta.url);

export const parseFile = multer({ storage });
