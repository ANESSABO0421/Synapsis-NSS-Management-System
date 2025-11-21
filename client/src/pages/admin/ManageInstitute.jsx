import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <div className="p-4 sm:p-6 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#008236] tracking-wide">
            Manage Institutions
          </h2>
        </div>

        {/* ============== DESKTOP TABLE ============== */}
        {loading ? (
          <p className="text-gray-400">Loading institutions...</p>
        ) : institutions.length === 0 ? (
          <p className="text-gray-400">No institutions found.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-green-900/40 shadow-lg">
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
                          className="text-green-500 hover:text-green-400"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(inst._id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ============== MOBILE CARDS ============== */}
            <div className="md:hidden grid gap-4 mt-4">
              {institutions.map((inst, idx) => (
                <motion.div
                  key={inst._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow border border-green-600/20"
                >
                  <h3 className="text-lg font-bold text-[#008236]">
                    {inst.name}
                  </h3>

                  <div className="mt-2 text-black space-y-1 text-sm">
                    <p>
                      <b>Address:</b> {inst.address}
                    </p>
                    <p>
                      <b>Email:</b> {inst.contactEmail}
                    </p>
                    <p>
                      <b>Phone:</b> {inst.phoneNumber}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => openEdit(inst)}
                      className="text-green-600 text-sm flex items-center gap-1"
                    >
                      <FiEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(inst._id)}
                      className="text-red-600 text-sm flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ============== MODAL ============== */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white border border-green-800 p-6 rounded-2xl w-full max-w-md shadow-2xl"
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
                    className="p-3 rounded-lg bg-white text-black border border-green-800 focus:ring-2 focus:ring-green-500"
                    required
                  />

                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black border border-green-800 focus:ring-2 focus:ring-green-500"
                  />

                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="Contact Email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black border border-green-800 focus:ring-2 focus:ring-green-500"
                    required
                  />

                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="p-3 rounded-lg bg-white text-black border border-green-800 focus:ring-2 focus:ring-green-500"
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
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
