import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminLogin,
  clearError,
} from "../redux/adminAuthSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    error,
    isAuthenticated,
    admin,
  } = useSelector(
    (state) => state.adminAuth
  );

  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(adminLogin(form));
  };

  // ==========================================
  // ONLY ADMIN CAN REDIRECT
  // ==========================================

  useEffect(() => {
    if (
      isAuthenticated &&
      admin?.role === "admin"
    ) {
      navigate(
        "/admin/dashboard",
        { replace: true }
      );
    }
  }, [
    isAuthenticated,
    admin,
    navigate,
  ]);

  // ==========================================
  // CLEAR ERROR ON UNMOUNT
  // ==========================================

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 border border-red-300 text-red-600 p-3">
            {error}
          </div>
        )}

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full border rounded p-3 mb-4 outline-none focus:border-blue-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded p-3 mb-6 outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded p-3 text-white transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>

    </div>
  );
};

export default Login;