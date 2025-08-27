require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Other middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
