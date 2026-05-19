"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

const QR_BASE_URL =
  "https://qr-menu-rho-nine-seven.vercel.app/menu/wix-garden-cafe-mp9tei2r";

const ORANGE = "#f07c10";
const CREAM = "#f7f3ef";
const CARD = "#1c1107";
const BORDER = "rgba(240,124,16,0.15)";
const DIM = "#8b7355";

type Props = { restaurantName: string };

export default function TablesClient({ restaurantName }: Props) {
  const [tableCount, setTableCount] = useState(10);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <label style={{ color: DIM, fontSize: "14px" }}>Masa sayısı:</label>
        <input
          type="number"
          min={1}
          max={50}
          step={1}
          value={tableCount}
          onChange={(e) => {
            const val = Math.min(50, Math.max(1, parseInt(e.target.value) || 1));
            setTableCount(val);
          }}
          style={{
            width: "72px",
            padding: "6px 10px",
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "8px",
            color: CREAM,
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
          <TableCard
            key={n}
            tableNumber={n}
            restaurantName={restaurantName}
          />
        ))}
      </div>
    </div>
  );
}

function TableCard({
  tableNumber,
  restaurantName,
}: {
  tableNumber: number;
  restaurantName: string;
}) {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const url = `${QR_BASE_URL}?table=${tableNumber}`;

  useEffect(() => {
    if (!displayRef.current) return;
    QRCodeLib.toCanvas(displayRef.current, url, {
      width: 160,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});
  }, [url]);

  async function handleDownload() {
    const dlCanvas = document.createElement("canvas");
    dlCanvas.width = 280;
    dlCanvas.height = 340;
    const ctx = dlCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = CARD;
    ctx.fillRect(0, 0, dlCanvas.width, dlCanvas.height);

    ctx.fillStyle = ORANGE;
    ctx.fillRect(0, 0, dlCanvas.width, 52);
    ctx.fillStyle = CREAM;
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`MASA ${tableNumber}`, dlCanvas.width / 2, 34);

    const tempCanvas = document.createElement("canvas");
    await QRCodeLib.toCanvas(tempCanvas, url, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(40, 60, 200, 200);
    ctx.drawImage(tempCanvas, 40, 60);

    ctx.fillStyle = DIM;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(restaurantName, dlCanvas.width / 2, 288);
    ctx.fillStyle = CREAM;
    ctx.font = "11px sans-serif";
    ctx.fillText(`Masa ${tableNumber} için sipariş`, dlCanvas.width / 2, 308);

    const link = document.createElement("a");
    link.download = `masa-${tableNumber}-qr.png`;
    link.href = dlCanvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <p
        style={{
          color: CREAM,
          fontWeight: 600,
          fontSize: "14px",
          margin: 0,
          letterSpacing: "0.05em",
        }}
      >
        MASA {tableNumber}
      </p>

      <canvas
        ref={displayRef}
        style={{ borderRadius: "6px", border: "2px solid white" }}
      />

      <button
        onClick={handleDownload}
        style={{
          border: `1px solid ${ORANGE}`,
          color: ORANGE,
          background: "transparent",
          borderRadius: "999px",
          padding: "4px 16px",
          fontSize: "12px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        PNG İndir
      </button>
    </div>
  );
}
