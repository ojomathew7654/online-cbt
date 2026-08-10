import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import "mathlive";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
} from "lucide-react";

import ChemistryInline from "../extensions/ChemistryInline";
import compressImage from "../extensions/compressImage";
import ResizableImage from "./ResizableImage";
import { MathInline } from "../extensions/MathInline";

import MathFormulaPicker from "./MathFormulaPicker";
import ChemistryFormulaPicker from "./ChemistryFormulaPicker";

const ToolbarButton = ({
  children,
  title,
  active = false,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex h-9 w-9 shrink-0 items-center justify-center",
        "rounded-md border transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-primary bg-primary text-white"
          : "border-transparent text-light hover:border-border hover:bg-bg hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
};

const ToolbarDivider = () => (
  <div className="mx-1 h-6 w-px shrink-0 bg-border" />
);

const RichQuestionEditor = ({
  content = "",
  onChange,
  placeholder = "Type your question here...",
  pendingImagesRef,
}) => {
  const imageInputRef = useRef(null);

  /*
   * Mathematics / Physics
   */
  const mathButtonRef = useRef(null);

  const [mathSearch, setMathSearch] = useState("");
  const [mathOpen, setMathOpen] = useState(false);

  const [mathMenuPosition, setMathMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  /*
   * Chemistry
   */
  const chemistryButtonRef = useRef(null);

  const [chemistrySearch, setChemistrySearch] = useState("");
  const [chemistryOpen, setChemistryOpen] = useState(false);

  const [chemistryMenuPosition, setChemistryMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
      }),

      Underline,

      Subscript,

      Superscript,

      Highlight,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      ResizableImage.configure({
        inline: false,
        allowBase64: false,
      }),

      Placeholder.configure({
        placeholder,
      }),

      MathInline,

      ChemistryInline,
    ],

    content,

    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },

    editorProps: {
      attributes: {
        /**
         * IMPORTANT:
         * Keep this as a single string without newlines.
         *
         * ProseMirror/Tiptap uses this value as the DOM `class`
         * attribute. Passing multiline whitespace can cause:
         *
         * InvalidCharacterError:
         * The token provided contains HTML space characters.
         */
        class: [
          "min-h-[150px]",
          "w-full",
          "bg-bg",
          "px-4",
          "py-3",
          "text-sm",
          "leading-7",
          "text-white",
          "outline-none",

          // Paragraphs
          "[&_p]:my-1",

          // Bullet lists
          "[&_ul]:ml-6",
          "[&_ul]:list-disc",

          // Numbered lists
          "[&_ol]:ml-6",
          "[&_ol]:list-decimal",

          // Images
          "[&_img]:max-w-full",
        ].join(" "),
      },
    },
  });

  /*
   * Keep the Mathematics / Physics menu positioned
   * relative to its toolbar button.
   */
  useEffect(() => {
    if (!mathOpen || !mathButtonRef.current) {
      return;
    }

    const updateMathMenuPosition = () => {
      const buttonRect = mathButtonRef.current.getBoundingClientRect();

      const menuWidth = 360;
      const menuHeight = 430;
      const spacing = 8;

      let left = buttonRect.left;

      if (left + menuWidth > window.innerWidth - 16) {
        left = window.innerWidth - menuWidth - 16;
      }

      if (left < 16) {
        left = 16;
      }

      let top = buttonRect.bottom + spacing;

      if (top + menuHeight > window.innerHeight - 16) {
        top = buttonRect.top - menuHeight - spacing;
      }

      if (top < 16) {
        top = 16;
      }

      setMathMenuPosition({
        top,
        left,
      });
    };

    updateMathMenuPosition();

    window.addEventListener("resize", updateMathMenuPosition);
    window.addEventListener("scroll", updateMathMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMathMenuPosition);
      window.removeEventListener("scroll", updateMathMenuPosition, true);
    };
  }, [mathOpen]);

  /*
   * Keep the Chemistry menu positioned
   * relative to its toolbar button.
   */
  useEffect(() => {
    if (!chemistryOpen || !chemistryButtonRef.current) {
      return;
    }

    const updateChemistryMenuPosition = () => {
      const buttonRect = chemistryButtonRef.current.getBoundingClientRect();

      const menuWidth = 340;
      const menuHeight = 380;
      const spacing = 8;

      let left = buttonRect.left;

      if (left + menuWidth > window.innerWidth - 16) {
        left = window.innerWidth - menuWidth - 16;
      }

      if (left < 16) {
        left = 16;
      }

      let top = buttonRect.bottom + spacing;

      if (top + menuHeight > window.innerHeight - 16) {
        top = buttonRect.top - menuHeight - spacing;
      }

      if (top < 16) {
        top = 16;
      }

      setChemistryMenuPosition({
        top,
        left,
      });
    };

    updateChemistryMenuPosition();

    window.addEventListener("resize", updateChemistryMenuPosition);
    window.addEventListener("scroll", updateChemistryMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateChemistryMenuPosition);
      window.removeEventListener("scroll", updateChemistryMenuPosition, true);
    };
  }, [chemistryOpen]);

  /*
   * Keep the editor synchronized with external content changes.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentContent = editor.getHTML();

    if (content !== currentContent) {
      editor.commands.setContent(content || "", false);
    }
  }, [editor, content]);

  /*
   * Tiptap is not ready yet.
   */
  if (!editor) {
    return (
      <div className="flex min-h-[150px] w-full items-center justify-center rounded-lg border border-border bg-bg p-4 text-sm text-light">
        Loading editor...
      </div>
    );
  }

  /*
   * Image upload
   */
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    // Reset input so the same image can be selected again.
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      const pendingId = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(compressedFile);

      if (pendingImagesRef?.current) {
        pendingImagesRef.current.set(pendingId, compressedFile);
      } else {
        console.warn(
          "RichQuestionEditor: no pendingImagesRef provided — image will not be uploadable.",
        );
      }

      editor
        .chain()
        .focus()
        .insertContent({
          type: "resizableImage",
          attrs: {
            src: previewUrl,
            alt: file.name,
            title: file.name,
            pendingId,
          },
        })
        .run();
    } catch (error) {
      console.error("Image processing failed:", error);
    }
  };

  /*
   * Insert a custom mathematics / physics equation.
   */
  const insertEquation = () => {
    editor.chain().focus().insertMath("").run();

    setMathOpen(false);
    setMathSearch("");
  };

  /*
   * Insert a predefined mathematics / physics formula.
   */
  const insertMathFormula = (formula = "") => {
    editor.chain().focus().insertMath(formula).run();

    setMathOpen(false);
    setMathSearch("");
  };

  /*
   * Insert a predefined or custom chemistry formula.
   */
  const insertChemistry = (formula = "") => {
    editor.chain().focus().insertChemistry(formula).run();

    setChemistryOpen(false);
    setChemistrySearch("");
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-bg shadow-lg">
      {/* =========================================================
          TOOLBAR
      ========================================================== */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-bg-deep p-2">
        {/* =====================================================
            TEXT FORMATTING
        ====================================================== */}

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => {
            editor.chain().focus().toggleBold().run();
          }}
        >
          <Bold size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => {
            editor.chain().focus().toggleItalic().run();
          }}
        >
          <Italic size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => {
            editor.chain().focus().toggleUnderline().run();
          }}
        >
          <UnderlineIcon size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => {
            editor.chain().focus().toggleSubscript().run();
          }}
        >
          <SubscriptIcon size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => {
            editor.chain().focus().toggleSuperscript().run();
          }}
        >
          <SuperscriptIcon size={17} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* =====================================================
            LISTS
        ====================================================== */}

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => {
            editor.chain().focus().toggleBulletList().run();
          }}
        >
          <List size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() => {
            editor.chain().focus().toggleOrderedList().run();
          }}
        >
          <ListOrdered size={17} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* =====================================================
            MATHEMATICS / PHYSICS
        ====================================================== */}

        <MathFormulaPicker
          buttonRef={mathButtonRef}
          open={mathOpen}
          setOpen={setMathOpen}
          setOtherOpen={setChemistryOpen}
          search={mathSearch}
          setSearch={setMathSearch}
          menuPosition={mathMenuPosition}
          onInsertFormula={insertMathFormula}
          onInsertCustom={insertEquation}
        />

        {/* =====================================================
            CHEMISTRY
        ====================================================== */}

        <ChemistryFormulaPicker
          buttonRef={chemistryButtonRef}
          open={chemistryOpen}
          setOpen={setChemistryOpen}
          setOtherOpen={setMathOpen}
          search={chemistrySearch}
          setSearch={setChemistrySearch}
          menuPosition={chemistryMenuPosition}
          onInsertFormula={insertChemistry}
        />

        {/* =====================================================
            IMAGE UPLOAD
        ====================================================== */}

        <ToolbarButton
          title="Upload Image / Diagram"
          onClick={() => {
            imageInputRef.current?.click();
          }}
        >
          <ImageIcon size={18} />
        </ToolbarButton>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />

        {/* =====================================================
            TEXT ALIGNMENT
        ====================================================== */}

        <ToolbarButton
          title="Align Left"
          active={editor.isActive({
            textAlign: "left",
          })}
          onClick={() => {
            editor.chain().focus().setTextAlign("left").run();
          }}
        >
          <AlignLeft size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Align Center"
          active={editor.isActive({
            textAlign: "center",
          })}
          onClick={() => {
            editor.chain().focus().setTextAlign("center").run();
          }}
        >
          <AlignCenter size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Align Right"
          active={editor.isActive({
            textAlign: "right",
          })}
          onClick={() => {
            editor.chain().focus().setTextAlign("right").run();
          }}
        >
          <AlignRight size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => {
            editor.chain().focus().toggleHighlight().run();
          }}
        >
          <Highlighter size={17} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* =====================================================
            UNDO / REDO
        ====================================================== */}

        <ToolbarButton
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() => {
            editor.chain().focus().undo().run();
          }}
        >
          <Undo2 size={17} />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() => {
            editor.chain().focus().redo().run();
          }}
        >
          <Redo2 size={17} />
        </ToolbarButton>
      </div>

      {/* =========================================================
          EDITOR CONTENT
      ========================================================== */}

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichQuestionEditor;
