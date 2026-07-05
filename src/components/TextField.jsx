import Icon from "./Icon";

// Labeled input with inline validation — the form vocabulary for every
// auth screen. `error` renders below the input and flags it for AT.

export default function TextField({ id, label, error, hint, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`input${error ? " input--invalid" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
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
