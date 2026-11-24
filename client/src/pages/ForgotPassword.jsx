
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import API from "../api/authApi";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/forgot-password", { email });

      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/verify-reset-otp", {
        email,
        otp,
      });

      toast.success(res.data.message);
      setStep(3);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setLoading(true);

      const res = await API.post("/forgot-password", { email });

      setOtp("");
      toast.success(res.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-400";

  const inputWrapper =
    "flex items-center rounded-xl border border-white/10 bg-white/5 px-4 transition-all duration-300 focus-within:border-violet-500 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.3)]";

  const submitClass =
    "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-4 font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:bg-gray-600";

  return (
    <AuthLayout>
      <AuthCard>
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-xl font-bold text-white shadow-lg">
              C
            </div>

            <h1 className="text-2xl font-bold text-white">
              CareerPilot
            </h1>
          </div>

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
              {step === 1 && <Mail size={25} className="text-violet-300" />}
              {step === 2 && <ShieldCheck size={25} className="text-violet-300" />}
              {step === 3 && <Lock size={25} className="text-violet-300" />}
            </div>

            <h2 className="text-3xl font-bold text-white">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Create New Password"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {step === 1 && "Enter your registered email to receive a password reset OTP."}
              {step === 2 && `Enter the 6-digit OTP sent to ${email}.`}
              {step === 3 && "Choose a strong new password for your account."}
            </p>
          </div>

          <div className="mb-7 flex items-center gap-2">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className={`h-1.5 flex-1 rounded-full transition ${
                  step >= number
                    ? "bg-gradient-to-r from-violet-500 to-cyan-400"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Registered Email
                </label>

                <div className={inputWrapper}>
                  <Mail size={18} className="text-gray-400" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className={submitClass}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? "Sending OTP..." : "Send OTP"}
                  {!loading && <ArrowRight size={18} />}
                </span>
              </motion.button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Enter 6-digit OTP
                </label>

                <div className={inputWrapper}>
                  <ShieldCheck size={18} className="text-gray-400" />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className={`${inputClass} text-center text-xl tracking-[0.5em]`}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className={submitClass}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? "Verifying..." : "Verify OTP"}
                  {!loading && <ArrowRight size={18} />}
                </span>
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={loading}
                  onClick={resendOtp}
                  className="text-sm text-violet-300 transition hover:text-violet-100 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  New Password
                </label>

                <div className={inputWrapper}>
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Confirm Password
                </label>

                <div className={inputWrapper}>
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                </div>
              </div>

              <p className="text-xs leading-5 text-gray-400">
                Password must contain at least 8 characters, including
                uppercase, lowercase, a number and a special character.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className={submitClass}
              >
                {loading ? "Updating Password..." : "Reset Password"}
              </motion.button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-100"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
