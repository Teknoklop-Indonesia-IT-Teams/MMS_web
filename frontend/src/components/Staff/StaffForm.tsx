import React, { useState, useEffect } from "react";
import { X, User, Mail } from "lucide-react";
import { User as UserType } from "../../types";

interface StaffFormProps {
  user: UserType | null;
  onSave: (
    userData: Omit<UserType, "id" | "created_at" | "updated_at"> & {
      email?: string;
    }
  ) => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama wajib diisi";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format email tidak valid";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data to send
      const dataToSend = {
        nama: formData.nama,
        petugas: formData.nama,
        role: "staff",
        username: formData.nama.toLowerCase().replace(/\s+/g, ""),
        email: formData.email.trim() || undefined, // Include email in the data
      };
      onSave(dataToSend);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {user ? "Edit Petugas" : "Tambah Petugas Baru"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Nama Petugas */}
            <div className="space-y-2">
              <label
                htmlFor="nama"
                className="flex items-center text-sm font-semibold text-gray-700"
              >
                <User className="h-4 w-4 mr-2 text-blue-500" />
                Nama Petugas
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.nama ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Masukkan nama petugas"
              />
              {errors.nama && (
                <p className="text-sm text-red-500 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.nama}
                </p>
              )}
            </div>

            {/* Email Petugas */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center text-sm font-semibold text-gray-700"
              >
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                Email Petugas
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Masukkan email petugas (untuk notifikasi)"
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              💾 {user ? "Update Petugas" : "Simpan Petugas"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              ❌ Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
