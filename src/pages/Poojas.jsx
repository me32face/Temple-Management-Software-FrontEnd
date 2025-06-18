import React, { useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Poojas.css';

const PoojaForm = () => {
  const [poojaData, setPoojaData] = useState({
    poojaName: '',
    date: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentProof: '',
    devotees: [{ name: '', nakshathra: '' }]
  });

  const [receiptInfo, setReceiptInfo] = useState(null);
  const printRef = useRef();

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setPoojaData({ ...poojaData, [e.target.name]: e.target.value });
  };

  const handleDevoteeChange = (index, e) => {
    const updatedDevotees = [...poojaData.devotees];
    updatedDevotees[index][e.target.name] = e.target.value;
    setPoojaData({ ...poojaData, devotees: updatedDevotees });
  };

  const addDevotee = () => {
    setPoojaData({
      ...poojaData,
      devotees: [...poojaData.devotees, { name: '', nakshathra: '' }]
    });
  };

  const removeDevotee = (index) => {
    const updatedDevotees = poojaData.devotees.filter((_, i) => i !== index);
    setPoojaData({ ...poojaData, devotees: updatedDevotees });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/poojas`, poojaData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { receiptNumber } = res.data;

      Swal.fire(
        'Success',
        `Pooja created successfully! Receipt Number: ${receiptNumber}`,
        'success'
      );

      setReceiptInfo({
        receiptNumber,
        ...poojaData
      });

      setPoojaData({
        poojaName: '',
        date: '',
        amount: '',
        paymentMethod: 'Cash',
        paymentProof: '',
        devotees: [{ name: '', nakshathra: '' }]
      });

    } catch (err) {
      Swal.fire('Error', err.response?.data?.msg || 'Something went wrong', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pooja-form-container">
      <h2 className="pooja-form-title">Create Pooja</h2>
      <form onSubmit={handleSubmit} className="pooja-form">
        <div className="pooja-form-group">
          <label>Pooja Name</label>
          <input
            type="text"
            name="poojaName"
            value={poojaData.poojaName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pooja-form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={poojaData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pooja-form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={poojaData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pooja-form-group">
          <label>Payment Method</label>
          <select
            name="paymentMethod"
            value={poojaData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        <div className="pooja-form-group">
          <label>Payment Proof (URL)</label>
          <input
            type="text"
            name="paymentProof"
            value={poojaData.paymentProof}
            onChange={handleChange}
          />
        </div>

        <div className="pooja-devotee-section">
          <label>Devotees</label>
          {poojaData.devotees.map((devotee, index) => (
            <div key={index} className="pooja-devotee-group">
              <input
                type="text"
                name="name"
                placeholder="Devotee Name"
                value={devotee.name}
                onChange={(e) => handleDevoteeChange(index, e)}
                required
              />
              <input
                type="text"
                name="nakshathra"
                placeholder="Nakshathra"
                value={devotee.nakshathra}
                onChange={(e) => handleDevoteeChange(index, e)}
                required
              />
              {poojaData.devotees.length > 1 && (
                <button
                  type="button"
                  className="pooja-remove-btn"
                  onClick={() => removeDevotee(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="pooja-add-btn" onClick={addDevotee}>
            Add Devotee
          </button>
        </div>

        <button type="submit" className="pooja-submit-btn">
          Submit
        </button>
      </form>

      {receiptInfo && (
        <div className="pooja-receipt-container" ref={printRef}>
          <h3>Receipt</h3>
          <p><strong>Receipt Number:</strong> {receiptInfo.receiptNumber}</p>
          <p><strong>Pooja Name:</strong> {receiptInfo.poojaName}</p>
          <p><strong>Date:</strong> {receiptInfo.date}</p>
          <p><strong>Amount:</strong> ₹{receiptInfo.amount}</p>
          <p><strong>Payment Method:</strong> {receiptInfo.paymentMethod}</p>
          <div>
            <strong>Devotees:</strong>
            <ul>
              {receiptInfo.devotees.map((dev, i) => (
                <li key={i}>
                  {dev.name} ({dev.nakshathra})
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handlePrint} className="pooja-print-btn">Print Receipt</button>
        </div>
      )}
    </div>
  );
};

export default PoojaForm;
