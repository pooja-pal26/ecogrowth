import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // SweetAlert modal state matching PHP checkValidData()
  const [swalAlert, setSwalAlert] = useState({
    isOpen: false,
    title: '',
    text: '',
    icon: 'error',
    focusId: ''
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Genstree AI LLP';
  }, []);

  const handleCloseSwal = () => {
    const targetId = swalAlert.focusId;
    setSwalAlert({ isOpen: false, title: '', text: '', icon: 'error', focusId: '' });
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.focus();
      }, 50);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // PHP exact validation: checkValidData()
    if (!email.trim()) {
      setSwalAlert({
        isOpen: true,
        title: 'Email Missing !',
        text: 'Please enter email.',
        icon: 'error',
        focusId: 'email'
      });
      return;
    }

    if (!password) {
      setSwalAlert({
        isOpen: true,
        title: 'Password Missing !',
        text: 'Please enter password.',
        icon: 'error',
        focusId: 'password'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-slate-950">
      {/* Background AI Infrastructure Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        poster="/assets/login_img.png"
      >
        <source src="/assets/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Futuristic Deep Gradient & Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-900/65 to-slate-950/80 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.7)_100%)] pointer-events-none z-[1]" />

      {/* Dynamic ambient gradient glow spheres */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-35 filter blur-3xl pointer-events-none z-[2]"
        style={{ background: 'radial-gradient(circle, #0d9488 0%, #4f46e5 100%)' }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-35 filter blur-3xl pointer-events-none z-[2]"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, #0891b2 100%)' }}
      />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-8 sm:p-10 transition-all duration-300">
        
        {/* Brand Logo Header matching PHP EcoGrowth */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <img 
              src="/assets/echo_growth.png" 
              alt="Genstree AI LLP" 
              className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="inline-block px-3 py-1 bg-teal-50 border border-teal-100 rounded-full">
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-800">
              Enterprise Portal &bull; EcoGrowth
            </p>
          </div>
        </div>

        {/* Server Error Alert matching PHP EcoGrowth message style */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50/95 border border-red-200 border-l-4 border-l-red-600 text-red-700 text-sm rounded-r-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <div>
                <strong className="font-bold">Error!&nbsp;</strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-800 text-lg leading-none font-bold cursor-pointer p-1"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/75 hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 rounded-xl text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50/75 hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 rounded-xl text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button with app theme gradient */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 35%, #4f46e5 70%, #7c3aed 100%)'
              }}
              className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-teal-500/25 hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Genstree AI LLP &bull; All Rights Reserved
          </p>
        </div>
      </div>

      {/* SweetAlert Modal matching PHP swal() exactly */}
      {swalAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              {swalAlert.icon === 'error' ? (
                <div className="w-16 h-16 rounded-full border-4 border-red-200 flex items-center justify-center bg-red-50 text-red-500 text-4xl font-light leading-none">
                  &times;
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center bg-green-50 text-green-500 text-3xl font-bold">
                  &#10003;
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {swalAlert.title}
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              {swalAlert.text}
            </p>

            <button
              type="button"
              onClick={handleCloseSwal}
              className="w-full bg-[#7cd1f9] hover:bg-[#63c3f0] active:bg-[#52b5e3] text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm uppercase tracking-wider cursor-pointer shadow-xs"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

