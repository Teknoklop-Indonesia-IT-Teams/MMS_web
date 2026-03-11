import React from "react";
import { X } from "lucide-react";
import { Equipment } from "../../../types";

interface Props {
  equipment: Equipment;
  onClose: () => void;
}

const PlcDescriptionModal: React.FC<Props> = ({ equipment, onClose }) => {
  const Row = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <p className="p-2 text-sm text-gray-900 rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-100">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detail Informasi Alat PLC
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {equipment.nama} — {equipment.jenis}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Row label="Nama Alat" value={equipment.nama} />
              <Row label="Jenis PLC" value={equipment.jenis} />
              <Row label="Instalasi" value={equipment.instalasi} />
              <Row label="Garansi" value={equipment.garansi} />
              <Row label="Remote" value={equipment.remot} />
            </div>
            <div className="space-y-4">
              <Row label="Lokasi" value={equipment.lokasi} />
              <Row label="Device" value={equipment.device} />
              <Row label="Sensor" value={equipment.sensor} />
              <Row label="Pelanggan" value={equipment.pelanggan} />
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <span
                  className={`px-2 py-1 text-sm rounded inline-block ${
                    equipment.status === "Garansi"
                      ? "bg-green-100 text-green-800"
                      : equipment.status === "Habis"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {equipment.status || "-"}
                </span>
              </div>
              <Row label="PIC" value={equipment.pic} />
            </div>
          </div>

          {equipment.i_alat && (
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Gambar Alat
              </label>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <img
                  src={`${import.meta.env.VITE_URL}/uploads/${equipment.i_alat}`}
                  alt={equipment.nama}
                  className="h-auto max-w-full rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlcDescriptionModal;
