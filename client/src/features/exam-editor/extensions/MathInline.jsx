import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import "katex/dist/katex.min.css";

import "mathlive";
import { MathNodeView } from "./MathNodeView";

export const MathInline = Node.create({
  name: "mathInline",

  group: "inline",

  inline: true,

  atom: true,

  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: "",

        parseHTML: (element) => {
          return element.getAttribute("data-latex") || "";
        },

        renderHTML: (attributes) => {
          return {
            "data-latex": attributes.latex || "",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "math",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addCommands() {
    return {
      insertMath:
        (latex = "") =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,

              attrs: {
                latex,
              },
            })
            .run();
        },
    };
  },
});
