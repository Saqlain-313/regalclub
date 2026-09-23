const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    try {
        
        const token = req.cookies.token; 
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }

        const decoded = jwt.verify(token, "santosh");
        req.user = decoded; 

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};


