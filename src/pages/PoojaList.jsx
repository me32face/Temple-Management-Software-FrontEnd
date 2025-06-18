import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/PoojaList.css'; // Import the CSS

const PoojaList = () => {
  const [poojas, setPoojas] = useState([]);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/api/poojas`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setPoojas(res.data);
    })
    .catch(err => {
      Swal.fire('Error', err.response?.data?.msg || 'Failed to fetch poojas', 'error');
    });
  }, []);

  return (
    <div className="pooja-list-container">
      <h2 className="pooja-list-title">All Poojas</h2>
      <table className="pooja-list-table">
        <thead>
          <tr>
            <th>Receipt No</th>
            <th>Pooja Name</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Devotees</th>
          </tr>
        </thead>
        <tbody>
          {poojas.map((p) => (
            <tr key={p._id}>
              <td>{p.receiptNumber}</td>
              <td>{p.poojaName}</td>
              <td>{new Date(p.date).toLocaleDateString()}</td>
              <td>₹{p.amount}</td>
              <td>{p.paymentMethod}</td>
              <td>
                {p.devotees.map((d, idx) => (
                  <div key={idx} className="pooja-list-devotee">
                    {d.name} ({d.nakshathra})
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PoojaList;
