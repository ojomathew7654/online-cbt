/*
 * Same approach as the Profile page's image compression:
 * - Never crops. Only scales the whole image down proportionally
 *   if it's larger than maxDimension, so nothing is cut off.
 * - Progressively lowers JPEG quality until the file is under
 *   maxSizeMB, or it hits minQuality.
 */
export const compressImage = (
  file,
  {
    maxDimension = 800,
    maxSizeMB = 1,
    initialQuality = 0.85,
    minQuality = 0.2,
    qualityStep = 0.15,
  } = {},
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if too large — aspect ratio preserved, nothing cropped
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = initialQuality;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            const sizeMB = blob.size / 1024 / 1024;

            if (sizeMB > maxSizeMB && quality > minQuality) {
              quality -= qualityStep;
              tryCompress();
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
};

export default compressImage;
