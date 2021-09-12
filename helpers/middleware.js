const ExpressError = require("./expressError");

const requireToken = (req, res, next) => {
    try {
        if (req.body.token === "abc123") return next();
        throw new ExpressError("Unauthorized", 401);
    } catch (err) {
        return next(err);
    };
};

module.exports = { requireToken };