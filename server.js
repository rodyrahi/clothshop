let express = require('express');
let app = express();
const session = require("express-session");
const bcrypt = require('bcrypt');

const { shopdb} = require("./db.js");

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true  
}));



app.use((req, res, next) => {
  if (req.url !== "/employee/register" && req.url !== "/employee/login") {
    if (req.session && req.session.employeeId) {
      next();
    } else {
      res.render("partials/employee-login");
    }
  } else {
    next();
  }
});




app.get('/', async(req, res) => {
  if (req.session.employeeId) {
    const items = shopdb.prepare(`select name , price from items`).all()
    res.render('index' , {items});
  } else {
  
    res.redirect("/employee/login");
  }
   
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
  
app.get('/branches', (req, res) => {
    const branches = shopdb.prepare(`select * from branches`).all()
    res.render('partials/branches' , {branches});
});

app.get('/createbranches', (req, res) => {
  res.render('partials/createbranches');
});
app.post('/createbranch', (req, res) => {
  
  const { name , address } = req.body
  
  shopdb.prepare(`INSERT INTO branches (name, address) VALUES (?, ?)`).run(name , address);  

  res.redirect('/branches');
});
app.post("/branches/delete/:id", (req, res) => {
  const id  = req.params.id;

  shopdb.prepare("DELETE FROM branches WHERE id = ?").run(id);

  res.redirect("/branches");
});


app.get("/branches/edit/:id", (req, res) => {
  const id = req.params.id;
  const branch = shopdb.prepare("SELECT * FROM branches WHERE id = ?").get(id);
  res.render("partials/editbranch", { branch });
});

app.post("/branch/edit/:id", (req, res) => {
  const id = req.params.id;
  const { name, address } = req.body;
  shopdb
    .prepare("UPDATE branches SET name = ?, address = ? WHERE id = ?")
    .run(name, address, id);
  res.redirect("/branches");
});


app.get("/branch/:id", (req, res) => {
  const id = req.params.id;

  const branch = shopdb.prepare("SELECT * FROM branches WHERE id = ?").get(id);

  const employees = shopdb
    .prepare("SELECT * FROM employees WHERE branch_id = ?")
    .all(id);

  res.render("partials/viewbranch", {
    branch,
    employees,
  });
});

app.post("/branch/:id/addemployee", (req, res) => {
  const id = req.params.id;
  const { name, password } = req.body;

  // Encrypt the password
  const encryptedPassword = bcrypt.hashSync(password, 10);

  shopdb
    .prepare(
      "INSERT INTO employees (name, password, branch_id) VALUES (?, ?, ?)"
    )
    .run(name, encryptedPassword, id);

  res.redirect(`/branch/${id}`);
});



app.get("/employee/register", (req, res) => {
  const branches = shopdb.prepare("SELECT * FROM branches").all();
  res.render("partials/employee-create", { branches });
});



app.post("/employee/register", async (req, res) => {

  const { name, username, password, branch } = req.body;

  shopdb
    .prepare(
      "INSERT INTO employees (name, password, branch_id) VALUES (?, ?, ?)"
    )
    .run(name,  password, branch);

  res.redirect("/employee/login");

});





app.get("/employee/login", (req, res) => {
  res.render("partials/employee-login");
});

app.post("/employee/login", (req, res) => {
  const { username, password } = req.body;

  console.log(username, password);
  // Lookup employee by username
  const employee = shopdb
    .prepare("SELECT * FROM employees WHERE name = ?")
    .get(username);

  if (employee && employee.password === password) {
    // Login successful, set session variable
    req.session.employeeId = employee.id;

    console.log(req.session.employeeId , employee.id);

    res.redirect("/");
  } else {
    // Login failed
    res.render("partials/employee-login", { error: "Invalid username or password" });
  }
});


app.listen(4000, () => console.log(`http://localhost:${4000}`));

