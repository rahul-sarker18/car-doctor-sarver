const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("car doctor sarver");
});

// jwt

// function varyfidJwt(req, res, next) {
//    const authHeaders = req.headers.authorization;

//    if(!authHeaders){
//     res.status(401).send({message : 'unauthHeaders accesse'});
//    }
//    const token = authHeaders.splite(' ')[1]

//    jwt.verify(token , process.env.ACCESS_TOKEN_SECRITE  , function(error , decoded){
//     if(error){
//      return res.status(401).send({message : 'unauthHeaders accesse'})
//     }
//     req.decoded = decoded;
//     next();
//    })
// }

function varyfidJwt(req , res , next){
  const authheaders = req.headers.authorization;
  console.log('authheaders' , authheaders);
  if(!authheaders){
    return res.status(401).send({message : 'unauthorize user'});
  }
  const token = authheaders.split(' ')[1];
  console.log("token",token);
  jwt.verify(token , process.env.ACCESS_TOKEN_SECRITE  , function(err , decoded){
    if(err){
      return res.status(401).send({message : 'unauthorize user'});
    }

    req.decoded = decoded;
    next()
  })
  
}

//user name: car-doctor-sarver
// password :: wEzI65UauC7S4tfZ

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.r4sxyx4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const createproduct = client.db("services").collection("service");
    const createorders = client.db("services").collection("orders");

    // JWT TOKEN
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log('user' , user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRITE, {
        expiresIn: "10h",
      });  
      res.send({ token });
    });

    //post order
    app.post("/order", async (req, res) => {
      const or = req.body;
      const result = await createorders.insertOne(or);
      res.send(result);
    });

    // order get
    app.get("/order", varyfidJwt, async (req, res) => {
      const decoded = req.decoded;
      console.log('decoded 89',  decoded);
      


      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const curture = createorders.find(query);
      const result = await curture.toArray();
      res.send(result);
    });
    // detete order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await createorders.deleteOne(query);
      res.send(result);
    });

    //update ///

    app.patch("/order", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;

      const updatedoc = {
        $set: {
          status: status,
        },
      };
      const result = await createorders.updateOne(query, updatedoc);
      res.send(result);
    });
    // get data in database
    app.get("/services", async (req, res) => {
      const query = {};
      const curture = createproduct.find(query);
      const result = await curture.toArray();
      res.send(result);
    });
    //get
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await createproduct.findOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`run the surver ${port}`);
});
