import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function VsIcon() {
  const copper = "#b87333";
  const w = 32;
  const cx = 16;
  const cy = 16;
  const toothR = 12;
  const toothSize = 4;

  const teeth = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    return {
      x: cx + toothR * Math.cos(angle),
      y: cy + toothR * Math.sin(angle),
    };
  });

  return new ImageResponse(
    (
      <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
        {teeth.map((t, i) => (
          <circle key={i} cx={t.x} cy={t.y} r={toothSize} fill={copper} />
        ))}
        <circle cx={cx} cy={cy} r={8.5} fill={copper} />
        <circle cx={cx} cy={cy} r={4.5} fill="white" />
        <path
          d={`M ${cx - 3.5} ${cy - 3} L ${cx} ${cy + 3} L ${cx + 3.5} ${cy - 3}`}
          stroke={copper}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    { ...size }
  );
}
