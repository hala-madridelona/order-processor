import express from "express";

const app = express();
app.get("/", (_, res) => res.send("API Server Running"));

app.listen(3000, () => {
  console.log("API server running on port 3000");
});
