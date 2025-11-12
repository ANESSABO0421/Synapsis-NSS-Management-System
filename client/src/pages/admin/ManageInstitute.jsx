import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ManageInstitute = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    contactEmail: "",
    phoneNumber: "",
  });

  const token = localStorage.getItem("token");

  // Fetch Institutions
  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:3000/api/institution/allinstitutebyadmin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInstitutions(data.institutions || []);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await axios.put(
          `http://localhost:3000/api/institution/${editData._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/institution/create",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setModalOpen(false);
      setEditData(null);
      setForm({ name: "", address: "", contactEmail: "", phoneNumber: "" });
      fetchInstitutions();
    } catch (error) {
      console.error("Error saving institution:", error);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this institution?"))
      return;
    try {
      await axios.delete(`http://localhost:3000/api/institution/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInstitutions();
    } catch (error) {
      console.error("Error deleting institution:", error);
    }
  };

  const openEdit = (inst) => {
    setEditData(inst);
    setForm({
      name: inst.name,
      address: inst.address,
      contactEmail: inst.contactEmail,
      phoneNumber: inst.phoneNumber,
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditData(null);
    setForm({ name: "", address: "", contactEmail: "", phoneNumber: "" });
    setModalOpen(true);
  };

  return (
    <div className="p-6 min-h-screen  text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-[#008236] tracking-wide">
            Manage Institutions
          </h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 text-white"
          >
            <FiPlus /> Add Institution
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-400">Loading institutions...</p>
        ) : institutions.length === 0 ? (
          <p className="text-gray-400">No institutions found.</p>
        ) : (
          <div className="overflow-x-auto  rounded-xl border border-green-900/40 shadow-lg">
            <table className="min-w-full text-left">
              <thead className="bg-[#008236] text-white uppercase text-sm">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst, idx) => (
                  <motion.tr
                    key={inst._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-green-800/40 hover:bg-green-900/10 transition-all"
                  >
                    <td className="px-6 py-3 font-semibold text-black">
                      {inst.name}
                    </td>
                    <td className="px-6 py-3 text-black">{inst.address}</td>
                    <td className="px-6 py-3 text-black">
                      {inst.contactEmail}
                    </td>
                    <td className="px-6 py-3 text-black">
                      {inst.phoneNumber}
                    </td>
                    <td className="px-6 py-3 flex justify-center gap-4">
                      <button
                        onClick={() => openEdit(inst)}
                        className="text-green-400 hover:text-green-300 transition"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(inst._id)}
                        className="text-red-500 hover:text-red-400 transition"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white border border-green-800 p-6 rounded-2xl w-[400px] shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="text-2xl font-semibold text-center mb-4 text-green-500">
                  {editData ? "Edit Institution" : "Add Institution"}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Institution Name"
                    value={form.name}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black outline-none border border-green-800 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black outline-none border border-green-800 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="Contact Email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black outline-none border border-green-800 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black outline-none border border-green-800 focus:ring-2 focus:ring-green-500"
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition"
                    >
                      {editData ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageInstitute;
