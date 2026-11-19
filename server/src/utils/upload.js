
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = (folderName) => {
  const uploadRoot =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const uploadDir = path.join(uploadRoot, folderName);

  fs.mkdirSync(uploadDir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
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
      fileSize: 5 * 1024 * 1024,
    },
  });
};

export default upload;
