
const dotenv = require('dotenv')
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
var bodyParser = require('body-parser')

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://ivanthanon:mongodbcrema@cluster0.thjovik.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser:true, useUnifiedTopology:true})

let db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", function(){
  console.log("conectado a la BD!")
})

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

let urlModel = mongoose.model('url',urlSchema)

app.use(bodyParser.urlencoded({   
  extended: true
})); 

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req,res) {
  const regex = /https?:\/\/(www\.)?/
  const body_request = req.body.url
  
  if (!regex.test(body_request)) {
      res.json({error:"invalid url"})
  } else {
    const myId = parseInt(Math.random() * 55)
    urlModel
    .find()
    .exec()
    .then(data => {
      new urlModel({
        original_url: body_request,
        short_url: myId
      })
    .save()
    .then(()=>{
        res.json({
          original_url: body_request,
          short_url: myId
        })
      })
    .catch(err => {
        res.json(err)
        })
      })
    }
})

app.get('/api/shorturl/:id', function (req,res) {
    urlModel
  .findOne({
    short_url: req.params.id
  })
  .exec()
  .then((url)=>{    
    res.redirect(url["original_url"]);
  });
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
