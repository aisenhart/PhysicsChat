const stripe = require('stripe')('sk_test_...');
module.exports = function(express,app,db,STRIPE_SECRET_KEY,STRIPE_PUBLISHABLE_KEY,DOMAIN) {
    const endpointSecret = process.env.ENDPOINT_SECRET;

    app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
        const event = request.body;
      
        // Handle the event
        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Then define and call a method to handle the successful payment intent.

            // handlePaymentIntentSucceeded(paymentIntent);
            break;
          case 'payment_method.attached':
            const paymentMethod = event.data.object;
            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            break;
          // ... handle other event types
          case 'charge.succeeded':
            console.log(event.data);

          default:
            console.log(`Unhandled event type ${event.type}`);
        }
      
        // Return a response to acknowledge receipt of the event
        response.json({received: true});
      });
      














}





//C:\Users\andre\Desktop\stripe.exe listen --forward-to localhost:3000/webhook
