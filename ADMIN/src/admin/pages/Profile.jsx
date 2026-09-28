import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminProfile,
  updateAdminProfile,
  clearMessage,
  clearError,
} from "../redux/adminAuthSlice";
import { toast } from "react-toastify";
import { UserCircle, Shield, Mail, Phone, MapPin, Loader2 } from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const { admin, isProfileLoading, loading, success, message, error } =
    useSelector((state) => state.adminAuth);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    city: "",
  });

  useEffect(() => {
    if (!admin) dispatch(getAdminProfile());
  }, [dispatch, admin]);

  useEffect(() => {
    if (admin) {
      const user = admin?.user || admin;
      setForm({
        fullName: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
        city: user?.city || "",
      });
    }
  }, [admin]);

  useEffect(() => {
    if (success && message) toast.success(message);
    if (error) toast.error(error);
    return () => {
      dispatch(clearMessage());
      dispatch(clearError());
    };
  }, [success, message, error, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateAdminProfile(form));
    if (updateAdminProfile.fulfilled.match(result)) {
      dispatch(getAdminProfile());
    }
  };

  const user = admin?.user || admin;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
              <UserCircle size={44} />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-800 capitalize">
              {user?.name || "Admin"}
            </h2>
            <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
              <Shield size={12} className="text-purple-500" />
              {user?.role || "admin"}
            </p>
          </div>

          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-gray-400" />
              {user?.email || "-"}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400" />
              {user?.mobile || "-"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              {user?.city || "-"}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
