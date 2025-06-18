import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Devotees.css';

const Devotees = () => {
  const [devotees, setDevotees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    place: '',
    pincode: '',
    whatsappNumber: '',
    secondaryNumber: ''
  });

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchDevotees();
  }, []);

  const fetchDevotees = async () => {
    try {
      const res = await axios.get(`${API}/api/devotees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevotees(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch devotees', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/devotees`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Devotee added', 'success');
      setFormData({
        name: '',
        address: '',
        place: '',
        pincode: '',
        whatsappNumber: '',
        secondaryNumber: ''
      });
      fetchDevotees();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.msg || 'Failed to add devotee', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this devotee?')) return;
    try {
      await axios.delete(`${API}/api/devotees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Deleted', 'Devotee deleted', 'success');
      fetchDevotees();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete devotee', 'error');
    }
  };

  return (
    <div className="devotees-container">
      <h2 className="devotees-title">Manage Devotees</h2>

      <form onSubmit={handleSubmit} className="devotees-form">
        <div className="devotees-form-row">
          <input 
            type="text"
            name="name"
            className="devotees-input"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input 
            type="text"
            name="address"
            className="devotees-input"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <input 
            type="text"
            name="place"
            className="devotees-input"
            placeholder="Place"
            value={formData.place}
            onChange={handleChange}
          />
          <input 
            type="text"
            name="pincode"
            className="devotees-input"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
          />
          <input 
            type="text"
            name="whatsappNumber"
            className="devotees-input"
            placeholder="WhatsApp Number"
            value={formData.whatsappNumber}
            onChange={handleChange}
          />
          <input 
            type="text"
            name="secondaryNumber"
            className="devotees-input"
            placeholder="Secondary Number"
            value={formData.secondaryNumber}
            onChange={handleChange}
          />
          <button type="submit" className="devotees-submit-btn">
            Add Devotee
          </button>
        </div>
      </form>

      <table className="devotees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Place</th>
            <th>Pincode</th>
            <th>WhatsApp</th>
            <th>Secondary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devotees.map((d) => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td>{d.address}</td>
              <td>{d.place}</td>
              <td>{d.pincode}</td>
              <td>{d.whatsappNumber}</td>
              <td>{d.secondaryNumber}</td>
              <td>
                <button className="devotees-delete-btn" onClick={() => handleDelete(d._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Devotees;
