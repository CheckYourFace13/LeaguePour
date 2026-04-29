import QRCode from "qrcode";

export async function buildQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 240,
    color: {
      dark: "#f2f4ff",
      light: "#0f1220",
    },
  });
}
