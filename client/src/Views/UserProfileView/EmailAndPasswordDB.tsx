import React, { useState } from 'react';
import Modal from 'react-modal';
import { Mail, Lock, Eye, EyeOff, Check, X, Key, Shield } from 'lucide-react';
import http from '../../../http';

const EmailAndPasswordDB: React.FC<{
  input: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ input, isOpen, setIsOpen }) => {
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [changePassData, setChangePassData] = useState<any>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);

  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: 0,
      border: 'none',
      borderRadius: '16px',
      background: 'transparent',
      overflow: 'visible'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999999999
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (input === 'email') {
        const result = await http.patch('changeEmail', { email, password });
        setError('');
        setMessage(result.data.message);
        setShowOtp(true);
      } else if (input === 'password') {
        const result = await http.patch('changePassword', changePassData);
        setError('');
        setMessage(result.data.message);
        setChangePassData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        setTimeout(() => {
          setIsOpen(false);
          setMessage('');
          setError('');
        }, 1000);
      }
    } catch (error: any) {
      if (error.status === 401) {
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOTP = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (input === 'email' && otp) {
        const result = await http.patch('verifyChangeEmailOTP', { otp, email });
        setShowOtp(false);
        setError('');
        setMessage('Email successfully changed');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          setIsOpen(false);
          setMessage('Email successfully changed');
        }, 1000);
      }
    } catch (error: any) {
      if (error.status === 400) {
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setError('');
    setMessage('');
    setEmail('');
    setPassword('');
    setChangePassData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setShowOtp(false);
  };

  return (
    <Modal
      onRequestClose={closeModal}
      isOpen={isOpen}
      style={modalStyle}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-8 w-full max-w-md mx-auto relative">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-theme_normal rounded-2xl mb-4 shadow-lg">
            {input === 'email' ? (
              <Mail className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {input === 'email' ? 'Change Email' : 'Change Password'}
          </h1>
          <p className="text-gray-600">
            {input === 'email' 
              ? 'Update your email address securely'
              : 'Create a new secure password'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600 text-center">{message}</p>
          </div>
        )}

        <div className="space-y-6">
          {input === 'email' ? (
            <>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 z-10 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={showOtp}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border-gray-200 focus:border-indigo-500 disabled:opacity-50"
                    placeholder="Enter your new email"
                  />
                  {validateEmail(email) && email && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute  z-10 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={showOtp}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border-gray-200 focus:border-indigo-500 disabled:opacity-50"
                    placeholder="Enter your current password"
                  />
                </div>
              </div>

              {/* OTP Field */}
              {showOtp && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 z-10 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border-gray-200 focus:border-indigo-500"
                      placeholder="Enter the OTP sent to your email"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Current Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 z-10 text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={changePassData.currentPassword}
                    onChange={(e) => setChangePassData((prev : any) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border-gray-200 focus:border-indigo-500"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-indigo-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 z-10 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 z-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 z-10 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={changePassData.newPassword}
                    onChange={(e) => setChangePassData((prev : any) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border-gray-200 focus:border-indigo-500"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-indigo-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 z-10 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 z-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 z-10 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={changePassData.confirmNewPassword}
                    onChange={(e) => setChangePassData((prev : any) => ({ ...prev, confirmNewPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50/50 backdrop-blur-sm focus:bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border-gray-200 focus:border-indigo-500"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-indigo-600 transition-colors"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="h-5 w-5 z-10 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 z-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={showOtp ? handleSubmitOTP : handleSubmit}
            disabled={loading}
            className="w-full bg-theme_normal disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>
                  {showOtp ? 'Verifying...' : input === 'email' ? 'Sending OTP...' : 'Updating Password...'}
                </span>
              </div>
            ) : (
              <span>
                {showOtp ? 'Verify OTP' : input === 'email' ? 'Send Verification Code' : 'Update Password'}
              </span>
            )}
          </button>
        </div>

        {/* Security Notice */}
        {/* <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <span>
              {input === 'email' 
                ? "For your security, you'll receive a confirmation email at both your current and new email addresses."
                : "Make sure your new password is strong and unique. Avoid using personal information or common words."
              }
            </span>
          </p>
        </div> */}
      </div>
    </Modal>
  );
};

export default EmailAndPasswordDB;