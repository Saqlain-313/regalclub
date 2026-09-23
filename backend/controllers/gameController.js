const axios = require("axios");

const baseUrl = "https://api-doc.space/api";
const apiKey = process.env.API_DOCS_KEY || "k0B2cXsGPZwzaxALE2IJ";

const defaultHeaders = {
    "Content-Type": "application/json",
    "x-domain": "matchadda.vip",
};

const callGameApi = async (params = {}) => {
    console.log("Calling Game API with params:", params); // Debug log to check the parameters being sent
    const response = await axios.get(`${baseUrl}/getgamedetails`, {
        params: {
            key: apiKey,
            ...params,
        },
        headers: defaultHeaders,
    });

    return response.data;
};

const getGameDetails = async (req, res) => {
    try {
        const { gameId } = req.query;

        if (!gameId) {
            return res.status(400).json({
                status: false,
                message: "gameId is required",
            });
        }

        const data = await callGameApi({ gameId });
        return res.status(200).json({
            status: true,
            message: "Game details fetched successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Failed to fetch game details",
            error: error.response?.data || error.message,
        });
    }
};

const getAllGames = async (req, res) => {
    try {
 
        const { page, size } = req.query;
        const response = await callGameApi({ page, size, });

        const data = response.data;
        
        // console.log("Fetched games:", response); // Debug log to check the fetched data
        return res.status(200).json({
            status: true,
            message: "Game list fetched successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Failed to fetch game list",
            error: error.response?.data || error.message,
        });
    }
};
const getGamesByGameType = async (req, res) => {
    try {
 
        const { page, size, game_type } = req.query;
        const response = await callGameApi({ page, size, game_type });

        const data = response.data;
        
        // console.log("Fetched games:", response); // Debug log to check the fetched data
        return res.status(200).json({
            status: true,
            message: "Game list fetched successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Failed to fetch game list",
            error: error.response?.data || error.message,
        });
    }
};

const getProviderList = async (req, res) => {
    try {
        const data = await callGameApi({ provider_list: 1 });

        return res.status(200).json({
            status: true,
            message: "Provider list fetched successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Failed to fetch provider list",
            error: error.response?.data || error.message,
        });
    }
};

const getGameTypeList = async (req, res) => {
    try {
        const data = await callGameApi({ gametype_list: 1 });

        return res.status(200).json({
            status: true,
            message: "Game type list fetched successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Failed to fetch game type list",
            error: error.response?.data || error.message,
        });
    }
};

module.exports = {
    baseUrl,
    getGameDetails,
    getAllGames,
    getGamesByGameType,
    getProviderList,
    getGameTypeList,
};