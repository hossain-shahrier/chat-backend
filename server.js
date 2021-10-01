// Importing
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
// app config
const app = express();
const PORT = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1274453",
  key: "b300ea0292a58f338286",
  secret: "bd702d22acd1437a2b17",
  cluster: "eu",
  useTLS: true,
});

const db = mongoose.connection;

db.once("open", (req, res) => {
  console.log("DB Connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timeStamp: messageDetails.timeStamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});
// middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
app.use(cors());
// DB Config
dotenv.config();
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Conntected to MongoDB"))
  .catch((err) => console.error(err));

//

// API routes
app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});
app.get("/api/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
app.post("/api/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// Listen
app.listen(PORT, () => {
  console.log(`listening on localhost: ${PORT}`);
});
