
import Icon from "./Icon";

export default function EmptyState({ icon = "dumbbell", title, sub, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={26} />
      </div>
      <div className="empty-title">{title}</div>
      {sub && <p className="empty-sub">{sub}</p>}
      {children}
    </div>
  );
}
