import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOtp";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verifyotp" element={<VerifyOTP />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/studentdashboard" element={<StudentDashboard />} />
    </Routes>
  );
};

export default App;
