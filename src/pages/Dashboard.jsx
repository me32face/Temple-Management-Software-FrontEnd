import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Dashboard.css';
import LoadingPage from '../components/Loading';

const DashboardSummary = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire('Unauthorized', 'Please login first', 'warning');
      navigate('/login');
      return;
    }

    axios.get(`${API}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data))
    .catch(err => {
      console.error(err);
      Swal.fire('Session expired', 'Please login again', 'error');
      localStorage.removeItem('token');
      navigate('/login');
    });
  }, [navigate, API]);

  if (!data) {
    return <LoadingPage />;
  }

  return (
    <div className="dash-summary__container">
      <h1 className="dash-summary__title">Temple Dashboard</h1>
      <div className="dash-summary__grid">
        <div className="dash-summary__card">
          <h2>Donations</h2>
          <p>₹ {data.donationTotal}</p>
        </div>
        <div className="dash-summary__card">
          <h2>Poojas</h2>
          <p>₹ {data.poojaTotal}</p>
        </div>
        <div className="dash-summary__card">
          <h2>Total Income</h2>
          <p>₹ {data.totalIncome}</p>
        </div>
        <div className="dash-summary__card">
          <h2>Expenses</h2>
          <p>₹ {data.expenseTotal}</p>
        </div>
        <div className="dash-summary__card">
          <h2>Devotees</h2>
          <p>{data.devoteeCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
