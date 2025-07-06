import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import '../assets/styles/Expenses.css';

const RamayanaParayanam = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date(),
    name: '',
    nakshathra: '',
    phone: '',
    amount: '',
    paymentMode: 'Cash',
    notes: '',
    paymentPending: false
  });
  const [editingId, setEditingId] = useState(null);
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/ramayana`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data);
    } catch (err) {
      Swal.fire('Error', 'Could not fetch entries', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        date: formData.date.toISOString()
      };

      if (editingId) {
        await axios.put(`${API}/api/ramayana/${editingId}`, payload, config);
        Swal.fire('Updated!', 'Entry updated', 'success');
      } else {
        await axios.post(`${API}/api/ramayana`, payload, config);
        Swal.fire('Saved!', 'Entry added', 'success');
      }

      fetchData();
      setFormData({
        date: new Date(),
        name: '',
        nakshathra: '',
        phone: '',
        amount: '',
        paymentMode: 'Cash',
        notes: '',
        paymentPending: false
      });
      setEditingId(null);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || 'Failed', 'error');
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      date: new Date(entry.date),
      name: entry.name,
      nakshathra: entry.nakshathra,
      phone: entry.phone,
      amount: entry.amount,
      paymentMode: entry.paymentMode,
      notes: entry.notes || '',
      paymentPending: entry.paymentPending || false
    });
    setEditingId(entry._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm delete?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/ramayana/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Deleted', 'Entry removed', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Could not delete', 'error');
    }
  };

  return (
    <div className="expenses-container">
      <h2 className="expenses-title">Ramayana Parayanam</h2>

      <form className="expenses-form" onSubmit={handleSubmit}>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          className="expenses-input"
          dateFormat="dd-MM-yyyy"
          required
        />
        <input type="text" name="name" className="expenses-input" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="nakshathra" className="expenses-input" placeholder="Nakshathra" value={formData.nakshathra} onChange={handleChange} required />
        <input type="text" name="phone" className="expenses-input" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <input type="number" name="amount" className="expenses-input" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
        <select name="paymentMode" className="expenses-select" value={formData.paymentMode} onChange={handleChange}>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <input type="text" name="notes" className="expenses-input" placeholder="Notes (optional)" value={formData.notes} onChange={handleChange} />
        
        <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <input
            type="checkbox"
            name="paymentPending"
            checked={formData.paymentPending}
            onChange={handleChange}
            style={{ marginRight: '8px' }}
          />
          Mark as Not Paid
        </label>

        <button type="submit" className="expenses-submit-btn">{editingId ? 'Update' : 'Add Entry'}</button>
      </form>

      <div className="expenses-table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Nakshathra</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Not Paid?</th>
              <th>Notes</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry._id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.name}</td>
                <td>{entry.nakshathra}</td>
                <td>{entry.phone}</td>
                <td>{entry.amount}</td>
                <td>{entry.paymentMode}</td>
                <td>{entry.paymentPending ? 'Yes' : 'No'}</td>
                <td>{entry.notes || '—'}</td>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
                <td>
                  <button className="expenses-btn edit" onClick={() => handleEdit(entry)}>Edit</button>
                  <button className="expenses-btn delete" onClick={() => handleDelete(entry._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RamayanaParayanam;
