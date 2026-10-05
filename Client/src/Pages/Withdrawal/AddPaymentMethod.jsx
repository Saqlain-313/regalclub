// pages/Withdrawal/AddPaymentMethod.jsx
//
// Add / edit a saved withdrawal method:
//   /withdrawal/add/bankcard  -> bank
//   /withdrawal/add/upiaddress -> upi
//   /withdrawal/add/usdt      -> usdt
// Edit mode is triggered with navigation state: { methodId }

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertCircle,
  Banknote,
  Building2,
  ChevronLeft,
  CreditCard,
  KeyRound,
  Phone,
  Save,
  User,
  Wallet,
} from "lucide-react";

import {
  addPaymentMethod,
  fetchPaymentMethods,
  selectPaymentMethods,
  selectPaymentMethodsSaving,
  updatePaymentMethod,
} from "../../redux/slices/paymentMethodSlice";

const TYPE_CONFIG = {
  bankcard: {
    type: "bank",
    title: "Add a bank account number",
    editTitle: "Edit bank account",
    warning: "To ensure the safety of your funds, please bind your bank account",
  },
  upiaddress: {
    type: "upi",
    title: "Add a UPI address",
    editTitle: "Edit UPI address",
    warning: "To ensure the safety of your funds, please bind your UPI address",
  },
  usdt: {
    type: "usdt",
    title: "Add a USDT address",
    editTitle: "Edit USDT address",
    warning:
      "Make sure the network matches your wallet network — sending on the wrong network can lose your funds",
  },
};

const Field = ({ icon, label, children }) => (
  <div className="mb-4">
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[#B45CFF]">{icon}</span>
      <span className="text-xs font-semibold text-gray-300">{label}</span>
    </div>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-[#2a1b3d] bg-[#12061C] px-3.5 py-3 text-sm font-semibold text-white placeholder-gray-500 outline-none transition-all focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/30";
const errorClass = "mt-1 text-[10px] text-red-400 error-message";

const AddPaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Kind from the URL — /withdrawal/add/bankcard | upiaddress | usdt
  // (the routes have no :kind param, so read it from the pathname)
  const kind = String(location.pathname)
    .split("/")
    .filter(Boolean)
    .pop(); // bankcard | upiaddress | usdt

  const config = TYPE_CONFIG[kind] || TYPE_CONFIG.bankcard;
  const methods = useSelector(selectPaymentMethods);
  const saving = useSelector(selectPaymentMethodsSaving);

  const editMethod = methods.find(
    (m) => location.state?.methodId && m._id === location.state.methodId,
  );

  const [form, setForm] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    phone: "",
    upiId: "",
    upiName: "",
    network: "TRC20",
    walletAddress: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // Pre-fill when editing
  useEffect(() => {
    if (editMethod) {
      setForm((prev) => ({
        ...prev,
        bankName: editMethod.bankName || "",
        accountHolderName: editMethod.accountHolderName || "",
        accountNumber: editMethod.accountNumber || "",
        ifscCode: editMethod.ifscCode || "",
        phone: editMethod.phone || "",
        upiId: editMethod.upiId || "",
        upiName: editMethod.upiName || "",
        network: editMethod.network || "TRC20",
        walletAddress: editMethod.walletAddress || "",
      }));
    }
  }, [editMethod?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (config.type === "bank") {
      if (!form.accountHolderName.trim())
        errs.accountHolderName = "Recipient name is required";
      if (!/^\d{9,18}$/.test(form.accountNumber.trim()))
        errs.accountNumber = "Enter a valid bank account number";
      if (!form.bankName.trim()) errs.bankName = "Please select a bank";
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(form.ifscCode.trim()))
        errs.ifscCode = "Enter a valid IFSC code";
    } else if (config.type === "upi") {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(form.upiId.trim()))
        errs.upiId = "Enter a valid UPI ID (e.g. name@paytm)";
      if (!form.upiName.trim()) errs.upiName = "Holder name is required";
    } else {
      if (!form.walletAddress.trim() || form.walletAddress.trim().length < 20)
        errs.walletAddress = "Enter a valid USDT wallet address";
      if (!form.network) errs.network = "Select a network";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editMethod) {
        await dispatch(
          updatePaymentMethod({ id: editMethod._id, ...form }),
        ).unwrap();
        toast.success("Payment method updated successfully");
      } else {
        await dispatch(addPaymentMethod({ type: config.type, ...form })).unwrap();
        toast.success("Payment method saved successfully");
      }
      navigate(-1);
    } catch (err) {
      toast.error(String(err).slice(0, 140) || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0410] pb-10">
      <div className="mx-auto max-w-md px-4 pt-4">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2a1b3d] bg-[#1C0F2B] text-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-base font-bold text-white">
            {editMethod ? config.editTitle : config.title}
          </h1>
        </div>

        {/* WARNING BANNER */}
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#B45CFF]/25 bg-[#B45CFF]/8 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-[#B45CFF]" />
          <p className="text-[11px] leading-relaxed text-gray-300">
            {config.warning}
          </p>
        </div>

        {/* FORM */}
        {config.type === "bank" && (
          <>
            <Field icon={<Building2 size={16} />} label="Choose a bank">
              <select
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Please select a bank</option>
                {[
                  "State Bank of India",
                  "HDFC Bank",
                  "ICICI Bank",
                  "Axis Bank",
                  "Punjab National Bank",
                  "Kotak Mahindra Bank",
                  "Bank of Baroda",
                  "Union Bank of India",
                  "Canara Bank",
                  "Yes Bank",
                  "IndusInd Bank",
                  "IDFC FIRST Bank",
                  "Other Bank",
                ].map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {errors.bankName && <p className={errorClass}>{errors.bankName}</p>}
            </Field>

            <Field icon={<User size={16} />} label="Full recipient's name">
              <input
                type="text"
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter full recipient's name"
              />
              {errors.accountHolderName && (
                <p className={errorClass}>{errors.accountHolderName}</p>
              )}
            </Field>

            <Field icon={<CreditCard size={16} />} label="Bank account number">
              <input
                type="text"
                inputMode="numeric"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                className={inputClass}
                placeholder="Please enter your bank account number"
              />
              {errors.accountNumber && (
                <p className={errorClass}>{errors.accountNumber}</p>
              )}
            </Field>

            <Field icon={<Phone size={16} />} label="Phone number">
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="Please enter your phone number"
              />
            </Field>

            <Field icon={<KeyRound size={16} />} label="IFSC code">
              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                className={`${inputClass} uppercase`}
                placeholder="Please enter IFSC code"
              />
              {errors.ifscCode && <p className={errorClass}>{errors.ifscCode}</p>}
            </Field>
          </>
        )}

        {config.type === "upi" && (
          <>
            <Field icon={<Wallet size={16} />} label="UPI ID">
              <input
                type="text"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. name@paytm"
              />
              {errors.upiId && <p className={errorClass}>{errors.upiId}</p>}
            </Field>

            <Field icon={<User size={16} />} label="UPI holder name">
              <input
                type="text"
                name="upiName"
                value={form.upiName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter UPI holder name"
              />
              {errors.upiName && <p className={errorClass}>{errors.upiName}</p>}
            </Field>
          </>
        )}

        {config.type === "usdt" && (
          <>
            <Field icon={<Banknote size={16} />} label="USDT network">
              <select
                name="network"
                value={form.network}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="TRC20">USDT — TRC20 (Tron)</option>
                <option value="ERC20">USDT — ERC20 (Ethereum)</option>
                <option value="BEP20">USDT — BEP20 (BNB Chain)</option>
              </select>
              {errors.network && <p className={errorClass}>{errors.network}</p>}
            </Field>

            <Field icon={<Wallet size={16} />} label="USDT wallet address">
              <input
                type="text"
                name="walletAddress"
                value={form.walletAddress}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your USDT wallet address"
              />
              {errors.walletAddress && (
                <p className={errorClass}>{errors.walletAddress}</p>
              )}
            </Field>
          </>
        )}

        {/* SAVE */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`mt-2 w-full rounded-full py-3.5 text-sm font-bold tracking-widest text-white transition-all active:scale-[0.98] ${
            saving
              ? "cursor-not-allowed bg-[#2a1b3d] text-gray-500"
              : "bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_12px_rgba(180,92,255,0.5)]"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={15} />
                {editMethod ? "Update" : "Save"}
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AddPaymentMethod;
