process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
let items = require("./fakeDB");

let firstItem = {
    name: "football",
    price: "$12.55"
};

beforeEach(() => {
    items.push(firstItem);
});

afterEach(() => {
    items.length = 0;
});


describe("GET /items", () => {
    test("Does the GET items route return the array of items?", async() => {
        let res = await request(app).get("/items");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{name: "football", price: "$12.55"}])
    });
});

describe("GET /items/:name", () => {
    test("Does the GET single item route return the correct item?", async() => {
        let res = await request(app).get("/items/football");
        expect(res.statusCode).toBe(200);
        expect(res.body.item).toEqual({name: "football", price: "$12.55"})
    });
    test("Does the GET single item route return an error if the requested item does not exist?", 
        async() => {
            let res = await request(app).get("/items/carrot");
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({error: {message: "Item not found.", status: 400}});
        });
});

describe("POST /items", () => {
    test("Does the POST items route push a new item to the array?", async() => {
        let res = await request(app).post("/items")
        .send({token: "abc123", item: {name: "toothbrush", price: "$1.99"}});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({added: {name: "toothbrush", price: "$1.99"}});
        expect(items.length).toBe(2);
    });
    test("Does the POST items route return an error if the user is not authenticated?", async() => {
        let res = await request(app).post("/items")
        .send({token: "pizza", item: {name: "toothbrush", price: "$1.99"}});
        expect(res.statusCode).toBe(401);
        expect(res.body.error.message).toEqual("Unauthorized");
        expect(items.length).toBe(1);
    });
});

describe("PATCH /items/name", () => {
    test("Does the PATCH route allow a user to alter data if they are authenticated?", async() => {
        let res = await request(app).patch("/items/football")
        .send({token: "abc123", item: {name: "football", price: "$7.99"}});
        expect(items.length).toBe(1);
        expect(res.statusCode).toEqual(200);
        expect(items[0].price).toEqual("$7.99");
    });
    test("Does the PATCH route return the appopriate error if the item does not exist?", async() => {
        let res = await request(app).patch("/items/carrot")
        .send({token: "abc123", item: {name: "football", price: "$7.99"}});
        expect(res.statusCode).toBe(400);
        expect(res.body.error.message).toEqual("Item not found.");
        expect(items[0]).toEqual({name: "football", price: "$7.99"});
    });
    test("Does the PATCH route return the appropriate error if the user supplies an incorrect token?",
        async() => {
            let res = await request(app).patch("/items/football")
            .send({token: "abc12", item: {name: "football", price: "$7.99"}});
            expect(res.statusCode).toBe(401);
            expect(res.body.error.message).toEqual("Unauthorized");
            expect(items[0]).toEqual({name: "football", price: "$7.99"});
        });
});

describe("DELETE /items/name", () => {
    test("Does the DELETE route delete an existing item, provided the correct user token?", 
        async() => {
            let res = await request(app).delete("/items/football")
            .send({token: "abc123"});
            expect(res.statusCode).toBe(200);
            expect(items).toEqual([]);
            expect(res.body.message).toEqual("Deleted");
        });
    test("Does the DELETE route return an error if the requested item is not found?", async() => {
        let res = await request(app).delete("/items/soda")
        .send({token: "abc123"});
        expect(res.statusCode).toBe(400);
        expect(res.body.error.message).toEqual("Item not found.");
    });
    test("Does the DELETE route return an error if the user is not authenticated?", async() => {
        let res = await request(app).delete("/items/football")
        .send({token: "abc"});
        expect(res.statusCode).toBe(401);
        expect(res.body.error.message).toEqual("Unauthorized");
    });
});
