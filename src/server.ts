
import express from "express";
import { pgClient } from "./lib/sql/client.js";
import { orders } from "./lib/sql/models/orders.js";

const app = express();
app.get("/", async (_, res) => {
  try {
    const client = pgClient.getClient();
    const results = await client.select().from(orders);
    res.json(results);
  } catch (error) {
    console.log('ERROR => ', error);
    res.send(`SWW => ${error}`);
  }
});

app.listen(3000,() => {
  console.log('Listening at 3000 <U>')
});
