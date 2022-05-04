const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const res = require("express/lib/response");
require("dotenv").config();

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

    // GET INVENTORY
    app.get("/inventory", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      let cursor;
      if (!email) {
        cursor = inventoryCollection.find({});
      } else {
        cursor = inventoryCollection.find(query);
      }

      const inventory = await cursor.toArray();
      res.send(inventory);
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
          //  name: updatedInventory.name,
          //  image: updatedInventory.img,
          //  price: updatedInventory.price,
          quantity: updatedInventory.quantity,
          //  description: updatedInventory.description,
          //  supplier: updatedInventory.supplier,
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
