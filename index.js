const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const MY_NUMBER = process.env.MY_NUMBER;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {

    const msg =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!msg) return res.sendStatus(200);

    const from = msg.from;
    const text = msg.text?.body || "";

    // cuma balas nomor kamu
    if (from !== MY_NUMBER) {
      return res.sendStatus(200);
    }

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Kamu adalah pacar virtual yang:
- cuek tapi perhatian
- kadang galak manja
- soft spoken
- jawab natural seperti chat WhatsApp asli
- jangan terlalu formal
- jangan terlalu panjang
- jangan terlalu cringe
- kadang pakai kata seperti:
  "hm"
  "apaa"
  "yaudah"
  "ih"
  "aku capek"
  "jangan aneh aneh"
  "yasudah sana"

- sesekali perhatian dan manis
- kalau user sedih coba nenangin pelan
- jangan pakai emoji berlebihan
- balas seperti cewek asli Indonesia umur remaja/dewasa muda
`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const reply = ai.choices[0].message.content;

    await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: reply
        }
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

    console.log(
      err.response?.data || err.message
    );

    res.sendStatus(200);
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Bot jalan");
});
