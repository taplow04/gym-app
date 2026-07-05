import Icon from "./Icon";

// Custom checkbox — native input stays in the DOM for keyboard + AT,
// the drawn box carries the volt visual. ≥44px row height for touch.

export default function Checkbox({ checked, onChange, children, id }) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox-box" aria-hidden="true">
        <Icon name="check" size={13} strokeWidth={3.2} />
      </span>
      <span className="checkbox-label">{children}</span>
    </label>
  );
}
