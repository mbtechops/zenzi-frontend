const express = require("express");
const app = express();

const { checkBalance } = require("./contractCall");

const bodyParser = require("body-parser");
const crypto = require("crypto");
require("dotenv").config();

app.use(bodyParser.json());

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

if (!PAYSTACK_SECRET) {
  console.error("PAYSTACK_SECRET is not defined in environment variables");
  process.exit(1);
}

module.exports = (req, res) => {
  const signature = req.headers["x-paystack-signature"];

  if (!signature) {
    console.log("No signature provided, rejecting request");
    return res.status(400).send("Signature missing");
  }

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // Validate the signature
  if (hash !== signature) {
    console.log("Invalid signature, possible tampering detected");
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  console.log("Paystack webhook event:", event);

  switch (event.event) {
    case "transfer.success":
      console.log("Payment successful:", event.data);

      checkBalance();

      break;
    case "transfer.failed":
      console.log("Payment failed:", event.data);
      break;

    default:
      console.log("Unhandled event type:", event.event);
  }

  res.sendStatus(200);
};


// start the project, use ngrok hhttp 4242 to setup ngrok, open localhost:4040 on browser to inspect the webhook