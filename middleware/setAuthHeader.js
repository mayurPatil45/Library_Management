const isTokenExpire = require("../utils/isTokenExpired")

const setAuthHeader = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (accessToken || !isTokenExpire(accessToken)) {
            req.headers["authorization"] = `Bearer ${accessToken}`;
        }

        console.log(req.headers["authorization"]);
        next();

    } catch (error) {
        console.error("Error in adding access token to header: ", error.message);
    }
}

module.exports = setAuthHeader;