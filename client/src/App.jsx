import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOtp";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import { AdminCreateEvent } from "./pages/admin/AdminCreateEvent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verifyotp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminpanel" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="admincreateevent" element={<AdminCreateEvent />} />
        </Route>
        <Route path="/studentdashboard" element={<StudentDashboard />} />
      </Routes>
    </>
  );
};

export default App;
