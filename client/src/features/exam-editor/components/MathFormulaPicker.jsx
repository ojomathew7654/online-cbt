import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Sigma, X } from "lucide-react";
import "mathlive";

import { MATH_FORMULAS } from "./formulas";

/**
 * Renders a read-only MathLive preview for a formula
 * inside the mathematics / physics formula picker.
 */
const MathFormulaPreview = ({ formula }) => {
  const mathFieldRef = useRef(null);

  useEffect(() => {
    if (!mathFieldRef.current) {
      return;
    }

    mathFieldRef.current.value = formula || "";
  }, [formula]);

  return (
    <math-field
      ref={mathFieldRef}
      read-only
      virtual-keyboard-mode="off"
      className="pointer-events-none block max-w-full overflow-hidden text-sm"
      style={{
        background: "transparent",
        border: "none",
        outline: "none",
        color: "white",
        padding: 0,
      }}
    />
  );
};

const MathFormulaPicker = ({
  buttonRef,
  open,
  setOpen,
  setOtherOpen,
  search,
  setSearch,
  menuPosition,
  onInsertFormula,
  onInsertCustom,
}) => {
  const pickerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Close the Mathematics / Physics picker
   * and clear the current search.
   */
  const closeMath = () => {
    setOpen(false);
    setSearch("");
    setIsLoading(false);
  };

  /**
   * Close the picker when clicking outside it.
   *
   * Because the picker is rendered through a portal,
   * we explicitly check both the picker and the trigger button.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event) => {
      const picker = pickerRef.current;
      const button = buttonRef.current;

      if (
        picker &&
        !picker.contains(event.target) &&
        button &&
        !button.contains(event.target)
      ) {
        closeMath();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, buttonRef]);

  /**
   * Toggle the Mathematics / Physics picker.
   *
   * When Mathematics opens, Chemistry is closed.
   */
  const handleMathToggle = () => {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (nextOpen) {
      setOtherOpen(false);
      setIsLoading(true);

      // Allow the picker to render first,
      // then prepare the formulas.
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    } else {
      setSearch("");
      setIsLoading(false);
    }
  };

  /**
   * Insert a predefined mathematics / physics formula.
   *
   * The actual Tiptap insertion is handled by the parent.
   */
  const handleInsertMathFormula = (formula = "") => {
    onInsertFormula?.(formula);
  };

  /**
   * Insert a custom mathematics / physics equation.
   *
   * The actual Tiptap insertion is handled by the parent.
   */
  const handleInsertCustom = () => {
    onInsertCustom?.();
  };

  /**
   * Filter predefined formulas using:
   * - name
   * - formula
   * - category
   */
  const filteredMathFormulas = MATH_FORMULAS.filter((item) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.formula.toLowerCase().includes(normalizedSearch) ||
      item.category.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="shrink-0">
      {/* =====================================================
          MATHEMATICS / PHYSICS BUTTON
      ====================================================== */}
      <button
        ref={buttonRef}
        type="button"
        title="Insert Mathematics / Physics Equation"
        aria-label="Insert Mathematics / Physics Equation"
        onClick={handleMathToggle}
        className={[
          "flex h-9 items-center gap-1.5 rounded-md border px-2.5",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          open
            ? "border-primary bg-primary text-white"
            : "border-transparent text-light hover:border-border hover:bg-bg hover:text-white",
        ].join(" ")}
      >
        <Sigma size={18} />

        <span className="hidden text-xs font-medium sm:inline">Math</span>

        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* =====================================================
          MATHEMATICS / PHYSICS PICKER
      ====================================================== */}
      {open &&
        createPortal(
          <div
            ref={pickerRef}
            className="
              fixed z-[99999]
              w-[360px] max-w-[calc(100vw-2rem)]
              overflow-hidden rounded-xl
              border border-border
              bg-bg-deep
              shadow-2xl
            "
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {/* =================================================
                HEADER + SEARCH
            ================================================== */}
            <div className="border-b border-border px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Mathematics & Physics
                  </p>

                  <p className="mt-0.5 text-xs text-light">
                    Select a common equation or enter your own.
                  </p>
                </div>

                {/* CLOSE */}
                <button
                  type="button"
                  title="Close"
                  aria-label="Close mathematics and physics formulas"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={closeMath}
                  className="
                    flex h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-md
                    text-light
                    transition
                    hover:bg-bg
                    hover:text-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary/40
                  "
                >
                  <X size={16} />
                </button>
              </div>

              {/* SEARCH */}
              <div className="relative mt-2.5">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                  }}
                  placeholder="Search by name, formula, or category..."
                  spellCheck={false}
                  autoComplete="off"
                  className="
                    h-9 w-full
                    rounded-lg
                    border border-border
                    bg-bg
                    px-3 pr-9
                    text-xs
                    text-white
                    outline-none
                    placeholder:text-light
                    transition
                    focus:border-primary
                    focus:ring-1
                    focus:ring-primary
                  "
                />

                {/* CLEAR SEARCH */}
                {search && (
                  <button
                    type="button"
                    title="Clear search"
                    aria-label="Clear mathematics search"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={() => {
                      setSearch("");
                    }}
                    className="
                      absolute right-2 top-1/2
                      flex h-6 w-6
                      -translate-y-1/2
                      items-center justify-center
                      rounded-md
                      text-light
                      transition
                      hover:bg-bg-deep
                      hover:text-white
                      focus:outline-none
                      focus:ring-1
                      focus:ring-primary
                    "
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                FORMULA LIST
            ================================================== */}
            <div className="max-h-[390px] overflow-y-auto p-1.5">
              {isLoading ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />

                  <div className="text-center">
                    <p className="text-xs font-medium text-white">
                      Loading mathematics & physics formulas...
                    </p>

                    <p className="mt-1 text-[11px] text-light">
                      Preparing equations for you
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {filteredMathFormulas.map((item) => (
                    <button
                      key={`${item.name}-${item.formula}`}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() => {
                        handleInsertMathFormula(item.formula);
                      }}
                      className="
                        flex w-full items-start justify-between
                        gap-3 rounded-lg px-3 py-3
                        text-left transition
                        hover:bg-primary-variant
                      "
                    >
                      <span className="min-w-0 flex-1">
                        {/* FORMULA NAME */}
                        <span className="block truncate text-xs font-semibold text-white">
                          {item.name}
                        </span>

                        {/* FORMULA PREVIEW */}
                        <span className="pointer-events-none mt-1.5 block min-w-0">
                          <MathFormulaPreview formula={item.formula} />
                        </span>

                        {/* CATEGORIES */}
                        {item.categories?.length > 0 && (
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {item.categories.map((category) => (
                              <span
                                key={category}
                                className="
                                  inline-block rounded
                                  bg-primary/10
                                  px-1.5 py-0.5
                                  text-[9px]
                                  font-medium
                                  text-primary
                                "
                              >
                                {category}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>

                      <span className="shrink-0 text-xs text-primary">
                        Insert
                      </span>
                    </button>
                  ))}

                  {/* NO RESULTS */}
                  {filteredMathFormulas.length === 0 && (
                    <div className="px-3 py-6 text-center">
                      <p className="text-xs font-medium text-white">
                        No equations found
                      </p>

                      <p className="mt-1 text-[11px] text-light">
                        Try another name, formula, or category.
                      </p>
                    </div>
                  )}

                  {/* =================================================
                      CUSTOM EQUATION
                  ================================================== */}
                  <div className="my-1.5 border-t border-border" />

                  <button
                    type="button"
                    onMouseDown={(event) => {
                      /*
                       * Preserve the Tiptap selection before inserting
                       * the custom equation.
                       */
                      event.preventDefault();
                    }}
                    onClick={handleInsertCustom}
                    className="
                      flex w-full items-center gap-3
                      rounded-lg px-3 py-3
                      text-left transition
                      hover:bg-primary-variant
                    "
                  >
                    <span
                      className="
                        flex h-8 w-8 shrink-0
                        items-center justify-center
                        rounded-md
                        bg-primary/10
                        text-primary
                      "
                    >
                      ✏️
                    </span>

                    <span>
                      <span className="block text-xs font-semibold text-white">
                        Custom equation
                      </span>

                      <span className="mt-0.5 block text-[11px] text-light">
                        Enter your own mathematical or physics equation
                      </span>
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MathFormulaPicker;
