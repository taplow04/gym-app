import { useState } from "react";
import Icon from "./Icon";
import { passwordStrength } from "../lib/validate";

// Password input with show/hide toggle and an optional live strength
// meter (signup/reset). Strength is advisory; validation gates submit.

export default function PasswordField({
  id,
  label,
  error,
  hint,
  showStrength = false,
  value,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? passwordStrength(value) : null;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`input input--affixed${error ? " input--invalid" : ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={value}
          {...inputProps}
        />
        <button
          type="button"
          className="input-affix"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={-1}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={19} />
        </button>
      </div>

      {strength && value ? (
        <div className="strength" aria-live="polite">
          <div className="strength-bars">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`strength-bar${
                  strength.score >= step ? ` strength-bar--on-${strength.score}` : ""
                }`}
              />
            ))}
          </div>
          <span className={`strength-label strength-label--${strength.score}`}>
            {strength.label}
          </span>
        </div>
      ) : null}

      {error ? (
        <p className="field-error" id={`${id}-error`}>
          <Icon name="alert" size={14} strokeWidth={2.2} /> {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
