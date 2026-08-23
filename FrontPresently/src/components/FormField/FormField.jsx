import { MdCalendarToday } from "react-icons/md";
import "./FormField.css";

function applyMask(value, mask) {
  const raw = String(value ?? "");

  if (mask === "date") {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const parts = [];

    if (digits.length > 0) parts.push(digits.slice(0, 2));
    if (digits.length > 2) parts.push(digits.slice(2, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 8));

    return parts.join("/");
  }

  if (mask === "time") {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }

  if (mask === "number") {
    return raw.replace(/\D/g, "");
  }

  return raw;
}

function FormField({
  label,
  required = false,
  error,
  as = "input",
  type = "text",
  icon,
  mask,
  options,
  placeholder,
  value,
  onChange,
  disabled,
  readOnly,
  helperText,
  id,
}) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const normalizedOptions = options?.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  function handleChange(event) {
    if (!onChange) {
      return;
    }

    if (mask) {
      const nextValue = applyMask(event.target.value, mask);
      onChange({
        ...event,
        target: {
          ...event.target,
          value: nextValue,
        },
      });
      return;
    }

    onChange(event);
  }

  const inputType = mask === "date" || mask === "time" || mask === "number" ? "text" : type;
  const inputMode =
    mask === "date" || mask === "time" || mask === "number" ? "numeric" : undefined;

  return (
    <div className="evt-field">
      {label && (
        <label className="evt-field__label" htmlFor={fieldId}>
          {label}
          {required && <span className="evt-field__required">*</span>}
        </label>
      )}

      <div className={`evt-field__control ${error ? "evt-field__control--error" : ""}`}>
        {as === "textarea" && (
          <textarea
            id={fieldId}
            className="evt-field__textarea"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
          />
        )}

        {as === "select" && (
          <select
            id={fieldId}
            className="evt-field__select"
            value={value}
            onChange={handleChange}
            disabled={disabled}
          >
            <option value="" disabled>
              {placeholder || "Selecione"}
            </option>
            {normalizedOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {as === "input" && (
          <>
            <input
              id={fieldId}
              type={inputType}
              inputMode={inputMode}
              className="evt-field__input"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              disabled={disabled}
              readOnly={readOnly}
              maxLength={mask === "date" ? 10 : mask === "time" ? 5 : undefined}
            />
            {icon === "calendar" && <MdCalendarToday size={16} className="evt-field__icon" />}
          </>
        )}
      </div>

      {error && <span className="evt-field__error">{error}</span>}
      {helperText && !error && <span className="evt-field__helper">{helperText}</span>}
    </div>
  );
}

export default FormField;
