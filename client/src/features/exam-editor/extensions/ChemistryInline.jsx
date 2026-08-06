import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

import { useEffect, useRef, useState } from "react";
import katex from "katex";

import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";

const ChemistryNodeView = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
}) => {
  const initialFormula = node.attrs.formula || "";

  const [editing, setEditing] = useState(!initialFormula);

  const [value, setValue] = useState(initialFormula);

  const inputRef = useRef(null);
  const previewRef = useRef(null);

  /*
   * Keep local state synchronized
   * with the Tiptap node.
   */
  useEffect(() => {
    setValue(node.attrs.formula || "");
  }, [node.attrs.formula]);

  /*
   * Focus the input whenever
   * chemistry editing mode opens.
   */
  useEffect(() => {
    if (!editing) {
      return;
    }

    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();

        inputRef.current.select();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [editing]);

  /*
   * Render the chemistry formula
   * using KaTeX + mhchem.
   */
  useEffect(() => {
    if (editing || !previewRef.current) {
      return;
    }

    const formula = node.attrs.formula?.trim() || "";

    /*
     * Clear previous preview first.
     */
    previewRef.current.innerHTML = "";

    /*
     * If formula is empty,
     * show a helpful placeholder.
     */
    if (!formula) {
      previewRef.current.textContent = "Click to enter chemistry formula";

      return;
    }

    try {
      /*
       * mhchem syntax is passed
       * through the \ce command.
       */
      katex.render(`\\ce{${formula}}`, previewRef.current, {
        throwOnError: false,
        displayMode: false,
        strict: false,
      });
    } catch (error) {
      console.error("Chemistry formula rendering failed:", error);

      /*
       * If rendering fails,
       * display the original formula
       * instead of crashing the editor.
       */
      previewRef.current.textContent = formula;
    }
  }, [editing, node.attrs.formula]);

  /*
   * Commit the chemistry formula.
   */
  const commit = () => {
    const formula = inputRef.current?.value?.trim() || "";

    /*
     * Do not allow an empty chemistry node.
     */
    if (!formula) {
      deleteNode();

      return;
    }

    /*
     * Save the formula to
     * the Tiptap document.
     */
    updateAttributes({
      formula,
    });

    /*
     * Update local state.
     */
    setValue(formula);

    /*
     * Return to preview mode.
     */
    setEditing(false);
  };

  /*
   * Cancel editing.
   *
   * If this is a newly inserted empty
   * chemistry node, remove it.
   */
  const cancel = () => {
    const originalFormula = node.attrs.formula?.trim() || "";

    if (!originalFormula) {
      deleteNode();

      return;
    }

    /*
     * Restore the original formula.
     */
    setValue(originalFormula);

    setEditing(false);
  };

  /*
   * Handle keyboard shortcuts.
   */
  const handleKeyDown = (event) => {
    /*
     * Enter = Save
     */
    if (event.key === "Enter") {
      event.preventDefault();

      commit();

      return;
    }

    /*
     * Escape = Cancel
     */
    if (event.key === "Escape") {
      event.preventDefault();

      cancel();
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      className="
        mx-1
        inline-flex
        max-w-full
        align-middle
      "
    >
      {editing ? (
        /*
         * CHEMISTRY EDITOR
         */
        <span
          className="
            inline-flex
            max-w-full
            flex-wrap
            items-center
            gap-2
            rounded-xl
            border
            border-primary
            bg-bg-deep
            p-2
            shadow-lg
          "
        >
          {/* INPUT */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. H2SO4"
            spellCheck={false}
            autoComplete="off"
            className="
              w-64
              max-w-full
              rounded-lg
              border
              border-border
              bg-bg
              px-3
              py-2
              text-sm
              text-white
              outline-none
              transition
              placeholder:text-light
              focus:border-primary
              focus:ring-1
              focus:ring-primary
            "
          />

          {/* INSERT */}
          <button
            type="button"
            onClick={commit}
            className="
              rounded-lg
              bg-primary
              px-4
              py-2
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

          {/* CANCEL */}
          <button
            type="button"
            onClick={cancel}
            className="
              rounded-lg
              border
              border-border
              bg-transparent
              px-4
              py-2
              text-xs
              font-medium
              text-light
              transition
              hover:bg-bg
              hover:text-white
              active:scale-95
            "
          >
            Cancel
          </button>
        </span>
      ) : (
        /*
         * RENDERED CHEMISTRY FORMULA
         */
        <span
          ref={previewRef}
          onClick={() => setEditing(true)}
          title="Click to edit chemistry formula"
          className={`
            inline-flex
            min-h-[28px]
            cursor-pointer
            items-center
            rounded-md
            px-2
            py-1
            transition
            hover:bg-primary-variant
            ${selected ? "bg-primary-variant ring-1 ring-primary" : ""}
          `}
        />
      )}
    </NodeViewWrapper>
  );
};

/*
 * Tiptap Chemistry Inline Node
 */
export const ChemistryInline = Node.create({
  name: "chemistryInline",

  group: "inline",

  inline: true,

  atom: true,

  selectable: true,

  /*
   * Chemistry formula attribute.
   */
  addAttributes() {
    return {
      formula: {
        default: "",

        parseHTML: (element) => element.getAttribute("data-formula") || "",

        renderHTML: (attributes) => ({
          "data-formula": attributes.formula || "",
        }),
      },
    };
  },

  /*
   * Read saved chemistry formulas
   * from HTML.
   */
  parseHTML() {
    return [
      {
        tag: 'span[data-type="chemistry"]',
      },
    ];
  },

  /*
   * Save chemistry formulas
   * into HTML.
   *
   * Example:
   *
   * <span
   *   data-type="chemistry"
   *   data-formula="H2SO4"
   * ></span>
   */
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "chemistry",
      }),
    ];
  },

  /*
   * Use React as the Tiptap
   * node view.
   */
  addNodeView() {
    return ReactNodeViewRenderer(ChemistryNodeView);
  },

  /*
   * Add the insertChemistry command.
   *
   * Usage:
   *
   * editor
   *   .chain()
   *   .focus()
   *   .insertChemistry("")
   *   .run();
   */
  addCommands() {
    return {
      insertChemistry:
        (formula = "") =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                formula,
              },
            })
            .run();
        },
    };
  },
});

export default ChemistryInline;
