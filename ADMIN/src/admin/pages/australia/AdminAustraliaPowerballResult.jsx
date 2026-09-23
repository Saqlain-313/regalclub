import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    createPowerballResult,
    getAllPowerballResults,
    clearPowerballResultState,
    deletePowerballResult,
    getAllPendingGames,
    clearPendingGames,
    getUnselectedPowerballNumbers,
} from "../../redux/australia/powerballResultSlice";

import { toast } from "react-toastify";

const INITIAL_FORM = {
    drawNo: "",
    gamePoolId: "",
    powerball: "",
    numbers: ["", "", "", "", "", "", ""],
};

const AustraliaPowerballResult = () => {
    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

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

        // NEW
        selectedNumbers,
        unselectedNumbers,
        unselectedCounts,
        unselectedNumbersLoading,
    } = useSelector(
        (state) =>
            state.australiaPowerballResult ||
            state.powerballResult ||
            {}
    );

    // =========================================================
    // STATE
    // =========================================================

    const [formData, setFormData] =
        useState(INITIAL_FORM);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [showPendingGames, setShowPendingGames] =
        useState(false);

    const [showGameDetails, setShowGameDetails] =
        useState(false);

    const [selectedGame, setSelectedGame] =
        useState(null);

    const [selectedDrawNo, setSelectedDrawNo] =
        useState("all");

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        dispatch(getAllPowerballResults());
        dispatch(getAllPendingGames());
    }, [dispatch]);

    // =========================================================
    // NORMALIZE PENDING API RESPONSE
    // =========================================================

    const normalizedPools = useMemo(() => {
        if (!Array.isArray(pendingGames)) {
            return [];
        }

        const poolMap = {};

        pendingGames.forEach((item) => {
            if (!item) {
                return;
            }

            const poolId =
                item.poolId ||
                item.gamePoolId ||
                "";

            if (!poolId) {
                return;
            }

            if (!poolMap[poolId]) {
                poolMap[poolId] = {
                    poolId: String(poolId),

                    drawNo:
                        Number(item.drawNo) || 0,

                    playerId:
                        item.playerId || null,

                    userId:
                        item.userId || null,

                    userName:
                        item.userName ||
                        "Unknown",

                    userEmail:
                        item.userEmail ||
                        "",

                    bidAmount:
                        Number(item.bidAmount) || 0,

                    currencyDetails:
                        item.currencyDetails ||
                        {},

                    playerStatus:
                        item.playerStatus ||
                        "Pending",

                    poolStatus:
                        item.poolStatus ||
                        "Open",

                    createdAt:
                        item.createdAt ||
                        null,

                    games: [],
                };
            }

            // =================================================
            // NESTED GAMES
            // =================================================

            if (Array.isArray(item.games)) {
                item.games.forEach((game) => {
                    if (!game) {
                        return;
                    }

                    poolMap[poolId].games.push({
                        ...game,

                        gameNo:
                            Number(game.gameNo) || 0,

                        numbers:
                            Array.isArray(
                                game.numbers
                            )
                                ? game.numbers.map(Number)
                                : [],

                        powerball:
                            Number(
                                game.powerball
                            ) || 0,

                        poolId: String(poolId),

                        drawNo:
                            Number(item.drawNo) || 0,

                        playerId:
                            item.playerId ||
                            null,

                        userId:
                            item.userId ||
                            null,

                        userName:
                            item.userName ||
                            "Unknown",

                        userEmail:
                            item.userEmail ||
                            "",

                        bidAmount:
                            Number(
                                item.bidAmount
                            ) || 0,

                        currencyDetails:
                            item.currencyDetails ||
                            {},

                        playerStatus:
                            item.playerStatus ||
                            "Pending",

                        poolStatus:
                            item.poolStatus ||
                            "Open",

                        createdAt:
                            item.createdAt ||
                            null,
                    });
                });
            }
        });

        return Object.values(poolMap);
    }, [pendingGames]);

    // =========================================================
    // UNIQUE DRAW NUMBERS
    // =========================================================

    const pendingDrawNumbers = useMemo(() => {
        const set = new Set();

        normalizedPools.forEach((pool) => {
            if (pool.drawNo) {
                set.add(Number(pool.drawNo));
            }
        });

        return Array.from(set).sort(
            (a, b) => a - b
        );
    }, [normalizedPools]);

    // =========================================================
    // EXISTING RESULT DRAWS
    // =========================================================

    const existingDrawNumbers = useMemo(() => {
        if (!Array.isArray(results)) {
            return [];
        }

        return results
            .map((item) =>
                Number(item?.drawNo)
            )
            .filter(
                (value) =>
                    !Number.isNaN(value)
            )
            .sort(
                (a, b) => a - b
            );
    }, [results]);

    // =========================================================
    // ALL DRAW NUMBERS
    // =========================================================

    const allDrawNumbers = useMemo(() => {
        return [
            ...new Set([
                ...existingDrawNumbers,
                ...pendingDrawNumbers,
            ]),
        ].sort(
            (a, b) => a - b
        );
    }, [
        existingDrawNumbers,
        pendingDrawNumbers,
    ]);

    // =========================================================
    // NEXT DRAW
    // =========================================================

    const nextDrawNumber = useMemo(() => {
        if (
            allDrawNumbers.length ===
            0
        ) {
            return 1;
        }

        return (
            Math.max(
                ...allDrawNumbers
            ) + 1
        );
    }, [allDrawNumbers]);

    // =========================================================
    // POOLS FOR SELECTED DRAW
    // =========================================================

    const poolsForSelectedDraw =
        useMemo(() => {
            if (!formData.drawNo) {
                return [];
            }

            return normalizedPools.filter(
                (pool) =>
                    Number(
                        pool.drawNo
                    ) ===
                    Number(
                        formData.drawNo
                    )
            );
        }, [
            formData.drawNo,
            normalizedPools,
        ]);

    // =========================================================
    // SELECTED POOL
    // =========================================================

    const selectedPool = useMemo(() => {
        if (!formData.gamePoolId) {
            return null;
        }

        return (
            poolsForSelectedDraw.find(
                (pool) =>
                    String(
                        pool.poolId
                    ) ===
                    String(
                        formData.gamePoolId
                    )
            ) || null
        );
    }, [
        formData.gamePoolId,
        poolsForSelectedDraw,
    ]);

    // =========================================================
    // EXISTING RESULT CHECK
    // =========================================================

    const selectedDrawHasResult =
        useMemo(() => {
            if (!formData.drawNo) {
                return false;
            }

            if (!Array.isArray(results)) {
                return false;
            }

            return results.some(
                (item) =>
                    Number(
                        item?.drawNo
                    ) ===
                    Number(
                        formData.drawNo
                    )
            );
        }, [
            formData.drawNo,
            results,
        ]);

    // =========================================================
    // SUCCESS / ERROR
    // =========================================================

    useEffect(() => {
        if (success) {
            toast.success(
                message ||
                    "Result Declared Successfully!"
            );
        }

        if (error) {
            const errorMessage =
                typeof error ===
                "string"
                    ? error
                    : error?.message ||
                      "Failed to declare result.";

            toast.error(
                errorMessage
            );
        }
    }, [
        success,
        error,
        message,
    ]);

    // =========================================================
    // DRAW CHANGE - AUTO SELECT POOL
    // =========================================================

    const handleDrawChange = (
        event
    ) => {
        const drawNo =
            event.target.value;

        // Find pools for this draw
        const poolsForDraw = normalizedPools.filter(
            (pool) =>
                Number(pool.drawNo) === Number(drawNo)
        );

        // Auto select the first pool if available
        const autoPoolId = poolsForDraw.length > 0 ? poolsForDraw[0].poolId : "";

        console.log("DRAW CHANGED:", drawNo);
        console.log("AUTO SELECTED POOL:", autoPoolId);

        setFormData((prev) => ({
            ...prev,
            drawNo,
            gamePoolId: autoPoolId,
        }));

        // If pool is auto selected, fetch unselected numbers
        if (autoPoolId) {
            dispatch(
                getUnselectedPowerballNumbers({
                    gamePoolId: autoPoolId,
                })
            );
        }
    };

    // =========================================================
    // POOL CHANGE
    // =========================================================

    const handlePoolChange = (
        event
    ) => {
        const gamePoolId =
            event.target.value;

        console.log(
            "SELECTED GAME POOL:",
            gamePoolId
        );

        setFormData((prev) => ({
            ...prev,
            gamePoolId,
        }));

        // ================================================
        // GET UNSELECTED NUMBERS
        // ================================================

        if (gamePoolId) {
            dispatch(
                getUnselectedPowerballNumbers({
                    gamePoolId,
                })
            );
        }
    };

    // =========================================================
    // NORMAL INPUT
    // =========================================================

    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================================================
    // NUMBER INPUT
    // =========================================================

    const handleNumberChange = (
        index,
        value
    ) => {
        setFormData((prev) => {
            const numbers = [
                ...prev.numbers,
            ];

            numbers[index] = value;

            return {
                ...prev,
                numbers,
            };
        });
    };

    // =========================================================
    // DECLARE RESULT
    // =========================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        console.log(
            "======================================"
        );

        console.log(
            "🔥 DECLARE RESULT BUTTON CLICKED"
        );

        console.log(
            "FORM DATA:",
            formData
        );

        console.log(
            "======================================"
        );

        // =====================================================
        // PREVENT DOUBLE CLICK
        // =====================================================

        if (
            isSubmitting ||
            createLoading
        ) {
            console.log(
                "Already submitting..."
            );

            return;
        }

        // =====================================================
        // DRAW
        // =====================================================

        if (!formData.drawNo) {
            toast.error(
                "Please select Draw Number."
            );

            return;
        }

        // =====================================================
        // POOL ID
        // =====================================================

        if (!formData.gamePoolId) {
            toast.error(
                "Please select Game Pool."
            );

            return;
        }

        // =====================================================
        // FIND POOL
        // =====================================================

        const pool =
            poolsForSelectedDraw.find(
                (item) =>
                    String(
                        item.poolId
                    ) ===
                    String(
                        formData.gamePoolId
                    )
            );

        console.log(
            "SELECTED POOL:",
            pool
        );

        if (!pool) {
            toast.error(
                "Selected Game Pool not found."
            );

            return;
        }

        // =====================================================
        // POOL STATUS
        // =====================================================

        const poolStatus =
            String(
                pool.poolStatus ||
                    ""
            )
                .trim()
                .toLowerCase();

        console.log(
            "POOL STATUS:",
            poolStatus
        );

        if (
            poolStatus !==
            "open"
        ) {
            toast.error(
                "Selected Game Pool is not open."
            );

            return;
        }

        // =====================================================
        // EXISTING RESULT
        // =====================================================

        if (
            selectedDrawHasResult
        ) {
            toast.error(
                `Draw #${formData.drawNo} already has a result.`
            );

            return;
        }

        // =====================================================
        // NUMBERS
        // =====================================================

        if (
            !Array.isArray(
                formData.numbers
            ) ||
            formData.numbers.length !==
                7
        ) {
            toast.error(
                "Exactly 7 winning numbers are required."
            );

            return;
        }

        const numbers =
            formData.numbers.map(
                (value) =>
                    Number(value)
            );

        // =====================================================
        // EMPTY VALIDATION
        // =====================================================

        const hasEmptyNumber =
            formData.numbers.some(
                (value) =>
                    value === "" ||
                    value === null ||
                    value ===
                        undefined
            );

        if (hasEmptyNumber) {
            toast.error(
                "Please enter all 7 winning numbers."
            );

            return;
        }

        // =====================================================
        // INTEGER VALIDATION
        // =====================================================

        if (
            numbers.some(
                (number) =>
                    !Number.isInteger(
                        number
                    )
            )
        ) {
            toast.error(
                "Winning numbers must be valid numbers."
            );

            return;
        }

        // =====================================================
        // RANGE
        // =====================================================

        if (
            numbers.some(
                (number) =>
                    number < 1 ||
                    number > 35
            )
        ) {
            toast.error(
                "Winning numbers must be between 1 and 35."
            );

            return;
        }

        // =====================================================
        // UNIQUE
        // =====================================================

        if (
            new Set(numbers).size !==
            7
        ) {
            toast.error(
                "Winning numbers must be unique."
            );

            return;
        }

        // =====================================================
        // POWERBALL
        // =====================================================

        if (
            formData.powerball ===
                "" ||
            formData.powerball ===
                null ||
            formData.powerball ===
                undefined
        ) {
            toast.error(
                "Please enter Powerball."
            );

            return;
        }

        const powerball =
            Number(
                formData.powerball
            );

        if (
            !Number.isInteger(
                powerball
            )
        ) {
            toast.error(
                "Powerball must be a valid number."
            );

            return;
        }

        if (
            powerball < 1 ||
            powerball > 20
        ) {
            toast.error(
                "Powerball must be between 1 and 20."
            );

            return;
        }

        // =====================================================
        // FINAL PAYLOAD
        // =====================================================

        const payload = {
            gamePoolId:
                String(
                    formData.gamePoolId
                ),

            numbers,

            powerball,
        };

        console.log(
            "======================================"
        );

        console.log(
            "🚀 FINAL CREATE PAYLOAD"
        );

        console.log(
            JSON.stringify(
                payload,
                null,
                2
            )
        );

        console.log(
            "======================================"
        );

        setIsSubmitting(true);

        try {
            // =================================================
            // API CALL
            // =================================================

            const response =
                await dispatch(
                    createPowerballResult(
                        payload
                    )
                ).unwrap();

            console.log(
                "======================================"
            );

            console.log(
                "✅ RESULT CREATED"
            );

            console.log(
                "API RESPONSE:",
                response
            );

            console.log(
                "======================================"
            );

            toast.success(
                response?.message ||
                    "Result Declared Successfully!"
            );

            // =================================================
            // RESET
            // =================================================

            setFormData({
                ...INITIAL_FORM,
                numbers: [
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                ],
            });

            // =================================================
            // REFRESH
            // =================================================

            await dispatch(
                getAllPowerballResults()
            );

            await dispatch(
                getAllPendingGames()
            );

            dispatch(
                clearPowerballResultState()
            );
        } catch (err) {
            console.error(
                "======================================"
            );

            console.error(
                "❌ CREATE RESULT ERROR:",
                err
            );

            console.error(
                "======================================"
            );

            const errorMessage =
                typeof err ===
                "string"
                    ? err
                    : err?.message ||
                      err?.error ||
                      "Failed to declare result.";

            toast.error(
                errorMessage
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================================================
    // PENDING POOL FILTER
    // =========================================================

    const filteredPools =
        useMemo(() => {
            if (
                selectedDrawNo ===
                "all"
            ) {
                return normalizedPools;
            }

            return normalizedPools.filter(
                (pool) =>
                    Number(
                        pool.drawNo
                    ) ===
                    Number(
                        selectedDrawNo
                    )
            );
        }, [
            normalizedPools,
            selectedDrawNo,
        ]);

    // =========================================================
    // VIEW PENDING
    // =========================================================

    const handleViewPendingGames =
        () => {
            const next =
                !showPendingGames;

            setShowPendingGames(
                next
            );

            if (next) {
                dispatch(
                    getAllPendingGames()
                );

                setSelectedDrawNo(
                    "all"
                );
            }
        };

    // =========================================================
    // GAME DETAILS
    // =========================================================

    const handleGameClick = (
        game
    ) => {
        setSelectedGame(game);
        setShowGameDetails(true);
    };

    const closeGameDetails = () => {
        setShowGameDetails(false);
        setSelectedGame(null);
    };

    // =========================================================
    // DELETE RESULT
    // =========================================================

    const handleDeleteResult =
        async (id) => {
            if (!id) {
                toast.error(
                    "Result ID missing."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this result?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await dispatch(
                    deletePowerballResult(
                        id
                    )
                ).unwrap();

                toast.success(
                    "Result deleted successfully."
                );

                await dispatch(
                    getAllPowerballResults()
                );

                await dispatch(
                    getAllPendingGames()
                );
            } catch (err) {
                console.error(
                    "DELETE ERROR:",
                    err
                );

                toast.error(
                    typeof err ===
                        "string"
                        ? err
                        : err?.message ||
                              "Failed to delete result."
                );
            }
        };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="container mx-auto px-4 py-8">

            {/* =================================================
                DECLARE RESULT
            ================================================= */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">

                    <div className="flex justify-between items-center gap-4 flex-wrap">

                        <h2 className="text-xl font-bold text-white">
                            Declare Australia Powerball Result
                        </h2>

                        <span className="text-sm text-white bg-white/20 px-3 py-1 rounded-full">
                            Australia Powerball
                        </span>

                    </div>

                </div>

                <div className="p-6">

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* =====================================
                            DRAW
                        ===================================== */}

                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Draw Number
                            </label>

                            <select
                                value={
                                    formData.drawNo
                                }
                                onChange={
                                    handleDrawChange
                                }
                                disabled={
                                    isSubmitting ||
                                    createLoading
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >

                                <option value="">
                                    Select Draw Number
                                </option>

                                {pendingDrawNumbers.length >
                                    0 && (
                                    <optgroup label="Pending Draws">

                                        {pendingDrawNumbers.map(
                                            (
                                                draw
                                            ) => (
                                                <option
                                                    key={
                                                        `pending-${draw}`
                                                    }
                                                    value={
                                                        draw
                                                    }
                                                >
                                                    Draw #
                                                    {
                                                        draw
                                                    }
                                                </option>
                                            )
                                        )}

                                    </optgroup>
                                )}

                                {existingDrawNumbers.length >
                                    0 && (
                                    <optgroup label="Existing Draws">

                                        {existingDrawNumbers.map(
                                            (
                                                draw
                                            ) => (
                                                <option
                                                    key={
                                                        `existing-${draw}`
                                                    }
                                                    value={
                                                        draw
                                                    }
                                                >
                                                    Draw #
                                                    {
                                                        draw
                                                    }
                                                </option>
                                            )
                                        )}

                                    </optgroup>
                                )}

                                <optgroup label="New Draw">

                                    <option
                                        value={
                                            nextDrawNumber
                                        }
                                    >
                                        Draw #
                                        {
                                            nextDrawNumber
                                        }
                                    </option>

                                </optgroup>

                            </select>

                            {/* Show auto-selected pool info */}
                            {formData.drawNo && formData.gamePoolId && (
                                <p className="mt-2 text-xs text-green-600">
                                    ✓ Pool auto-selected for Draw #{formData.drawNo}
                                </p>
                            )}

                        </div>

                        {/* =====================================
                            GAME POOL
                        ===================================== */}

                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Game Pool
                            </label>

                            <select
                                value={
                                    formData.gamePoolId
                                }
                                onChange={
                                    handlePoolChange
                                }
                                disabled={
                                    isSubmitting ||
                                    createLoading ||
                                    !formData.drawNo
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            >

                                <option value="">
                                    {!formData.drawNo
                                        ? "Select Draw Number First"
                                        : "Select Game Pool"}
                                </option>

                                {poolsForSelectedDraw.map(
                                    (
                                        pool
                                    ) => (
                                        <option
                                            key={
                                                pool.poolId
                                            }
                                            value={
                                                pool.poolId
                                            }
                                        >
                                            Pool #
                                            {
                                                pool.poolId.slice(
                                                    -8
                                                )
                                            }{" "}
                                            —{" "}
                                            {
                                                pool.games
                                                    .length
                                            }{" "}
                                            Games —{" "}
                                            {
                                                pool.poolStatus
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            {formData.drawNo &&
                                poolsForSelectedDraw.length ===
                                    0 && (
                                    <p className="mt-2 text-sm text-orange-600">
                                        No game pool found for Draw #
                                        {
                                            formData.drawNo
                                        }
                                    </p>
                                )}

                            {/* =====================================
                                SELECTED POOL
                            ===================================== */}

                            {selectedPool && (
                                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-5">

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Pool ID
                                            </p>

                                            <p className="text-xs font-bold text-purple-700 break-all">
                                                {
                                                    selectedPool.poolId
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Draw
                                            </p>

                                            <p className="font-bold text-gray-800">
                                                #
                                                {
                                                    selectedPool.drawNo
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Games
                                            </p>

                                            <p className="font-bold text-gray-800">
                                                {
                                                    selectedPool
                                                        .games
                                                        .length
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Status
                                            </p>

                                            <p
                                                className={`font-bold ${
                                                    String(
                                                        selectedPool.poolStatus
                                                    )
                                                        .toLowerCase() ===
                                                    "open"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {
                                                    selectedPool.poolStatus
                                                }
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-4 pt-4 border-t border-purple-200 grid grid-cols-1 md:grid-cols-3 gap-4">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                User
                                            </p>

                                            <p className="font-semibold">
                                                {
                                                    selectedPool.userName
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Email
                                            </p>

                                            <p className="font-semibold break-all">
                                                {
                                                    selectedPool.userEmail
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Bid
                                            </p>

                                            <p className="font-semibold">
                                                {
                                                    selectedPool
                                                        .currencyDetails
                                                        ?.localCurrency
                                                }{" "}
                                                {
                                                    selectedPool
                                                        .currencyDetails
                                                        ?.localAmount
                                                }
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* =====================================
                                UNSELECTED NUMBERS
                            ===================================== */}

                            {formData.gamePoolId && (
                                <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-5">

                                    <div className="flex justify-between items-center mb-5">

                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">
                                                Unselected Numbers
                                            </h4>

                                            <p className="text-xs text-gray-500 mt-1">
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

                                    {/* =================================
                                        MAIN NUMBERS
                                    ================================= */}

                                    <div className="mb-6">

                                        <div className="flex justify-between items-center mb-3">

                                            <p className="text-sm font-semibold text-gray-700">
                                                Main Numbers
                                            </p>

                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                                {
                                                    unselectedCounts
                                                        ?.unselectedMainNumbers ||
                                                    0
                                                }{" "}
                                                Unselected
                                            </span>

                                        </div>

                                        {Array.isArray(
                                            unselectedNumbers?.mainNumbers
                                        ) &&
                                        unselectedNumbers.mainNumbers.length >
                                            0 ? (
                                            <div className="flex flex-wrap gap-2">

                                                {unselectedNumbers.mainNumbers.map(
                                                    (
                                                        number
                                                    ) => (
                                                        <span
                                                            key={
                                                                number
                                                            }
                                                            className="w-10 h-10 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center justify-center font-bold"
                                                        >
                                                            {
                                                                number
                                                            }
                                                        </span>
                                                    )
                                                )}

                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No unselected main numbers found.
                                            </p>
                                        )}

                                    </div>

                                    {/* =================================
                                        POWERBALL - RED BALL
                                    ================================= */}

                                    <div>

                                        <div className="flex justify-between items-center mb-3">

                                            <p className="text-sm font-semibold text-gray-700">
                                                Powerball
                                            </p>

                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                                {
                                                    unselectedCounts
                                                        ?.unselectedPowerballs ||
                                                    0
                                                }{" "}
                                                Unselected
                                            </span>

                                        </div>

                                        {Array.isArray(
                                            unselectedNumbers?.powerballs
                                        ) &&
                                        unselectedNumbers.powerballs.length >
                                            0 ? (
                                            <div className="flex flex-wrap gap-2">

                                                {unselectedNumbers.powerballs.map(
                                                    (
                                                        number
                                                    ) => (
                                                        <span
                                                            key={
                                                                number
                                                            }
                                                            className="w-10 h-10 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold"
                                                        >
                                                            {
                                                                number
                                                            }
                                                        </span>
                                                    )
                                                )}

                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No unselected Powerball numbers found.
                                            </p>
                                        )}

                                    </div>

                                    {/* =================================
                                        SELECTED SUMMARY
                                    ================================= */}

                                    <div className="mt-6 pt-4 border-t border-gray-200">

                                        <p className="text-xs font-semibold text-gray-500 mb-3">
                                            Selected Numbers Summary
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div className="bg-white rounded-lg border p-3">

                                                <p className="text-xs text-gray-500 mb-2">
                                                    Selected Main Numbers
                                                </p>

                                                <div className="flex flex-wrap gap-1.5">

                                                    {selectedNumbers?.mainNumbers
                                                        ?.length >
                                                    0 ? (
                                                        selectedNumbers.mainNumbers.map(
                                                            (
                                                                number
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        number
                                                                    }
                                                                    className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold"
                                                                >
                                                                    {
                                                                        number
                                                                    }
                                                                </span>
                                                            )
                                                        )
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

                                                    {selectedNumbers?.powerballs
                                                        ?.length >
                                                    0 ? (
                                                        selectedNumbers.powerballs.map(
                                                            (
                                                                number
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        number
                                                                    }
                                                                    className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold"
                                                                >
                                                                    {
                                                                        number
                                                                    }
                                                                </span>
                                                            )
                                                        )
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

                        {/* =====================================
                            NUMBERS
                        ===================================== */}

                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Winning Numbers
                            </label>

                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">

                                {formData.numbers.map(
                                    (
                                        value,
                                        index
                                    ) => (
                                        <input
                                            key={
                                                index
                                            }
                                            type="number"
                                            min="1"
                                            max="35"
                                            value={
                                                value
                                            }
                                            onChange={(event) =>
                                                handleNumberChange(
                                                    index,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                isSubmitting ||
                                                createLoading
                                            }
                                            placeholder={
                                                `${index + 1}`
                                            }
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    )
                                )}

                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Enter 7 unique numbers between 1 and 35.
                            </p>

                        </div>

                        {/* =====================================
                            POWERBALL
                        ===================================== */}

                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Powerball
                            </label>

                            <input
                                type="number"
                                name="powerball"
                                min="1"
                                max="20"
                                value={
                                    formData.powerball
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    isSubmitting ||
                                    createLoading
                                }
                                placeholder="Enter Powerball"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />

                            <p className="text-xs text-gray-500 mt-2">
                                Powerball must be between 1 and 20.
                            </p>

                        </div>

                        {/* =====================================
                            WARNING
                        ===================================== */}

                        {selectedDrawHasResult && (
                            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4">

                                <p className="text-red-700 font-semibold">
                                    ⚠️ Draw #
                                    {
                                        formData.drawNo
                                    }{" "}
                                    already has a result.
                                </p>

                            </div>
                        )}

                        {/* =====================================
                            DEBUG INFO
                        ===================================== */}

                        {formData.gamePoolId && (
                            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-lg p-4">

                                <p className="text-xs text-gray-500">
                                    Selected Game Pool ID
                                </p>

                                <p className="text-sm font-bold text-gray-800 break-all">
                                    {
                                        formData.gamePoolId
                                    }
                                </p>

                            </div>
                        )}

                        {/* =====================================
                            DECLARE BUTTON
                        ===================================== */}

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                createLoading
                            }
                            className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ||
                            createLoading
                                ? "Declaring..."
                                : "Declare Result"}
                        </button>

                    </form>

                </div>
            </div>

            {/* =================================================
                RESULTS
            ================================================= */}

            <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">

                <div className="bg-gray-800 px-6 py-5 flex justify-between items-center gap-4 flex-wrap">

                    <h3 className="text-xl font-bold text-white">
                        Australia Powerball Results
                    </h3>

                    <button
                        type="button"
                        onClick={
                            handleViewPendingGames
                        }
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                    >
                        {showPendingGames
                            ? "Hide Pending Games"
                            : "View Pending Games"}

                        {normalizedPools.length >
                            0 && (
                            <span className="ml-2 bg-red-500 px-2 py-1 rounded-full text-xs">
                                {
                                    normalizedPools.length
                                }
                            </span>
                        )}
                    </button>

                </div>

                <div className="p-6 overflow-x-auto">

                    {loading ? (
                        <div className="py-10 text-center text-gray-500">
                            Loading results...
                        </div>
                    ) : (
                        <table className="min-w-full">

                            <thead>

                                <tr className="border-b">

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                                        #
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                                        Draw
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                                        Numbers
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                                        Powerball
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {Array.isArray(
                                    results
                                ) &&
                                results.length >
                                    0 ? (
                                    results.map(
                                        (
                                            result,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    result._id ||
                                                    index
                                                }
                                                className="border-b hover:bg-gray-50"
                                            >

                                                <td className="px-4 py-4">
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </td>

                                                <td className="px-4 py-4 font-bold">
                                                    #
                                                    {
                                                        result.drawNo
                                                    }
                                                </td>

                                                <td className="px-4 py-4">

                                                    <div className="flex flex-wrap gap-1">

                                                        {Array.isArray(
                                                            result.numbers
                                                        ) &&
                                                            result.numbers.map(
                                                                (
                                                                    number,
                                                                    i
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            i
                                                                        }
                                                                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold"
                                                                    >
                                                                        {
                                                                            number
                                                                        }
                                                                    </span>
                                                                )
                                                            )}

                                                    </div>

                                                </td>

                                                <td className="px-4 py-4">

                                                    <span className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                                                        {
                                                            result.powerball
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-4 py-4 text-sm text-gray-500">
                                                    {result.createdAt
                                                        ? new Date(
                                                              result.createdAt
                                                          ).toLocaleString()
                                                        : "-"}
                                                </td>

                                                <td className="px-4 py-4">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteResult(
                                                                result._id
                                                            )
                                                        }
                                                        disabled={
                                                            deleteLoading
                                                        }
                                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center py-10 text-gray-500"
                                        >
                                            No results found.
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
                <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">

                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">

                        <div className="flex justify-between items-center gap-4 flex-wrap">

                            <div>

                                <h3 className="text-xl font-bold text-white">
                                    Pending Games — Pool Wise
                                </h3>

                                <p className="text-purple-100 text-sm mt-1">
                                    {
                                        filteredPools.length
                                    }{" "}
                                    pool(s)
                                </p>

                            </div>

                            <div className="flex gap-3">

                                {pendingDrawNumbers.length >
                                    0 && (
                                    <select
                                        value={
                                            selectedDrawNo
                                        }
                                        onChange={(event) =>
                                            setSelectedDrawNo(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="px-3 py-2 rounded-lg bg-white text-gray-800"
                                    >

                                        <option value="all">
                                            All Draws
                                        </option>

                                        {pendingDrawNumbers.map(
                                            (
                                                draw
                                            ) => (
                                                <option
                                                    key={
                                                        draw
                                                    }
                                                    value={
                                                        draw
                                                    }
                                                >
                                                    Draw #
                                                    {
                                                        draw
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPendingGames(
                                            false
                                        );

                                        dispatch(
                                            clearPendingGames()
                                        );
                                    }}
                                    className="px-4 py-2 bg-white text-purple-700 font-semibold rounded-lg"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                    <div className="p-6">

                        {pendingGamesLoading ? (
                            <div className="py-10 text-center">

                                <div className="inline-block w-8 h-8 border-4 border-purple-600 border-r-transparent rounded-full animate-spin" />

                                <p className="mt-3 text-gray-500">
                                    Loading pending games...
                                </p>

                            </div>
                        ) : filteredPools.length ===
                          0 ? (
                            <div className="py-10 text-center text-gray-500">
                                No pending game pools found.
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {filteredPools.map(
                                    (
                                        pool
                                    ) => (
                                        <div
                                            key={
                                                pool.poolId
                                            }
                                            className="border-2 border-purple-200 rounded-xl overflow-hidden"
                                        >

                                            {/* POOL HEADER */}

                                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-5">

                                                <div className="flex justify-between items-start gap-4 flex-wrap">

                                                    <div>

                                                        <div className="flex items-center gap-3 flex-wrap">

                                                            <h4 className="text-xl font-bold text-white">
                                                                Pool #
                                                                {
                                                                    pool.poolId.slice(
                                                                        -8
                                                                    )
                                                                }
                                                            </h4>

                                                            <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold">
                                                                Draw #
                                                                {
                                                                    pool.drawNo
                                                                }
                                                            </span>

                                                            <span className="px-3 py-1 bg-green-500/30 text-white rounded-full text-sm font-semibold">
                                                                {
                                                                    pool.poolStatus
                                                                }
                                                            </span>

                                                        </div>

                                                        <p className="mt-2 text-purple-100 text-xs break-all">
                                                            Pool ID:{" "}
                                                            {
                                                                pool.poolId
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="text-right">

                                                        <p className="text-white font-bold text-lg">
                                                            {
                                                                pool.games
                                                                    .length
                                                            }{" "}
                                                            Games
                                                        </p>

                                                        <p className="text-purple-100 text-sm">
                                                            {
                                                                pool.currencyDetails
                                                                    ?.localCurrency
                                                            }{" "}
                                                            {
                                                                pool.currencyDetails
                                                                    ?.localAmount
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">

                                                    <span className="px-3 py-1.5 bg-white/20 text-white rounded-full text-sm">
                                                        👤{" "}
                                                        {
                                                            pool.userName
                                                        }
                                                    </span>

                                                    <span className="px-3 py-1.5 bg-white/20 text-white rounded-full text-sm">
                                                        📧{" "}
                                                        {
                                                            pool.userEmail
                                                        }
                                                    </span>

                                                    <span className="px-3 py-1.5 bg-white/20 text-white rounded-full text-sm">
                                                        💰{" "}
                                                        {
                                                            pool.currencyDetails
                                                                ?.localCurrency
                                                        }{" "}
                                                        {
                                                            pool.currencyDetails
                                                                ?.localAmount
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                            {/* GAMES */}

                                            <div className="p-5">

                                                <h5 className="font-bold text-gray-800 text-lg mb-4">
                                                    Games in Pool
                                                </h5>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                                    {pool.games.map(
                                                        (
                                                            game
                                                        ) => (
                                                            <button
                                                                type="button"
                                                                key={`${pool.poolId}-${game.gameNo}`}
                                                                onClick={() =>
                                                                    handleGameClick(
                                                                        game
                                                                    )
                                                                }
                                                                className="text-left border border-gray-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-lg transition"
                                                            >

                                                                <div className="flex justify-between items-center mb-4">

                                                                    <span className="font-bold text-gray-800">
                                                                        Game #
                                                                        {
                                                                            game.gameNo
                                                                        }
                                                                    </span>

                                                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                                                        Pending
                                                                    </span>

                                                                </div>

                                                                <div className="flex flex-wrap gap-1.5">

                                                                    {game.numbers.map(
                                                                        (
                                                                            number,
                                                                            index
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold"
                                                                            >
                                                                                {
                                                                                    number
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}

                                                                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                                                                        {
                                                                            game.powerball
                                                                        }
                                                                    </span>

                                                                </div>

                                                                <div className="mt-4 pt-3 border-t">

                                                                    <div className="flex justify-between">

                                                                        <span className="text-xs text-gray-500">
                                                                            Powerball
                                                                        </span>

                                                                        <span className="text-sm font-bold text-red-600">
                                                                            {
                                                                                game.powerball
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                </div>

                                                            </button>
                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>

                </div>
            )}

            {/* =================================================
                GAME DETAIL MODAL
            ================================================= */}

            {showGameDetails &&
                selectedGame && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex justify-between items-center">

                                <div>

                                    <h3 className="text-xl font-bold text-white">
                                        Game #
                                        {
                                            selectedGame.gameNo
                                        }
                                    </h3>

                                    <p className="text-purple-100 text-sm">
                                        Draw #
                                        {
                                            selectedGame.drawNo
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeGameDetails
                                    }
                                    className="text-white text-3xl leading-none"
                                >
                                    ×
                                </button>

                            </div>

                            <div className="p-6">

                                {/* POOL */}

                                <div className="mb-6">

                                    <p className="text-xs text-gray-500 mb-2">
                                        Pool ID
                                    </p>

                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">

                                        <p className="text-sm font-bold text-purple-700 break-all">
                                            {
                                                selectedGame.poolId
                                            }
                                        </p>

                                    </div>

                                </div>

                                {/* USER */}

                                <div className="mb-6">

                                    <h4 className="font-bold text-gray-800 mb-3">
                                        User Information
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Name
                                            </p>

                                            <p className="font-semibold">
                                                {
                                                    selectedGame.userName
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Email
                                            </p>

                                            <p className="font-semibold break-all">
                                                {
                                                    selectedGame.userEmail
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Bid
                                            </p>

                                            <p className="font-semibold">
                                                {
                                                    selectedGame
                                                        .currencyDetails
                                                        ?.localCurrency
                                                }{" "}
                                                {
                                                    selectedGame
                                                        .currencyDetails
                                                        ?.localAmount
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Status
                                            </p>

                                            <p className="font-semibold">
                                                {
                                                    selectedGame.playerStatus
                                                }
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* NUMBERS */}

                                <div>

                                    <h4 className="font-bold text-gray-800 mb-3">
                                        Game Numbers
                                    </h4>

                                    <div className="flex flex-wrap gap-3">

                                        {selectedGame.numbers.map(
                                            (
                                                number,
                                                index
                                            ) => (
                                                <span
                                                    key={
                                                        index
                                                    }
                                                    className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold"
                                                >
                                                    {
                                                        number
                                                    }
                                                </span>
                                            )
                                        )}

                                        <span className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-lg font-bold">
                                            {
                                                selectedGame.powerball
                                            }
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default AustraliaPowerballResult;