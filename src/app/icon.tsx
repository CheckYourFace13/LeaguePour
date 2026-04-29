import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #060810 0%, #0d1120 70%, #151a2f 100%)",
          color: "white",
          fontWeight: 900,
          fontSize: 42,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <span style={{ color: "#ffffff", marginRight: 2 }}>L</span>
        <span style={{ color: "#f43f5e" }}>P</span>
      </div>
    ),
    size,
  );
}
