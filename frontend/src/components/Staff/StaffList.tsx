import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { User } from "../../types";
import { staffService } from "../../services/enhancedServices";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  showConfirmationToast,
} from "../../utils/toast";
import StaffForm from "./StaffForm";
import { useAuth } from "../../hooks/useAuthSimple";
import { PERMISSIONS } from "../../constants/roles";
import { useNoEquipmentData } from "../../hooks/useLazyEquipment";

interface StaffResponse {
  id: number;
  nama?: string;
  role?: string;
  username?: string;
  email?: string;
  telp?: string;
}

const StaffList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false); // Start with false, hanya loading ketika fetch
  const [dataLoaded, setDataLoaded] = useState(false); // Track apakah data sudah dimuat
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Clear equipment data karena tidak diperlukan di halaman staff
  useNoEquipmentData();

  // Get user permissions
  const { hasAnyRole } = useAuth();
  const canManageStaff = hasAnyRole([...PERMISSIONS.DASHBOARD_FULL_ACCESS]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffService.getAll();

      if (response && response.status === 200 && response.data) {
        // Ensure data is an array and map to User interface
        const staffData = Array.isArray(response.data) ? response.data : [];

        const userData: User[] = (staffData as unknown as StaffResponse[]).map(
          (staff: StaffResponse) => ({
            id: staff.id,
            nama: staff.nama || "",
            role: staff.role || undefined || "staff",
            username: staff.username || "",
            email: staff.email || undefined,
            telp: staff.telp || undefined,
          }),
        );

        // Sort by ID in ascending order
        userData.sort((a, b) => a.id - b.id);

        setUsers(userData);
        setDataLoaded(true);
      } else {
        throw new Error(
          `HTTP ${response?.status || "Unknown"}: ${
            response?.statusText || "Unknown error"
          }`,
        );
      }
    } catch (error) {
      console.error("StaffList: Error fetching staff members:", error);
      setError(
        `Gagal memuat data petugas: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Lazy loading - hanya fetch ketika komponen mount dan data belum dimuat
  useEffect(() => {
    if (!dataLoaded) {
      fetchUsers();
    }
  }, [fetchUsers, dataLoaded]);

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
      const user = users.find((u) => u.id === userId);
      const userName = user ? user.nama : `ID ${userId}`;

      showConfirmationToast(
        `Hapus petugas ${userName}?`,
        async () => {
          const loadingToastId = showLoadingToast("Menghapus petugas...");
          try {
            await staffService.delete(userId.toString());
            await fetchUsers();
            showSuccessToast(
              "Petugas berhasil dihapus!",
              `${userName} telah dihapus dari sistem`,
            );
          } catch (error) {
            console.error("Error deleting staff:", error);
            showErrorToast(
              "Gagal menghapus petugas",
              "Terjadi kesalahan saat menghapus data petugas",
            );
          } finally {
            toast.dismiss(loadingToastId);
          }
        },
        () => {
          // User cancelled - no action needed
        },
        "Tindakan ini tidak dapat dibatalkan",
      );
    },
    [fetchUsers, users],
  );

  const handleSaveUser = useCallback(
    async (userData: Omit<User, "id"> & { email?: string }) => {
      const isEdit = !!selectedUser;
      const action = isEdit ? "memperbarui" : "menambahkan";
      const loadingToastId = showLoadingToast(`Sedang ${action} petugas...`);

      try {
        // Create data for API - backend only expects nama and email
        const apiData = {
          nama: userData.nama,
          email: userData.email || undefined,
          role: userData.role || "engineer",
          username: userData.username,
          telp: userData.telp,
        };

        if (selectedUser) {
          await staffService.update(selectedUser.id.toString(), apiData);
          showSuccessToast(
            "Petugas berhasil diperbarui!",
            `Data ${userData.nama} telah diperbarui`,
          );
        } else {
          await staffService.create(apiData);
          showSuccessToast(
            "Petugas berhasil ditambahkan!",
            `${userData.nama} telah ditambahkan ke sistem`,
          );
        }
        await fetchUsers();
      } catch (error) {
        console.error("Error saving staff:", error);
        showErrorToast(
          `Gagal ${action} petugas`,
          "Terjadi kesalahan saat menyimpan data petugas",
        );
      } finally {
        toast.dismiss(loadingToastId);
        setIsFormOpen(false);
        setSelectedUser(null);
      }
    },
    [selectedUser, fetchUsers],
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
      <div className="p-6 transition-colors duration-200 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Data Petugas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola data petugas sistem dan email untuk testing
            </p>
          </div>
          {canManageStaff && (
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Plus className="w-4 h-4" />
              Tambah Petugas
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="transition-colors duration-200 bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Nama
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Username
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Role
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Telp
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="transition-colors duration-200 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data petugas
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.nama}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {user.email || "Tidak ada email"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.telp}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                      {canManageStaff && (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 mr-3 text-blue-600 transition-colors duration-200 rounded dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
                        </>
                      )}
                      {!canManageStaff && (
                        <span className="text-xs text-gray-400">View Only</span>
                      )}
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
