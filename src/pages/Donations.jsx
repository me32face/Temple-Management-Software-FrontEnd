import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Donations.css';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    receiptNumber: '',
    donorName: '',
    donorAddress: '',
    amount: '',
    purpose: '',
    paymentMethod: 'Cash',
    paymentProof: ''
  });

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchDonations();
    fetchReceiptNumber();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${API}/api/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedDonations = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.donations)
        ? res.data.donations
        : [];

      setDonations(fetchedDonations);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load donations', 'error');
    }
  };

  const fetchReceiptNumber = async () => {
    try {
      const res = await axios.get(`${API}/api/donations/next-receipt`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData((prev) => ({
        ...prev,
        receiptNumber: res.data.receiptNumber || ''
      }));
    } catch (err) {
      console.error('Failed to fetch receipt number', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { receiptNumber, ...dataToSend } = formData;
      await axios.post(`${API}/api/donations`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Donation added', 'success');
      setFormData({
        receiptNumber: '',
        donorName: '',
        donorAddress: '',
        amount: '',
        purpose: '',
        paymentMethod: 'Cash',
        paymentProof: ''
      });
      fetchDonations();
      fetchReceiptNumber();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to add donation', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    try {
      await axios.delete(`${API}/api/donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Deleted', 'Donation deleted', 'success');
      fetchDonations();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete donation', 'error');
    }
  };

  return (
    <div className="donations-container">
      <h2>Donations</h2>

      <form onSubmit={handleSubmit} className="donation-form">
        <input
          type="text"
          name="receiptNumber"
          value={formData.receiptNumber}
          readOnly
          placeholder="Receipt Number"
        />
        <input
          type="text"
          name="donorName"
          value={formData.donorName}
          onChange={handleChange}
          placeholder="Donor Name"
          required
        />
        <input
          type="text"
          name="donorAddress"
          value={formData.donorAddress}
          onChange={handleChange}
          placeholder="Donor Address"
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          min="1"
          required
        />
        <input
          type="text"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Purpose"
          required
        />
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          required
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <input
          type="text"
          name="paymentProof"
          value={formData.paymentProof}
          onChange={handleChange}
          placeholder="Payment Proof (optional)"
        />
        <button type="submit">Add Donation</button>
      </form>

      <table className="donation-table">
        <thead>
          <tr>
            <th>Receipt</th>
            <th>Name</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Payment</th>
            <th>Proof</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donations.length > 0 ? (
            donations.map((d) => (
              <tr key={d._id}>
                <td>{d.receiptNumber}</td>
                <td>{d.donorName}</td>
                <td>{d.donorAddress || '-'}</td>
                <td>{d.amount}</td>
                <td>{d.purpose}</td>
                <td>{d.paymentMethod}</td>
                <td>{d.paymentProof || '-'}</td>
                <td>{d.date ? new Date(d.date).toLocaleDateString() : '-'}</td>
                <td>
                  <button onClick={() => handleDelete(d._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>
                No donations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Donations;
