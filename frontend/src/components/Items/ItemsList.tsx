import React, { useState, useEffect } from "react";
import { itemsService, Item } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const ItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null as File | null,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemsService.getAll();
      if (response.status === 200) {
        setItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      showError("Gagal memuat items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingItem) {
        const response = await itemsService.update(
          editingItem.itemId.toString(),
          formDataToSend
        );
        if (response.status === 200) {
          showSuccess("Item berhasil diperbarui");
        }
      } else {
        const response = await itemsService.create(formDataToSend);
        if (response.status === 201) {
          showSuccess("Item berhasil ditambahkan");
        }
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      showError("Gagal menyimpan item");
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      image: null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

    try {
      const response = await itemsService.delete(id.toString());
      if (response.status === 200) {
        showSuccess("Item berhasil dihapus");
        fetchItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showError("Gagal menghapus item");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: null,
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Items</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <span>+</span>
          Tambah Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editingItem ? "Edit Item" : "Tambah Item"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Judul
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Konten
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Gambar
                </label>
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {editingItem ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="overflow-hidden bg-white rounded-lg shadow-md"
          >
            {item.image && (
              <div className="flex items-center justify-center h-48 bg-gray-200">
                <img
                  src={`${import.meta.env.VITE_URL}/uploads/${item.image}`}
                  alt={item.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="h-48 bg-gray-200 flex items-center justify-center"><span class="text-gray-400">📷</span></div>';
                    }
                  }}
                />
              </div>
            )}

            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                {item.content}
              </p>

              <div className="mb-3 text-xs text-gray-500">
                <p>
                  Dibuat:{" "}
                  {new Date(item.createdDtm).toLocaleDateString("id-ID")}
                </p>
                {item.createdByName && <p>Oleh: {item.createdByName}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 rounded-md hover:bg-blue-50"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.itemId)}
                  className="p-2 text-red-600 rounded-md hover:bg-red-50"
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-12 text-center">
          <span className="block mb-4 text-4xl text-gray-400">📷</span>
          <p className="text-gray-500">Belum ada item yang ditambahkan</p>
        </div>
      )}
    </div>
  );
};

export default ItemsList;
