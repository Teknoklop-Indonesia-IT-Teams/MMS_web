import React from "react";
import { X } from "lucide-react";
import { Equipment } from "../../types";

interface QRCodeDisplayProps {
  equipment: Equipment;
  onClose: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  equipment,
  onClose,
}) => {
  const qrUrl = `${window.location.origin}/qr/telemetri/detail/${equipment.id}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            QR Code - {equipment.nama}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center">
          <div className="bg-white p-4 rounded-lg inline-block">
            <div className="text-sm text-gray-600 mb-2">
              QR Code untuk: {equipment.nama}
            </div>
            <div className="text-xs text-gray-500">URL: {qrUrl}</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
