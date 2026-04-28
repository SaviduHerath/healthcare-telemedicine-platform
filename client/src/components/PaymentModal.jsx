import React, { useState } from 'react';
import { createPaymentCheckout, createBankTransferPayment } from '../api/paymentService';

const PaymentModal = ({ appointment, isOpen, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    routingNumber: '',
    transactionReference: ''
  });

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isOpen || !appointment) return null;

  const handleStripePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const paymentData = {
        appointmentId: appointment._id,
        amount: appointment.consultationFee || 1500,
        patientEmail: storedUser.email,
        patientPhone: storedUser.phoneNumber || storedUser.phone || '',
        patientName: storedUser.fullName || 'Patient',
        patientId: storedUser._id || storedUser.email,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName
      };
      
      const response = await createPaymentCheckout(paymentData);
      
      if (response.url) {
        window.location.href = response.url;
      } else {
        setError('Failed to initiate Stripe payment');
      }
    } catch (err) {
      setError('Payment failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (base64String, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(base64String);
    });
  };

  const handleBankTransferPayment = async (e) => {
    e.preventDefault();
    
    if (!receiptFile) {
      setError('Please upload receipt image');
      return;
    }

    if (!bankDetails.transactionReference) {
      setError('Please enter transaction reference');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert receipt file to base64 and compress
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('authToken');
          
          if (!token) {
            setError('Authentication token not found. Please login again.');
            setLoading(false);
            return;
          }

          // Compress the image to reduce payload size
          let receiptImageUrl = reader.result;
          if (receiptImageUrl.startsWith('data:image')) {
            receiptImageUrl = await compressImage(receiptImageUrl, 0.6);
          }

          const paymentData = {
            appointmentId: appointment._id,
            amount: appointment.consultationFee || 1500,
            patientId: storedUser._id || storedUser.email,
            patientName: storedUser.fullName || 'Patient',
            patientEmail: storedUser.email,
            patientPhone: storedUser.phoneNumber || storedUser.phone || '',
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
            bankName: bankDetails.bankName,
            accountHolder: bankDetails.accountHolder,
            accountNumber: bankDetails.accountNumber,
            routingNumber: bankDetails.routingNumber,
            transactionReference: bankDetails.transactionReference,
            receiptImageUrl
          };

          console.log('Sending bank transfer payment with compressed image');

          const response = await createBankTransferPayment(paymentData);
          
          if (response.paymentId) {
            alert('Bank transfer payment recorded! Awaiting admin verification.');
            onPaymentSuccess();
            onClose();
          }
        } catch (err) {
          console.error('Bank transfer error:', err);
          const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Payment failed';
          setError('Payment failed: ' + errorMsg);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(receiptFile);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Error processing payment: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Make Payment</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Appointment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-600 font-medium">Consultation with</p>
                <p className="text-lg font-bold text-slate-900">{appointment.doctorName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Amount to pay</p>
                <p className="text-2xl font-bold text-green-600">Rs. {appointment.consultationFee || 1500}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Select Payment Method</h3>
            
            {/* Stripe Option */}
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition" style={{borderColor: paymentMethod === 'stripe' ? '#3b82f6' : '#e2e8f0'}}>
              <input
                type="radio"
                name="payment"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => { setPaymentMethod(e.target.value); setError(null); }}
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-4 flex-1">
                <p className="font-semibold text-slate-900">Credit/Debit Card</p>
                <p className="text-sm text-slate-500">Pay securely via Stripe</p>
              </div>
              <div className="text-2xl">💳</div>
            </label>

            {/* Bank Transfer Option */}
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition" style={{borderColor: paymentMethod === 'bank_transfer' ? '#3b82f6' : '#e2e8f0'}}>
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={(e) => { setPaymentMethod(e.target.value); setError(null); }}
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-4 flex-1">
                <p className="font-semibold text-slate-900">Bank Transfer</p>
                <p className="text-sm text-slate-500">Transfer funds directly to our account</p>
              </div>
              <div className="text-2xl">🏦</div>
            </label>
          </div>

          {/* Stripe Payment */}
          {paymentMethod === 'stripe' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">
                  You will be redirected to Stripe's secure payment page. No card details are stored on our servers.
                </p>
              </div>
              <button
                onClick={handleStripePayment}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '🔄 Processing...' : '💳 Pay with Card'}
              </button>
            </div>
          )}

          {/* Bank Transfer Form */}
          {paymentMethod === 'bank_transfer' && (
            <form onSubmit={handleBankTransferPayment} className="space-y-4">
              {/* Bank Details Display */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-3">Transfer to this account:</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Bank Name:</span> Healthcare Bank Ltd</p>
                  <p><span className="font-semibold">Account Holder:</span> Healthcare Platform</p>
                  <p><span className="font-semibold">Account Number:</span> 1234567890</p>
                  <p><span className="font-semibold">Routing Number:</span> 021000021</p>
                </div>
              </div>

              {/* Bank Details Form */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Confirm Transfer Details</h4>
                
                <input
                  type="text"
                  placeholder="Your Bank Name"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Your Account Number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Routing Number"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Transaction Reference / UTR"
                  value={bankDetails.transactionReference}
                  onChange={(e) => setBankDetails({...bankDetails, transactionReference: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Receipt Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0])}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="font-semibold text-slate-900">Upload Receipt Image</p>
                  <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                  {receiptFile && (
                    <p className="text-sm text-green-600 mt-2">✓ {receiptFile.name}</p>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '🔄 Processing...' : '✓ Submit Bank Transfer'}
              </button>
            </form>
          )}

          {/* Footer Note */}
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
            <p>💡 After bank transfer, admin will verify your payment within 24 hours. You'll receive a notification once verified.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
