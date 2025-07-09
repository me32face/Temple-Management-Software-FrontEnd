import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import '../assets/styles/RamayanaParayanam.css';

const RamayanaParayanam = () => {
  const [entries, setEntries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortLatestFirst, setSortLatestFirst] = useState(true);
  const [sortByPending, setSortByPending] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = date => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...formData, date: formData.date.toISOString() };

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

  const handleEdit = entry => {
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

  const handleDelete = async id => {
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

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const filteredEntries = [...entries]
    .filter(entry => {
      const s = searchText.toLowerCase();
      return (
        entry.name.toLowerCase().includes(s) ||
        entry.nakshathra.toLowerCase().includes(s) ||
        entry.phone.includes(s) ||
        entry.amount.toString().includes(s) ||
        entry.paymentMode.toLowerCase().includes(s) ||
        entry.notes?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (sortByPending) {
        return a.paymentPending === b.paymentPending
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : a.paymentPending
          ? -1
          : 1;
      } else {
        return sortLatestFirst
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  return (
    <div className="rp-container">
      <h2 className="rp-title">Ramayana Parayanam</h2>

      {/* Form Section */}
      <div className="rp-input-section">
        <form className="rp-form" onSubmit={handleSubmit}>
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            className="rp-input"
            dateFormat="dd-MM-yyyy"
            required
          />
          <input
            type="text"
            name="name"
            className="rp-input"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="nakshathra"
            className="rp-input"
            placeholder="Nakshathra"
            value={formData.nakshathra}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            className="rp-input"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            className="rp-input"
            placeholder="Amount"
            value={formData.amount}
            onChange={e =>
              setFormData({ ...formData, amount: Math.max(0, e.target.value) })
            }
            min="0"
            step="any" // optional: allows decimals
            inputMode="numeric"
          />
          <select
            name="paymentMode"
            className="rp-select"
            value={formData.paymentMode}
            onChange={handleChange}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
          <input
            type="text"
            name="notes"
            className="rp-input"
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={handleChange}
          />
          <label className="rp-checkbox-label">
            <input
              type="checkbox"
              name="paymentPending"
              checked={formData.paymentPending}
              onChange={handleChange}
              className="rp-checkbox"
            />
            Not Paid
          </label>
          <button type="submit" className="rp-submit-btn">
            {editingId ? 'Update' : 'Add Entry'}
          </button>
        </form>
      </div>

      {/* Listing Section */}
      <div className="rp-listing-section">
        <div className="rp-controls">
          <input
            type="text"
            placeholder="Search entries..."
            className="rp-search"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <button
            className="rp-sort-btn"
            onClick={() => setSortByPending(prev => !prev)}
          >
            Sort by: {sortByPending ? 'Payment Status 🔽' : 'Latest First 🔼'}
          </button>
        </div>

        <div className="rp-table-container">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Nakshathra</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry._id}>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.name}</td>
                  <td>{entry.nakshathra}</td>
                  <td>{entry.phone}</td>
                  <td>₹{entry.amount}</td>
                  <td>{entry.paymentMode}</td>
                  <td style={{ color: entry.paymentPending ? 'red' : 'lightgreen', fontWeight: 'bold' }}>
                    {entry.paymentPending ? 'Not Paid' : 'Paid'}
                  </td>
                  <td>{entry.notes || '—'}</td>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="rp-btn edit" onClick={() => handleEdit(entry)}>Edit</button>
                    <button className="rp-btn delete" onClick={() => handleDelete(entry._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RamayanaParayanam;
