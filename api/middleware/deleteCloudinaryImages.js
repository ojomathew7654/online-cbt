import cloudinary from "./cloudinary.js";

/*
 * Deletes a list of Cloudinary images by public ID.
 *
 * Uses Promise.allSettled so one failed deletion (e.g. an ID that
 * no longer exists) never blocks the DB delete it's cleaning up
 * after.
 */
export const deleteCloudinaryImages = async (publicIds = []) => {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return;
  }

  await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, { resource_type: "image" }),
    ),
  );
};
