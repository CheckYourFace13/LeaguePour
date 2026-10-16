type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function VsLogo({ size = 36, showWordmark = true, className }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <VsMarkSvg size={size} />
      {showWordmark && (
        <span
          className="font-display font-extrabold tracking-tight text-[var(--vs-text)] leading-none"
          style={{ fontSize: size * 0.55 }}
        >
          Venue<span className="text-[var(--vs-accent)]">Sprocket</span>
        </span>
      )}
    </span>
  );
}

export function VsMarkSvg({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 8 gear teeth as satellite circles */}
      <circle cx="32" cy="18" r="4.5" fill="#b87333" />
      <circle cx="28.97" cy="28.97" r="4.5" fill="#b87333" />
      <circle cx="18" cy="32" r="4.5" fill="#b87333" />
      <circle cx="7.03" cy="28.97" r="4.5" fill="#b87333" />
      <circle cx="4" cy="18" r="4.5" fill="#b87333" />
      <circle cx="7.03" cy="7.03" r="4.5" fill="#b87333" />
      <circle cx="18" cy="4" r="4.5" fill="#b87333" />
      <circle cx="28.97" cy="7.03" r="4.5" fill="#b87333" />
      {/* Center hub */}
      <circle cx="18" cy="18" r="10" fill="#b87333" />
      {/* Center hole */}
      <circle cx="18" cy="18" r="5.5" fill="white" />
      {/* V mark */}
      <path
        d="M 13.5 14 L 18 22 L 22.5 14"
        stroke="#b87333"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
