import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, MapPin, QrCode } from "lucide-react";
import { Equipment } from "../../types";

/**
 * Public Equipment Detail - Accessible without authentication
 * Used for QR code scanning from external devices/browsers
 */
const PublicEquipmentDetail: React.FC = () => {
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
        console.log("🔍 Public QR: Fetching equipment data for ID:", id);

        // Gunakan endpoint public untuk QR code access
        const response = await fetch(
          `http://localhost:3001/api/alat/public/${id}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Alat tidak ditemukan");
          } else {
            setError("Gagal memuat data alat");
          }
          return;
        }

        const data = await response.json();
        console.log("✅ Public QR: Equipment data received:", data);

        if (data.success && data.data) {
          setEquipment(data.data);
        } else {
          setError("Data alat tidak tersedia");
        }
      } catch (error) {
        console.error("❌ Public QR: Error fetching equipment:", error);
        setError("Gagal memuat data alat");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Memuat data alat dari QR Code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-gray-600 text-sm">
              <QrCode size={16} />
              <span>Akses melalui QR Code</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={24} className="flex-shrink-0" />
              <h1 className="text-xl font-bold">Error</h1>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="text-sm text-gray-500">
              <p>Pastikan:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>QR Code masih valid</li>
                <li>Koneksi internet stabil</li>
                <li>Alat masih terdaftar di sistem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 text-gray-600 mb-4">
              <QrCode size={24} />
              <h1 className="text-xl font-bold">Data Tidak Tersedia</h1>
            </div>
            <p className="text-gray-700">Data alat tidak dapat ditampilkan.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "normal":
        return "text-green-600 bg-green-100";
      case "garansi":
        return "text-green-600 bg-green-100"; // Garansi aktif = hijau
      case "habis":
        return "text-red-600 bg-red-100"; // Garansi habis = merah
      case "maintenance":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getGaransiStatus = (garansiDate: string | null | undefined) => {
    if (!garansiDate)
      return { status: "Tidak diketahui", color: "bg-gray-100 text-gray-800" };

    const today = new Date();
    const garansi = new Date(garansiDate);

    if (isNaN(garansi.getTime())) {
      return { status: "Tidak valid", color: "bg-gray-100 text-gray-800" };
    }

    if (garansi > today) {
      return { status: "Garansi", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Habis", color: "bg-red-100 text-red-800" };
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Belum pernah";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data tidak valid";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <QrCode size={16} />
              <span>Diakses melalui QR Code</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleString("id-ID")}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Detail Alat - {equipment.nama}
          </h1>
          <p className="text-gray-600">
            Informasi lengkap alat dari sistem maintenance
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Status Saat Ini
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  equipment.status
                )}`}
              >
                {equipment.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informasi Alat
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nama Alat
                  </label>
                  <p className="text-gray-900 font-medium">{equipment.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Kode Alat
                  </label>
                  <p className="text-gray-900 font-mono">
                    {equipment.device || "N/A"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Lokasi
                    </label>
                    <p className="text-gray-900">{equipment.lokasi}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Jenis
                  </label>
                  <p className="text-gray-900">{equipment.jenis}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Device
                  </label>
                  <p className="text-gray-900">{equipment.device || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Garansi
                  </label>
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                        getGaransiStatus(equipment.garansi).color
                      }`}
                    >
                      {getGaransiStatus(equipment.garansi).status}
                    </span>
                    {equipment.garansi && (
                      <p className="text-xs text-gray-500">
                        Berakhir: {formatDate(equipment.garansi)}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    PIC (Person In Charge)
                  </label>
                  <p className="text-gray-900 font-medium">
                    {equipment.pic || "Belum ditentukan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informasi Maintenance
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Maintenance Terakhir
                </label>
                <p className="text-gray-900">
                  {formatDate(equipment.maintenanceDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Maintenance Selanjutnya
                </label>
                <p className="text-gray-900">
                  {formatDate(equipment.nextMaintenanceDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Maintenance Management System</p>
          <p>AWLR Sungai Serayu Banjarnegara</p>
        </div>
      </div>
    </div>
  );
};

export default PublicEquipmentDetail;
