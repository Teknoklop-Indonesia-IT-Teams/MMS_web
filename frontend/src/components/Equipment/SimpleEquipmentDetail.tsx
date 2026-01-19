import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, MapPin, Settings, User } from "lucide-react";
import { Equipment } from "../../types";
import { alatService } from "../../services/enhancedServices";

const SimpleEquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) {
        setError("ID alat tidak valid");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await alatService.getById(id);

        if (response.data) {
          setEquipment(response.data);
        } else {
          setError("Data alat tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        setError("Gagal memuat data alat");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Memuat data alat...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link
              to="/telemetri"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                Kembali ke List Telemetri
              </span>
              <span className="sm:hidden">Kembali</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 text-red-600 mb-3 sm:mb-4">
              <AlertCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold">Error</h1>
            </div>
            <p className="text-gray-700 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link
              to="/telemetri"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                Kembali ke List Telemetri
              </span>
              <span className="sm:hidden">Kembali</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 transition-colors duration-200">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              Alat Tidak Ditemukan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Alat dengan ID {id} tidak ditemukan dalam sistem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Link
            to="/telemetri"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Kembali ke List Telemetri</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 sm:p-6 transition-colors duration-200">
            <h1 className="text-lg sm:text-2xl font-bold">{equipment.nama}</h1>
            <p className="text-blue-100 dark:text-blue-200 mt-1 text-sm sm:text-base">
              ID: {equipment.id} | {equipment.jenis}
            </p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Basic Info */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2 transition-colors duration-200">
                  Informasi Dasar
                </h2>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={14}
                      className="text-gray-500 dark:text-gray-400 mt-1 sm:w-4 sm:h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Lokasi
                      </p>
                      <p className="font-medium text-sm sm:text-base break-words text-gray-900 dark:text-gray-100">
                        {equipment.lokasi || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Settings
                      size={14}
                      className="text-gray-500 mt-1 sm:w-4 sm:h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Device</p>
                      <p className="font-medium text-sm sm:text-base break-words">
                        {equipment.device || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Settings
                      size={14}
                      className="text-gray-500 mt-1 sm:w-4 sm:h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Sensor</p>
                      <p className="font-medium text-sm sm:text-base break-words">
                        {equipment.sensor || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User
                      size={14}
                      className="text-gray-500 mt-1 sm:w-4 sm:h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">PIC</p>
                      <p className="font-medium text-sm sm:text-base break-words">
                        {equipment.pic || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                  Informasi Teknis
                </h2>

                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Instalasi
                    </p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {equipment.instalasi || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Garansi</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {equipment.garansi || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Remot</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {equipment.remot || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        equipment.status === "Garansi"
                          ? "bg-green-100 text-green-800"
                          : equipment.status === "Non-Garansi"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {equipment.status || "-"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Pelanggan
                    </p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {equipment.pelanggan || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Image */}
            {equipment.i_alat && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2 mb-3 sm:mb-4">
                  Gambar Alat
                </h2>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <img
                    src={`${import.meta.env.VITE_URL}/uploads/${
                      equipment.i_alat
                    }`}
                    alt={equipment.nama}
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    onError={(e) => {
                      console.error("Failed to load equipment image");
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                ✅ QR Code berhasil di-scan!
              </h3>
              <p className="text-green-700 text-sm sm:text-base">
                Anda berhasil mengakses detail record maintenance alat{" "}
                <strong>{equipment.nama}</strong> melalui QR code.
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-2">
                Semua informasi alat telemetri ditampilkan di atas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEquipmentDetail;
