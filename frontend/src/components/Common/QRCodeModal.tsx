import React, { useRef } from "react";
import { X, Download, Printer } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Equipment } from "../../types";
import { getMostAccessibleUrl } from "../../utils/networkUtils";

interface QRCodeModalProps {
  equipment: Equipment;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ equipment, onClose }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("");

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        // Gunakan network utils untuk mendapatkan URL terbaik dengan route public
        const urlInfo = await getMostAccessibleUrl(
          `/qr/telemetri/detail/${equipment.id}`,
        );
        // Buat QR code dengan error correction yang baik
        const qrUrl = await QRCode.toDataURL(urlInfo.url, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M", // Medium error correction untuk scanning yang lebih baik
        });

        setQrCodeUrl(qrUrl);
      } catch (error) {
        // Fallback ke metode lama jika network utils gagal
        try {
          const fallbackUrl = `${window.location.protocol}//${
            window.location.hostname
          }${
            window.location.port ? ":" + window.location.port : ""
          }/qr/telemetri/detail/${equipment.id}`;

          const qrUrl = await QRCode.toDataURL(fallbackUrl, {
            width: 256,
            margin: 2,
            color: { dark: "#000000", light: "#FFFFFF" },
            errorCorrectionLevel: "M",
          });

          setQrCodeUrl(qrUrl);
        } catch (fallbackError) {
          console.error(
            "❌ Fallback QR generation also failed:",
            fallbackError,
          );
        }
      }
    };

    generateQR();
  }, [equipment.id]);

  const handleDownload = async () => {
    if (!qrCodeUrl) {
      console.error("QR Code not ready yet");
      return;
    }

    try {
      // Method 1: Direct download dari QR code data URL
      const link = document.createElement("a");
      link.download = `qr-${equipment.nama
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = qrCodeUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);

      // Fallback method: Using html2canvas
      if (qrRef.current) {
        try {
          const canvas = await html2canvas(qrRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            useCORS: true,
          });
          const link = document.createElement("a");
          link.download = `qr-${equipment.nama
            .replace(/\s+/g, "-")
            .toLowerCase()}.png`;
          link.href = canvas.toDataURL("image/png");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (canvasError) {
          console.error("Error with html2canvas:", canvasError);
        }
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && qrRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${equipment.nama}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { display: inline-block; padding: 20px; border: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h3>${equipment.nama}</h3>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <p>Scan untuk melihat detail informasi alat</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">QR Code - {equipment.nama}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div ref={qrRef} className="mb-6 text-center">
          {qrCodeUrl ? (
            <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto mb-3"
                style={{ maxWidth: "256px", height: "auto" }}
                onLoad={() => console.log("QR image loaded successfully")}
                onError={() => console.error("QR image failed to load")}
              />
              <p className="text-sm font-medium text-gray-700">
                Scan untuk melihat detail alat
              </p>
              <p className="mt-1 text-xs text-gray-500 break-words">
                {equipment.nama}
              </p>
              <p className="mt-1 text-xs text-gray-400">ID: {equipment.id}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-8 h-8 mb-3 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Generating QR Code...</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDownload}
            disabled={!qrCodeUrl}
            className={`flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors rounded-md ${
              qrCodeUrl
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Download size={16} />
            <span>{qrCodeUrl ? "Download" : "Loading..."}</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={!qrCodeUrl}
            className={`flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors rounded-md ${
              qrCodeUrl
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Printer size={16} />
            <span>{qrCodeUrl ? "Print" : "Loading..."}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
