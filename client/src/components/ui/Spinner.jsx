import { FiLoader } from "react-icons/fi";

const Spinner = ({
  size = "2rem",
  text = "Please wait...",
  showText = true,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <FiLoader
        size={size}
        className="animate-spin text-primary"
        aria-hidden="true"
      />

      {showText && <p className="text-sm font-medium text-light">{text}</p>}
    </div>
  );
};

export default Spinner;
