import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/styles/OldPendingPayments.css';

const OldPendingPayments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    name: '',
    details: '',
    phone: '',
    amount: '',
    paymentMode: 'Cash',
    notes: '',
    paymentPending: true,
  });

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/old-pending-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch data', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev.paymentPending : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...formData,
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
      };

      if (editingId) {
        await axios.put(`${API}/api/old-pending-payments/${editingId}`, payload, config);
        Swal.fire('Updated', 'Record updated successfully', 'success');
      } else {
        await axios.post(`${API}/api/old-pending-payments`, payload, config);
        Swal.fire('Success', 'Record created', 'success');
      }

      setFormData({
        date: new Date(),
        name: '',
        details: '',
        phone: '',
        amount: '',
        paymentMode: 'Cash',
        notes: '',
        paymentPending: true,
      });
      setEditingId(null);
      fetchPayments();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || 'Something went wrong', 'error');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      date: new Date(item.date),
      name: item.name,
      details: item.details,
      phone: item.phone,
      amount: item.amount,
      paymentMode: item.paymentMode || 'Cash',
      notes: item.notes || '',
      paymentPending: item.paymentPending,
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete Record?',
      text: 'Are you sure you want to delete this payment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/old-pending-payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Deleted', 'Record deleted successfully', 'success');
      fetchPayments();
    } catch (err) {
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  // Filtering based on status and search
  const filtered = payments
    .filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter(item =>
      filterStatus === 'all'
        ? true
        : filterStatus === 'paid'
        ? !item.paymentPending
        : item.paymentPending
    );

  // Dashboard summary
  const totalPaid = payments
    .filter(p => !p.paymentPending)
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalUnpaid = payments
    .filter(p => p.paymentPending)
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalOverall = totalPaid + totalUnpaid;

  return (
    <div className="old-pending-container">
      <h2 className="old-pending-title">Old Pending Payments Received</h2>

      {/* Dashboard Summary */}
      <div className="old-pending-summary">
        <div className="summary-box paid">
          <h4>Total Paid</h4>
          <p>₹ {totalPaid}</p>
        </div>
        <div className="summary-box unpaid">
          <h4>Total Not Paid</h4>
          <p>₹ {totalUnpaid}</p>
        </div>
        <div className="summary-box total">
          <h4>Total Amount</h4>
          <p>₹ {totalOverall}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="old-pending-filters">
        <input
          type="text"
          className="old-pending-search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="old-pending-select"
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Not Paid</option>
        </select>
      </div>

      {/* Form */}
      <form className="old-pending-form" onSubmit={handleSubmit}>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          className="old-pending-input"
          dateFormat="dd-MM-yyyy"
          required
        />
        <input
          type="text"
          name="name"
          className="old-pending-input"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="details"
          className="old-pending-input"
          placeholder="Details"
          value={formData.details}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          className="old-pending-input"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          className="old-pending-input"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <select
          name="paymentMode"
          className="old-pending-select"
          value={formData.paymentMode}
          onChange={handleChange}
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <input
          type="text"
          name="notes"
          className="old-pending-input"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="paymentPending"
            checked={!formData.paymentPending}
            onChange={handleChange}
          /> Mark as Paid
        </label>

        <button type="submit" className="old-pending-submit-btn">
          {editingId ? 'Update Record' : 'Add Record'}
        </button>
      </form>

      {/* Table */}
      <div className="old-pending-table-container">
        <table className="old-pending-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Details</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr
                key={item._id}
                className={item.paymentPending ? 'row-unpaid' : 'row-paid'}
              >
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.name}</td>
                <td>{item.details || '—'}</td>
                <td>{item.phone || '—'}</td>
                <td>{item.amount}</td>
                <td>{item.paymentMode || '—'}</td>
                <td>{item.notes || '—'}</td>
                <td>{item.paymentPending ? 'Not Paid' : 'Paid'}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</td>
                <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}</td>
                <td className="old-pending-actions">
                  <button className="old-pending-btn edit" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button className="old-pending-btn delete" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '1rem' }}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OldPendingPayments;
