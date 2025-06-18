import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Staff.css';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    contact: ''
  });
  const [editingId, setEditingId] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch staff', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (editingId) {
        await axios.put(`${API}/api/staff/${editingId}`, formData, config);
        Swal.fire('Success', 'Staff updated', 'success');
      } else {
        await axios.post(`${API}/api/staff`, formData, config);
        Swal.fire('Success', 'Staff added', 'success');
      }

      setFormData({ name: '', role: '', contact: '' });
      setEditingId(null);
      fetchStaff();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.msg || 'Something went wrong', 'error');
    }
  };

  const handleEdit = (staff) => {
    setFormData({
      name: staff.name,
      role: staff.role,
      contact: staff.contact
    });
    setEditingId(staff._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/staff/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Swal.fire('Deleted', 'Staff deleted', 'success');
      fetchStaff();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  return (
    <div className="staff-alt-container">
      <h2 className="staff-alt-title">Staff Directory</h2>

      <form className="staff-alt-form" onSubmit={handleSubmit}>
        <div className="staff-alt-fields">
          <input
            type="text"
            name="name"
            className="staff-alt-input"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            className="staff-alt-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Chef">Chef</option>
          </select>

          <input
            type="text"
            name="contact"
            className="staff-alt-input"
            placeholder="Contact Info"
            value={formData.contact}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="staff-alt-submit-btn">
          {editingId ? 'Update Staff' : 'Add Staff'}
        </button>
      </form>

      <div className="staff-alt-table-container">
        <table className="staff-alt-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map(staff => (
              <tr key={staff._id}>
                <td>{staff.name}</td>
                <td>{staff.role}</td>
                <td>{staff.contact || 'N/A'}</td>
                <td>
                  <button className="staff-alt-btn edit" onClick={() => handleEdit(staff)}>Edit</button>
                  <button className="staff-alt-btn delete" onClick={() => handleDelete(staff._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Staff;
