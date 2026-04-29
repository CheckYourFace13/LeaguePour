import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "linear-gradient(145deg, #05070f 0%, #0b1020 70%, #14192d 100%)",
          fontWeight: 900,
          fontSize: 118,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <span style={{ color: "#ffffff", marginRight: 4 }}>L</span>
        <span style={{ color: "#f43f5e" }}>P</span>
      </div>
    ),
    size,
  );
}
