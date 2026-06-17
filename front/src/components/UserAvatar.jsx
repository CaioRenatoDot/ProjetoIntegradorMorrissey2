const avatarColors = [
  "#00c030",
  "#2563eb",
  "#9333ea",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#be123c",
  "#4f46e5",
];

function hashText(value) {
  return value.split("").reduce((hash, character) => {
    return hash + character.charCodeAt(0);
  }, 0);
}

export function getUserInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function getUserAvatarColor(name) {
  const hash = hashText(name || "Watchd");
  return avatarColors[hash % avatarColors.length];
}

export default function UserAvatar({ className = "", name, size = "md" }) {
  const sizeClassName = size === "lg" ? "h-24 w-24 text-3xl" : size === "nav" ? "h-7 w-7 text-[10px]" : size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  const initials = getUserInitials(name || "");
  const backgroundColor = getUserAvatarColor(name || "");

  return (
    <span
      aria-hidden="true"
      className={`inline-grid flex-none place-items-center rounded-full border border-white/10 font-black text-white shadow-lg shadow-black/20 ${sizeClassName} ${className}`}
      style={{ backgroundColor }}
    >
      {initials}
    </span>
  );
}


