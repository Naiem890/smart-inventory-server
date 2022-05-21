const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect with database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfnf6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client
      .db("smartShopManger")
      .collection("products");

    // Adding product in database

    app.post("/product/add", async (req, res) => {
      let newProduct = {};
      newProduct = req.body;

      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Reading product by id in database
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // Filter product by userid in database

    app.get("/products/:uid", async (req, res) => {
      const uidNumber = req.params.uid;
      // console.log(uidNumber);
      const query = { uid: uidNumber };
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      // console.log(typeof cursor);
      res.send(product);
    });

    // Reading all the product collection from database
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // Update product stock

    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const {
        productSold,
        productStock,
        productStockModifier,
        productSoldModifier,
      } = req.body;

      const filter = { _id: ObjectId(id) };

      const options = { upsert: true };

      const updateDoc = {
        $set: {
          productStock: `${
            parseInt(productStock) + parseInt(productStockModifier)
          }`,
          productSold: `${
            parseInt(productSold) + parseInt(productSoldModifier)
          }`,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    // Delete product

    app.delete("/product/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };

      const result = await productCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        res.send(result);
      } else {
        res.send(result);
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Back End Is Running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
