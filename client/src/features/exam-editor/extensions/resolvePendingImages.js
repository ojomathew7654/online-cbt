export async function resolvePendingImages(html, pendingImagesMap, uploadFn) {
  if (!html || !html.includes("data-pending-id")) {
    return { html: html || "", publicIds: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const pendingImages = Array.from(
    doc.querySelectorAll("img[data-pending-id]"),
  );

  const publicIds = [];

  await Promise.all(
    pendingImages.map(async (img) => {
      const pendingId = img.getAttribute("data-pending-id");
      const file = pendingImagesMap.get(pendingId);

      if (!file) {
        // No matching file (already uploaded/cleared) — just drop the marker
        img.removeAttribute("data-pending-id");
        return;
      }

      const { url, publicId } = await uploadFn(file);

      const oldSrc = img.getAttribute("src");

      img.setAttribute("src", url);
      img.setAttribute("data-public-id", publicId);
      img.removeAttribute("data-pending-id");

      publicIds.push(publicId);
      pendingImagesMap.delete(pendingId);

      // Release the local blob preview now that the real image is uploaded
      if (oldSrc && oldSrc.startsWith("blob:")) {
        URL.revokeObjectURL(oldSrc);
      }
    }),
  );

  return { html: doc.body.innerHTML, publicIds };
}

export default resolvePendingImages;
