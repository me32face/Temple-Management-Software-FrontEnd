import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/styles/MonthlyPoojaConducted.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const paymentModes = ['Cash', 'UPI', 'Bank', 'Other'];

const MonthlyPoojaConducted = () => {
  const [persons, setPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [year, setYear] = useState(2025);
  const [recordsByMonth, setRecordsByMonth] = useState({});
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', nakshatra: '', address: '', poojaName: '' });
  const [expandedMonths, setExpandedMonths] = useState({});
  const [editStates, setEditStates] = useState({});
  const [editPerson, setEditPerson] = useState(null);

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const res = await axios.get(`${API}/api/monthly-pooja/persons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersons(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        Swal.fire('Error', 'Backend route not found (404)', 'error');
      } else {
        Swal.fire('Error', 'Backend is likely waking up. Try again in 5 seconds.', 'info');
      }
    }
  };

  const handleAddOrUpdatePerson = async (e) => {
    e.preventDefault();
    try {
      if (editPerson) {
        await axios.put(`${API}/api/monthly-pooja/persons/${editPerson._id}`, newPerson, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditPerson(null);
        Swal.fire('Updated', `${newPerson.name}'s details were updated successfully`, 'success');
      } else {
        await axios.post(`${API}/api/monthly-pooja/persons`, newPerson, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Added', 'New performer added successfully', 'success');
      }
      setNewPerson({ name: '', phone: '', nakshatra: '', address: '', poojaName: '' });
      fetchPersons();
    } catch (err) {
      Swal.fire('Error', 'Failed to save performer', 'error');
    }
  };

  const handleDeletePerson = async (id) => {
    const firstConfirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this performer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue',
      cancelButtonText: 'Cancel',
    });

    if (firstConfirm.isConfirmed) {
      const secondConfirm = await Swal.fire({
        title: 'Final Confirmation',
        text: 'This action is irreversible. Confirm deletion?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete permanently',
        cancelButtonText: 'Cancel',
      });

      if (secondConfirm.isConfirmed) {
        try {
          await axios.delete(`${API}/api/monthly-pooja/persons/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchPersons();
          Swal.fire('Deleted', 'Person deleted successfully', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to delete person', 'error');
        }
      }
    }
  };

  const openModal = async (person, yearOverride = null) => {
    try {
      setSelectedPerson(person);
      setModalOpen(true);

      const res = await axios.get(`${API}/api/monthly-pooja/persons/${person._id}/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const selectedYear = yearOverride !== null ? yearOverride : year;

      const map = {};
      res.data
        .filter((r) => r.year === selectedYear)
        .forEach((r) => {
          if (!map[r.month]) map[r.month] = [];
          map[r.month].push({
            ...r,
            isNew: false,
            dateObjects: r.dates.map((d) => new Date(selectedYear, months.indexOf(r.month), d))
          });
        });

      setRecordsByMonth(map);
    } catch (err) {
      Swal.fire('Error', 'Failed to load records', 'error');
    }
  };

  const toggleMonth = (month) => {
    setExpandedMonths({ ...expandedMonths, [month]: !expandedMonths[month] });

    if (!recordsByMonth[month] || recordsByMonth[month].length === 0) {
      setRecordsByMonth({
        ...recordsByMonth,
        [month]: [{
          tempId: Date.now().toString(),
          person: selectedPerson._id,
          year,
          month,
          dateObjects: [],
          amount: '',
          isPaid: false,
          paymentMode: '',
          notes: '',
          isNew: true
        }]
      });
    }
  };

  const handleRecordChange = (month, idx, field, value) => {
    const updated = { ...recordsByMonth };
    updated[month][idx][field] = value;
    setRecordsByMonth(updated);
  };

  const toggleEdit = (month, idx) => {
    const key = `${month}_${idx}`;
    const r = recordsByMonth[month][idx];

    if (!editStates[key]) {
      Swal.fire({
        title: 'Edit Record',
        text: 'Do you want to edit this record?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Edit',
        cancelButtonText: 'Cancel',
      }).then(result => {
        if (result.isConfirmed) {
          setEditStates(prev => ({ ...prev, [key]: true }));
        }
      });
    } else {
      setEditStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const cancelRecord = (month, idx) => {
    const r = recordsByMonth[month][idx];

    if (r.isNew) {
      const updated = { ...recordsByMonth };
      updated[month].splice(idx, 1);
      if (updated[month].length === 0) delete updated[month];
      setRecordsByMonth(updated);
    } else {
      toggleEdit(month, idx);
    }
  };

  const clearRecord = (month, idx) => {
    const r = recordsByMonth[month][idx];

    if (r.isNew) {
      const updated = { ...recordsByMonth };
      updated[month].splice(idx, 1);
      if (updated[month].length === 0) delete updated[month];
      setRecordsByMonth(updated);
    } else {
      Swal.fire({
        title: 'Clear Record?',
        text: 'This will clear the current values but keep the entry.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Clear',
        cancelButtonText: 'Cancel'
      }).then(result => {
        if (result.isConfirmed) {
          const updated = { ...recordsByMonth };
          updated[month][idx] = {
            ...r,
            dateObjects: [],
            amount: '',
            isPaid: false,
            paymentMode: '',
            notes: '',
          };
          setRecordsByMonth(updated);
        }
      });
    }
  };

  const saveRecord = async (month, idx) => {
    const r = recordsByMonth[month][idx];

    const confirm = await Swal.fire({
      title: 'Save Record?',
      text: 'Do you want to save this record?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      const payload = {
        ...r,
        dates: r.dateObjects.map(d => d.getDate()),
        year,
        month
      };

      if (r.isNew) {
        const existingRecord = recordsByMonth[month]?.find(rec => !rec.isNew);
        if (existingRecord) {
          Swal.fire('Not Allowed', `A record already exists for ${month} ${year}. Only one per month is allowed.`, 'warning');
          return;
        }

        const { tempId, isNew, dateObjects, ...postPayload } = payload;
        await axios.post(`${API}/api/monthly-pooja/records`, postPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const { dateObjects, ...updatePayload } = payload;
        await axios.put(`${API}/api/monthly-pooja/records/${r._id}`, updatePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      Swal.fire('Saved', `Record for ${month} saved`, 'success');

      setEditStates(prev => {
        const newState = { ...prev };
        delete newState[`${month}_${idx}`];
        return newState;
      });

      if (selectedPerson) {
        await openModal(selectedPerson);
      }
    } catch (err) {
      if (err.response?.data?.error?.includes('already exists')) {
        Swal.fire('Not Allowed', err.response.data.error, 'warning');
      } else {
        Swal.fire('Error', 'Failed to save record', 'error');
      }
    }
  };

  const handleEditClick = (person) => {
    Swal.fire({
      title: 'Edit Performer',
      text: `Do you want to edit details for ${person.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Edit',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        setEditPerson(person);
        setNewPerson({
          name: person.name,
          phone: person.phone,
          nakshatra: person.nakshatra,
          address: person.address,
          poojaName: person.poojaName || ''
        });
      }
    });
  };


  return (
    <div className="mpc-page">
      <div className="mpc-section mpc-addperson">
        <h3 className="mpc-section__title">{editPerson ? 'Edit Performer' : 'Add Performer'}</h3>
        <form className="mpc-form" onSubmit={handleAddOrUpdatePerson}>
          <input className="mpc-form__input" placeholder="Name" value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} required />
          <input className="mpc-form__input" placeholder="Phone" value={newPerson.phone} onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })} required />
          <input className="mpc-form__input" placeholder="Nakshatra" value={newPerson.nakshatra} onChange={(e) => setNewPerson({ ...newPerson, nakshatra: e.target.value })} />
          <input className="mpc-form__input" placeholder="Address" value={newPerson.address} onChange={(e) => setNewPerson({ ...newPerson, address: e.target.value })} />
          <input className="mpc-form__input" placeholder="Pooja Name" value={newPerson.poojaName} onChange={(e) => setNewPerson({ ...newPerson, poojaName: e.target.value })} />
          <button className="mpc-form__button" type="submit">{editPerson ? 'Update' : 'Add'}</button>
        </form>
      </div>

      <div className="mpc-section mpc-personlist">
        <h3 className="mpc-section__title">Performers</h3>
        <input type="text" placeholder="Search..." className="mpc-search__input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />
        <ul>
          {persons.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.phone.includes(searchQuery) ||
            p.nakshatra.toLowerCase().includes(searchQuery) ||
            (p.poojaName && p.poojaName.toLowerCase().includes(searchQuery))
          )
          .map((p) => (
            <li className="mpc-personlist__item" key={p._id}>
            <div className="mpc-personlist__info">
                <span>{p.name} – {p.nakshatra} – {p.phone} – {p.poojaName || '—'}</span>
            </div>
            <div className="mpc-personlist__actions">
                <button className="mpc-personlist__view" onClick={() => openModal(p)}>👁️ View</button>
                <button className="mpc-personlist__edit" onClick={() => handleEditClick(p)}>✏️ Edit</button>
                <button className="mpc-personlist__delete" onClick={() => handleDeletePerson(p._id)}>🗑️ Delete</button>
            </div>
            </li>
          ))}
        </ul>
      </div>

      {modalOpen && (
        <div className="mpc-modal">
          <div className="mpc-modal-content">
            <button className="mpc-modal__close" onClick={() => setModalOpen(false)}>×</button>
            <h3>{selectedPerson.name} · {selectedPerson.nakshatra} · {selectedPerson.poojaName || '—'}</h3>
            <p>📞 {selectedPerson.phone} · 🏠 {selectedPerson.address}</p>

            <div className="mpc-yearselect">
              <label>Year:
                <select value={year} onChange={async (e) => {
                    const selectedYear = parseInt(e.target.value);
                    setYear(selectedYear);
                    setRecordsByMonth({}); // Clear previous data
                    if (selectedPerson) {
                        await openModal(selectedPerson, selectedYear); // Pass the selected year
                    }
                }}>
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </label>
            </div>

            {months.map((month) => (
              <div key={month} className="mpc-month-block">
                <h4 onClick={() => toggleMonth(month)}>{month}</h4>
                {expandedMonths[month] && (recordsByMonth[month] || []).map((r, idx) => {
                  const isEditing = editStates[`${month}_${idx}`] || r.isNew;
                  return (
                    <div key={r._id || r.tempId} className="mpc-record">
                        {isEditing ? (
                        <>
                            <label>Date</label>
                            <DatePicker
                            selected={r.dateObjects[0] || null}
                            onChange={(date) => {
                                handleRecordChange(month, idx, 'dateObjects', date ? [date] : []);
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="mpc-date-input"
                            placeholderText="Select date"
                            isClearable
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            />
                            <input
                            placeholder="Amount"
                            type="number"
                            value={r.amount}
                            onChange={(e) => handleRecordChange(month, idx, 'amount', e.target.value)}
                            />
                            <div className="mpc-paid-checkbox">
                                <input
                                    type="checkbox"
                                    id={`paid-${month}-${idx}`}
                                    checked={r.isPaid}
                                    onChange={(e) => handleRecordChange(month, idx, 'isPaid', e.target.checked)}
                                />
                                <label htmlFor={`paid-${month}-${idx}`}>Paid</label>
                            </div>
                            <select
                            value={r.paymentMode}
                            onChange={(e) => handleRecordChange(month, idx, 'paymentMode', e.target.value)}
                            >
                            <option value="">Mode</option>
                            {paymentModes.map((m) => (
                                <option key={m}>{m}</option>
                            ))}
                            </select>
                            <textarea
                            placeholder="Notes"
                            value={r.notes}
                            onChange={(e) => handleRecordChange(month, idx, 'notes', e.target.value)}
                            />
                            <button onClick={() => saveRecord(month, idx)}>Save</button>
                            <button onClick={() => clearRecord(month, idx)} style={{ background: '#dc3545' }}>
                                Clear
                            </button>
                            <button onClick={() => cancelRecord(month, idx)} style={{ background: '#6c757d' }}>
                              Cancel
                            </button>
                        </>
                        ) : (
                        <>
                          <p><strong>Date:</strong> {
                            r.dateObjects && r.dateObjects.length > 0
                                ? r.dateObjects
                                    .sort((a, b) => a - b)
                                    .map(d => d.toLocaleDateString('en-GB')) // Format as DD/MM/YYYY
                                    .join(', ')
                                : '—'
                            }
                          </p>
                          <p><strong>Amount:</strong> ₹{r.amount || 0}</p>
                          <p><strong>Paid:</strong> {r.isPaid ? '✅' : '❌'}</p>
                          <p><strong>Mode:</strong> {r.paymentMode || '—'}</p>
                          <p><strong>Notes:</strong> {r.notes || '—'}</p>
                          <button onClick={() => toggleEdit(month, idx)}>Edit</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPoojaConducted;
