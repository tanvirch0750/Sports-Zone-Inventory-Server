const express = require("express");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello sports inventory server");
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
