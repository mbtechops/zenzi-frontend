require("dotenv").config();
const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET } = process.env;

// This is your test secret API key.
const stripe = require("stripe")(STRIPE_SECRET_KEY);
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = STRIPE_ENDPOINT_SECRET;
const express = require("express");
const app = express();

// const bodyParser = require("body-parser"); // Might be needed
// app.use(bodyParser.json());

const { allocateToken, depositToken } = require("./contractCall");

// https://e174-2c0f-f5c0-707-d73b-c28d-90b-6986-4.ngrok-free.app

module.exports =  (request, response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "charge.succeeded":
        const chargeSuccess = event.data.object;

        const eventObject = {
          eventType: event.type,
          amount: chargeSuccess.amount,
          amount_captured: chargeSuccess.amount,
          userCountry: chargeSuccess.billing_details.address.country,
          userEmail: chargeSuccess.billing_details.email,
          userName: chargeSuccess.billing_details.name,
          message: chargeSuccess.outcome.seller_message,
          outcomeType: chargeSuccess.outcome.type,
          paymentMethod: chargeSuccess.payment_method_details.type,
          receiptUrl: chargeSuccess.receipt_url,
          currency: chargeSuccess.currency,
          paid: chargeSuccess.paid,
          status: chargeSuccess.status,
        };

        allocateToken(chargeSuccess.amount)
            .then(r => console.log(r));

        // console.log("Event Object: ", eventObject);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        console.log(`Payment Method for ${paymentMethod} was successful!`);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "checkout.session.completed":
        const sessionCompleted = event.data.object;
        console.log(
          `Session Completed for ${sessionCompleted} was successful!`
        );
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "charge.failed":
        const chargeFailed = event.data.object;
        console.log(`Charge Failed for ${chargeFailed.amount}`);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "balance.available":
        const availableBalance = event.data.object;
        console.log(
          `Available Balance for ${availableBalance} was successful!`
        );
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  };
