import React, { useState, useEffect, useCallback } from "react";
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching staff data...");

      const response = await staffService.getAll();
      console.log("Staff response:", response);

      if (response.status === 200 && response.data) {
        // Ensure data is an array and map to User interface
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

        console.log("Setting user data (sorted by ID):", userData);
        setUsers(userData);
      } else {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error fetching staff members:", error);
      setError("Gagal memuat data petugas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setIsFormOpen(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }, []);

  const handleDeleteUser = useCallback(
    async (userId: number) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus petugas ini?")) {
        try {
          await staffService.delete(userId.toString());
          await fetchUsers();
          alert("Petugas berhasil dihapus");
        } catch (error) {
          console.error("Error deleting staff:", error);
          alert("Gagal menghapus petugas");
        }
      }
    },
    [fetchUsers]
  );

  const handleSaveUser = useCallback(
    async (userData: Omit<User, "id">) => {
      try {
        if (selectedUser) {
          await staffService.update(selectedUser.id.toString(), userData);
          alert("Petugas berhasil diperbarui");
        } else {
          await staffService.create(userData);
          alert("Petugas berhasil ditambahkan");
        }
        await fetchUsers();
      } catch (error) {
        console.error("Error saving staff:", error);
        alert("Gagal menyimpan data petugas");
      }
      setIsFormOpen(false);
      setSelectedUser(null);
    },
    [selectedUser, fetchUsers]
  );

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedUser(null);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Memuat data petugas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="mb-4 text-red-600">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Petugas</h1>
            <p className="text-gray-600">Kelola data petugas sistem</p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Petugas
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
          <div className="p-4 text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center">
              <Users className="w-8 h-8 mr-3" />
              <div>
                <p className="text-blue-100">Total Petugas</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-600">
            <div className="flex items-center">
              <Users className="w-8 h-8 mr-3" />
              <div>
                <p className="text-green-100">Admin</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 text-white rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center">
              <Users className="w-8 h-8 mr-3" />
              <div>
                <p className="text-orange-100">Staff</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "staff").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data petugas
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nama}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1 mr-3 text-blue-600 transition-colors rounded hover:text-blue-900"
                        title="Edit petugas"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-red-600 transition-colors rounded hover:text-red-900"
                        title="Hapus petugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Form Modal */}
      {isFormOpen && (
        <StaffForm
          user={selectedUser}
          onSave={handleSaveUser}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default StaffList;
