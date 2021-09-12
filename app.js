const express = require("express");
const morgan = require("morgan");
const ExpressError = require("./helpers/expressError");
const routes = require("./helpers/routes");

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/items", routes);

app.use((req, res, next) => {
    const notFoundError = new ExpressError("Not Found", 404);
    return next(notFoundError);
});

app.use((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message;

    return res.status(status).json({
        error: {message, status}
    });
});



module.exports = app;