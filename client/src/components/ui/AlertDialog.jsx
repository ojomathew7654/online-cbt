/* eslint-disable react/prop-types */
import { FiAlertCircle, FiX } from "react-icons/fi";

const AlertDialog = ({ setOpenAlert, message }) => {
  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
      role="alertdialog"
      aria-modal="true"
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
          <h2 className="text-base font-semibold text-white">Notification</h2>

          <button
            type="button"
            onClick={() => setOpenAlert(false)}
            aria-label="Close notification"
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
            "
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-7">
          <div className="flex flex-col items-center text-center">
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-primary/10
                text-primary
              "
            >
              <FiAlertCircle size={28} />
            </div>

            <p className="mt-5 text-sm leading-6 text-light">{message}</p>
          </div>
        </div>

        {/* Action */}
        <div className="border-t border-border bg-bg/40 px-5 py-4">
          <button
            type="button"
            onClick={() => setOpenAlert(false)}
            className="
              h-11 w-full
              rounded-xl
              bg-primary
              px-5
              text-sm font-semibold
              text-bg
              transition
              hover:brightness-110
              focus:outline-none
              focus:ring-4
              focus:ring-primary/20
            "
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
