import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import MaintenanceEmailService from "../../services/maintenanceEmailService";

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      const currentEmails = MaintenanceEmailService.getMaintenanceEmails();
      setEmails([...currentEmails]);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      return;
    }

    if (!validateEmail(newEmail)) {
      alert("Format email tidak valid!");
      return;
    }

    if (emails.includes(newEmail)) {
      alert("Email sudah ada dalam daftar!");
      return;
    }

    setEmails([...emails, newEmail]);
    setNewEmail("");
  };

  const handleRemoveEmail = (index: number) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    setEmails(updatedEmails);
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);


    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    const newErrors: Record<number, string> = {};
    let hasErrors = false;

    emails.forEach((email, index) => {
      if (!email.trim()) {
        newErrors[index] = "Email tidak boleh kosong";
        hasErrors = true;
      } else if (!validateEmail(email)) {
        newErrors[index] = "Format email tidak valid";
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }


    const validEmails = emails.filter((email) => email.trim());

    alert(
      `✅ Email maintenance berhasil disimpan!\n${validEmails.length} email tersimpan.\n\n📧 Email akan dikirim SEKALI SAJA untuk setiap equipment dengan status kuning/merah.`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Pengaturan Email Maintenance
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <p className="mb-4 text-sm text-gray-600">
              Email-email berikut akan menerima notifikasi otomatis untuk
              maintenance alat:
            </p>

            {/* Add new email section */}
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Tambah email baru..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
              />
              <button
                onClick={handleAddEmail}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                Tambah
              </button>
            </div>

            {/* Email list */}
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[index] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="email@company.com"
                  />
                  <button
                    onClick={() => handleRemoveEmail(index)}
                    className="p-2 text-red-600 transition-colors hover:text-red-700"
                    title="Hapus email"
                  >
                    <Trash2 size={16} />
                  </button>
                  {errors[index] && (
                    <div className="absolute mt-12 text-xs text-red-500">
                      {errors[index]}
                    </div>
                  )}
                </div>
              ))}

              {emails.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <p>Belum ada email terdaftar</p>
                  <p className="text-sm">
                    Tambahkan email untuk menerima notifikasi maintenance
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-md bg-green-50">
            <h3 className="mb-2 font-medium text-green-900">
              ✅ Logika Email Baru:
            </h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>
                • <strong>SEKALI KIRIM SAJA</strong> - Email hanya dikirim 1x
                untuk setiap equipment
              </li>
              <li>
                • <strong>PERSISTENT</strong> - Tidak akan kirim lagi meskipun
                reload website
              </li>
              <li>
                • <strong>NO SPAM</strong> - Sistem ingat equipment mana yang
                sudah dikirim email
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-md bg-blue-50">
            <h3 className="mb-2 font-medium text-blue-900">ℹ️ Cara Kerja:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>
                • Email dikirim otomatis ketika equipment pertama kali berstatus
                kuning/merah
              </li>
              <li>• Status kuning: email peringatan (warning)</li>
              <li>• Status merah: email urgent</li>
              <li>
                • Setelah dikirim, email tidak akan dikirim lagi untuk equipment
                yang sama
              </li>
              <li>• Data tersimpan permanent di localStorage browser</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Save size={16} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsModal;
