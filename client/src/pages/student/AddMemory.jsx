import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AddMemoryPremium = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const dropRef = useRef();
  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/students/my-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data?.events || []);
    } catch {
      toast.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setImages(arr);
    setPreviewImages(arr.map((f) => URL.createObjectURL(f)));
  };

  const onFileInput = (e) => handleFiles(e.target.files);
  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => e.preventDefault();

  const uploadImages = async () => {
    if (!selectedEvent) return toast.error("Select event first");
    if (images.length === 0) return toast.error("Select at least one image");

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    try {
      await axios.post(
        `http://localhost:3000/api/students/${selectedEvent._id}/uploadimagesbystudent`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Images uploaded!");
      setImages([]);
      setPreviewImages([]);
      setOpenUploadModal(false);
      fetchEvents();
    } catch {
      toast.error("Upload failed");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openEvent = (event) => {
    setSelectedEvent(event);
    setOpenEventModal(true);
  };

  const openUpload = (event) => {
    setSelectedEvent(event);
    setOpenUploadModal(true);
  };

  const closeEvent = () => setOpenEventModal(false);
  const closeUpload = () => setOpenUploadModal(false);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const nextLightbox = () =>
    setLightboxIndex((i) => (i === selectedEvent.images.length - 1 ? 0 : i + 1));

  const prevLightbox = () =>
    setLightboxIndex((i) => (i === 0 ? selectedEvent.images.length - 1 : i - 1));

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-200 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-600">
        Add Event Memories
      </h2>

      {/* EVENT LIST */}
      <div className="space-y-6 sm:space-y-8">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-xl bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-2xl transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">{event.title}</h3>

                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Date:</span> {formatDate(event.date)}
                </p>

                <div className="text-sm text-gray-700 mt-3 space-y-1">
                  <p><span className="font-semibold">Location:</span> {event.location}</p>
                  <p><span className="font-semibold">Hours:</span> {event.hours}</p>
                  <p><span className="font-semibold">Institution:</span> {event.institution?.name}</p>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 w-full sm:w-auto"
                    onClick={() => openUpload(event)}
                  >
                    Upload Images
                  </button>

                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 w-full sm:w-auto"
                    onClick={() => openEvent(event)}
                  >
                    View Memories
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  🖼 {event.images?.length || 0} memories
                </p>
              </div>

              {/* PREVIEW GRID */}
              <div className="hidden md:block w-40 sm:w-44">
                {event.images?.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {event.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        className="h-20 w-full object-cover rounded-xl shadow"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    No images
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {openUploadModal && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closeUpload}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Upload Images — {selectedEvent.title}
                </h2>

                <button
                  className="px-3 py-1 bg-gray-100 rounded-lg"
                  onClick={closeUpload}
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Upload Area */}
                <div className="flex-1">
                  <div
                    ref={dropRef}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-xl h-52 sm:h-64 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <p className="text-lg">Drag & Drop Images Here</p>
                    <p className="text-sm mt-1">or click below</p>

                    <input type="file" multiple onChange={onFileInput} className="mt-3" />
                  </div>

                  {/* Preview */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {previewImages.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={src}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow"
                        />

                        <button
                          onClick={() => {
                            setPreviewImages((p) => p.filter((_, i) => i !== idx));
                            setImages((p) => p.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadImages}
                    className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
                  >
                    Upload
                  </button>
                </div>

                {/* Side Info */}
                <div className="w-full md:w-80 p-4 bg-gray-50 rounded-xl border">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h3>

                  <p className="text-xs text-gray-500">{formatDate(selectedEvent.date)}</p>

                  <p className="mt-3 text-sm text-gray-700">
                    <span className="font-semibold">Location:</span> {selectedEvent.location}
                  </p>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Hours:</span> {selectedEvent.hours}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {selectedEvent.images?.length || 0} existing images
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW MEMORIES MODAL */}
      <AnimatePresence>
        {openEventModal && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closeEvent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">{formatDate(selectedEvent.date)}</p>
                </div>

                <button
                  className="px-3 py-1 bg-gray-200 rounded-lg"
                  onClick={closeEvent}
                >
                  Close
                </button>
              </div>

              <div className="p-4">
                {selectedEvent.images?.length ? (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {selectedEvent.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="break-inside-avoid rounded-xl overflow-hidden shadow cursor-pointer group"
                        onClick={() => openLightbox(idx)}
                      >
                        <img
                          src={img.url}
                          className="w-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">No memories yet</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[999] flex items-center justify-center p-6"
            onClick={closeLightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl sm:max-w-5xl w-full"
            >
              <img
                src={selectedEvent.images[lightboxIndex].url}
                className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />

              {/* Prev */}
              <button
                onClick={prevLightbox}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white w-10 sm:w-12 h-10 sm:h-12 rounded-full backdrop-blur-xl text-2xl sm:text-3xl flex items-center justify-center"
              >
                ‹
              </button>

              {/* Next */}
              <button
                onClick={nextLightbox}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white w-10 sm:w-12 h-10 sm:h-12 rounded-full backdrop-blur-xl text-2xl sm:text-3xl flex items-center justify-center"
              >
                ›
              </button>

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute right-4 top-4 px-3 sm:px-4 py-2 bg-white/20 text-white rounded-full backdrop-blur-xl"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddMemoryPremium;
