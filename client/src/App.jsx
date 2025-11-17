import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import VerifyOTP from "./pages/VerifyOtp";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
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
import ApproveGraceMark from "./pages/teacher/ApproveGraceMark";
import StudentLayout from "./pages/student/StudentLayout";
import OAuthSuccess from "./pages/OAuthSuccess";
import { SocketProvider } from "./context/SocketContext";
import SocketTest from "./components/SocketTest";
import ChatPage from "./pages/coordinator/Chat/ChatPage";
import TeacherChatPage from "./pages/teacher/Chat/TeacherChatPage";
import StudentMyEvents from "./pages/student/StudentMyEvents";
import MyProfile from "./pages/student/MyProfile";
import StudentChatPage from "./pages/student/Chat/StudentChatPage";
import StudentCertificate from "./pages/student/StudentCertificate";
import StudentAttendance from "./pages/student/StudentAttendance";
import AdminProfile from "./pages/admin/AdminProfile";
import CoordinatorMyProfile from "./pages/coordinator/CoordinatorMyProfile";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import GetAllPendingAlumni from "./pages/admin/GetAllPendingAlumni";
import AlumniLayout from "./pages/Alumni/AlumniLayout";
import AllAlumni from "./pages/admin/AllAlumni";
import AlumniDashboard from "./pages/Alumni/AlumniDashboard";
import AlumniProfile from "./pages/Alumni/AlumniProfile";
import TeacherAnnouncement from "./pages/teacher/TeacherAnnouncement";
import StudentAnnouncement from "./pages/student/StudentAnnouncement";
import Testimonials from "./pages/Alumni/AlumniTestimonials";
import AlumniTestimonials from "./pages/Alumni/AlumniTestimonials";
import ManageTestimonials from "./pages/admin/ManageTestimonials";
import Donation from "./pages/Alumni/Donation";
import ManageDonation from "./pages/coordinator/ManageDonation";
import SuccessDonation from "./pages/Alumni/SuccessDonation";
import MentorshipRequest from "./pages/student/MentorshipRequest";
import MentorshipAlumni from "./pages/Alumni/ManageMentorshipAlumni";

const App = () => {
  return (
    <>
      <SocketProvider>
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/success" element={<OAuthSuccess />} />
          <Route path="/verifyotp" element={<VerifyOTP />} />
          {/* <Route path="/testmessage" element={<SocketTest />} /> */}

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
            <Route path="pendingalumni" element={<GetAllPendingAlumni />} />
            <Route
              path="pendingcoordinator"
              element={<GetAllPendingCoordinator />}
            />
            <Route path="allstudent" element={<AllStudent />} />
            <Route path="allalumni" element={<AllAlumni />} />
            <Route path="allteachers" element={<AllTeacher />} />
            <Route path="testimonials" element={<ManageTestimonials />} />
            <Route path="allcoordinators" element={<AllCoordinators />} />
            <Route path="createinstitution" element={<CreateInstitution />} />
            <Route path="manageinstitute" element={<ManageInstitute />} />
            <Route path="adminprofile" element={<AdminProfile />} />
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
            <Route path="chat" element={<ChatPage />} />
            <Route path="ManageDonation" element={<ManageDonation />} />
            <Route
              path="coordinatormyprofile"
              element={<CoordinatorMyProfile />}
            />
          </Route>

          <Route path="/teacherLayout" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="myeventsteacher" element={<MyEventsTeacher />} />
            <Route
              path="attendanceByTeacher"
              element={<AttendanceByTeacher />}
            />
            <Route path="attendancepdf" element={<GeneratePdfTeacher />} />
            <Route path="assigngracemarks" element={<AssignGraceMark />} />
            <Route
              path="approvegracebyteacher"
              element={<ApproveGraceMark />}
            />
            <Route path="teacherchat" element={<TeacherChatPage />} />
            <Route path="announcement" element={<TeacherAnnouncement />} />
            <Route path="teacherprofile" element={<TeacherProfile />} />
          </Route>
          <Route path="/studentlayout" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route
              path="/studentlayout/dashboard"
              element={<StudentDashboard />}
            />
            <Route path="studentevents" element={<StudentMyEvents />} />
            <Route path="studentprofile" element={<MyProfile />} />
            <Route path="certificates" element={<StudentCertificate />} />
            <Route path="chatstudent" element={<StudentChatPage />} />
            <Route path="studentattendance" element={<StudentAttendance />} />
            <Route path="mentorshiprequestbyvolunteer" element={<MentorshipRequest />} />
            <Route path="announcement" element={<StudentAnnouncement />} />
          </Route>
          <Route path="/alumnilayout" element={<AlumniLayout />}>
            <Route index element={<AlumniDashboard />} />
            <Route path="/alumnilayout/dashboard" element={<AlumniDashboard />} />
            <Route path="/alumnilayout/alumniprofile" element={<AlumniProfile />} />
            <Route path="/alumnilayout/testimonials" element={<AlumniTestimonials />} />
            <Route path="/alumnilayout/donations" element={<Donation />} />
            <Route path="/alumnilayout/managementorship" element={<MentorshipAlumni />} />
            <Route path="/alumnilayout/success-donation" element={<SuccessDonation />} />
          </Route>
        </Routes>
      </SocketProvider>
    </>
  );
};

export default App;
