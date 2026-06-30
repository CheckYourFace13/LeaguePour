import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function LpIcon() {
  const blue = "#1a73ff";

  return new ImageResponse(
    (
      <svg width={32} height={32} viewBox="0 0 36 36">
        {/* Mug body */}
        <path d="M 8 13 L 10 30 L 24 30 L 26 13 Z" fill={blue} />
        {/* Handle */}
        <path
          d="M 25 16 Q 32 16 32 22 Q 32 28 25 28"
          stroke={blue}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Foam */}
        <ellipse cx="11" cy="13" rx="4" ry="3.5" fill="white" />
        <ellipse cx="18" cy="11.5" rx="4.5" ry="3.5" fill="white" />
        <ellipse cx="25" cy="13" rx="3.5" ry="3" fill="white" />
        {/* Star */}
        <path
          d="M 17 19 L 17.9 21.8 L 20.9 21.8 L 18.5 23.5 L 19.4 26.3 L 17 24.6 L 14.6 26.3 L 15.5 23.5 L 13.1 21.8 L 16.1 21.8 Z"
          fill="white"
        />
      </svg>
    ),
    { ...size }
  );
}
