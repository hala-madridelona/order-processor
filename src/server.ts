
import express from "express";
import { pgClient } from "./lib/sql/client.js";
import { orders } from "./lib/sql/models/orders.js";
import { createOrder } from "./lib/api/orders/create-order.js";
import { inventory_reservations } from "./lib/sql/models/inventory_reservations.js";
import { count } from "drizzle-orm";
import { fetchOrderStatus } from "./lib/api/orders/fetch-status.js";
import { listOrders } from "./lib/api/orders/list-order.js";
import { createPaymentIntent } from "./lib/payments/stripe.js";


const app = express();
app.get("/", async (req, res) => {
  try {
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


app.get("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await fetchOrderStatus(orderId);
    if (!result.found) {
      res.status(404).json({ error: result.error })
    }
    res.status(200).json(result.entry);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || "Something went wrong!"});
  }
})

app.post("/create", createOrder);
app.get('/list', listOrders);

app.post("/orders/:orderId/create-payment-intent", async (req, res) => {
  try {
    const { orderId } = req.params;
    const clientSecret = await createPaymentIntent(orderId);
    res.status(200).json({ clientSecret });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || "Something went wrong!"});
  }
});

app.listen(3000,() => {
  console.log('Listening at 3000 <U>')
});
