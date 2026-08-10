import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, FlaskConical, X } from "lucide-react";

import { CHEMISTRY_FORMULAS } from "./formulas";

const ChemistryFormulaPicker = ({
  buttonRef,
  open,
  setOpen,
  setOtherOpen,
  search,
  setSearch,
  menuPosition,
  onInsertFormula,
}) => {
  const chemistryButtonRef = useRef(null);

  /*
   * Keep the internally created button ref synchronized
   * with the ref supplied by the parent.
   */
  useEffect(() => {
    if (!buttonRef) {
      return;
    }

    if (typeof buttonRef === "function") {
      buttonRef(chemistryButtonRef.current);
      return;
    }

    buttonRef.current = chemistryButtonRef.current;
  }, [buttonRef]);

  const closeChemistry = () => {
    setOpen(false);
    setSearch("");
  };

  const handleChemistryToggle = () => {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (nextOpen) {
      setOtherOpen(false);
    } else {
      setSearch("");
    }
  };

  const insertChemistry = (formula = "") => {
    onInsertFormula(formula);
    closeChemistry();
  };

  const filteredChemistryFormulas = CHEMISTRY_FORMULAS.filter((item) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.formula.toLowerCase().includes(normalizedSearch) ||
      item.categories?.some((category) =>
        category.toLowerCase().includes(normalizedSearch),
      )
    );
  });

  return (
    <>
      <button
        ref={chemistryButtonRef}
        type="button"
        title="Insert Chemistry Formula"
        aria-label="Insert Chemistry Formula"
        onClick={handleChemistryToggle}
        className={[
          "flex h-9 items-center gap-1.5 rounded-md border px-2.5",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          open
            ? "border-primary bg-primary text-white"
            : "border-transparent text-light hover:border-border hover:bg-bg hover:text-white",
        ].join(" ")}
      >
        <FlaskConical size={15} />

        <span className="hidden text-xs font-medium sm:inline">Chemistry</span>

        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            className="
              fixed z-[99999]
              w-[340px] max-w-[calc(100vw-2rem)]
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
            {/* HEADER + SEARCH */}
            <div className="border-b border-border px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Chemistry formulas
                  </p>

                  <p className="mt-0.5 text-xs text-light">
                    Select a common formula or enter your own.
                  </p>
                </div>

                {/* CLOSE */}
                <button
                  type="button"
                  title="Close"
                  aria-label="Close chemistry formulas"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={closeChemistry}
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
                    aria-label="Clear chemistry search"
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

            {/* FORMULA LIST */}
            <div className="max-h-[360px] overflow-y-auto p-1.5">
              {filteredChemistryFormulas.map((item) => (
                <button
                  key={`${item.name}-${item.formula}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    insertChemistry(item.formula);
                  }}
                  className="
                    flex w-full items-center justify-between
                    gap-3 rounded-lg px-3 py-2.5
                    text-left transition
                    hover:bg-primary-variant
                  "
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-white">
                      {item.name}
                    </span>

                    <span className="mt-0.5 block truncate font-mono text-[11px] text-light">
                      {item.formula}
                    </span>
                  </span>

                  <span className="shrink-0 text-xs text-primary">Insert</span>
                </button>
              ))}

              {/* NO RESULTS */}
              {filteredChemistryFormulas.length === 0 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-xs font-medium text-white">
                    No formulas found
                  </p>

                  <p className="mt-1 text-[11px] text-light">
                    Try another name, formula, or category.
                  </p>
                </div>
              )}

              {/* CUSTOM FORMULA */}
              <div className="my-1.5 border-t border-border" />

              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  insertChemistry("");
                }}
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
                    Custom formula
                  </span>

                  <span className="mt-0.5 block text-[11px] text-light">
                    Enter your own chemistry notation
                  </span>
                </span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ChemistryFormulaPicker;
