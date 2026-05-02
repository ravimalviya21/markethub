const express = require("express");
const app = express();
require("dotenv").config();

const PORT = 3002;

app.listen(PORT, () => {
    console.log("Server is running", PORT)
})