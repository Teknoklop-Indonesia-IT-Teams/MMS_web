import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users, AlertCircle } from "lucide-react";
import { User } from "../../types";
import { staffService } from "../../services/api";
import StaffForm from "./StaffForm";

interface StaffResponse {
  id: number;
  nama?: string;
  petugas?: string;
  role?: string;
  username?: string;
}

const StaffList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false); // Flag to prevent multiple loads

  useEffect(() => {
    // Prevent multiple calls
    if (hasLoaded) return;

    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await staffService.getAll();

        if (!isMounted) return;

        if (response.status === 200) {
          // Ensure data is an array and map to User interface
          const staffData = Array.isArray(response.data) ? response.data : [];
          const userData: User[] = (
            staffData as unknown as StaffResponse[]
          ).map((staff: StaffResponse) => ({
            id: staff.id,
            nama: staff.nama || staff.petugas || "",
            petugas: staff.petugas || staff.nama || "",
            role: staff.role || "staff",
            username: staff.username || staff.nama || staff.petugas || "",
          }));

          // Sort by ID in ascending order
          userData.sort((a, b) => a.id - b.id);
          setUsers(userData);
          setHasLoaded(true);
        } else {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText || "Unknown error"}`
          );
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching staff members:", error);
        setError("Gagal memuat data petugas");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [hasLoaded]); // Only depend on hasLoaded flag

  const refreshUsers = async () => {
    try {
      const response = await staffService.getAll();
      if (response.status === 200) {
        const staffData = Array.isArray(response.data) ? response.data : [];
        const userData: User[] = (staffData as unknown as StaffResponse[]).map(
          (staff: StaffResponse) => ({
            id: staff.id,
            nama: staff.nama || staff.petugas || "",
            petugas: staff.petugas || staff.nama || "",
            role: staff.role || "staff",
            username: staff.username || staff.nama || staff.petugas || "",
          })
        );

        // Sort by ID in ascending order
        userData.sort((a, b) => a.id - b.id);

        setUsers(userData);
      }
    } catch (error) {
      console.error("Error refreshing staff members:", error);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus petugas ini?")) {
      try {
        await staffService.delete(userId.toString());
        await refreshUsers();
        alert("Petugas berhasil dihapus");
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Gagal menghapus petugas");
      }
    }
  };

  const handleSaveUser = async (userData: Omit<User, "id">) => {
    try {
      if (selectedUser) {
        await staffService.update(selectedUser.id.toString(), userData);
        alert("Petugas berhasil diperbarui");
      } else {
        await staffService.create(userData);
        alert("Petugas berhasil ditambahkan");
      }
      await refreshUsers();
    } catch (error) {
      console.error("Error saving staff:", error);
      alert("Gagal menyimpan data petugas");
    }
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Memuat data petugas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manajemen Petugas
            </h1>
            <p className="text-gray-600">
              Kelola data petugas sistem monitoring
            </p>
          </div>
        </div>

        <button
          onClick={handleAddUser}
          className="flex items-center px-6 py-3 space-x-2 text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:scale-105"
        >
          <Plus size={20} />
          <span className="font-semibold">Tambah Petugas</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Petugas</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Petugas Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {users.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Role Tersedia</p>
              <p className="text-2xl font-bold text-purple-600">4</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Terjadi Kesalahan</p>
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={refreshUsers}
              className="px-4 py-2 ml-auto text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-md rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Petugas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  No
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Nama Petugas
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                  Username
                </th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Users className="w-16 h-16 text-gray-300" />
                      <p className="text-lg font-medium text-gray-500">
                        Belum ada data petugas
                      </p>
                      <p className="text-gray-400">
                        Klik tombol "Tambah Petugas" untuk menambahkan petugas
                        baru
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <span className="text-sm font-semibold text-blue-600">
                              {(user.nama ||
                                user.petugas ||
                                "?")[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.nama || user.petugas || "Nama tidak tersedia"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                        {user.role || "staff"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {user.username || user.nama || user.petugas || "-"}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-white transition-all duration-200 transform rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105"
                          title="Edit Petugas"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-white transition-all duration-200 transform rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105"
                          title="Hapus Petugas"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <StaffForm
          user={selectedUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default StaffList;
