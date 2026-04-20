import express from "express";
import axios from "axios";
import { gerarResposta } from "./index.js";

const app = express();
app.use(express.json());

// 🔐 variáveis de ambiente (Railway)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID;

// 🔗 webhook verificação
app.get("/webhook", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY_TOKEN
  ) {
    return res.send(req.query["hub.challenge"]);
  }

  res.sendStatus(403);
});

// 📩 receber mensagens
app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const userId = message.from;
    const text = message.text?.body;

    console.log("Mensagem:", text);

    const resposta = await gerarResposta(userId, text);

    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: userId,
        text: { body: resposta },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro:", error.message);
    res.sendStatus(500);
  }
});

// 🚀 porta dinâmica (Railway exige isso)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});