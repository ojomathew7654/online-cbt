import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

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
  Sigma,
  FlaskConical,
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

/**
 * Reusable toolbar button
 */
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

/**
 * Toolbar divider
 */

const ToolbarDivider = () => (
  <div className="mx-1 h-6 w-px shrink-0 bg-border" />
);

const RichQuestionEditor = ({
  content = "",
  onChange,
  placeholder = "Type your question here...",
  /*
   * Shared Map<pendingId, File> — created once per form (e.g. in
   * ManualQuestionForm) and passed down to every editor instance
   * (question + all options) so images picked in any of them can
   * be uploaded together at "Add Question" time.
   */
  pendingImagesRef,
}) => {
  const imageInputRef = useRef(null);

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

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentContent = editor.getHTML();

    if (content !== currentContent) {
      editor.commands.setContent(content || "", false);
    }
  }, [editor, content]);

  /**
   * Tiptap is not ready yet.
   */
  if (!editor) {
    return (
      <div className="flex min-h-[150px] w-full items-center justify-center rounded-lg border border-border bg-bg p-4 text-sm text-light">
        Loading editor...
      </div>
    );
  }

  /**
   * Handle image selection.
   *
   * IMPORTANT: this does NOT upload to Cloudinary. It compresses
   * the image (same non-cropping, proportional-scale approach as
   * the Profile page), keeps the File in memory (pendingImagesRef),
   * and inserts a local blob preview into the editor. The actual
   * upload happens later, only when the teacher clicks
   * "Add Question" — see resolvePendingImages.js.
   */
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    // Reset input so the same image can be selected again
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

  /**
   * Insert mathematics or physics equation
   *
   * Example:
   * x^2 + y^2 = z^2
   *
   * The MathLive field will open through MathInline.
   */
  const insertEquation = () => {
    editor.chain().focus().insertMath("").run();
  };

  /**
   * Insert chemistry formula
   *
   * Example:
   * \ce{H2O}
   *
   * The teacher can edit the MathLive field.
   */
  const insertChemistry = () => {
    editor.chain().focus().insertChemistry("").run();
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

        <ToolbarButton
          title="Insert Mathematics / Physics Equation"
          onClick={insertEquation}
        >
          <Sigma size={18} />
        </ToolbarButton>

        {/* =====================================================
            CHEMISTRY
        ====================================================== */}

        <ToolbarButton
          title="Insert Chemistry Formula"
          onClick={insertChemistry}
        >
          <FlaskConical size={18} />
        </ToolbarButton>

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
