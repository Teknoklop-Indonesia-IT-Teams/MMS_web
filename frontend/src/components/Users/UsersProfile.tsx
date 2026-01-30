import React, { useState, useEffect } from "react";
import { usersService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { User2, Key, Save, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/apiSimple";

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Form state for profile
  const [formData, setFormData] = useState({
    email: "",
    nama: "",
    username: "",
    telp: "",
    role: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.status === 200) {
        setFormData({
          email: response.data.email || "",
          nama: response.data.nama || "",
          username: response.data.username || "",
          telp: response.data.telp || "",
          role: response.data.role || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authService.updateProfile(formData);

      if (response.status === 200) {
        showSuccess("Profile berhasil diperbarui");
        setIsEditing(false);
        setShowAlert(true);

        updateUser(formData);

        await fetchCurrentUser();
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
    } catch (error) {
      showError("Gagal memperbarui profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Password baru dan konfirmasi password tidak sama");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("Password baru minimal 6 karakter");
      return;
    }

    try {
      const response = await authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === 200) {
        showSuccess("Password berhasil diubah");
        setShowPasswordModal(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showError("Gagal mengubah password. Periksa password lama Anda.");
    }
  };

  const resetPasswordForm = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl text-gray-400 mb-4 block">👤</span>
        <p className="text-gray-500">User tidak ditemukan</p>
        <p className="text-sm text-gray-400 mt-2">Silakan login kembali</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <User2 size={40} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Saya
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola informasi profile dan keamanan akun Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-blue-500 dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Informasi Profile
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        email: user.email || "",
                        nama: user.nama || "",
                        username: user.username || "",
                        telp: user.telp || "",
                        role: user.role || "",
                      });
                    }}
                    className="px-4 py-2 text-sm text-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleProfileSubmit}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={16} />
                    Simpan
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.nama?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama Lengkap"
                      />
                      <p className="text-sm text-white dark:text-gray-400">
                        Nama Anda akan ditampilkan di aplikasi
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-white">
                        {user.nama || "Nama tidak tersedia"}
                      </h3>
                      <p className="text-sm text-white dark:text-gray-300">
                        {user.email}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <hr className="my-4" />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white dark:text-gray-300 mb-1">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <p className="text-white">{user.username || "-"}</p>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white dark:text-gray-300 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <p className="text-white">{user.email || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white dark:text-gray-300 mb-1">
                    Nomor Telepon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telp}
                      onChange={(e) =>
                        setFormData({ ...formData, telp: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0812-3456-7890"
                    />
                  ) : (
                    <p className="text-white">{user.telp || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <p className="text-white capitalize">{user.role || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="lg:col-span-1">
          <div className="bg-blue-500 dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Keamanan Akun
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white dark:text-gray-300 mb-2">
                  Password
                </h3>
                <p className="text-sm text-white mb-4">
                  Perbarui password Anda secara berkala untuk menjaga keamanan
                  akun
                </p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Key size={18} />
                  Ubah Password
                </button>
              </div>

              {/* Session Info (optional) */}
              {/* <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Informasi Login</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Terakhir login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : "Tidak tersedia"}</p>
                  <p>Akun dibuat: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : "Tidak tersedia"}</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ubah Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Lama
                </label>

                <input
                  type={showOld ? "text" : "password"}
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password lama"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>

                <input
                  type={showNew ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>

                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Konfirmasi password baru"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="pt-4">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      resetPasswordForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Ubah Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
