import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ResizableImageNodeView } from "./ResizableImageNodeView";

/*
 * Extends Tiptap's base Image extension to add:
 *
 * - width: lets the teacher resize the image (drag handle in the
 *   node view), stored as a plain pixel number so it round-trips
 *   through saved HTML as a `width` attribute.
 *
 * - pendingId: set only while an image is a *local* pick that
 *   hasn't been uploaded to Cloudinary yet. Cleared (and swapped
 *   for publicId) at submit time by resolvePendingImages.js.
 *
 * - publicId: the Cloudinary public ID, once uploaded. Kept in the
 *   HTML too so it's recoverable even without the imagePublicIds
 *   field on the Question record.
 */
export const ResizableImage = Image.extend({
  name: "resizableImage",

  addAttributes() {
    return {
      ...this.parent?.(),

      width: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("width") || element.style.width;
          return value ? parseInt(value, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }

          return { width: attributes.width };
        },
      },

      pendingId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-pending-id") || null,
        renderHTML: (attributes) => {
          if (!attributes.pendingId) {
            return {};
          }

          return { "data-pending-id": attributes.pendingId };
        },
      },

      publicId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-public-id") || null,
        renderHTML: (attributes) => {
          if (!attributes.publicId) {
            return {};
          }

          return { "data-public-id": attributes.publicId };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

export default ResizableImage;
