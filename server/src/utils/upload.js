


import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../Config/env.js";

const s3 = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY,
    secretAccessKey: ENV.AWS_SECRET_KEY,
  },
});

const upload = (folderName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: ENV.AWS_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

export default upload;



























