import { NodeViewWrapper } from "@tiptap/react";
import { useRef, useState } from "react";

const MIN_WIDTH = 80;

export const ResizableImageNodeView = ({
  node,
  updateAttributes,
  selected,
}) => {
  const imgRef = useRef(null);
  const [resizing, setResizing] = useState(false);

  const { src, alt, title, width } = node.attrs;

  /*
   * Drag-to-resize. Only scales width; height follows automatically
   * (via CSS `height: auto`) so the image is never distorted or cropped.
   */
  const handlePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const img = imgRef.current;

    if (!img) {
      return;
    }

    const startX = event.clientX;
    const startWidth = img.getBoundingClientRect().width;

    setResizing(true);

    const handlePointerMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(MIN_WIDTH, Math.round(startWidth + delta));

      updateAttributes({ width: newWidth });
    };

    const handlePointerUp = () => {
      setResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      className="
        relative
        inline-block
        max-w-full
        align-middle
      "
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt || ""}
        title={title || ""}
        draggable={false}
        style={{
          width: width ? `${width}px` : "auto",
          maxWidth: "100%",
          height: "auto",
        }}
        className={`
          rounded-lg
          border
          ${selected ? "border-primary ring-2 ring-primary" : "border-border"}
        `}
      />

      {selected && (
        <span
          onPointerDown={handlePointerDown}
          title="Drag to resize"
          className={`
            absolute
            bottom-0
            right-0
            h-4
            w-4
            translate-x-1/2
            translate-y-1/2
            cursor-nwse-resize
            rounded-full
            border-2
            border-white
            bg-primary
            shadow
            ${resizing ? "scale-110" : ""}
          `}
        />
      )}
    </NodeViewWrapper>
  );
};

export default ResizableImageNodeView;
