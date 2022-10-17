//express
const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const app = express();
const port = 3000;

//parse .env file
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});  
const openai = new OpenAIApi(configuration);


//body-parser
app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/api', async (req, res) => {
    console.log(req.body.prompt);
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: req.body.prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
        console.log(completion.data);
        res.send(req.body.prompt+completion.data.choices[0].text);
        console.log(completion.data.choices[0].text);
      } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
      }
});

//listen
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
);  


