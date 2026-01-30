import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { Role } from "../../services/api";
import { ROLES } from "../../constants/roles";
interface SignUpForm {
  nama: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  telp: string;
  role: string;
}
interface RoleItem {
  id: number;
  name: string;
  value: string;
}
const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<SignUpForm>({
    nama: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    telp: "",
    role: "",
  });

  const [roles, setRoles] = useState<RoleItem[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     try {
  //       const res = await fetch(`${import.meta.env.VITE_API_URL}/roles`);
  //       const json = await res.json();

  //       if (json.success && Array.isArray(json.data)) {
  //         setRoles(json.data);
  //         console.log("roles data:", json.data);
  //       } else {
  //         setRoles([]);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       setRoles([]);
  //     }
  //   };

  //   fetchRoles();
  // }, []);
  useEffect(() => {
    if (roles.length > 0) {
      const engineerRole = roles.find((r) => r.value === "engineer");

      if (engineerRole) {
        setFormData((prev) => ({
          ...prev,
          role: engineerRole.id.toString(),
        }));
      }
    }
  }, [roles]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nama.trim()) {
      showError("Error", "Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      showError("Error", "Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("Error", "Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      showError("Error", "Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      showError("Error", "Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError("Error", "Passwords do not match");
      return false;
    }
    if (!formData.telp.trim()) {
      showError("Error", "Mobile number is required");
      return false;
    }
    if (!formData.role || formData.role === "") {
      showError("Error", "Please select a role");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: formData.nama,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            telp: formData.telp,
            role: formData.role,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        showSuccess(
          "Account Created",
          "Your account has been created successfully. Please wait for admin approval.",
        );
      } else {
        showError("Error", data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      showError(
        "Network Error",
        "Unable to connect to server. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created!
            </h1>

            <p className="text-gray-600 mb-6">
              Your account has been created successfully. An administrator will
              review and approve your account shortly.
            </p>

            <p className="text-sm text-gray-500 mb-8">
              You will receive an email notification once your account is
              approved.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join the MMS system to manage maintenance operations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="telp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mobile Number
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="telp"
                  name="telp"
                  type="number"
                  value={formData.telp}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              {/* <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Role
              </label>
              <div className="relative"> */}
              {/* <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih Role</option>

                  {roles.map((role) => {
                    console.log(
                      "ROLES",
                      roles.map((e) => e.name),
                    );

                    return (
                      <option key={role.id} value={role.id}>
                        {role.value}
                      </option>
                    );
                  })}
                </select> */}
              <input type="hidden" name="role" value={formData.role} />
            </div>
            {/* </div> */}

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
