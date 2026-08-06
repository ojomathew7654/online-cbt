import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/*
 * Uses the CLOUDINARY_NAME / CLOUDINARY_KEY / CLOUDINARY_SECRET
 * values already present in your .env file.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary;
