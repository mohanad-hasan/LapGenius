import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { makeAbsoluteUrl } from "@/lib/api";

/**
 * UserAvatar — مكوّن أفاتار موحد لجميع المستخدمين
 * يعرض أيقونة موحدة للمستخدمين أو صورة المستخدم إذا توفرت
 */

/**
 * @param {object} props
 * @param {string} props.name       - اسم المستخدم
 * @param {string} [props.src]      - رابط صورة المستخدم
 * @param {string} [props.className] - كلاسات Tailwind الإضافية (size, ring, ...)
 * @param {string} [props.size]     - "sm" | "md" | "lg" | "xl"  (default: "md")
 */
export function UserAvatar({ name = "User", src, className = "", size = "md" }) {
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setImgErr(false);
  }, [src]);

  const sizeClass = {
    sm: "size-7 p-1.5",
    md: "size-9 p-2",
    lg: "size-12 p-2.5",
    xl: "size-20 p-4",
  }[size] || "size-9 p-2";

  const finalSrc = makeAbsoluteUrl(src);

  return finalSrc && !imgErr ? (
    <img
      src={finalSrc}
      alt={name}
      className={`${sizeClass.replace(/p-\d?\.?\d?/, "p-0")} object-cover rounded-full select-none shrink-0 border ${className}`}
      onError={() => setImgErr(true)}
    />
  ) : (
    <div
      aria-label={name}
      className={`${sizeClass} rounded-full inline-flex items-center justify-center select-none shrink-0 bg-accent text-muted-foreground ${className}`}
    >
      <User className="w-full h-full" />
    </div>
  );
}
