import { NodeViewWrapper } from "@tiptap/react";

import { useEffect, useRef, useState } from "react";

export const MathNodeView = ({ node, updateAttributes, selected }) => {
  const [editing, setEditing] = useState(!node.attrs.latex);

  const mathFieldRef = useRef(null);
  const committedRef = useRef(false);

  useEffect(() => {
    if (!editing) {
      return;
    }

    const mathField = mathFieldRef.current;

    if (!mathField) {
      return;
    }

    try {
      mathField.value = node.attrs.latex || "";
    } catch (error) {
      console.error("MathLive value initialization error:", error);
    }

    const frame = requestAnimationFrame(() => {
      try {
        mathField.focus();
      } catch (error) {
        console.error("MathLive focus error:", error);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const commit = () => {
    /**
     * Prevent duplicate commits.
     */
    if (committedRef.current) {
      return;
    }

    committedRef.current = true;

    const mathField = mathFieldRef.current;

    if (!mathField) {
      setEditing(false);
      return;
    }

    try {
      /**
       * MathLive's value property contains the
       * LaTeX representation.
       */
      // const value = mathField.value || "";
      const value = mathField.getValue("latex") || "";

      updateAttributes({
        latex: value,
      });
    } catch (error) {
      console.error("Failed to save MathLive equation:", error);
    }

    setEditing(false);
  };

  /**
   * ==========================================================
   * Open Editor Again
   * ==========================================================
   */
  const openEditor = () => {
    committedRef.current = false;

    setEditing(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      commit();

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      return;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      const mathField = mathFieldRef.current;

      if (mathField && document.activeElement === mathField) {
        return;
      }

      commit();
    }, 100);
  };

  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      className="
        mx-1
        inline-flex
        align-middle
      "
    >
      {editing ? (
        <span
          className="
            inline-flex
            items-center
            gap-1
            rounded-lg
            border
            border-primary
            bg-bg-deep
            p-1
            shadow-lg
          "
        >
          {/* ==================================================
              MATH FIELD
          ================================================== */}

          <math-field
            ref={mathFieldRef}
            virtual-keyboard-mode="manual"
            className="
              min-w-25
              rounded-md
              bg-bg
              px-2
              py-1
              text-white
              outline-none
            "
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </span>
      ) : (
        <span
          className={[
            "relative",
            "z-9999",
            "inline-flex",
            "cursor-pointer",
            "items-center",
            "rounded-md",
            "bg-transparent",
            "px-1",
            "py-0.5",
            "transition-colors",
            "hover:bg-bg-deep",
            selected ? "bg-primary/20 ring-1 ring-primary" : "",
          ].join(" ")}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();

            openEditor();
          }}
          title="Click to edit equation"
        >
          <math-field
            ref={(element) => {
              if (element) {
                element.value = node.attrs.latex || "";
              }
            }}
            read-only
            className="pointer-events-none"
          />
        </span>
      )}
    </NodeViewWrapper>
  );
};
