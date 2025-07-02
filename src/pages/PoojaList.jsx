import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/PoojaList.css';

const PoojaList = () => {
  const [poojas, setPoojas] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editingPooja, setEditingPooja] = useState(null);
  const [poojasSortedByPending, setPoojasSortedByPending] = useState(false);

  const [formData, setFormData] = useState({
    manualReceiptNumber: '',
    poojaName: '',
    date: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentProof: '',
    paymentPending: false
  });

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`${API}/api/poojas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPoojas(res.data))
      .catch(err =>
        Swal.fire('Error', err.response?.data?.msg || 'Failed to fetch', 'error')
      );
  }, []);

  const handleDelete = id => {
    Swal.fire({
      title: 'Delete this pooja?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete'
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        axios
          .delete(`${API}/api/poojas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then(() => {
            setPoojas(prev => prev.filter(p => p._id !== id));
            Swal.fire('Deleted!', 'Pooja deleted.', 'success');
          })
          .catch(err =>
            Swal.fire('Error', err.response?.data?.msg || 'Delete failed', 'error')
          );
      }
    });
  };

  const handleEdit = pooja => {
    setEditingPooja(pooja);
    setFormData({
      manualReceiptNumber: pooja.manualReceiptNumber || '',
      poojaName: pooja.poojaName,
      date: pooja.date.slice(0, 10),
      amount: pooja.amount,
      paymentMethod: pooja.paymentMethod,
      paymentProof: pooja.paymentProof || '',
      paymentPending: pooja.paymentPending || false
    });
  };

  const handleUpdate = e => {
    e.preventDefault();
    axios
      .put(`${API}/api/poojas/${editingPooja._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setPoojas(prev =>
          prev.map(p => (p._id === editingPooja._id ? res.data : p))
        );
        Swal.fire('Updated!', 'Pooja updated.', 'success');
        setEditingPooja(null);
      })
      .catch(err =>
        Swal.fire('Error', err.response?.data?.msg || 'Update failed', 'error')
      );
  };

  const filtered = [...poojas]
    .filter(p => {
      const s = searchText.toLowerCase();
      return (
        p.receiptNumber?.toLowerCase().includes(s) ||
        p.manualReceiptNumber?.toLowerCase().includes(s) ||
        p.poojaName?.toLowerCase().includes(s) ||
        p.paymentMethod?.toLowerCase().includes(s) ||
        p.devotees.some(
          d =>
            d.name.toLowerCase().includes(s) ||
            d.nakshathra.toLowerCase().includes(s)
        )
      );
    })
    .sort((a, b) =>
      poojasSortedByPending ? b.paymentPending - a.paymentPending : 0
    )
    .reverse();

  return (
    <div className="pl-container">
      <h2 className="pl-header">All Poojas</h2>
      <div className="pl-search-wrapper">
        <input
          type="text"
          className="pl-search-input"
          placeholder="Search poojas..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      <div className="pl-table-wrapper">
        <table className="pl-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Manual #</th>
              <th>Name</th>
              <th>Date</th>
              <th>Amt</th>
              <th
                onClick={() => setPoojasSortedByPending(p => !p)}
                style={{ cursor: 'pointer' }}
              >
                Pending {poojasSortedByPending ? '🔽' : '🔼'}
              </th>
              <th>Pay</th>
              <th>Proof</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Devotees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p._id} className={i % 2 === 0 ? 'pl-row-even' : 'pl-row-odd'}>
                <td>{p.receiptNumber}</td>
                <td>{p.manualReceiptNumber || '-'}</td>
                <td>{p.poojaName}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>₹{p.amount}</td>
                <td style={{ color: p.paymentPending ? 'red' : 'green', fontWeight: 'bold' }}>
                  {p.paymentPending ? 'Not Paid' : 'Paid'}
                </td>
                <td>{p.paymentMethod}</td>
                <td>{p.paymentProof || '-'}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{new Date(p.updatedAt).toLocaleString()}</td>
                <td className="pl-devotees-cell">
                  {p.devotees.map((d, idx) => (
                    <span key={idx} className="pl-devotee-pill">
                      {d.name} ({d.nakshathra})
                    </span>
                  ))}
                </td>
                <td>
                  <button
                    className="pl-btn pl-btn-edit"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="pl-btn pl-btn-delete"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPooja && (
        <div className="pl-modal-overlay">
          <div className="pl-modal">
            <h3 className="pl-modal-header">Edit {editingPooja.receiptNumber}</h3>
            <form className="pl-edit-form" onSubmit={handleUpdate}>
              <input
                type="text"
                className="pl-input"
                placeholder="Manual Receipt Number"
                value={formData.manualReceiptNumber}
                onChange={e =>
                  setFormData({ ...formData, manualReceiptNumber: e.target.value })
                }
              />
              <input
                type="text"
                className="pl-input"
                placeholder="Name"
                value={formData.poojaName}
                onChange={e =>
                  setFormData({ ...formData, poojaName: e.target.value })
                }
                required
              />
              <input
                type="date"
                className="pl-input"
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
              <input
                type="number"
                className="pl-input"
                placeholder="Amount"
                value={formData.amount}
                onChange={e =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
              <label>
                <input
                  type="checkbox"
                  checked={formData.paymentPending}
                  onChange={e =>
                    setFormData({ ...formData, paymentPending: e.target.checked })
                  }
                />
                Payment Pending
              </label>
              <select
                className="pl-input"
                value={formData.paymentMethod}
                onChange={e =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              >
                <option>Cash</option>
                <option>UPI</option>
              </select>
              <input
                type="text"
                className="pl-input"
                placeholder="Payment Proof"
                value={formData.paymentProof}
                onChange={e =>
                  setFormData({ ...formData, paymentProof: e.target.value })
                }
              />
              <div className="pl-modal-actions">
                <button type="submit" className="pl-btn pl-btn-update">
                  Update
                </button>
                <button
                  type="button"
                  className="pl-btn pl-btn-cancel"
                  onClick={() => setEditingPooja(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoojaList;
