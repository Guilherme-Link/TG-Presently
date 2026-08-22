import "./Button.css";

function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  onClick,
  children,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`evt-btn evt-btn--${variant} evt-btn--${size}`}
    >
      {children}
    </button>
  );
}

export default Button;
