import { useEffect, useRef } from "react";
import "mathlive";

/**
 * Reusable renderer for exam rich content.
 *
 * Supports:
 * - Plain text
 * - [highlighted words]
 * - HTML
 * - Images
 * - MathLive equations
 * - Chemistry formulas
 */
const RichContentRenderer = ({
  content = "",
  className = "",
  highlightBracketText = false,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.innerHTML = "";

    const value = content ?? "";

    /*
     * -----------------------------------------
     * 1. PLAIN TEXT / EXCEL QUESTION
     * -----------------------------------------
     */
    if (highlightBracketText && !/<[a-z][\s\S]*>/i.test(value)) {
      const parts = String(value).split(/\[([^\]]+)\]/g);

      parts.forEach((part, index) => {
        if (index % 2 === 1) {
          const span = document.createElement("span");

          span.className =
            "font-semibold text-indigo-400 underline decoration-indigo-400/50 underline-offset-4";

          span.textContent = part;

          container.appendChild(span);
        } else {
          container.appendChild(document.createTextNode(part));
        }
      });

      return;
    }

    /*
     * -----------------------------------------
     * 2. RICH HTML CONTENT
     * -----------------------------------------
     */
    container.innerHTML = String(value);

    /*
     * -----------------------------------------
     * 3. RENDER MATHLIVE
     * -----------------------------------------
     */
    const mathSpans = container.querySelectorAll('span[data-type="math"]');

    mathSpans.forEach((span) => {
      const latex = span.getAttribute("data-latex") || "";

      span.innerHTML = "";

      const mathField = document.createElement("math-field");

      mathField.value = latex;
      mathField.setAttribute("read-only", "");
      mathField.style.pointerEvents = "none";
      mathField.style.border = "none";
      mathField.style.background = "transparent";
      mathField.style.padding = "0";
      mathField.style.margin = "0";

      span.appendChild(mathField);
    });

    /*
     * -----------------------------------------
     * 4. RENDER CHEMISTRY
     * -----------------------------------------
     */
    const chemistrySpans = container.querySelectorAll(
      'span[data-type="chemistry"]',
    );

    chemistrySpans.forEach((span) => {
      const formula = span.getAttribute("data-formula") || "";

      span.innerHTML = "";

      const formulaElement = document.createElement("span");

      formulaElement.className =
        "inline-flex items-center font-medium text-emerald-400";

      formulaElement.textContent = formula;

      span.appendChild(formulaElement);
    });

    /*
     * -----------------------------------------
     * 5. IMAGE HANDLING
     * -----------------------------------------
     */
    const images = container.querySelectorAll("img");

    images.forEach((img) => {
      img.classList.add(
        "my-3",
        "max-w-full",
        "h-auto",
        "rounded-xl",
        "border",
        "border-slate-700",
        "object-contain",
      );

      img.style.maxWidth = "100%";
      img.style.height = "auto";
    });

    return () => {
      container.innerHTML = "";
    };
  }, [content, highlightBracketText]);

  return (
    <div
      ref={containerRef}
      className={`
        rich-content
        max-w-none
        break-words
        text-sm
        leading-7
        text-slate-200

        [&_p]:my-2
        [&_p:first-child]:mt-0
        [&_p:last-child]:mb-0

        [&_strong]:font-semibold
        [&_strong]:text-white

        [&_em]:italic

        [&_ul]:my-3
        [&_ul]:list-disc
        [&_ul]:pl-6

        [&_ol]:my-3
        [&_ol]:list-decimal
        [&_ol]:pl-6

        [&_li]:my-1

        [&_a]:text-indigo-400
        [&_a]:underline

        ${className}
      `}
    />
  );
};

export default RichContentRenderer;
