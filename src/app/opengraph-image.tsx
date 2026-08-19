import { ImageResponse } from "next/og";

export const alt = "LeaguePour — Venue Competition Software for Bars";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0d1b40",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#0057d9",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 24,
            }}
          >
            <div style={{ display: "flex", fontSize: 40 }}>🏆</div>
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "#ffffff" }}>
            League<span style={{ color: "#4d94ff" }}>Pour</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#ffffff", maxWidth: 980 }}>
          Run bar competitions. Fill more seats.
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#a9b8db", marginTop: 20, maxWidth: 900 }}>
          Trivia, darts, cornhole, and league nights — signups, entry fees, and standings in one place.
        </div>
      </div>
    ),
    { ...size },
  );
}
