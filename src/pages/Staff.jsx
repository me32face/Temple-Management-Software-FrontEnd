import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Staff.css';
import LoadingPage from '../components/Loading';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    address: '',
    pincode: '',
    contact1: '',
    contact2: '',
    emergencyContact: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch staff', 'error');
    } finally {
      setLoading(false);
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
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingId) {
        await axios.put(`${API}/api/staff/${editingId}`, formData, config);
        Swal.fire('Success', 'Staff updated', 'success');
      } else {
        await axios.post(`${API}/api/staff`, formData, config);
        Swal.fire('Success', 'Staff added', 'success');
      }

      setFormData({
        name: '',
        role: '',
        address: '',
        pincode: '',
        contact1: '',
        contact2: '',
        emergencyContact: ''
      });
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
      address: staff.address,
      pincode: staff.pincode,
      contact1: staff.contact1,
      contact2: staff.contact2,
      emergencyContact: staff.emergencyContact || ''
    });
    setEditingId(staff._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Deleted', 'Staff deleted', 'success');
      fetchStaff();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const filteredStaff = staffList.filter((staff) =>
    Object.values(staff).some(value =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="staff-alt-container">
      <h2 className="staff-alt-title">Staff Directory</h2>

      <form className="staff-alt-form" onSubmit={handleSubmit}>
        <div className="staff-alt-fields">
          <input type="text" name="name" className="staff-alt-input" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="role" className="staff-alt-input" placeholder="Role" value={formData.role} onChange={handleChange} required />
          <input type="text" name="address" className="staff-alt-input" placeholder="Full Address" value={formData.address} onChange={handleChange} />
          <input type="text" name="pincode" className="staff-alt-input" placeholder="PIN Code" value={formData.pincode} onChange={handleChange} />
          <input type="text" name="contact1" className="staff-alt-input" placeholder="Contact 1" value={formData.contact1} onChange={handleChange} />
          <input type="text" name="contact2" className="staff-alt-input" placeholder="Contact 2" value={formData.contact2} onChange={handleChange} />
          <input type="text" name="emergencyContact" className="staff-alt-input" placeholder="Emergency Contact (optional)" value={formData.emergencyContact} onChange={handleChange} />
        </div>
        <button type="submit" className="staff-alt-submit-btn">
          {editingId ? 'Update Staff' : 'Add Staff'}
        </button>
      </form>

      <input
        type="text"
        className="staff-alt-search"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <LoadingPage />
      ) : (
        <div className="staff-alt-table-container">
          <table className="staff-alt-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Address</th>
                <th>PIN</th>
                <th>Contact 1</th>
                <th>Contact 2</th>
                <th>Emergency Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(staff => (
                <tr key={staff._id}>
                  <td>{staff.name}</td>
                  <td>{staff.role}</td>
                  <td>{staff.address}</td>
                  <td>{staff.pincode}</td>
                  <td>{staff.contact1}</td>
                  <td>{staff.contact2}</td>
                  <td>{staff.emergencyContact || 'N/A'}</td>
                  <td>
                    <button className="staff-alt-btn edit" onClick={() => handleEdit(staff)}>Edit</button>
                    <button className="staff-alt-btn delete" onClick={() => handleDelete(staff._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Staff;
