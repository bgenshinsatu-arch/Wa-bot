const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MY_NUMBER = process.env.MY_NUMBER;

// root
app.get("/", (req, res) => {
  res.send("Bot aktif");
});

// webhook verify
app.get("/webhook", (req, res) => {
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (token === "test123") {
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
});

// webhook message
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

    let reply = "gw gatau mo jawab apa 😭";

    const lower = text.toLowerCase();

    if (lower.includes("halo")) {
      reply = "halo juga";
    } else if (lower.includes("apa kabar")) {
      reply = "baik kok";
    } else if (lower.includes("siapa")) {
      reply = "gw bot whatsapp 😎";
    }
    console.log("FROM:", from);
console.log("MY:", MY_NUMBER);
console.log("TEXT:", text);
console.log("REPLY:", reply);

    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body: reply,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Bot jalan di port ${PORT}`);
});
