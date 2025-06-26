import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Devotees.css';

const roleLabels = {
  trustMember: 'Trust Member',
  nonTrustMember: 'Non Trust Member',
  common: 'Common',
  executiveCommittee: 'Executive Committee',
  kudumbam: 'Kudumbam',
};

const Devotees = () => {
  const [devotees, setDevotees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    place: '',
    pincode: '',
    whatsappNumber: '',
    secondaryNumber: '',
    roles: {
      trustMember: false,
      nonTrustMember: false,
      common: false,
      executiveCommittee: false,
      kudumbam: false,
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editId, setEditId] = useState(null);
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
    const { name, value, type, checked } = e.target;
    if (name in formData.roles) {
      setFormData((prev) => ({
        ...prev,
        roles: {
          ...prev.roles,
          [name]: checked
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/api/devotees/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Updated', 'Devotee updated', 'success');
        setEditId(null);
      } else {
        await axios.post(`${API}/api/devotees`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Success', 'Devotee added', 'success');
      }
      resetForm();
      fetchDevotees();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || 'Failed to save devotee', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      place: '',
      pincode: '',
      whatsappNumber: '',
      secondaryNumber: '',
      roles: {
        trustMember: false,
        nonTrustMember: false,
        common: false,
        executiveCommittee: false,
        kudumbam: false,
      }
    });
  };

  const handleEdit = (d) => {
    setEditId(d._id);
    setFormData({
      name: d.name,
      address: d.address,
      place: d.place,
      pincode: d.pincode,
      whatsappNumber: d.whatsappNumber,
      secondaryNumber: d.secondaryNumber,
      roles: d.roles || {}
    });
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
      Swal.fire('Error', 'Failed to delete devotee', 'error');
    }
  };

  const filteredDevotees = devotees.filter((d) => {
    const fullText = `
      ${d.name} ${d.address} ${d.place} ${d.pincode}
      ${d.whatsappNumber} ${d.secondaryNumber}
      ${Object.entries(d.roles || {}).filter(([, v]) => v).map(([k]) => roleLabels[k]).join(' ')}
    `.toLowerCase();

    const matchesSearch = fullText.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter
      ? d.roles && d.roles[roleFilter]
      : true;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="devotees-main-container">
      <h2 className="devotees-header-title">Manage Devotees</h2>

      <div className="devotees-search-filter">
        <input
          type="text"
          placeholder="Search by any field"
          className="devotees-input-field"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="devotees-select-dropdown"
        >
          <option value="">All Roles</option>
          {Object.entries(roleLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="devotees-form-wrapper">
        <div className="devotees-input-group">
          {[
            ['name', 'Name'],
            ['address', 'Address'],
            ['place', 'Place'],
            ['pincode', 'Pincode'],
            ['whatsappNumber', 'WhatsApp Number'],
            ['secondaryNumber', 'Secondary Number'],
          ].map(([key, label]) => (
            <input
              key={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="devotees-input-field"
              placeholder={label}
              required={key === 'name'}
            />
          ))}
        </div>

        <div className="devotees-role-checkboxes">
          {Object.entries(roleLabels).map(([roleKey, label]) => (
            <label key={roleKey} className="devotees-checkbox-label">
              <input
                type="checkbox"
                name={roleKey}
                checked={formData.roles[roleKey] || false}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}
        </div>

        <button type="submit" className="devotees-submit-button">
          {editId ? 'Update Devotee' : 'Add Devotee'}
        </button>
      </form>

      <div className="devotees-table-wrapper">
        <table className="devotees-table-element">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Place</th>
              <th>Pincode</th>
              <th>Roles</th>
              <th>WhatsApp</th>
              <th>Secondary</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevotees.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td className="wrap-text">{d.address}</td>
                <td>{d.place}</td>
                <td>{d.pincode}</td>
                <td>
                  {Object.entries(d.roles || {})
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <span key={k}>{roleLabels[k]}<br /></span>
                    ))}
                </td>
                <td>{d.whatsappNumber}</td>
                <td>{d.secondaryNumber}</td>
                <td>{new Date(d.createdAt).toLocaleString()}</td>
                <td>{new Date(d.updatedAt).toLocaleString()}</td>
                <td className="table-actions">
                  <button onClick={() => handleEdit(d)} className="devotees-edit-button">Edit</button>
                  <button className="devotees-delete-button" onClick={() => handleDelete(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devotees;
