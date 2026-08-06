/* eslint-disable react/prop-types */
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export const FormInput = ({
  label,
  errMes,
  required = false,
  placeholder = "",
  value = "",
  type = "text",
  pattern,
  nameRef,
  name,
  onChange,
  disabled = false,
  autoComplete = "off",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const hasError = Boolean(errMes);

  return (
    <div className="w-full">
      {/* Label */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={name} className="text-sm font-medium text-white/90">
          {label}

          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>

      {/* Input wrapper */}
      <div className="relative">
        <input
          id={name}
          ref={nameRef}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          pattern={pattern}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={onChange}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={`
            h-12 w-full rounded-xl border bg-bg-deep
            px-4 text-sm text-white
            placeholder:text-light/50
            outline-none transition-all duration-200
            disabled:cursor-not-allowed disabled:opacity-50

            ${isPassword ? "pr-12" : ""}

            ${
              hasError
                ? "border-danger/70 focus:border-danger focus:ring-4 focus:ring-danger/10"
                : "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
            }
          `}
        />

        {/* Password visibility */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="
              absolute right-3 top-1/2
              flex h-9 w-9 -translate-y-1/2
              items-center justify-center
              rounded-lg text-light
              transition
              hover:bg-white/5 hover:text-white
              focus:outline-none focus:ring-2 focus:ring-primary/30
              disabled:cursor-not-allowed
            "
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>

      {/* Error */}
      {hasError && (
        <p
          id={`${name}-error`}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          {errMes}
        </p>
      )}
    </div>
  );
};
