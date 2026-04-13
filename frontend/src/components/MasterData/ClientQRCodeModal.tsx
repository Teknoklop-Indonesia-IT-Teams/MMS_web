import React, { useRef } from "react";
import { X, Download, Printer } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

interface ClientQRCodeModalProps {
    clientName: string;
    onClose: () => void;
}

const ClientQRCodeModal: React.FC<ClientQRCodeModalProps> = ({ clientName, onClose }) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("");
    const [dashboardUrl, setDashboardUrl] = React.useState<string>("");

    React.useEffect(() => {
        const generateQR = async () => {
            try {
                const url = `${window.location.protocol}//${window.location.hostname}${
                    window.location.port ? ":" + window.location.port : ""
                }/public-dashboard-telemetry/${encodeURIComponent(clientName)}`;

                setDashboardUrl(url);

                const qrUrl = await QRCode.toDataURL(url, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF",
                    },
                    errorCorrectionLevel: "M",
                });

                setQrCodeUrl(qrUrl);
            } catch (error) {
                console.error("❌ QR generation failed:", error);
            }
        };

        generateQR();
    }, [clientName]);

    const handleDownload = async () => {
        if (!qrCodeUrl) return;

        try {
            const link = document.createElement("a");
            link.download = `qr-dashboard-${clientName.replace(/\s+/g, "-").toLowerCase()}.png`;
            link.href = qrCodeUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading QR code:", error);
            if (qrRef.current) {
                try {
                    const canvas = await html2canvas(qrRef.current, {
                        backgroundColor: "#ffffff",
                        scale: 2,
                        logging: false,
                        useCORS: true,
                    });
                    const link = document.createElement("a");
                    link.download = `qr-dashboard-${clientName.replace(/\s+/g, "-").toLowerCase()}.png`;
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
        if (printWindow && qrCodeUrl) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code Dashboard - ${clientName}</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                            .qr-container { display: inline-block; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
                            .url { font-size: 11px; color: #666; word-break: break-all; max-width: 280px; margin: 8px auto 0; }
                        </style>
                    </head>
                    <body>
                        <div class="qr-container">
                            <h5>QR Code Dashboard Client</h5>
                            <h3>${clientName}</h3>
                            <img src="${qrCodeUrl}" alt="QR Code" />
                            <p>Scan untuk mengakses dashboard client</p>
                            <p class="url">${dashboardUrl}</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        QR Code Dashboard - {clientName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div ref={qrRef} className="mb-4 text-center">
                    {qrCodeUrl ? (
                        <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="mx-auto mb-3"
                                style={{ maxWidth: "256px", height: "auto" }}
                            />
                            <p className="text-sm font-medium text-gray-700">
                                Scan untuk mengakses dashboard client
                            </p>
                            <p className="mt-1 text-xs font-semibold text-gray-800">
                                {clientName}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="w-8 h-8 mb-3 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-500">Generating QR Code...</p>
                        </div>
                    )}
                </div>

                {dashboardUrl && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">URL Dashboard:</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 break-all">{dashboardUrl}</p>
                    </div>
                )}

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

export default ClientQRCodeModal;
