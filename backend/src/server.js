const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const aspirateursRoutes = require("./routes/aspirateurs");
const missionsRoutes = require("./routes/missions");
const measurementsRoutes = require("./routes/measurements");
const collectesRoutes = require("./routes/collectes");
const statisticsRoutes = require("./routes/statistics");
const iotRoutes = require("./routes/iot");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "EcoBot Platform API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/aspirateurs", aspirateursRoutes);
app.use("/api/missions", missionsRoutes);
app.use("/api/measurements", measurementsRoutes);
app.use("/api/collectes", collectesRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/iot", iotRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
