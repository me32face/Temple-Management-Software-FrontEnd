import React, { useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../assets/styles/Poojas.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns'; // To format date for receipt

const PoojaForm = () => {
  const [poojaData, setPoojaData] = useState({
    manualReceiptNumber: '',
    poojaName: '',
    date: new Date(),
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
      const submissionData = {
        ...poojaData,
        date: format(poojaData.date, 'yyyy-MM-dd') // ISO format for API
      };

      const res = await axios.post(`${API}/api/poojas`, submissionData, {
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

      // Reset form after submit
      setPoojaData({
        manualReceiptNumber: '',
        poojaName: '',
        date: new Date(),
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
    <div>
      <h2 className="pfm-title">New Pooja</h2>
      <div className="pfm-container">
        <form onSubmit={handleSubmit} className="pfm-form">
          <div className="pfm-field pfm-field--manual-receipt">
            <label className="pfm-label">Manual Receipt Number</label>
            <input
              className="pfm-input"
              type="text"
              name="manualReceiptNumber"
              value={poojaData.manualReceiptNumber}
              onChange={handleChange}
              placeholder="Optional manual receipt number"
            />
            <small className="pfm-hint">Optional. Will not replace the system-generated receipt number.</small>
          </div>

          <div className="pfm-field pfm-field--pooja-name">
            <label className="pfm-label">Pooja Name</label>
            <input
              className="pfm-input"
              type="text"
              name="poojaName"
              value={poojaData.poojaName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pfm-field pfm-field--date">
            <label className="pfm-label">Date</label>
            <DatePicker
              selected={poojaData.date}
              onChange={(date) => setPoojaData({ ...poojaData, date })}
              className="pfm-input"
              dateFormat="dd-MM-yyyy"
              required
              maxDate={new Date()}
              showYearDropdown
              scrollableYearDropdown
            />
          </div>

          <div className="pfm-field pfm-field--amount">
            <label className="pfm-label">Amount (INR)</label>
            <input
              className="pfm-input"
              type="number"
              name="amount"
              value={poojaData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pfm-field pfm-field--payment-method">
            <label className="pfm-label">Payment Method</label>
            <select
              className="pfm-select"
              name="paymentMethod"
              value={poojaData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div className="pfm-field pfm-field--payment-proof">
            <label className="pfm-label">Payment Proof URL</label>
            <input
              className="pfm-input"
              type="text"
              name="paymentProof"
              value={poojaData.paymentProof}
              onChange={handleChange}
            />
          </div>

          <div className="pfm-devotee-section">
            <label className="pfm-label">Devotees</label>
            {poojaData.devotees.map((devotee, index) => (
              <div key={index} className="pfm-devotee-entry">
                <input
                  className="pfm-input pfm-input--devotee-name"
                  type="text"
                  name="name"
                  placeholder="Devotee Name"
                  value={devotee.name}
                  onChange={(e) => handleDevoteeChange(index, e)}
                  required
                />
                <input
                  className="pfm-input pfm-input--devotee-nakshathra"
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
                    className="pfm-btn pfm-btn--remove"
                    onClick={() => removeDevotee(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="pfm-btn pfm-btn--add" onClick={addDevotee}>
              + Add Devotee
            </button>
          </div>

          <button type="submit" className="pfm-btn pfm-btn--submit">
            Submit Pooja
          </button>
        </form>

        {receiptInfo && (
          <div className="pfm-receipt" ref={printRef}>
            <h3 className="pfm-receipt-title">Receipt</h3>
            <p><strong>Receipt Number:</strong> {receiptInfo.receiptNumber}</p>
            <p><strong>Manual Receipt Number:</strong> {receiptInfo.manualReceiptNumber || 'N/A'}</p>
            <p><strong>Pooja Name:</strong> {receiptInfo.poojaName}</p>
            <p><strong>Date:</strong> {format(receiptInfo.date, 'dd-MM-yyyy')}</p>
            <p><strong>Amount:</strong> ₹{receiptInfo.amount}</p>
            <p><strong>Payment Method:</strong> {receiptInfo.paymentMethod}</p>
            <div>
              <strong>Devotees:</strong>
              <ul className="pfm-receipt-devotees">
                {receiptInfo.devotees.map((dev, i) => (
                  <li key={i}>
                    {dev.name} ({dev.nakshathra})
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={handlePrint} className="pfm-btn pfm-btn--print">
              Print Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoojaForm;
