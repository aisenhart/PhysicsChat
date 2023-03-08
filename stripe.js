const stripe = require('stripe')('sk_test_51MiUmaLyXGv9FHExtWCByYnnoqjJwfme8lgeblXnAoGFyl3qwJYinunUz7zTdbjeJe1lTGd91hxLJtKajbP9g8iE00no5w3fcp');
module.exports = function(express,bodyParser,app,db,ENDPOINT_SECRET,DOMAIN) {

  function addRawBody(req, res, next) {
    req.setEncoding('utf8');
  
    var data = '';
  
    req.on('data', function(chunk) {
      data += chunk;
    });
  
    req.on('end', function() {
      req.rawBody = data;
  
      next();
    });
  }

    app.post('/webhook',(request, response) => {
      const event = request.body;
      const sig = request.headers['stripe-signature'];
      addRawBody(request, response, function() {
        try {
          stripe.webhooks.constructEvent(request.rawBody, sig, ENDPOINT_SECRET);
        } catch (err) {
          console.log(err.message)
          return response.status(400).send(`Webhook Error: ${err.message}`);
        }
      });
      
        // Handle the event
        switch (event.type) {

          case 'checkout.session.completed':
            console.log(event);
            let customer = event.data.object.customer;
            let customerEmail = event.data.object.customer_email;
            let mode = event.data.object.mode;
            let subscription = event.data.object.subscription;


          default:
            console.log('event');
        }
      
        // Return a response to acknowledge receipt of the event
        response.json({received: true});

      });


}





//C:\Users\andre\Desktop\stripe.exe listen --forward-to localhost:3000/webhook
