import { ImageResponse } from "next/og";

export const alt = "VenueSprocket — Private Event Booking & Venue Management Software";
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
          background: "#1a1512",
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
              background: "#b87333",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 24,
            }}
          >
            <div style={{ display: "flex", fontSize: 40 }}>📋</div>
          </div>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800, color: "#ffffff" }}>
            Venue<span style={{ color: "#d99b5f" }}>Sprocket</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#ffffff", maxWidth: 980 }}>
          Book more private events. Run them better.
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#cbb8a8", marginTop: 20, maxWidth: 900 }}>
          Inquiries, proposals, contracts, deposits, and BEOs — one platform for restaurants, bars, and breweries.
        </div>
      </div>
    ),
    { ...size },
  );
}
