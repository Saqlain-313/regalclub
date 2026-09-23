import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Power, RefreshCw, X } from "lucide-react";
import {
  getAllDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  toggleDivisionStatus,
  clearDivisionMessage,
} from "../redux/powerballDivisionSlice";

const SUPPORTED = ["india", "uae", "nepal", "pakistan", "australia", "bangladesh"];

const normalizeCountry = (value) => {
  const country = String(value || "").toLowerCase();
  return SUPPORTED.includes(country) ? country : "india";
};

const initialForm = {
  division: "",
  main: "",
  powerball: false,
  prize: "",
  isActive: true,
};

export default function PowerballDivisions({ country: countryProp }) {
  const { country: routeCountry } = useParams();
  const country = normalizeCountry(countryProp || routeCountry);

  const dispatch = useDispatch();
  const { divisions = [], loading = false, error, success, message } =
    useSelector((state) => state.powerballDivision || {});

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(getAllDivisions(country));
  }, [dispatch, country]);

  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => dispatch(clearDivisionMessage()), 2500);
      return () => clearTimeout(t);
    }
  }, [dispatch, success, error]);

  const change = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      division: Number(form.division),
      main: Number(form.main),
      powerball: Boolean(form.powerball),
      prize: Number(form.prize),
      isActive: Boolean(form.isActive),
    };

    const action = editingId
      ? updateDivision({ country, id: editingId, data })
      : createDivision({ country, data });

    const result = await dispatch(action);
    if (!result.error) {
      reset();
      dispatch(getAllDivisions(country));
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({
      division: item.division ?? "",
      main: item.main ?? "",
      powerball: Boolean(item.powerball),
      prize: item.prize ?? "",
      isActive: Boolean(item.isActive),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this division?")) return;
    const result = await dispatch(deleteDivision({ country, id }));
    if (!result.error) dispatch(getAllDivisions(country));
  };

  const toggle = async (id) => {
    const result = await dispatch(toggleDivisionStatus({ country, id }));
    if (!result.error) dispatch(getAllDivisions(country));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {country.toUpperCase()} Powerball Divisions
            </h1>
            <p className="text-sm text-gray-500">
              Country: {country.toUpperCase()}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => dispatch(getAllDivisions(country))}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => (showForm ? reset() : setShowForm(true))}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Close" : "Add Division"}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {String(error)}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={submit}
            className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-5"
          >
            <input
              type="number"
              name="division"
              min="1"
              required
              value={form.division}
              onChange={change}
              placeholder="Division"
              className="rounded-lg border px-3 py-2"
            />
            <input
              type="number"
              name="main"
              min="0"
              required
              value={form.main}
              onChange={change}
              placeholder="Main"
              className="rounded-lg border px-3 py-2"
            />
            <input
              type="number"
              name="prize"
              min="0"
              required
              value={form.prize}
              onChange={change}
              placeholder="Prize"
              className="rounded-lg border px-3 py-2"
            />
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <input
                type="checkbox"
                name="powerball"
                checked={form.powerball}
                onChange={change}
              />
              Powerball
            </label>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={change}
              />
              Active
            </label>

            <div className="flex gap-2 lg:col-span-5">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border px-5 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b px-5 py-4 font-semibold">
            Divisions ({divisions.length})
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs uppercase">Division</th>
                  <th className="px-5 py-3 text-left text-xs uppercase">Main</th>
                  <th className="px-5 py-3 text-left text-xs uppercase">Powerball</th>
                  <th className="px-5 py-3 text-left text-xs uppercase">Prize</th>
                  <th className="px-5 py-3 text-left text-xs uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {divisions.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold">{item.division}</td>
                    <td className="px-5 py-4">{item.main}</td>
                    <td className="px-5 py-4">{item.powerball ? "Yes" : "No"}</td>
                    <td className="px-5 py-4 font-semibold">
                      {Number(item.prize || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggle(item._id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => edit(item)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => toggle(item._id)}
                          className="rounded-lg bg-yellow-50 p-2 text-yellow-600"
                        >
                          <Power size={16} />
                        </button>
                        <button
                          onClick={() => remove(item._id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && divisions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">
                      No divisions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
