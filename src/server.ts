
import express from "express";
import { pgClient } from "./lib/sql/client.js";
import { orders } from "./lib/sql/models/orders.js";
import { createOrder } from "./lib/api/orders/create-order.js";
import { inventory_reservations } from "./lib/sql/models/inventory_reservations.js";
import { count } from "drizzle-orm";

const app = express();
app.get("/", async (req, res) => {
  try {
    console.log('REQUEST LOOKS LIKE => ', req);
    const client = pgClient.getClient();
    const results = await Promise.all([
      client.select({ count: count() }).from(orders),
      client.select().from(inventory_reservations)
    ]);

    res.json(results);
  } catch (error) {
    console.log('ERROR => ', error);
    res.send(`SWW => ${error}`);
  }
});

app.post("/create", createOrder);

app.listen(3000,() => {
  console.log('Listening at 3000 <U>')
});
