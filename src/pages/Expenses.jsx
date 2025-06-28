import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/styles/Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date(),
    amount: '',
    purpose: '',
    category: '',
    paymentMethod: 'Cash',
    proof: ''
  });
  const [editingId, setEditingId] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/expenses/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch expenses', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date
      };

      if (editingId) {
        await axios.put(`${API}/api/expenses/${editingId}`, payload, config);
        Swal.fire('Success', 'Expense updated', 'success');
      } else {
        await axios.post(`${API}/api/expenses`, payload, config);
        Swal.fire('Success', 'Expense created', 'success');
      }

      setFormData({
        date: new Date(),
        amount: '',
        purpose: '',
        category: '',
        paymentMethod: 'Cash',
        proof: ''
      });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.msg || 'Something went wrong', 'error');
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      date: new Date(expense.date),
      amount: expense.amount,
      purpose: expense.purpose,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      proof: expense.proof
    });
    setEditingId(expense._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Deleted', 'Expense deleted', 'success');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  return (
    <div className="expenses-container">
      <h2 className="expenses-title">Expenses</h2>

      <form className="expenses-form" onSubmit={handleSubmit}>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          className="expenses-input"
          dateFormat="dd-MM-yyyy"
          required
        />
        <input
          type="number"
          name="amount"
          className="expenses-input"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="purpose"
          className="expenses-input"
          placeholder="Purpose"
          value={formData.purpose}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          className="expenses-input"
          placeholder="Category (optional)"
          value={formData.category}
          onChange={handleChange}
        />
        <select
          name="paymentMethod"
          className="expenses-select"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <input
          type="text"
          name="proof"
          className="expenses-input"
          placeholder="Proof URL (optional)"
          value={formData.proof}
          onChange={handleChange}
        />

        <button type="submit" className="expenses-submit-btn">
          {editingId ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>

      <div className="expenses-table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Purpose</th>
              <th>Category</th>
              <th>Payment</th>
              <th>Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp._id}>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                <td>{exp.amount}</td>
                <td>{exp.purpose}</td>
                <td>{exp.category}</td>
                <td>{exp.paymentMethod}</td>
                <td>
                  {exp.proof ? (
                    <a href={exp.proof} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <button className="expenses-btn edit" onClick={() => handleEdit(exp)}>
                    Edit
                  </button>
                  <button className="expenses-btn delete" onClick={() => handleDelete(exp._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
