let express = require('express');
let app = express();
const session = require("express-session");
const bcrypt = require('bcrypt');

const { shopdb} = require("./db.js");
const e = require('express');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true  
}));



app.use((req, res, next) => {
  if (req.url !== "/employee/register" && req.url !== "/employee/login") {
    if (req.session && req.session.employee) {
      next();
    } else {
      res.render("partials/employee-login");
    }
  } else {
    next();
  }
});

function isAdmin(req, res, next) {
  if ( req.session.employee && req.session.employee.admin === 1) {
    next();
  } else {
    res.redirect("/employee/login" , { error: "You are not authorized to view this page" });
  }
 
}



app.get('/', async(req, res) => {
  console.log(req.session.employee);
  if (req.session.employee) {
    const items = shopdb.prepare(`select * from items`).all()
    const branch = shopdb
      .prepare("select * from branches where id = ?")
      .all(req.session.employee.branch);

    console.log(branch);
    res.render('index' , {items , branch: branch[0] , employee: req.session.employee });
  } else {
  
    res.redirect("/employee/login" );
  }
   
});



app.post('/createuser', (req, res) => {
  
  const username = req.body.name;
  const dob = req.body.dob;
  const phone = req.body.phone;

  const { items, price, count } = req.body;

  let type = req.body.type;
  console.log(type);

  
  const combinedArray = [];

  console.log(items);
  if (Array.isArray(items)) {
    items.forEach((element, index) => {
      let item = {
        name: element,
        price: price[index],
        type: type[index].split(",")[1],
        count: count[index],
      };

      combinedArray.push(item);
    });
  }else{
    let item = {
      name: items,
      price: price,
      type: type,
      count: count,
    };
    combinedArray.push(item);
  }

  console.log(combinedArray);

  const combinedString = JSON.stringify(combinedArray)

  let totalPrice =0
  if (combinedArray > 1) {
    totalPrice = price.reduce((accumulator, currentPrice) => accumulator + parseFloat(currentPrice), 0);

  }
  else{
    totalPrice = parseFloat(price)
  }


  shopdb.prepare(`INSERT INTO user (name, items, deliverydate, total ,phone , branch_id) VALUES (?, ?, ?, ?,? , ?)`).run(username, combinedString  , dob , totalPrice , phone , req.session.employee.branch);  
  res.redirect('/')
});
  
app.post('/createitem', (req, res) => {
  
  const { name  , press , steampress , rollpress , dryclean , rafoo , colour } = req.body

  const service = {
    press: press,
    steampress: steampress,
    rollpress: rollpress,
    dryclean: dryclean,
    rafoo: rafoo,
    colour: colour,
  }


  shopdb.prepare(`INSERT INTO items (name , service) VALUES (?, ?)`).run(name  , JSON.stringify(service));  
  res.redirect('/')
});
  
app.get('/branches', isAdmin, (req, res) => {
    const branches = shopdb.prepare(`select * from branches`).all()
    res.render('partials/branches' , {branches , employee: req.session.employee});
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
  res.render("partials/employee-login" , {employee: req.session.employee});
});

app.post("/employee/login", (req, res) => {
  const { username, password } = req.body;

  console.log(username, password);
  // Lookup employee by username
  const employee = shopdb
    .prepare("SELECT * FROM employees WHERE name = ?")
    .all(username);

    console.log(employee[0].password , password);
  if (employee && employee[0].password === password) {
    // Login successful, set session variable
    req.session.employee = {"id":employee[0].id , "branch":employee[0].branch_id , "admin":employee[0].admin};
    console.log(req.session.employee);
    
    
    res.redirect("/");
  } else {
    // Login failed
    res.render("partials/employee-login", { error: "Invalid username or password" });
  }
});

// Create customer details route
app.get("/customer-billing", (req, res) => {
  const users = shopdb
    .prepare("SELECT * FROM user WHERE branch_id = ? ORDER BY timestamp DESC")
    .all(req.session.employee.branch);
  
  const allusers = shopdb
  .prepare("SELECT * FROM user ORDER BY timestamp DESC")
  .all();
    
  const admin = req.session.employee.admin === 1 ? users : allusers;
  
    console.log(users);
  res.render("partials/customer-billing" , {users:  admin  , employee: req.session.employee});
});




app.get("/employee-salary", isAdmin, (req, res) => {
  const salary = shopdb
    .prepare("SELECT * FROM employees ")
    .all();

    console.log(salary);
  res.render("partials/employee-salary", { employeesalary: salary , employee: req.session.employee });
});

app.get("/edit-salary/:id", (req, res) => {
  const id = req.params.id;
  const employee = shopdb.prepare("SELECT * FROM employees WHERE id = ?").all(id);
  const salary = shopdb
    .prepare("SELECT * FROM salary WHERE employee_id = ?")
    .all(id);

  console.log(employee[0]);
  res.render("partials/edit-salary", {salary: salary,id, employee: employee[0]});



});

app.post("/edit-salary/:id", (req, res) => {
  const id = req.params.id;
  const { salary , debit , credit } = req.body;

  shopdb
    .prepare(
      "INSERT INTO salary (employee_id, salary, debit, credit) VALUES (?, ?, ?, ?)"
    )
    .run(id, salary, debit, credit);

  res.redirect(`/edit-salary/${id}`);

});


app.post("/update-salary/:id", (req, res) => {
  const id = req.params.id;
  const { salary } = req.body;

  shopdb
    .prepare("UPDATE employees SET salary = ? WHERE id = ?")
    .run(salary, id);

  res.redirect(`/edit-salary/${id}`);
});







app.get("/edit-user/:id", (req, res) => {
  if (!isAdmin(req)) {
    return res.status(401).send("Unauthorized");
  }

  // edit user
});



app.post("/paymentdone/:id", (req, res) => {
  const id = req.params.id;
  const { paid } = req.body;
  shopdb.prepare("UPDATE user SET payment = ?  WHERE id = ?").run( paid,id);
  res.redirect("/customer-billing");
});

app.listen(4000, () => console.log(`http://localhost:${4000}`));

