import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Dashboard.css';
import LoadingPage from '../components/Loading';

const DashboardSummary = () => {
  const [data, setData] = useState(null);
  const [type, setType] = useState('monthly');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire('Unauthorized', 'Please login first', 'warning');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      const params = { type };
      if (type === 'custom') {
        if (!fromDate || !toDate) {
          setLoading(false);
          return;
        }
        params.from = fromDate;
        params.to = toDate;
      }

      const res = await axios.get(`${API}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Session expired', 'Please login again', 'error');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, fromDate, toDate]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="dash-summary__container">
      <h1 className="dash-summary__title">Temple Dashboard</h1>

      <div className="dash-summary__filter">
        <label>
          View:&nbsp;
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="daily">Today</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        {type === 'custom' && (
          <div className="dash-summary__custom-date">
            <label>
              From:{' '}
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </label>
            &nbsp;
            <label>
              To:{' '}
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </label>
          </div>
        )}
      </div>

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
