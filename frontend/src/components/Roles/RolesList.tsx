import React, { useState, useEffect } from "react";
import { rolesService, Role } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    roleName: "",
  });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesService.getAll();
      if (response.status === 200) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      showError("Gagal memuat roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRole) {
        const response = await rolesService.update(
          editingRole.roleId.toString(),
          formData
        );
        if (response.status === 200) {
          showSuccess("Role berhasil diperbarui");
        }
      } else {
        const response = await rolesService.create(formData);
        if (response.status === 201) {
          showSuccess("Role berhasil ditambahkan");
        }
      }

      resetForm();
      fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      showError("Gagal menyimpan role");
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      roleName: role.roleName,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus role ini?")) return;

    try {
      const response = await rolesService.delete(id.toString());
      if (response.status === 200) {
        showSuccess("Role berhasil dihapus");
        fetchRoles();
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      showError("Gagal menghapus role");
    }
  };

  const resetForm = () => {
    setFormData({
      roleName: "",
    });
    setEditingRole(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-32 h-32 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Roles</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <span>+</span>
          Tambah Role
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editingRole ? "Edit Role" : "Tambah Role"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nama Role
                </label>
                <input
                  type="text"
                  value={formData.roleName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Contoh: Admin, User, Manager"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingRole ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Nama Role
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Dibuat
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.roleId} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {role.roleId}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {role.roleName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(role.createdDtm).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(role.roleId)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roles.length === 0 && (
        <div className="py-12 text-center">
          <span className="block mb-4 text-4xl text-gray-400">👥</span>
          <p className="text-gray-500">Belum ada role yang ditambahkan</p>
        </div>
      )}
    </div>
  );
};

export default RolesList;
