import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, PaintRoller, UserCheck } from "lucide-react";
import { User as UserType } from "../../types";
import { ROLES } from "../../constants/roles";

interface StaffFormProps {
  user: UserType | null;
  onSave: (
    userData: Omit<UserType, "id" | "created_at" | "updated_at"> & {
      email?: string;
      telp?: string;
    },
  ) => void;
  onCancel: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    username: "",
    role: "",
    telp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || "",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "",
        telp: user.telp || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.role.trim()) newErrors.role = "Role wajib dipilih";

    if (formData.email) {
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
    if (!validateForm()) return;

    onSave({
      nama: formData.nama,
      role: formData.role,
      username: formData.username.toLowerCase().replace(/\s+/g, ""),
      email: formData.email || undefined,
      telp: formData.telp || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-5">
      <div className="w-full sm:max-w-lg bg-white sm:rounded-xl shadow-2xl h-[95vh] sm:h-auto overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:p-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <h2 className="text-base sm:text-xl font-bold text-white">
              {user ? "Edit Petugas" : "Tambah Petugas"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 p-1 rounded-lg"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-4 py-4 sm:p-6"
        >
          <div className="space-y-4">
            {/* Nama */}
            <FormInput
              label="Nama Petugas"
              icon={<User size={16} />}
              value={formData.nama}
              error={errors.nama}
              onChange={(v: string) => setFormData({ ...formData, nama: v })}
              placeholder="Nama petugas"
            />

            {/* Email */}
            <FormInput
              label="Email"
              icon={<Mail size={16} />}
              value={formData.email}
              error={errors.email}
              onChange={(v: string) => setFormData({ ...formData, email: v })}
              placeholder="Email (opsional)"
              type="email"
            />

            {/* Username */}
            <FormInput
              label="Username"
              icon={<UserCheck size={16} />}
              value={formData.username}
              onChange={(v: string) =>
                setFormData({ ...formData, username: v })
              }
              placeholder="Username"
            />

            {/* Role */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <PaintRoller size={16} className="text-blue-500" />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                  errors.role ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              >
                <option value="">Pilih Role</option>
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.MANAGER}>Manager</option>
                <option value={ROLES.AST_MANAGER}>Asisten Manager</option>
                <option value={ROLES.ENGINEER}>Engineer</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role}</p>
              )}
            </div>

            {/* Telp */}
            <FormInput
              label="No. Telepon"
              icon={<Phone size={16} />}
              value={formData.telp}
              onChange={(v: string) => setFormData({ ...formData, telp: v })}
              placeholder="08xxxxxxxx"
              type="number"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold active:scale-95"
            >
              {user ? "Update" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold active:scale-95"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Reusable Input */
const FormInput = ({
  label,
  icon,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: any) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <span className="text-blue-500">{icon}</span>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default StaffForm;
