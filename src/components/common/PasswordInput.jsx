import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Reusable password input with label, visibility toggle and error display
// TODO: When integrating with Laravel backend, perform server-side password
// strength checks during registration and on change-password endpoints.
export default function PasswordInput({ id, label, value, onChange, error, placeholder, name, required }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}</span>
      <div className="relative">
        <input id={id} name={name} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          required={required}
          className={`w-full h-11 pr-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition ${error ? "border-destructive focus:ring-destructive/30" : ""}`} />
        <button type="button" aria-label="Toggle password visibility" onClick={() => setShow((s) => !s)}
          className="absolute end-2 top-1/2 -translate-y-1/2 size-9 grid place-items-center text-muted-foreground">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <span className="block mt-1 text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}
