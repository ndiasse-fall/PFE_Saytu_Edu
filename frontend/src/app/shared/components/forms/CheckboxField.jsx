export function CheckboxField({ name, checked, onChange, label }) {
    return (
        <label className="check-field">
            <input
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
            <span className="text-link">{label}</span>
        </label>
    );
}
