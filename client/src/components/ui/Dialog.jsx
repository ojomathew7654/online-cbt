/* eslint-disable react/prop-types */
import { FiAlertTriangle, FiX, FiLoader } from "react-icons/fi";

const Dialog = ({
  setOpenDialog,
  message,
  action,
  loading = false,
  title = "Confirm Action",
}) => {
  const handleClose = () => {
    if (!loading) {
      setOpenDialog(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="
          w-full max-w-md
          overflow-hidden
          rounded-2xl
          border border-border
          bg-bg-deep
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="dialog-title" className="text-base font-semibold text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close dialog"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              text-light
              transition
              hover:bg-white/5
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-primary/30
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <div className="flex flex-col items-center text-center">
            {/* Warning icon */}
            <div
              className="
                flex h-14 w-14 items-center justify-center
                rounded-full
                bg-warning/10
                text-warning
              "
            >
              <FiAlertTriangle size={27} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Are you sure?
            </h3>

            <p className="mt-2 text-sm leading-6 text-light">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border bg-bg/40 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              h-11 rounded-xl
              border border-border
              bg-bg
              px-5
              text-sm font-medium text-white
              transition
              hover:bg-white/5
              focus:outline-none
              focus:ring-2
              focus:ring-primary/30
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            No, Cancel
          </button>

          <button
            type="button"
            onClick={action}
            disabled={loading}
            className="
              flex h-11 items-center justify-center gap-2
              rounded-xl
              bg-danger
              px-5
              text-sm font-semibold text-white
              transition
              hover:brightness-110
              focus:outline-none
              focus:ring-4
              focus:ring-danger/20
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <FiLoader size={17} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Yes, Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
