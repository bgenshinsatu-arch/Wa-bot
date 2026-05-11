const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MY_NUMBER = process.env.MY_NUMBER;

app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("MODE:", mode);
  console.log("TOKEN:", token);
  console.log("VERIFY_TOKEN:", VERIFY_TOKEN);

  if (mode && token == VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
});

app.post("/webhook", async (req, res) => {
  try {
    const msg =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!msg) return res.sendStatus(200);

    const from = msg.from;
    const text = msg.text?.body || "";

    // cuma balas nomor tertentu
    if (from !== MY_NUMBER) {
      return res.sendStatus(200);
    }

    let reply = "";

    if (text.toLowerCase().includes("sayang")) {
      reply = "iya sayang kenapa hm";
    } 
    else if (text.toLowerCase().includes("apaa")) {
      reply = "gpp";
    } 
    else if (text.toLowerCase().includes("kangen")) {
      reply = "aku juga kangen";
    } 
    else if (text.toLowerCase().includes("marah")) {
      reply = "yaudah maaf";
    } 
    else if (text.toLowerCase().includes("tidur")) {
      reply = "tidur sana udah malem";
    } 
    else if (text.toLowerCase().includes("gamon")) {
      reply = "ih jangan aneh";
    } 
    else {
      const randomReply = [
        "hm",
        "iyaa",
        "apaa",
        "yaudah",
        "aku cape",
        "gajelas",
        "terserah",
        "manja bet si",
        "ih apasii",
        "aku ngantuk",
        "jangan ilang lagi",
        "kok cuek",
        "ya maaf"
      ];

      reply =
        randomReply[
          Math.floor(Math.random() * randomReply.length)
        ];
    }

    await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },
      {
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.sendStatus(200);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Bot jalan di port " + PORT);
});
