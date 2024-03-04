let express = require('express');
let app = express();
const session = require("express-session");
const { shopdb} = require("./db.js");

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.get('/', async(req, res) => {
    const items = shopdb.prepare(`select name , price from items`).all()
    // console.log(data);
    // const items = ['shirt' , 'coat' , 'pants']
    res.render('index' , {items});
});



app.post('/createuser', (req, res) => {
  
  const username = JSON.stringify(req.body.name);
  const dob = req.body.dob
  
  
  const { items, price , type , count } = req.body;
  const combinedArray = {
    "items":items,
    "price":price,
    "type":type,
    "count":count

  }
  const combinedString = JSON.stringify(combinedArray)
  const totalPrice = price.reduce((accumulator, currentPrice) => accumulator + parseFloat(currentPrice), 0);


  shopdb.prepare(`INSERT INTO user (name, items, deliverydate, total) VALUES (?, ?, ?, ?)`).run(username, combinedString  , dob , totalPrice);  
  res.redirect('/')
});
  
app.post('/createitem', (req, res) => {
  
  const { name , price } = req.body

  shopdb.prepare(`INSERT INTO items (name, price) VALUES (?, ?)`).run(name , price);  
  res.redirect('/')
});
  



app.listen(4000, () => console.log(`http://localhost:${4000}`));

