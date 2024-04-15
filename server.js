const express = require("express");
require("colors");
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/v1/test", require("./routes/testRoute"));
app.use("/api/v1/products", require("./routes/productsRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/orders", require("./routes/ordersRoute"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`.bgCyan);
}); 
