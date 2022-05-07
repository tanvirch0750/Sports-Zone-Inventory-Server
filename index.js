const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const res = require("express/lib/response");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader) {
    return res.status(401).send({
      message: "unauthorized access",
    });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    } else {
      console.log("decoded", decoded);
      req.decoded = decoded;
      next();
    }
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zcq5u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const inventoryCollection = client
      .db("sportsInventory")
      .collection("inventory");

    // Home route
    app.get("/", async (req, res) => {
      res.send("welcome to sports inventory server");
    });

    // Auth
    app.post("/login", async (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      res.send({ accessToken });
    });

    // GET INVENTORY
    app.get("/inventory", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      if (!email) {
        const cursor = inventoryCollection.find({});
        const inventory = await cursor.toArray();
        res.send(inventory);
      } else {
        res.send({ message: "Unauthorized access" });
      }
    });

    app.get("/inventory/myItems", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;

      if (email === decodedEmail) {
        const query = { email };
        const cursor = inventoryCollection.find(query);
        const inventory = await cursor.toArray();
        res.send(inventory);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });

    // GET SINGLE INVENTORY
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const inventory = await inventoryCollection.findOne(query);
      res.send(inventory);
    });

    // POST INVENTORY
    app.post("/inventory", async (req, res) => {
      const newInventory = req.body;
      const result = await inventoryCollection.insertOne(newInventory);
      res.send(result);
    });

    // DELETE INVENTORY
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });

    // DELIVERED QUANTITY
    app.put("/inventory/delivered/:id", async (req, res) => {
      const id = req.params.id;
      // const updatedInventory = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $inc: {
          quantity: -1,
        },
      };
      const result = await inventoryCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // STORED QUANTITY
    app.put("/inventory/stored/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      console.log(updatedQuantity);
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $inc: {
          quantity: +updatedQuantity.number,
        },
      };
      const result = await inventoryCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // UPDATE INVENTORY
    app.put("/inventory/delivered/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInventory = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedInventory.name,
          image: updatedInventory.img,
          email: updatedInventory.email,
          price: updatedInventory.price,
          quantity: updatedInventory.quantity,
          description: updatedInventory.description,
          supplier: updatedInventory.supplier,
          outlet: updatedInventory.outlet,
          warehouse: updatedInventory.warehouse,
        },
      };
      const result = await inventoryCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    console.log("db connection successful");
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
