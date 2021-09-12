const express = require("express");
const router = new express.Router();
const ExpressError = require("./expressError");
const middleware = require("./middleware");
const items = require("./fakeDB");

router.get("/", (req, res, next) => {
    try {
        return res.json(items);
    } catch (err) {
        return next(err);
    };
});


router.get("/:name", (req, res, next) => {
    try {
        let item = items.find(item => item.name === req.params.name);
        if (!item) throw new ExpressError("Item not found.", 400);
        return res.json({
            item
        });
    } catch(err) {
        return next(err);
    }
})


router.post("/", middleware.requireToken, (req, res, next) => {
    try {
        const item = req.body.item;
        if (!item) throw new ExpressError("No Content Provided.", 400);
        items.push(item);
        return res.json({
            added: {name: item.name, price: item.price}
        })
    } catch(err) {
        return next(err);
    };
});


router.patch("/:name", middleware.requireToken, (req, res, next) => {
    try {
        let item = items.find(item => item.name === req.params.name);
        if (!item) throw new ExpressError("Item not found.", 400);
        item.name = req.body.item.name;
        item.price = req.body.item.price;
        return res.json({
            updated: {"name": item.name, "price": item.price}
        });
    } catch(err) {
        return next(err);
    };
});


router.delete("/:name", middleware.requireToken, (req, res, next) => {
    try {
        let idx = items.findIndex(item => item.name === req.params.name);
        if (idx === -1) throw new ExpressError("Item not found.", 400);
        items.splice(idx, 1);
        return res.json({
            message: "Deleted"
        });
    } catch(err) {
        return next(err);
    };
});


module.exports = router;