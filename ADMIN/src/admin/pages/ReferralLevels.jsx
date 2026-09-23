// ReferralLevels.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getReferralLevels,
    updateReferralLevel,
    updateAllReferralLevels,
    resetReferralLevels,
    clearReferralLevelMessage,
} from "../redux/referralLevelSlice";

const ReferralLevels = () => {
    const dispatch = useDispatch();

    const {
        levels,
        loading,
        updating,
        resetting,
        error,
        success,
        message,
    } = useSelector((state) => state.referralLevel);

    const [formData, setFormData] = useState([]);
    const [editingLevel, setEditingLevel] = useState(null);
    const [localErrors, setLocalErrors] = useState({});
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

    // ======================================================
    // GET LEVELS
    // ======================================================

    useEffect(() => {
        dispatch(getReferralLevels());
    }, [dispatch]);

    // ======================================================
    // SET FORM DATA
    // ======================================================

    useEffect(() => {
        if (levels && levels.length > 0) {
            setFormData(
                levels.map((item) => ({
                    level: item.level,
                    percentage: item.percentage,
                    status: item.status,
                }))
            );
        }
    }, [levels]);

    // ======================================================
    // CLEAR MESSAGE
    // ======================================================

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                dispatch(clearReferralLevelMessage());
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    // ======================================================
    // CHANGE PERCENTAGE WITH VALIDATION
    // ======================================================

    const handlePercentageChange = (level, value) => {
        const numValue = parseFloat(value);
        const isValid = !isNaN(numValue) && numValue >= 0 && numValue <= 100;

        setLocalErrors((prev) => ({
            ...prev,
            [level]: isValid ? null : "Must be between 0-100",
        }));

        setFormData((prev) =>
            prev.map((item) =>
                item.level === level
                    ? { ...item, percentage: value }
                    : item
            )
        );
    };

    // ======================================================
    // CHANGE STATUS
    // ======================================================

    const handleStatusChange = (level) => {
        setFormData((prev) =>
            prev.map((item) =>
                item.level === level
                    ? { ...item, status: !item.status }
                    : item
            )
        );

        // Auto-save status change for individual level
        const updatedItem = formData.find(item => item.level === level);
        if (updatedItem) {
            handleUpdateSingleLevel(level, {
                status: !updatedItem.status,
                percentage: parseFloat(updatedItem.percentage)
            });
        }
    };

    // ======================================================
    // UPDATE SINGLE LEVEL
    // ======================================================

    const handleUpdateSingleLevel = async (level, data) => {
        try {
            const result = await dispatch(updateReferralLevel({ level, data })).unwrap();
            console.log("Level updated:", result);
            
            dispatch(getReferralLevels());
            setEditingLevel(null);
        } catch (error) {
            console.error("Failed to update level:", error);
        }
    };

    // ======================================================
    // SAVE ALL LEVELS
    // ======================================================

    const handleSaveAll = () => {
        const invalidLevel = formData.find(
            (item) => {
                const numValue = parseFloat(item.percentage);
                return isNaN(numValue) || numValue < 0 || numValue > 100;
            }
        );

        if (invalidLevel) {
            alert(`Level ${invalidLevel.level} has an invalid percentage. Must be between 0-100.`);
            return;
        }

        const levelsData = formData.map((item) => ({
            level: Number(item.level),
            percentage: parseFloat(item.percentage),
            status: Boolean(item.status),
        }));

        dispatch(updateAllReferralLevels(levelsData));
    };

    // ======================================================
    // SAVE SINGLE LEVEL (on blur)
    // ======================================================

    const handleBlur = (level) => {
        const item = formData.find((item) => item.level === level);
        if (!item) return;

        const numValue = parseFloat(item.percentage);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return;
        }

        handleUpdateSingleLevel(level, {
            percentage: numValue,
            status: item.status,
        });
    };

    // ======================================================
    // RESET
    // ======================================================

    const handleReset = () => {
        const confirmReset = window.confirm(
            "Are you sure you want to reset all referral levels to defaults?"
        );

        if (!confirmReset) {
            return;
        }

        dispatch(resetReferralLevels());
    };

    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    <p className="text-sm font-medium text-gray-500">
                        Loading referral levels...
                    </p>
                </div>
            </div>
        );
    }

    // ======================================================
    // GET LEVEL COLOR
    // ======================================================

    const getLevelColor = (level) => {
        const colors = {
            1: "from-purple-500 to-purple-600",
            2: "from-blue-500 to-blue-600",
            3: "from-cyan-500 to-cyan-600",
            4: "from-teal-500 to-teal-600",
            5: "from-green-500 to-green-600",
            6: "from-yellow-500 to-yellow-600",
            7: "from-orange-500 to-orange-600",
            8: "from-red-500 to-red-600",
        };
        return colors[level] || "from-gray-500 to-gray-600";
    };

    const getLevelBadgeColor = (level) => {
        const colors = {
            1: "bg-purple-100 text-purple-700",
            2: "bg-blue-100 text-blue-700",
            3: "bg-cyan-100 text-cyan-700",
            4: "bg-teal-100 text-teal-700",
            5: "bg-green-100 text-green-700",
            6: "bg-yellow-100 text-yellow-700",
            7: "bg-orange-100 text-orange-700",
            8: "bg-red-100 text-red-700",
        };
        return colors[level] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white/80 p-5 shadow-lg backdrop-blur-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                            🎯 Referral Levels
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage commission percentages for all 8 referral levels.
                            Changes are saved automatically.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* View toggle - Mobile */}
                        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 md:hidden">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                    viewMode === "grid"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                    viewMode === "list"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                List
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={resetting || updating}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {resetting ? "⏳ Resetting..." : "🔄 Reset Defaults"}
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveAll}
                            disabled={updating || resetting}
                            className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updating ? "💾 Saving..." : "💾 Save All Changes"}
                        </button>
                    </div>
                </div>

                {/* SUCCESS MESSAGE */}
                {success && message && (
                    <div className="mb-5 animate-slideDown rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm">
                        ✅ {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="mb-5 animate-slideDown rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
                        ❌ {error}
                    </div>
                )}

                {/* LEVELS COUNT */}
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {formData.length} of 8 referral levels
                    </p>
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm text-gray-500">View:</span>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                                viewMode === "grid"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                                viewMode === "list"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                        >
                            List
                        </button>
                    </div>
                </div>

                {/* GRID VIEW - Mobile & Desktop */}
                {viewMode === "grid" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {formData.map((item) => (
                            <div
                                key={item.level}
                                className="group rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-xl hover:scale-[1.02]"
                            >
                                {/* Level Header */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${getLevelColor(item.level)} text-lg font-bold text-white shadow-lg`}>
                                            {item.level}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">
                                                Level {item.level}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                Referral Level
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getLevelBadgeColor(item.level)}`}>
                                        {item.percentage}%
                                    </span>
                                </div>

                                {/* Percentage Input */}
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-semibold text-gray-600">
                                        Commission
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={item.percentage}
                                            onChange={(e) =>
                                                handlePercentageChange(
                                                    item.level,
                                                    e.target.value
                                                )
                                            }
                                            onBlur={() => handleBlur(item.level)}
                                            className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm font-semibold outline-none transition focus:ring-2 ${
                                                localErrors[item.level]
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                            }`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                            %
                                        </span>
                                    </div>
                                    {localErrors[item.level] && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {localErrors[item.level]}
                                        </p>
                                    )}
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-sm font-semibold text-gray-600">
                                        Status
                                    </span>
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleStatusChange(item.level)
                                            }
                                            className={`relative h-6 w-11 rounded-full transition ${
                                                item.status
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                                    item.status
                                                        ? "left-6"
                                                        : "left-1"
                                                }`}
                                            />
                                        </button>
                                        <span
                                            className={`ml-3 text-sm font-semibold ${
                                                item.status
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {item.status ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LIST VIEW - Mobile & Desktop */}
                {viewMode === "list" && (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Level
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Commission %
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Preview
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {formData.map((item) => (
                                        <tr
                                            key={item.level}
                                            className="border-b last:border-0 transition hover:bg-gray-50"
                                        >
                                            {/* LEVEL */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${getLevelColor(item.level)} text-sm font-bold text-white shadow-md`}>
                                                        {item.level}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            Level {item.level}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Referral Level
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* PERCENTAGE */}
                                            <td className="px-6 py-5">
                                                <div className="relative w-40">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                        value={item.percentage}
                                                        onChange={(e) =>
                                                            handlePercentageChange(
                                                                item.level,
                                                                e.target.value
                                                            )
                                                        }
                                                        onBlur={() => handleBlur(item.level)}
                                                        className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm font-semibold outline-none transition focus:ring-2 ${
                                                            localErrors[item.level]
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                                        }`}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                                        %
                                                    </span>
                                                    {localErrors[item.level] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {localErrors[item.level]}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(item.level)
                                                        }
                                                        className={`relative h-6 w-11 rounded-full transition ${
                                                            item.status
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                                                item.status
                                                                    ? "left-6"
                                                                    : "left-1"
                                                            }`}
                                                        />
                                                    </button>
                                                    <span
                                                        className={`ml-3 text-sm font-semibold ${
                                                            item.status
                                                                ? "text-green-600"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {item.status ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* PREVIEW */}
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${getLevelBadgeColor(item.level)}`}>
                                                    {item.percentage}%
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => {
                                                        const itemData = formData.find(f => f.level === item.level);
                                                        handleUpdateSingleLevel(item.level, {
                                                            percentage: parseFloat(itemData.percentage),
                                                            status: itemData.status,
                                                        });
                                                    }}
                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                                                >
                                                    Save
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* INFO */}
                <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <h3 className="font-bold text-blue-800">
                                Referral Commission Structure
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-blue-600">
                                <span className="font-semibold">Level 1</span> is your direct referral. 
                                <span className="font-semibold"> Level 2</span> is your referral's referral,
                                continuing up to <span className="font-semibold">Level 8</span>. 
                                Changes are saved automatically when you modify a percentage or toggle status.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {[1,2,3,4,5,6,7,8].map(level => (
                                    <span key={level} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getLevelBadgeColor(level)}`}>
                                        L{level}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-600">Commission Range</span>
                        <span className="text-gray-500">
                            {Math.min(...formData.map(item => parseFloat(item.percentage)))}% - {Math.max(...formData.map(item => parseFloat(item.percentage)))}%
                        </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{
                                width: `${(Math.max(...formData.map(item => parseFloat(item.percentage))) / 100) * 100}%`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ReferralLevels;