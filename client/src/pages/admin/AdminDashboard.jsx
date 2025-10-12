import axios from "axios";
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const statFetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:3000/api/admin/dashboardata",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data.Data);
        console.log("fetched Data:", res.data.Data);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    statFetch();
  }, [token]);

  // loading
  if (loading) {
    return (
      <div className="flex md:h-[500px] items-center justify-center">
        <CircularProgress color="success" />
      </div>
    );
  }

  const departmentData = (stats.student?.bydepartment || []).map((d) => ({
    department: d._id,
    count: d.count,
  }));
  console.log(departmentData)

  return <div></div>;
};

export default AdminDashboard;
