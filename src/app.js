const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const { Op, fn, col, literal } = require("sequelize");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

//routes
const contractRoutes = require("./routes/contracts");
const jobRoutes = require("./routes/jobs");
const adminRoutes = require("./routes/admin");
const balanceRoutes = require("./routes/balances");
app.use("", contractRoutes);
app.use("", jobRoutes);
app.use("", adminRoutes);
app.use("", balanceRoutes);

module.exports = app;
