import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    createPowerballResult,
    getAllPowerballResults,
    clearPowerballResultState,
    deletePowerballResult,
    getAllPendingGames,
    clearPendingGames,
    getUnselectedPowerballNumbers,
} from "../../redux/bangladesh/powerballResultSlice";

import { toast } from "react-toastify";

const INITIAL_FORM = {
    drawNo: "",
    gamePoolId: "",
    powerball: "",
    numbers: ["", "", "", "", "", "", ""],
};

const BangladeshPowerballResult = () => {
    const dispatch = useDispatch();

    const {
        createLoading,
        loading,
        success,
        error,
        message,
        results,
        deleteLoading,
        pendingGames,
        pendingGamesLoading,

        selectedNumbers,
        unselectedNumbers,
        unselectedCounts,
        unselectedNumbersLoading,
    } = useSelector(
        (state) => state.bangladeshPowerballResult
    );

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [groupedGames, setGroupedGames] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPendingGames, setShowPendingGames] = useState(false);
    const [showGameDetails, setShowGameDetails] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedDrawNo, setSelectedDrawNo] = useState("all");

    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {
        dispatch(getAllPowerballResults());
        dispatch(getAllPendingGames());
    }, [dispatch]);

    /* =====================================================
       GROUP PENDING GAMES BY POOL ID
    ===================================================== */

    useEffect(() => {
        if (!Array.isArray(pendingGames) || pendingGames.length === 0) {
            setGroupedGames({});
            return;
        }

        const grouped = {};

        pendingGames.forEach((item) => {
            if (!item) return;

            const poolId = item.poolId || item.gamePoolId;

            if (!poolId) return;

            if (!grouped[poolId]) {
                grouped[poolId] = {
                    poolId: String(poolId),
                    drawNo: Number(item.drawNo) || 0,
                    poolTotalPlayers: item.poolTotalPlayers || 0,
                    poolTotalAmount: item.poolTotalAmount || 0,
                    poolStatus: item.poolStatus || "Open",
                    playerId: item.playerId || null,
                    userId: item.userId || null,
                    userName: item.userName || "",
                    userEmail: item.userEmail || "",
                    bidAmount: item.bidAmount || 0,
                    currencyDetails: item.currencyDetails || {},
                    playerStatus: item.playerStatus || "Pending",
                    createdAt: item.createdAt || null,
                    games: [],
                };
            }

            if (Array.isArray(item.games)) {
                item.games.forEach((game) => {
                    if (!game) return;

                    grouped[poolId].games.push({
                        ...game,
                        poolId: String(poolId),
                        drawNo: Number(item.drawNo) || 0,
                        gameNo: Number(game.gameNo) || 0,
                        numbers: Array.isArray(game.numbers) ? game.numbers.map(Number) : [],
                        powerball: Number(game.powerball) || 0,
                        playerId: item.playerId || game.playerId || null,
                        userId: item.userId || game.userId || null,
                        userName: item.userName || game.userName || "",
                        userEmail: item.userEmail || game.userEmail || "",
                        bidAmount: item.bidAmount || game.bidAmount || 0,
                        currencyDetails: item.currencyDetails || game.currencyDetails || {},
                        playerStatus: item.playerStatus || game.playerStatus || "Pending",
                        poolStatus: item.poolStatus || game.poolStatus || "Open",
                        createdAt: item.createdAt || game.createdAt || null,
                    });
                });

                return;
            }

            grouped[poolId].games.push({
                ...item,
                poolId: String(poolId),
                drawNo: Number(item.drawNo) || 0,
                gameNo: Number(item.gameNo) || 0,
                numbers: Array.isArray(item.numbers) ? item.numbers.map(Number) : [],
                powerball: Number(item.powerball) || 0,
            });
        });

        console.log("GROUPED BANGLADESH POOLS:", grouped);

        setGroupedGames(grouped);
    }, [pendingGames]);

    /* =====================================================
       DRAW NUMBERS
    ===================================================== */

    const pendingDrawNumbers = useMemo(() => {
        const set = new Set();

        Object.values(groupedGames).forEach((pool) => {
            if (pool.drawNo) {
                set.add(Number(pool.drawNo));
            }
        });

        return Array.from(set).sort((a, b) => a - b);
    }, [groupedGames]);

    const existingDrawNumbers = useMemo(() => {
        if (!Array.isArray(results)) {
            return [];
        }

        return results
            .map((result) => Number(result.drawNo))
            .filter((value) => !Number.isNaN(value))
            .sort((a, b) => a - b);
    }, [results]);

    const allDrawNumbers = useMemo(() => {
        return [...new Set([...existingDrawNumbers, ...pendingDrawNumbers])].sort(
            (a, b) => a - b
        );
    }, [existingDrawNumbers, pendingDrawNumbers]);

    const nextDrawNumber = allDrawNumbers.length === 0
        ? 1
        : Math.max(...allDrawNumbers) + 1;

    /* =====================================================
       POOLS FOR SELECTED DRAW
    ===================================================== */

    const poolsForSelectedDraw = useMemo(() => {
        if (!formData.drawNo) {
            return [];
        }

        return Object.values(groupedGames).filter(
            (pool) => Number(pool.drawNo) === Number(formData.drawNo)
        );
    }, [groupedGames, formData.drawNo]);

    /* =====================================================
       SELECTED POOL
    ===================================================== */

    const selectedPool = useMemo(() => {
        if (!formData.gamePoolId) {
            return null;
        }

        return (
            poolsForSelectedDraw.find(
                (pool) => String(pool.poolId) === String(formData.gamePoolId)
            ) || null
        );
    }, [poolsForSelectedDraw, formData.gamePoolId]);

    /* =====================================================
       EXISTING RESULT
    ===================================================== */

    const selectedDrawHasResult = useMemo(() => {
        if (!formData.drawNo) {
            return false;
        }

        return (
            Array.isArray(results) &&
            results.some(
                (result) => Number(result.drawNo) === Number(formData.drawNo)
            )
        );
    }, [results, formData.drawNo]);

    /* =====================================================
       SUCCESS / ERROR
    ===================================================== */

    useEffect(() => {
        if (success) {
            toast.success(message || "Result Declared Successfully!");

            setFormData(INITIAL_FORM);

            dispatch(getAllPowerballResults());
            dispatch(getAllPendingGames());
            dispatch(clearPowerballResultState());
        }

        if (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Failed to declare result"
            );
        }
    }, [success, error, message, dispatch]);

    /* =====================================================
       AUTO-SELECT POOL WHEN DRAW CHANGES (FIXED)
    ===================================================== */

    // This useEffect automatically selects the first pool when a draw number is selected
    useEffect(() => {
        if (formData.drawNo && poolsForSelectedDraw.length > 0) {
            const autoPoolId = poolsForSelectedDraw[0]?.poolId;
            
            if (autoPoolId && String(autoPoolId) !== String(formData.gamePoolId)) {
                console.log("AUTO-SELECTING POOL:", autoPoolId);
                
                setFormData((prev) => ({
                    ...prev,
                    gamePoolId: autoPoolId,
                }));

                // Fetch unselected numbers for auto-selected pool
                dispatch(
                    getUnselectedPowerballNumbers({
                        gamePoolId: autoPoolId,
                    })
                );
            }
        } else if (formData.drawNo && poolsForSelectedDraw.length === 0) {
            // No pools found for this draw
            setFormData((prev) => ({
                ...prev,
                gamePoolId: "",
            }));
        }
    }, [formData.drawNo, poolsForSelectedDraw, dispatch]);

    /* =====================================================
       HANDLE CHANGE - DRAW CHANGE (UPDATED)
    ===================================================== */

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If draw number is changing
        if (name === "drawNo") {
            console.log("DRAW CHANGED:", value);

            // Reset gamePoolId, will be auto-selected by useEffect
            setFormData((prev) => ({
                ...prev,
                drawNo: value,
                gamePoolId: "",
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =====================================================
       POOL CHANGE
    ===================================================== */

    const handlePoolChange = (e) => {
        const gamePoolId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            gamePoolId,
        }));

        // Fetch unselected numbers for selected pool
        if (gamePoolId) {
            dispatch(
                getUnselectedPowerballNumbers({
                    gamePoolId,
                })
            );
        }
    };

    /* =====================================================
       NUMBER CHANGE
    ===================================================== */

    const handleNumberChange = (index, value) => {
        setFormData((prev) => {
            const numbers = [...prev.numbers];
            numbers[index] = value;

            return {
                ...prev,
                numbers,
            };
        });
    };

    /* =====================================================
       DECLARE RESULT
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("=================================");
        console.log("🔥 BANGLADESH DECLARE RESULT CLICKED");
        console.log("FORM DATA:", formData);
        console.log("=================================");

        if (isSubmitting || createLoading) {
            return;
        }

        if (!formData.drawNo) {
            toast.error("Please select Draw Number.");
            return;
        }

        if (!formData.gamePoolId) {
            toast.error("Please select Game Pool.");
            return;
        }

        const pool = poolsForSelectedDraw.find(
            (item) => String(item.poolId) === String(formData.gamePoolId)
        );

        console.log("SELECTED POOL:", pool);

        if (!pool) {
            toast.error("Selected Game Pool not found.");
            return;
        }

        if (Number(pool.drawNo) !== Number(formData.drawNo)) {
            toast.error("Selected pool does not belong to selected draw.");
            return;
        }

        const poolStatus = String(pool.poolStatus || "").trim().toLowerCase();

        if (poolStatus !== "open") {
            toast.error("Selected Game Pool is not open.");
            return;
        }

        if (selectedDrawHasResult) {
            toast.error(`Draw #${formData.drawNo} already has a result!`);
            return;
        }

        if (!Array.isArray(formData.numbers) || formData.numbers.length !== 7) {
            toast.error("Exactly 7 winning numbers are required.");
            return;
        }

        const hasEmptyNumber = formData.numbers.some(
            (value) => value === "" || value === null || value === undefined
        );

        if (hasEmptyNumber) {
            toast.error("Please enter all 7 winning numbers.");
            return;
        }

        const numbers = formData.numbers.map(Number);

        if (numbers.some((number) => !Number.isInteger(number))) {
            toast.error("Winning numbers must be valid numbers.");
            return;
        }

        if (numbers.some((number) => number < 1 || number > 35)) {
            toast.error("Winning numbers must be between 1 and 35.");
            return;
        }

        if (new Set(numbers).size !== 7) {
            toast.error("Winning numbers must be unique.");
            return;
        }

        if (formData.powerball === "" || formData.powerball === null || formData.powerball === undefined) {
            toast.error("Please enter Winning Powerball.");
            return;
        }

        const powerball = Number(formData.powerball);

        if (!Number.isInteger(powerball) || powerball < 1 || powerball > 20) {
            toast.error("Powerball must be between 1 and 20.");
            return;
        }

        const payload = {
            gamePoolId: String(formData.gamePoolId),
            numbers,
            powerball,
        };

        console.log("=================================");
        console.log("🚀 BANGLADESH FINAL PAYLOAD");
        console.log(JSON.stringify(payload, null, 2));
        console.log("=================================");

        setIsSubmitting(true);

        try {
            const response = await dispatch(
                createPowerballResult(payload)
            ).unwrap();

            console.log("✅ RESULT CREATED:", response);

            toast.success(response?.message || "Result Declared Successfully!");

            setFormData(INITIAL_FORM);

            await dispatch(getAllPowerballResults());
            await dispatch(getAllPendingGames());

            dispatch(clearPowerballResultState());
        } catch (err) {
            console.error("❌ CREATE RESULT ERROR:", err);

            toast.error(
                typeof err === "string"
                    ? err
                    : err?.message || err?.error || "Failed to declare result"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /* =====================================================
       PENDING FILTER
    ===================================================== */

    const filteredGroupedGames = useMemo(() => {
        if (selectedDrawNo === "all") {
            return groupedGames;
        }

        const result = {};

        Object.values(groupedGames).forEach((pool) => {
            if (Number(pool.drawNo) === Number(selectedDrawNo)) {
                result[pool.poolId] = pool;
            }
        });

        return result;
    }, [groupedGames, selectedDrawNo]);

    /* =====================================================
       VIEW PENDING
    ===================================================== */

    const handleViewPendingGames = () => {
        setShowPendingGames((prev) => !prev);

        if (!showPendingGames) {
            dispatch(getAllPendingGames());
            setSelectedDrawNo("all");
        }
    };

    /* =====================================================
       GAME DETAILS
    ===================================================== */

    const handleGameClick = (game) => {
        if (!game) {
            toast.error("Game details not available.");
            return;
        }

        setSelectedGame(game);
        setShowGameDetails(true);
    };

    const handleCloseDetails = () => {
        setShowGameDetails(false);
        setSelectedGame(null);
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDeleteResult = async (id) => {
        if (!window.confirm("Are you sure you want to delete this result?")) {
            return;
        }

        try {
            await dispatch(deletePowerballResult(id)).unwrap();

            toast.success("Result Deleted Successfully");

            await dispatch(getAllPowerballResults());
            await dispatch(getAllPendingGames());
        } catch (err) {
            toast.error(
                typeof err === "string"
                    ? err
                    : err?.message || "Failed to delete result"
            );
        }
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="container mx-auto px-4 py-8">

            {/* =================================================
                DECLARE RESULT
            ================================================= */}

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">

                    <h4 className="text-xl font-bold text-white">
                        Declare Bangladesh Powerball Result
                    </h4>

                    {existingDrawNumbers.length > 0 && (
                        <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
                            Latest Draw: #{existingDrawNumbers[existingDrawNumbers.length - 1]}
                        </span>
                    )}

                </div>

                <div className="p-6">

                    <form onSubmit={handleSubmit}>

                        {/* DRAW */}

                        <div className="mb-4">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Draw Number
                            </label>

                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                name="drawNo"
                                value={formData.drawNo}
                                onChange={handleChange}
                                disabled={isSubmitting || createLoading}
                            >

                                <option value="">
                                    Select Draw Number
                                </option>

                                {pendingDrawNumbers.length > 0 && (
                                    <optgroup label="Pending Draws">

                                        {pendingDrawNumbers.map((draw) => (
                                            <option
                                                key={`pending-${draw}`}
                                                value={draw}
                                            >
                                                Draw #{draw} ⏳
                                            </option>
                                        ))}

                                    </optgroup>
                                )}

                                {existingDrawNumbers.length > 0 && (
                                    <optgroup label="Existing Draws">

                                        {existingDrawNumbers.map((draw) => (
                                            <option
                                                key={`existing-${draw}`}
                                                value={draw}
                                            >
                                                Draw #{draw} ✅
                                            </option>
                                        ))}

                                    </optgroup>
                                )}

                                <optgroup label="New Draw">

                                    <option value={nextDrawNumber}>
                                        Draw #{nextDrawNumber} ✨
                                    </option>

                                </optgroup>

                            </select>

                            {/* Show auto-selected pool info */}
                            {formData.drawNo && formData.gamePoolId && (
                                <p className="mt-1 text-xs text-green-600">
                                    ✓ Pool auto-selected for Draw #{formData.drawNo}
                                </p>
                            )}

                            {/* Show available pools count */}
                            {formData.drawNo && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {poolsForSelectedDraw.length} pool(s) available for Draw #{formData.drawNo}
                                </p>
                            )}

                        </div>

                        {/* =================================================
                            GAME POOL
                        ================================================= */}

                        <div className="mb-4">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Game Pool
                            </label>

                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                name="gamePoolId"
                                value={formData.gamePoolId}
                                onChange={handlePoolChange}
                                disabled={isSubmitting || createLoading || !formData.drawNo}
                            >

                                <option value="">
                                    {!formData.drawNo
                                        ? "Select Draw Number First"
                                        : poolsForSelectedDraw.length === 0
                                        ? "No pools available"
                                        : "Select Game Pool"}
                                </option>

                                {poolsForSelectedDraw.map((pool) => (
                                    <option
                                        key={pool.poolId}
                                        value={pool.poolId}
                                    >
                                        Pool #{pool.poolId.slice(-8)} — {pool.games.length} Games — {pool.poolStatus}
                                    </option>
                                ))}

                            </select>

                            {formData.drawNo &&
                                poolsForSelectedDraw.length === 0 && (
                                    <p className="mt-1 text-xs text-orange-600">
                                        No game pool found for Draw #{formData.drawNo}
                                    </p>
                                )}

                            {selectedPool && (
                                <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-md">

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Pool ID
                                            </p>

                                            <p className="text-xs font-semibold text-purple-700 break-all">
                                                {selectedPool.poolId}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Games
                                            </p>

                                            <p className="font-semibold">
                                                {selectedPool.games.length}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                User
                                            </p>

                                            <p className="font-semibold">
                                                {selectedPool.userName || "Unknown"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Status
                                            </p>

                                            <p
                                                className={
                                                    String(selectedPool.poolStatus || "").toLowerCase() === "open"
                                                        ? "font-semibold text-green-600"
                                                        : "font-semibold text-red-600"
                                                }
                                            >
                                                {selectedPool.poolStatus}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* =================================================
                                UNSELECTED NUMBERS
                            ================================================= */}

                            {formData.gamePoolId && (
                                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">

                                    <div className="flex justify-between items-center mb-4">

                                        <div>
                                            <h5 className="font-bold text-gray-800">
                                                Unselected Numbers
                                            </h5>

                                            <p className="text-xs text-gray-500">
                                                Numbers not selected in this game pool
                                            </p>
                                        </div>

                                        {unselectedNumbersLoading && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <div className="w-4 h-4 border-2 border-gray-400 border-r-transparent rounded-full animate-spin" />
                                                Loading...
                                            </div>
                                        )}

                                    </div>

                                    {/* MAIN NUMBERS */}

                                    <div className="mb-4">

                                        <div className="flex justify-between items-center mb-2">

                                            <p className="text-sm font-semibold text-gray-700">
                                                Main Numbers
                                            </p>

                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                                {unselectedCounts?.unselectedMainNumbers || 0} Unselected
                                            </span>

                                        </div>

                                        {Array.isArray(unselectedNumbers?.mainNumbers) &&
                                        unselectedNumbers.mainNumbers.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">

                                                {unselectedNumbers.mainNumbers.map((number) => (
                                                    <span
                                                        key={number}
                                                        className="w-10 h-10 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center justify-center font-bold"
                                                    >
                                                        {number}
                                                    </span>
                                                ))}

                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No unselected main numbers found.
                                            </p>
                                        )}

                                    </div>

                                    {/* POWERBALL - RED BALL */}

                                    <div>

                                        <div className="flex justify-between items-center mb-2">

                                            <p className="text-sm font-semibold text-gray-700">
                                                Powerball
                                            </p>

                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                                {unselectedCounts?.unselectedPowerballs || 0} Unselected
                                            </span>

                                        </div>

                                        {Array.isArray(unselectedNumbers?.powerballs) &&
                                        unselectedNumbers.powerballs.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">

                                                {unselectedNumbers.powerballs.map((number) => (
                                                    <span
                                                        key={number}
                                                        className="w-10 h-10 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold"
                                                    >
                                                        {number}
                                                    </span>
                                                ))}

                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No unselected Powerball numbers found.
                                            </p>
                                        )}

                                    </div>

                                    {/* SELECTED SUMMARY */}

                                    <div className="mt-4 pt-4 border-t border-gray-200">

                                        <p className="text-xs font-semibold text-gray-500 mb-3">
                                            Selected Numbers Summary
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div className="bg-white rounded-lg border p-3">

                                                <p className="text-xs text-gray-500 mb-2">
                                                    Selected Main Numbers
                                                </p>

                                                <div className="flex flex-wrap gap-1.5">

                                                    {selectedNumbers?.mainNumbers?.length > 0 ? (
                                                        selectedNumbers.mainNumbers.map((number) => (
                                                            <span
                                                                key={number}
                                                                className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold"
                                                            >
                                                                {number}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            None
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            <div className="bg-white rounded-lg border p-3">

                                                <p className="text-xs text-gray-500 mb-2">
                                                    Selected Powerballs
                                                </p>

                                                <div className="flex flex-wrap gap-1.5">

                                                    {selectedNumbers?.powerballs?.length > 0 ? (
                                                        selectedNumbers.powerballs.map((number) => (
                                                            <span
                                                                key={number}
                                                                className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold"
                                                            >
                                                                {number}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            None
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* NUMBERS */}

                        <div className="mb-4">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Winning Numbers
                            </label>

                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">

                                {formData.numbers.map((num, index) => (
                                    <input
                                        key={index}
                                        type="number"
                                        min="1"
                                        max="35"
                                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={index + 1}
                                        value={num}
                                        onChange={(e) =>
                                            handleNumberChange(index, e.target.value)
                                        }
                                        disabled={isSubmitting || createLoading}
                                    />
                                ))}

                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                                Enter 7 unique numbers between 1 and 35.
                            </p>

                        </div>

                        {/* POWERBALL */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Winning Powerball
                            </label>

                            <input
                                type="number"
                                min="1"
                                max="20"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter Winning Powerball"
                                name="powerball"
                                value={formData.powerball}
                                onChange={handleChange}
                                disabled={isSubmitting || createLoading}
                            />

                        </div>

                        {/* SELECTED POOL ID */}

                        {formData.gamePoolId && (
                            <div className="mb-4 p-3 bg-gray-50 border rounded-md">

                                <p className="text-xs text-gray-500">
                                    Selected Game Pool ID
                                </p>

                                <p className="text-sm font-bold text-gray-800 break-all">
                                    {formData.gamePoolId}
                                </p>

                            </div>
                        )}

                        {/* EXISTING DRAW WARNING */}

                        {selectedDrawHasResult && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">

                                <p className="text-sm text-red-700 font-semibold">
                                    ⚠️ Draw #{formData.drawNo} already has a result.
                                </p>

                            </div>
                        )}

                        {/* =================================================
                            DECLARE BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || createLoading || !formData.drawNo || !formData.gamePoolId}
                        >
                            {isSubmitting || createLoading
                                ? "Declaring..."
                                : "Declare Result"}
                        </button>

                    </form>

                </div>

            </div>

            {/* =================================================
                RESULTS TABLE
            ================================================= */}

            <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">

                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">

                    <h5 className="text-lg font-semibold text-white">
                        Bangladesh Powerball Results
                    </h5>

                    <button
                        type="button"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded"
                        onClick={handleViewPendingGames}
                    >
                        {showPendingGames
                            ? "Hide Pending"
                            : "View Pending Games"}

                        {Object.keys(groupedGames).length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {Object.keys(groupedGames).length}
                            </span>
                        )}
                    </button>

                </div>

                <div className="p-6 overflow-x-auto">

                    {loading ? (
                        <div className="text-center py-8">
                            Loading results...
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                        #
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                        Draw
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                        Winning Numbers
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                        Powerball
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                        Created
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {Array.isArray(results) && results.length > 0 ? (
                                    results.map((item, index) => (
                                        <tr
                                            key={item._id || index}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-4 py-3">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3 font-semibold">
                                                #{item.drawNo}
                                            </td>

                                            <td className="px-4 py-3">

                                                <div className="flex flex-wrap gap-1">

                                                    {item.numbers?.map((number, index) => (
                                                        <span
                                                            key={index}
                                                            className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs font-bold"
                                                        >
                                                            {number}
                                                        </span>
                                                    ))}

                                                </div>

                                            </td>

                                            <td className="px-4 py-3">

                                                <span className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-800 rounded-full font-bold">
                                                    {item.powerball}
                                                </span>

                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleString()
                                                    : "N/A"}
                                            </td>

                                            <td className="px-4 py-3">

                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded disabled:opacity-50"
                                                    disabled={deleteLoading}
                                                    onClick={() => handleDeleteResult(item._id)}
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="px-4 py-8 text-center text-gray-500"
                                        >
                                            No Result Found
                                        </td>

                                    </tr>
                                )}

                            </tbody>

                        </table>
                    )}

                </div>

            </div>

            {/* =================================================
                PENDING POOLS
            ================================================= */}

            {showPendingGames && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">

                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">

                        <div className="flex justify-between items-center flex-wrap gap-4">

                            <h5 className="text-lg font-semibold text-white">
                                Pending Games by Pool
                                <span className="ml-2 text-sm text-purple-200">
                                    ({Object.keys(filteredGroupedGames).length} pools)
                                </span>
                            </h5>

                            <div className="flex items-center gap-3">

                                {pendingDrawNumbers.length > 0 && (
                                    <select
                                        value={selectedDrawNo}
                                        onChange={(e) =>
                                            setSelectedDrawNo(e.target.value)
                                        }
                                        className="px-3 py-2 bg-white text-gray-900 rounded-md"
                                    >

                                        <option value="all">
                                            All Draws
                                        </option>

                                        {pendingDrawNumbers.map((draw) => (
                                            <option
                                                key={draw}
                                                value={draw}
                                            >
                                                Draw #{draw}
                                            </option>
                                        ))}

                                    </select>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPendingGames(false);
                                        dispatch(clearPendingGames());
                                        setSelectedDrawNo("all");
                                    }}
                                    className="px-3 py-2 bg-white text-purple-600 font-semibold rounded"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                    <div className="p-6">

                        {pendingGamesLoading ? (
                            <div className="text-center py-8">
                                Loading pending games...
                            </div>
                        ) : Object.keys(filteredGroupedGames).length > 0 ? (
                            <div className="space-y-6">

                                {Object.values(filteredGroupedGames).map((pool) => (
                                    <div
                                        key={pool.poolId}
                                        className="border-2 border-purple-200 rounded-lg overflow-hidden"
                                    >

                                        {/* POOL HEADER */}

                                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">

                                            <div className="flex justify-between items-center flex-wrap gap-3">

                                                <div>

                                                    <div className="flex items-center gap-3">

                                                        <h6 className="text-white font-bold text-lg">
                                                            Pool #{pool.poolId ? pool.poolId.slice(-8) : "N/A"}
                                                        </h6>

                                                        <span className="bg-yellow-400 text-purple-900 font-bold px-3 py-1 rounded-full text-sm">
                                                            Draw #{pool.drawNo}
                                                        </span>

                                                    </div>

                                                    <p className="text-purple-100 text-xs mt-2 break-all">
                                                        Pool ID: {pool.poolId}
                                                    </p>

                                                    <p className="text-purple-100 text-sm mt-1">
                                                        {pool.games?.length || 0} games
                                                    </p>

                                                </div>

                                                <div className="flex gap-2 flex-wrap">

                                                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                                                        👤 {pool.userName || "Unknown"}
                                                    </span>

                                                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                                                        💰 {pool.currencyDetails?.localCurrency} {pool.currencyDetails?.localAmount}
                                                    </span>

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            String(pool.poolStatus || "").toLowerCase() === "open"
                                                                ? "bg-green-500/30 text-green-100"
                                                                : "bg-gray-500/30 text-gray-100"
                                                        }`}
                                                    >
                                                        {pool.poolStatus}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        {/* GAMES */}

                                        <div className="p-4">

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                                {pool.games?.map((game, index) => (
                                                    <div
                                                        key={`${pool.poolId}-${game.gameNo}-${index}`}
                                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-400 transition cursor-pointer"
                                                        onClick={() => handleGameClick(game)}
                                                    >

                                                        <div className="flex justify-between items-start mb-3">

                                                            <span className="font-semibold text-gray-700">
                                                                Game #{game.gameNo || index + 1}
                                                            </span>

                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                                Pending
                                                            </span>

                                                        </div>

                                                        <div className="flex flex-wrap gap-1">

                                                            {game.numbers?.map((number, numberIndex) => (
                                                                <span
                                                                    key={numberIndex}
                                                                    className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold"
                                                                >
                                                                    {number}
                                                                </span>
                                                            ))}

                                                            <span className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">
                                                                {game.powerball}
                                                            </span>

                                                        </div>

                                                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">

                                                            <div className="flex justify-between">

                                                                <span>
                                                                    Powerball
                                                                </span>

                                                                <strong className="text-red-600">
                                                                    {game.powerball}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>
                                                ))}

                                            </div>

                                        </div>

                                    </div>
                                ))}

                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No pending games found.
                            </div>
                        )}

                    </div>

                </div>
            )}

            {/* =================================================
                GAME DETAILS MODAL
            ================================================= */}

            {showGameDetails && selectedGame && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">

                            <h5 className="text-xl font-bold text-white">
                                Game Details — Draw #{selectedGame.drawNo}
                            </h5>

                            <button
                                type="button"
                                className="text-white text-2xl font-bold"
                                onClick={handleCloseDetails}
                            >
                                ×
                            </button>

                        </div>

                        <div className="p-6">

                            {/* POOL */}

                            <div className="mb-6">

                                <h6 className="text-sm font-medium text-gray-500 mb-2">
                                    Pool ID
                                </h6>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">

                                    <p className="text-sm font-bold text-purple-700 break-all">
                                        {selectedGame.poolId}
                                    </p>

                                </div>

                            </div>

                            {/* USER */}

                            <div className="mb-6">

                                <h6 className="text-sm font-medium text-gray-500 mb-3">
                                    User Information
                                </h6>

                                <div className="bg-gray-50 rounded-lg p-4">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <div>
                                            <label className="block text-xs text-gray-400">
                                                Username
                                            </label>

                                            <p className="font-semibold">
                                                {selectedGame.userName || "Unknown"}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400">
                                                Email
                                            </label>

                                            <p className="font-semibold break-all">
                                                {selectedGame.userEmail || "N/A"}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400">
                                                Bid
                                            </label>

                                            <p className="font-semibold">
                                                {selectedGame.currencyDetails?.localCurrency} {selectedGame.currencyDetails?.localAmount}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400">
                                                Status
                                            </label>

                                            <p className="font-semibold">
                                                {selectedGame.playerStatus || "Pending"}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* GAME */}

                            <div>

                                <h6 className="text-sm font-medium text-gray-500 mb-3">
                                    Game Numbers
                                </h6>

                                <div className="bg-gray-50 rounded-lg p-5">

                                    <div className="flex flex-wrap gap-2">

                                        {selectedGame.numbers?.map((number, index) => (
                                            <span
                                                key={index}
                                                className="w-12 h-12 bg-blue-100 text-blue-800 font-bold rounded-full flex items-center justify-center text-lg"
                                            >
                                                {number}
                                            </span>
                                        ))}

                                        <span className="w-12 h-12 bg-red-100 text-red-800 font-bold rounded-full flex items-center justify-center text-lg">
                                            {selectedGame.powerball}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default BangladeshPowerballResult;