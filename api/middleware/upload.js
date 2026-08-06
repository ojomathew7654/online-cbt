import multer from "multer";

/*
 * Memory storage (not disk storage).
 *
 * IMPORTANT: since your API is deployed on Vercel, the filesystem
 * is read-only except for /tmp. Memory storage avoids writing to
 * disk entirely — the file buffer is streamed straight to
 * Cloudinary from RAM.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
