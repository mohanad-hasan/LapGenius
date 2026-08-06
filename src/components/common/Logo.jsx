import logo from "@/assets/logo.webp";

export function Logo({ size = 36, withText = true, className = "", responsive = false }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="LapGenius" width={size} height={size} className="object-contain shrink-0" style={{ width: size, height: size }} />
      {withText && (
        <span className={`text-xl font-extrabold tracking-tight ${responsive ? "hidden sm:inline" : ""}`}>
          <span className="gradient-text">Lap</span>
          <span className="text-foreground">Genius</span>
        </span>
      )}
    </div>
  );
}
