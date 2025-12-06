require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const tasksRoutes = require("./src/routes/tasks");
const voiceRoutes = require("./src/routes/voice");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

app.use("/api/tasks", tasksRoutes);
app.use("/api/voice", voiceRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
