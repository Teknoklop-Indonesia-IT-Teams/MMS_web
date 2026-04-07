import React from "react";
import { X } from "lucide-react";
import { Equipment } from "../../types";

interface EquipmentDescriptionModalProps {
  equipment: Equipment;
  onClose: () => void;
}

const EquipmentDescriptionModal: React.FC<EquipmentDescriptionModalProps> = ({
  equipment,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detail Informasi Alat
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {equipment.nama} - {equipment.jenis}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nama Alat
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.nama || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Jenis
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.jenis || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Instalasi
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.instalasi || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Garansi
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.garansi || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Remote
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.remot || "-"}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Lokasi
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.lokasi || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Pelanggan
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.pelanggan_nama || equipment.pelanggan || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Status
                </label>
                <p
                  className={`text-sm p-2 rounded inline-block ${
                    equipment.status === "aktif"
                      ? "bg-green-100 text-green-800"
                      : equipment.status === "non-aktif"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {equipment.status || "-"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  PIC
                </label>
                <p className="p-2 text-sm text-gray-900 rounded bg-gray-50">
                  {equipment.pic || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Equipment Information */}
          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Informasi Lengkap Alat
            </label>
            <div className="p-4 space-y-4 rounded-lg bg-gray-50">

              {/* Device */}
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">Device</p>
                <p className="text-sm font-medium text-gray-900">{equipment.device || "-"}</p>
              </div>

              {/* Sensor */}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Sensor</p>
                {(() => {
                  const sensorArr = Array.isArray(equipment.sensor)
                    ? equipment.sensor
                    : equipment.sensor
                      ? (() => { try { return JSON.parse(equipment.sensor as string); } catch { return [equipment.sensor]; } })()
                      : [];

                  if (!sensorArr.length) return <p className="text-sm text-gray-400">-</p>;

                  return (
                    <div className="overflow-y-auto max-h-48">
                      <div className="grid grid-cols-3 gap-2">
                        {sensorArr.map((item: string, idx: number) => {
                          const [nama, id] = (item as string).split(",").map((s: string) => s.trim());
                          return (
                            <div key={idx} className="flex flex-col gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-1">
                                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-700 bg-blue-100 rounded-full shrink-0">
                                  {idx + 1}
                                </span>
                                <p className="text-xs font-medium text-gray-900 truncate">{nama || "-"}</p>
                              </div>
                              {id && (
                                <p className="text-xs text-gray-400 truncate">ID: {id}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>

          {/* Additional Equipment Details */}
          {equipment.i_alat && (
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Gambar Alat
              </label>
              <div className="p-4 rounded-lg bg-gray-50">
                <img
                  src={`${import.meta.env.VITE_URL}/uploads/${
                    equipment.i_alat
                  }`}
                  alt={equipment.nama}
                  className="h-auto max-w-full rounded-lg shadow-md"
                  onError={(e) => {
                    console.error("Failed to load image:", equipment.i_alat);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDescriptionModal;
