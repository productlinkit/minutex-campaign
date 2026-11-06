export default function Field({ label, error, children, hint, htmlFor }) {
  return (
    <div className={`mxc-field${error ? ' has-error' : ''}`}>
      <label className="mxc-field__label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <span className="mxc-field__error" role="alert">{error}</span> : hint && <span className="mxc-field__hint">{hint}</span>}
    </div>
  )
}
