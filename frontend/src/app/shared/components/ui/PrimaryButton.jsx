export function PrimaryButton({
    children,
    disabled = false,
    type = "button",
    block = false,
    className = "",
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            translate="no"
            className={`btn-primary${block ? " btn-block" : ""}${className ? ` ${className}` : ""}`}
        >
            {children}
        </button>
    );
}
