const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zcq5u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log("connected to mongo db");
  client.close();
});

app.get("/", (req, res) => {
  res.send("hello sports inventory server");
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
