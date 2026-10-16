type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function LpLogo({ size = 36, showWordmark = true, className }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LpMarkSvg size={size} />
      {showWordmark && (
        <span
          className="font-display font-extrabold tracking-tight text-lp-text leading-none"
          style={{ fontSize: size * 0.55 }}
        >
          League<span className="text-lp-accent">Pour</span>
        </span>
      )}
    </span>
  );
}

export function LpMarkSvg({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Beer mug body */}
      <path
        d="M 8 13 L 10 30 L 24 30 L 26 13 Z"
        fill="#1a73ff"
      />
      {/* Mug handle */}
      <path
        d="M 25 16 Q 32 16 32 22 Q 32 28 25 28"
        stroke="#1a73ff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Foam bubbles across top */}
      <ellipse cx="11" cy="13" rx="4" ry="3.5" fill="white" />
      <ellipse cx="18" cy="11.5" rx="4.5" ry="3.5" fill="white" />
      <ellipse cx="25" cy="13" rx="3.5" ry="3" fill="white" />
      {/* Star in mug */}
      <path
        d="M 17 19 L 17.9 21.8 L 20.9 21.8 L 18.5 23.5 L 19.4 26.3 L 17 24.6 L 14.6 26.3 L 15.5 23.5 L 13.1 21.8 L 16.1 21.8 Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}
