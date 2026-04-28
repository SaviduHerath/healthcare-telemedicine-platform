import React, { useState, useEffect } from 'react';
import { getPendingPayments, verifyPayment, rejectPayment } from '../../api/paymentService';

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, paymentId: null, notes: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, paymentId: null, notes: '' });

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const adminId = storedUser._id || storedUser.email;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getPendingPayments();
      setPayments(data);
    } catch (err) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      await verifyPayment(verifyModal.paymentId, adminId, verifyModal.notes, 'Verified');
      alert('Payment verified successfully');
      setVerifyModal({ isOpen: false, paymentId: null, notes: '' });
      fetchPayments();
    } catch (err) {
      alert('Failed to verify payment: ' + err.message);
    }
  };

  const handleRejectPayment = async () => {
    try {
      await rejectPayment(rejectModal.paymentId, adminId, rejectModal.notes);
      alert('Payment rejected');
      setRejectModal({ isOpen: false, paymentId: null, notes: '' });
      fetchPayments();
    } catch (err) {
      alert('Failed to reject payment: ' + err.message);
    }
  };

  const normalizeStatus = (status) => {
    if (status === 'Failed') return 'Declined';
    return status;
  };

  const pendingCount = payments.filter(p => normalizeStatus(p.status) === 'Pending').length;
  const verifiedCount = payments.filter(p => normalizeStatus(p.status) === 'Verified').length;
  const declinedCount = payments.filter(p => normalizeStatus(p.status) === 'Declined').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payment Management</h1>
        <p className="text-slate-600 mt-2">Review and verify pending payments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {pendingCount}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Verified</p>
          <p className="text-2xl font-bold text-green-900">
            {verifiedCount}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Declined</p>
          <p className="text-2xl font-bold text-red-900">
            {declinedCount}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Total Amount</p>
          <p className="text-2xl font-bold text-blue-900">
            Rs. {payments.reduce((sum, p) => sum + p.amount, 0)}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Doctor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Method</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {payments.map((payment) => (
              (() => {
                const status = normalizeStatus(payment.status);
                return (
              <tr key={payment._id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{payment.patientName}</p>
                    <p className="text-sm text-slate-500">{payment.patientEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-900">{payment.doctorName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-green-600">Rs. {payment.amount}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.paymentMethod === 'stripe'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {payment.paymentMethod === 'stripe' ? '💳 Card' : '🏦 Bank'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'Verified' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition"
                    >
                      View
                    </button>
                    {status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => setVerifyModal({ isOpen: true, paymentId: payment._id, notes: '' })}
                          className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded hover:bg-green-100 transition"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => setRejectModal({ isOpen: true, paymentId: payment._id, notes: '' })}
                          className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        status === 'Verified'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {status}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
                );
              })()
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Payment Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="text-slate-500 hover:text-slate-700 text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Patient Info */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-slate-900 mb-2">Patient Information</h3>
                <p><span className="font-medium">Name:</span> {selectedPayment.patientName}</p>
                <p><span className="font-medium">Email:</span> {selectedPayment.patientEmail}</p>
              </div>

              {/* Doctor Info */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-slate-900 mb-2">Doctor Information</h3>
                <p><span className="font-medium">Name:</span> {selectedPayment.doctorName}</p>
              </div>

              {/* Payment Info */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-slate-900 mb-2">Payment Information</h3>
                <p><span className="font-medium">Amount:</span> Rs. {selectedPayment.amount}</p>
                <p><span className="font-medium">Method:</span> {selectedPayment.paymentMethod === 'stripe' ? 'Credit/Debit Card (Stripe)' : 'Bank Transfer'}</p>
                <p><span className="font-medium">Status:</span> {selectedPayment.status}</p>
                <p><span className="font-medium">Date:</span> {new Date(selectedPayment.createdAt).toLocaleString()}</p>
              </div>

              {/* Bank Transfer Details */}
              {selectedPayment.paymentMethod === 'bank_transfer' && selectedPayment.bankTransferDetails && (
                <div className="border-b pb-4">
                  <h3 className="font-bold text-slate-900 mb-2">Bank Transfer Details</h3>
                  <p><span className="font-medium">Bank Name:</span> {selectedPayment.bankTransferDetails.bankName}</p>
                  <p><span className="font-medium">Account Holder:</span> {selectedPayment.bankTransferDetails.accountHolder}</p>
                  <p><span className="font-medium">Transaction Ref:</span> {selectedPayment.bankTransferDetails.transactionReference}</p>
                  
                  {selectedPayment.bankTransferDetails.receiptImageUrl && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Receipt Image:</p>
                      <img 
                        src={selectedPayment.bankTransferDetails.receiptImageUrl} 
                        alt="Receipt"
                        className="max-w-md rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              {selectedPayment.adminNotes && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-2">Admin Notes</h3>
                  <p>{selectedPayment.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Verify Payment</h2>
              <textarea
                placeholder="Add verification notes (optional)"
                value={verifyModal.notes}
                onChange={(e) => setVerifyModal({...verifyModal, notes: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setVerifyModal({ isOpen: false, paymentId: null, notes: '' })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Reject Payment</h2>
              <textarea
                placeholder="Reason for rejection"
                value={rejectModal.notes}
                onChange={(e) => setRejectModal({...rejectModal, notes: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal({ isOpen: false, paymentId: null, notes: '' })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectPayment}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentManagement;
