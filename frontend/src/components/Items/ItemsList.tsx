import React, { useState, useEffect } from "react";
import { itemsService, Item } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const ItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { showSuccess, showError } = useToast();

  // Form state
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Items</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Tambah Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit Item" : "Tambah Item"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konten
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar
                </label>
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingItem ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {item.image && (
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={`http://localhost:3001/uploads/${item.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {item.content}
              </p>

              <div className="text-xs text-gray-500 mb-3">
                <p>
                  Dibuat:{" "}
                  {new Date(item.createdDtm).toLocaleDateString("id-ID")}
                </p>
                {item.createdByName && <p>Oleh: {item.createdByName}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.itemId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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
        <div className="text-center py-12">
          <span className="text-4xl text-gray-400 mb-4 block">📷</span>
          <p className="text-gray-500">Belum ada item yang ditambahkan</p>
        </div>
      )}
    </div>
  );
};

export default ItemsList;
