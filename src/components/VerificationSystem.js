import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { callBackendFunction } from '../AuthContext';
import { useToast } from '../ToastContext';

const VerificationSystem = ({ type = 'user', itemId = null, onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [verificationData, setVerificationData] = useState({
    documents: [],
    notes: '',
    verificationType: type === 'user' ? 'id' : 'photo'
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    checkExistingVerification();
  }, [type, itemId]);

  const checkExistingVerification = async () => {
    try {
      if (type === 'user') {
        const userProfile = await callBackendFunction('getUserProfile', 'GET', {}, `?userId=${user?.uid}`);
        setVerificationStatus(userProfile.verificationStatus || 'pending');
      } else if (itemId) {
        const itemResponse = await callBackendFunction('getItems', 'GET', {}, `?itemId=${itemId}`);
        if (itemResponse.length > 0) {
          setVerificationStatus(itemResponse[0].verificationStatus || 'pending');
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    setVerificationData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (index) => {
    setVerificationData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const uploadDocuments = async () => {
    const uploadedUrls = [];
    
    for (const doc of verificationData.documents) {
      try {
        // Upload to Firebase Storage
        const url = await uploadToStorage(doc.file);
        uploadedUrls.push({
          name: doc.name,
          url: url,
          type: doc.type,
          size: doc.size
        });
      } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
      }
    }
    
    return uploadedUrls;
  };

  const uploadToStorage = async (file) => {
    // This would integrate with Firebase Storage
    // For now, return a placeholder URL
    return `https://storage.googleapis.com/swapin-verification/${Date.now()}_${file.name}`;
  };

  const submitVerification = async () => {
    if (verificationData.documents.length === 0) {
      showToast('Please upload at least one document', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const uploadedUrls = await uploadDocuments();
      
      const verificationPayload = {
        verificationData: {
          type: verificationData.verificationType,
          status: 'pending',
          notes: verificationData.notes,
          documents: uploadedUrls
        }
      };

      if (type === 'user') {
        verificationPayload.userId = user.uid;
        await callBackendFunction('verifyUser', 'POST', verificationPayload);
      } else {
        verificationPayload.itemId = itemId;
        await callBackendFunction('verifyItem', 'POST', verificationPayload);
      }

      setVerificationStatus('pending');
      showToast('Verification submitted successfully', 'success');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      showToast('Error submitting verification', 'error');
      console.error('Error submitting verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationSteps = () => {
    if (type === 'user') {
      return [
        { id: 1, title: 'Identity Verification', description: 'Upload government-issued ID' },
        { id: 2, title: 'Address Verification', description: 'Provide proof of address' },
        { id: 3, title: 'Phone Verification', description: 'Verify your phone number' },
        { id: 4, title: 'Review & Submit', description: 'Review and submit for approval' }
      ];
    } else {
      return [
        { id: 1, title: 'Item Photos', description: 'Upload clear photos of your item' },
        { id: 2, title: 'Condition Verification', description: 'Provide condition details' },
        { id: 3, title: 'Documentation', description: 'Upload receipts or certificates' },
        { id: 4, title: 'Review & Submit', description: 'Review and submit for approval' }
      ];
    }
  };

  const getDocumentTypes = () => {
    if (type === 'user') {
      return [
        { value: 'id', label: 'Government ID (Aadhar, PAN, Passport)' },
        { value: 'address', label: 'Address Proof (Utility Bill, Bank Statement)' },
        { value: 'phone', label: 'Phone Number Verification' },
        { value: 'email', label: 'Email Verification' }
      ];
    } else {
      return [
        { value: 'photo', label: 'Item Photos (Multiple angles)' },
        { value: 'video', label: 'Item Video Demonstration' },
        { value: 'receipt', label: 'Purchase Receipt/Invoice' },
        { value: 'warranty', label: 'Warranty Certificate' }
      ];
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        );
      case 'rejected':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        );
      case 'pending':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  if (verificationStatus === 'approved') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon('approved')}
          <div>
            <h3 className="text-lg font-semibold text-green-600">Verification Approved</h3>
            <p className="text-sm text-gray-600">
              Your {type} has been successfully verified
            </p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ Your verification is complete and you can now access all platform features
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon('rejected')}
          <div>
            <h3 className="text-lg font-semibold text-red-600">Verification Rejected</h3>
            <p className="text-sm text-gray-600">
              Your verification was not approved
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">
            Please review the requirements and submit again with proper documentation
          </p>
        </div>
        <button
          onClick={() => setVerificationStatus('pending')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Submit New Verification
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {type === 'user' ? 'User Verification' : 'Item Verification'}
        </h2>
        <p className="text-gray-600">
          Complete the verification process to build trust and access premium features
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {getVerificationSteps().map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < getVerificationSteps().length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Verification Form */}
      <div className="space-y-6">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Type
          </label>
          <select
            value={verificationData.verificationType}
            onChange={(e) => setVerificationData(prev => ({
              ...prev,
              verificationType: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {getDocumentTypes().map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Documents
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </label>
          </div>
        </div>

        {/* Uploaded Documents */}
        {verificationData.documents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
            <div className="space-y-2">
              {verificationData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={verificationData.notes}
            onChange={(e) => setVerificationData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add any additional information that might help with verification..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onComplete && onComplete()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitVerification}
            disabled={loading || verificationData.documents.length === 0}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Verification'
            )}
          </button>
        </div>
      </div>

      {/* Verification Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Verification Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure all documents are clear and legible</li>
          <li>• Upload original documents, not screenshots</li>
          <li>• Make sure documents are not expired</li>
          <li>• Verification typically takes 24-48 hours</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationSystem; 