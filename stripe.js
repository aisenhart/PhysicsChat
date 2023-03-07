const stripe = require('stripe')('sk_test_51MiUmaLyXGv9FHExtWCByYnnoqjJwfme8lgeblXnAoGFyl3qwJYinunUz7zTdbjeJe1lTGd91hxLJtKajbP9g8iE00no5w3fcp');
module.exports = function(express,app,db,STRIPE_SECRET_KEY,STRIPE_PUBLISHABLE_KEY,DOMAIN) {

    app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
        const event = request.body;
      
        // Handle the event
        switch (event.type) {


          case 'charge.succeeded':
            
            let chargeID = event.data.object.id;

            let charge = stripe.charges.retrieve(
              chargeID
            );

            //resolve charge promise
            charge.then(function(charge) {
              console.log(charge.order);
              console.log(charge)
            });

          default:
            console.log('event');
        }
      
        // Return a response to acknowledge receipt of the event
        response.json({received: true});
      });

      














}





//C:\Users\andre\Desktop\stripe.exe listen --forward-to localhost:3000/webhook
