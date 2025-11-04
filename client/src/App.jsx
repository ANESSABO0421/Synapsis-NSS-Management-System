import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import VerifyOTP from "./pages/VerifyOtp";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GetAllPendingStudent from "./pages/admin/GetAllPendingStudent";
import TeacherSignup from "./pages/Signup/TeacherSignup";
import CoordinatorSignup from "./pages/Signup/CoordinatorSignup";
import AlumniSignup from "./pages/Signup/AlumniSignup";
import GetAllPendingTeacher from "./pages/admin/GetAllPendingTeacher";
import GetAllPendingCoordinator from "./pages/admin/GetAllPendingCoordinator";
import AllStudent from "./pages/admin/AllStudent";
import AllTeacher from "./pages/admin/AllTeacher";
import CoordinatorLayout from "./pages/coordinator/CoordinatorLayout";
import AllCoordinators from "./pages/admin/AllCoordinators";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CreateEvent from "./pages/coordinator/CreateEvent";
import CreateInstitution from "./pages/admin/CreateInstitution";
import ManageInstitute from "./pages/admin/ManageInstitute";
import ManageStudents from "./pages/coordinator/ManageStudents";
import MyEvents from "./pages/coordinator/MyEvents";
import ManageTeacher from "./pages/coordinator/ManageTeacher";
import ManageVolunteers from "./pages/coordinator/ManageVolunteers";
import EventReportGenerator from "./pages/coordinator/EventReportGenerator";
import RecommendGraceMark from "./pages/coordinator/RecommendGraceMark";
import TeacherLayout from "./pages/teacher/teacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyEventsTeacher from "./pages/teacher/MyEventsTeacher";
import AttendanceByTeacher from "./pages/teacher/AttendanceByTeacher";
import GeneratePdfTeacher from "./pages/teacher/GeneratePdfTeacher";
import AssignGraceMark from "./pages/teacher/AssignGraceMark";

const App = () => {
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verifyotp" element={<VerifyOTP />} />

        {/* login */}
        <Route path="/login" element={<Login />} />

        {/* signup */}
        <Route path="/signup/student" element={<Signup />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/signup/coordinator" element={<CoordinatorSignup />} />
        <Route path="/signup/alumni" element={<AlumniSignup />} />

        {/* admin dashboard */}
        <Route path="/adminpanel" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pendingstudent" element={<GetAllPendingStudent />} />
          <Route path="pendingteacher" element={<GetAllPendingTeacher />} />
          <Route
            path="pendingcoordinator"
            element={<GetAllPendingCoordinator />}
          />
          <Route path="allstudent" element={<AllStudent />} />
          <Route path="allteachers" element={<AllTeacher />} />
          <Route path="allcoordinators" element={<AllCoordinators />} />
          <Route path="createinstitution" element={<CreateInstitution />} />
          <Route path="manageinstitute" element={<ManageInstitute />} />
        </Route>

        {/* coordinator dashboard */}
        <Route path="/coordinatorlayout" element={<CoordinatorLayout />}>
          <Route index element={<CoordinatorDashboard />} />
          <Route path="createevent" element={<CreateEvent />} />
          <Route path="managestudents" element={<ManageStudents />} />
          <Route path="myevents" element={<MyEvents />} />
          <Route path="manageteacher" element={<ManageTeacher />} />
          <Route path="managevolunteer" element={<ManageVolunteers />} />
          <Route path="eventreport" element={<EventReportGenerator />} />
          <Route path="recommendgracemark" element={<RecommendGraceMark />} />
        </Route>

        <Route path="/teacherLayout" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="myeventsteacher" element={<MyEventsTeacher />} />
          <Route path="attendanceByTeacher" element={<AttendanceByTeacher />} />
          <Route path="attendancepdf" element={<GeneratePdfTeacher />} />
          <Route path="assigngracemarks" element={<AssignGraceMark />} />
        </Route>
        <Route path="/studentdashboard" element={<StudentDashboard />} />
      </Routes>
    </>
  );
};

export default App;
