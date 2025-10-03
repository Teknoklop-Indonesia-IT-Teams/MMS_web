import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/apiSimple";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, Mail } from "lucide-react";
import LottieAnimation from "../Common/LottieAnimation";

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, showLoadingToast } = useToast();
  const { login } = useAuth();

  // Animation configuration - Lottie animations
  const ANIMATIONS = {
    login: "https://assets3.lottiefiles.com/packages/lf20_jcikwtux.json", // Security/Lock animation
    loading: "https://assets1.lottiefiles.com/packages/lf20_p8bfn5to.json", // Loading spinner
    success: "https://assets9.lottiefiles.com/packages/lf20_lk80fpsm.json", // Success checkmark
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showLoadingToast("Logging in...");

    try {
      console.log("🔑 Robust Login: Attempting login...");
      const response = await authService.login(credentials);

      // Type assertion for response data with enhanced parsing
      const responseData = response.data as {
        token?: string;
        accessToken?: string;
        expiresIn?: number;
        user?: {
          userId: string;
          name: string;
          role: string;
          email: string;
        };
        message?: string;
      };

      console.log("✅ Robust Login: Response received:", {
        hasToken: !!(responseData.token || responseData.accessToken),
        hasUser: !!responseData.user,
        expiresIn: responseData.expiresIn,
        message: responseData.message,
      });

      // Extract token and user data
      const token = responseData.token || responseData.accessToken;
      const user = responseData.user;
      const expiresIn = responseData.expiresIn || 86400; // Default 24 hours

      if (!token || !user) {
        throw new Error("Invalid response format: missing token or user data");
      }

      // Convert response to proper User format
      const userData = {
        id: parseInt(user.userId, 10),
        nama: user.name, // Use 'nama' instead of 'name' to match User type
        role: user.role,
        username: user.email, // Use email as username
        petugas: user.name,
        email: user.email,
      };

      console.log("👤 Robust Login: User data prepared:", {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        expiresIn: expiresIn + " seconds",
      });

      // Use robust login with expiration time
      login(token, userData, expiresIn);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      showSuccess(
        `Welcome back, ${user.name}!`,
        `Logged in as ${user.role}. Token valid for ${Math.round(
          expiresIn / 3600
        )} hours.`
      );

      // Show success animation dengan urutan yang benar
      setLoginSuccess(true);
      setIsLoading(false); // Stop loading animation

      // Delay untuk menampilkan pesan "Login Successful"
      setTimeout(() => {
        setShowSuccessMessage(true);
      }, 1000); // 1 detik setelah animasi success muncul

      // Mulai countdown redirect
      setTimeout(() => {
        setIsRedirecting(true);
      }, 2500);

      // Delay navigation untuk memberikan waktu user melihat pesan success
      setTimeout(() => {
        console.log("✅ Robust Login: Login completed successfully");
        navigate("/dashboard");
      }, 3500); // Total 3.5 detik untuk experience yang optimal
    } catch (error: unknown) {
      console.error("❌ Robust Login: Login failed:", error);

      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Login failed. Please check your credentials.";

      showError("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Decorative Elements */}
      <div className="absolute w-32 h-32 bg-green-200 rounded-full top-10 left-10 opacity-30 blur-xl"></div>
      <div className="absolute w-24 h-24 bg-blue-200 rounded-full top-20 right-20 opacity-40 blur-lg"></div>
      <div className="absolute bg-purple-200 rounded-full opacity-25 bottom-20 left-20 w-28 h-28 blur-xl"></div>
      <div className="absolute bg-green-300 rounded-full bottom-10 right-10 w-36 h-36 opacity-20 blur-2xl"></div>

      {/* Centered Login Form */}
      <div className="w-full max-w-md mx-auto">
        <div className="p-8 bg-white shadow-2xl backdrop-blur-sm rounded-2xl">
          {/* Animation Section dengan Transisi Smooth */}
          <div className="flex justify-center mb-6">
            <div className="relative w-[150px] h-[150px] flex items-center justify-center">
              {/* Login Success Animation */}
              {loginSuccess && (
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 transform animate-success-glow ${
                    loginSuccess
                      ? "scale-100 opacity-100"
                      : "scale-75 opacity-0"
                  }`}
                >
                  <LottieAnimation
                    src={ANIMATIONS.success}
                    width={120}
                    height={120}
                    loop={false}
                  />
                </div>
              )}

              {/* Loading Animation */}
              {isLoading && !loginSuccess && (
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
                    isLoading ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                >
                  <LottieAnimation
                    src={ANIMATIONS.loading}
                    width={120}
                    height={120}
                  />
                </div>
              )}

              {/* Default Login Animation */}
              {!isLoading && !loginSuccess && (
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
                    !isLoading && !loginSuccess
                      ? "scale-100 opacity-100"
                      : "scale-75 opacity-0"
                  }`}
                >
                  <LottieAnimation
                    src={ANIMATIONS.login}
                    width={150}
                    height={150}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Success Message dengan Animasi Smooth */}
          {showSuccessMessage && (
            <div className="mb-6 text-center animate-fade-in">
              <div className="inline-flex items-center px-6 py-3 border border-green-200 shadow-lg bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <div className="w-3 h-3 mr-3 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
                <span className="text-lg font-semibold text-green-800">
                  Login Successful!
                </span>
                <div className="ml-3 text-green-600">
                  <svg
                    className="w-5 h-5 animate-bounce"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 animate-fade-in">
                {isRedirecting ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Redirecting to dashboard...
                  </span>
                ) : (
                  "Taking you to dashboard in a moment..."
                )}
              </p>
            </div>
          )}

          {/* Header - Hide when login success */}
          <div
            className={`mb-8 text-center transition-all duration-700 transform ${
              loginSuccess
                ? "opacity-0 scale-95 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
          >
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Monitoring System
            </h1>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Login to your account
            </h2>
          </div>

          {/* Login Form dengan Transisi */}
          <div
            className={`transition-all duration-700 transform ${
              loginSuccess
                ? "opacity-0 scale-95 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Enter your username or email"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      })
                    }
                    className="block w-full py-3 pl-10 pr-3 placeholder-gray-400 transition-all border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    className="block w-full py-3 pl-3 pr-10 placeholder-gray-400 transition-all border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-all bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>

          {/* Sign Up Link - Always clickable */}
          <div className="mt-6 text-center space-y-3">
            {/* Forgot Password Link */}
            <div>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
