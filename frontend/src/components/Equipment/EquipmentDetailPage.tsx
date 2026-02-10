import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Equipment } from "../../types";
import { alatService } from "../../services/enhancedServices";
import EquipmentDetail from "./EquipmentPreventiveDetail";
import { showErrorToast } from "../../utils/toast";

const EquipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) {
        showErrorToast("ID alat tidak valid", "ID alat tidak ditemukan");
        navigate("/telemetri");
        return;
      }

      try {
        const response = await alatService.getById(id);
        if (response.data) {
          setEquipment(response.data);
        } else {
          showErrorToast(
            "Alat tidak ditemukan",
            `Alat dengan ID ${id} tidak ditemukan`
          );
          navigate("/telemetri");
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        showErrorToast(
          "Gagal memuat data alat",
          "Terjadi kesalahan saat mengambil data alat"
        );
        navigate("/telemetri");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, navigate]);

  const handleClose = () => {
    navigate("/telemetri");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data alat...</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Alat tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EquipmentDetail equipment={equipment} onClose={handleClose} />
    </div>
  );
};

export default EquipmentDetailPage;
