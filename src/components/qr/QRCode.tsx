"use client";

import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  url: string;
  size?: number;
  color?: string;
}

export function QRCode({ url, size = 200, color = "#f59e0b" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCodeLib.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  }, [url, size, color]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

export function QRCodeDownload({ url, restaurantName, color = "#f59e0b" }: { url: string; restaurantName: string; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCodeLib.toCanvas(canvasRef.current, url, {
      width: 300,
      margin: 3,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [url]);

  function handleDownload() {
    if (!canvasRef.current) return;

    const downloadCanvas = document.createElement("canvas");
    downloadCanvas.width = 400;
    downloadCanvas.height = 460;
    const ctx = downloadCanvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 460);

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 400, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(restaurantName, 200, 38);

    ctx.drawImage(canvasRef.current, 50, 70);

    ctx.fillStyle = "#6b7280";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Menüyü görmek için QR kodu okutun", 200, 420);
    ctx.fillStyle = color;
    ctx.font = "12px sans-serif";
    ctx.fillText(url, 200, 445);

    const link = document.createElement("a");
    link.download = `${restaurantName}-qr-menu.png`;
    link.href = downloadCanvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg border" />
      <button
        onClick={handleDownload}
        className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: color }}
      >
        QR Kodu İndir (PNG)
      </button>
    </div>
  );
}
