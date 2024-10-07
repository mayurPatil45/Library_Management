const constant = require('../')

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    switch (statusCode) {
        case constant.VALIDATEION_ERROR:
            res.json({
                title: "validation faild",
                message: err.message,
                stack: err.stack
            })
            break;

        case constant.UNAUTHORISED:
            res.json({
                title: "Unauthorised",
                message: err.message,
                stack: err.stack
            })
            break;

        case constant.FORBIDDEN:
            res.json({
                title: "Forbidden",
                message: err.message,
                stack: err.stack,
            })
            break;

        case constant: NOT_FOUND:
            res.json({
                title: "Not Found",
                message: err.message,
                stack: err.stack,
            })
            break;

        case constant.SERVER_ERROR:
            res.json({
                title: "Server Error",
                message: err.message,
                stack: err.stack,
            })
            break;

        default:
            console.log(err);
            console.log("No error found. All good")
            break;
    }
}

module.exports = errorHandler;