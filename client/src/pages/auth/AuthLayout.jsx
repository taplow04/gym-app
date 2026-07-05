import Icon from "../../components/Icon";

// Shared shell for every auth screen: brand mark, title block, content.
// Auth pages render without BottomNav, so this owns its own vertical
// rhythm (centered column, safe-area aware).

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth-screen">
      <div className="auth-brand" aria-label="Forge">
        <span className="auth-logo">
          <Icon name="zap" size={20} strokeWidth={2.4} />
        </span>
        <span className="auth-wordmark">FORGE</span>
      </div>

      <header className="auth-head">
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
      </header>

      <div className="auth-body">{children}</div>

      {footer && <div className="auth-foot">{footer}</div>}
    </main>
  );
}

/** Inline server-error banner for a form (network, wrong password, …). */
export function FormError({ children }) {
  if (!children) return null;
  return (
    <div className="form-error" role="alert">
      <Icon name="alert" size={17} strokeWidth={2.2} />
      <span>{children}</span>
    </div>
  );
}

/** Button label swap while a request is in flight. */
export function BtnSpinner() {
  return <span className="spinner" aria-hidden="true" />;
}
