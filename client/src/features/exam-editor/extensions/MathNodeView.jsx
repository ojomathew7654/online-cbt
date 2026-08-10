import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

export const MathNodeView = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
}) => {
  const initialLatex = node.attrs.latex || "";

  const [editing, setEditing] = useState(!initialLatex);

  const mathFieldRef = useRef(null);

  /*
   * Keep track of whether this is currently
   * being committed/deleted.
   *
   * This prevents blur + button click from
   * performing multiple actions.
   */
  const actionRef = useRef(false);

  /*
   * Keep the original equation while editing.
   *
   * Important:
   * We don't update the Tiptap node until
   * the teacher actually clicks Insert/Done.
   */
  const originalLatexRef = useRef(initialLatex);

  /*
   * ==========================================================
   * INITIALIZE MATHLIVE WHEN EDITING OPENS
   * ==========================================================
   */
  useEffect(() => {
    if (!editing) {
      return;
    }

    const mathField = mathFieldRef.current;

    if (!mathField) {
      return;
    }

    /*
     * Store the current equation as the
     * original value before editing.
     */
    originalLatexRef.current = node.attrs.latex || "";

    try {
      mathField.value = node.attrs.latex || "";
    } catch (error) {
      console.error("MathLive value initialization error:", error);
    }

    const frame = requestAnimationFrame(() => {
      try {
        mathField.focus();

        /*
         * Put the cursor inside the equation.
         */
        if (typeof mathField.executeCommand === "function") {
          mathField.executeCommand("moveToMathfieldEnd");
        }
      } catch (error) {
        console.error("MathLive focus error:", error);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [editing, node.attrs.latex]);

  /*
   * ==========================================================
   * GET CURRENT LATEX
   * ==========================================================
   */
  const getCurrentLatex = () => {
    const mathField = mathFieldRef.current;

    if (!mathField) {
      return "";
    }

    try {
      return (mathField.getValue("latex") || mathField.value || "").trim();
    } catch (error) {
      console.error("Failed to read MathLive equation:", error);

      return "";
    }
  };

  /*
   * ==========================================================
   * COMMIT / INSERT EQUATION
   * ==========================================================
   */
  const commit = () => {
    if (actionRef.current) {
      return;
    }

    const value = getCurrentLatex();

    /*
     * IMPORTANT:
     *
     * If the teacher opened a brand-new equation
     * and didn't enter anything, remove the node
     * instead of leaving an empty equation behind.
     */
    if (!value) {
      actionRef.current = true;

      deleteNode();

      return;
    }

    actionRef.current = true;

    try {
      updateAttributes({
        latex: value,
      });
    } catch (error) {
      console.error("Failed to save MathLive equation:", error);
    }

    setEditing(false);

    /*
     * Allow future editing again.
     */
    requestAnimationFrame(() => {
      actionRef.current = false;
    });
  };

  /*
   * ==========================================================
   * CANCEL EDITING
   * ==========================================================
   */
  const cancel = () => {
    if (actionRef.current) {
      return;
    }

    actionRef.current = true;

    /*
     * If this is a newly-created empty node,
     * remove it completely.
     */
    if (!originalLatexRef.current.trim()) {
      deleteNode();

      return;
    }

    /*
     * Existing equation:
     *
     * We haven't updated the Tiptap node yet,
     * so simply leaving editing mode restores
     * the original equation automatically.
     */
    setEditing(false);

    requestAnimationFrame(() => {
      actionRef.current = false;
    });
  };

  /*
   * ==========================================================
   * OPEN EDITOR
   * ==========================================================
   */
  const openEditor = () => {
    actionRef.current = false;

    originalLatexRef.current = node.attrs.latex || "";

    setEditing(true);
  };

  /*
   * ==========================================================
   * KEYBOARD HANDLING
   * ==========================================================
   */
  const handleKeyDown = (event) => {
    /*
     * Enter = save
     */
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      commit();

      return;
    }

    /*
     * Escape = cancel
     */
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      cancel();

      return;
    }
  };

  /*
   * ==========================================================
   * BLUR HANDLING
   * ==========================================================
   *
   * We intentionally DON'T immediately commit here.
   *
   * This gives the teacher a chance to click
   * Insert/Cancel without blur fighting with
   * the button action.
   */
  const handleBlur = () => {
    setTimeout(() => {
      if (actionRef.current) {
        return;
      }

      const mathField = mathFieldRef.current;

      /*
       * If focus returned to the MathLive field,
       * don't do anything.
       */
      if (mathField && document.activeElement === mathField) {
        return;
      }

      /*
       * Keep existing equation as-is when the
       * teacher simply clicks elsewhere.
       *
       * For a brand-new empty equation, remove it.
       */
      const value = getCurrentLatex();

      if (!value && !originalLatexRef.current.trim()) {
        actionRef.current = true;

        deleteNode();

        return;
      }

      /*
       * For an existing equation, save the
       * edited value when leaving the field.
       */
      if (value) {
        commit();
      }
    }, 150);
  };

  return (
    <NodeViewWrapper as="span" className="inline-flex max-w-full align-middle">
      {editing ? (
        /*
         * ==================================================
         * MATH EDITOR
         * ==================================================
         */
        <span
          className={[
            "inline-flex",
            "max-w-full",
            "items-center",
            "gap-1.5",
            "rounded-lg",
            "border",
            "border-primary",
            "bg-bg-deep",
            "p-1",
            "shadow-lg",
            selected ? "ring-2 ring-primary/40" : "",
          ].join(" ")}
        >
          {/* ==================================================
              MATHLIVE FIELD
          ================================================== */}

          <math-field
            ref={mathFieldRef}
            virtual-keyboard-mode="manual"
            className="
              min-w-[100px]
              max-w-[420px]
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

          {/* ==================================================
              INSERT / DONE
          ================================================== */}

          <button
            type="button"
            title="Insert equation"
            aria-label="Insert equation"
            onMouseDown={(event) => {
              /*
               * Prevent MathLive blur from running
               * before this button's click.
               */
              event.preventDefault();
            }}
            onClick={commit}
            className="
              flex
              h-8
              shrink-0
              items-center
              justify-center
              rounded-md
              bg-primary
              px-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:opacity-90
              active:scale-95
            "
          >
            Insert
          </button>

          {/* ==================================================
              CANCEL / CLOSE
          ================================================== */}

          <button
            type="button"
            title="Cancel equation"
            aria-label="Cancel equation"
            onMouseDown={(event) => {
              /*
               * Prevent MathLive blur from committing
               * the equation before cancellation.
               */
              event.preventDefault();
            }}
            onClick={cancel}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              border-border
              bg-transparent
              text-light
              transition
              hover:bg-bg
              hover:text-white
              active:scale-95
            "
          >
            ×
          </button>
        </span>
      ) : (
        /*
         * ==================================================
         * RENDERED EQUATION
         * ==================================================
         */
        <span
          className={[
            "relative",
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
