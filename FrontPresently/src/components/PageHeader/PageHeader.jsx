import { MdArrowBackIosNew } from "react-icons/md";
import "./PageHeader.css";

function PageHeader({
  breadcrumb,
  title,
  className = "",
  breadcrumbClassName = "",
  titleClassName = "",
  mobileOnly = false,
  onBack,
}) {
  const headerClasses = [
    "page-header",
    mobileOnly ? "page-header--mobile-only" : "",
    onBack ? "page-header--with-back" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <header className={headerClasses}>
      {onBack ? (
        <button type="button" className="page-header__back" onClick={onBack} aria-label="Voltar">
          <MdArrowBackIosNew size={15} />
        </button>
      ) : null}
      <div className="page-header__copy">
        <span className={`page-header__breadcrumb ${breadcrumbClassName}`.trim()}>
          {breadcrumb}
        </span>
        <h1 className={`page-header__title ${titleClassName}`.trim()}>{title}</h1>
      </div>
    </header>
  );
}

export default PageHeader;
