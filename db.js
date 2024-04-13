const Database = require('better-sqlite3');


const shopdb = new Database('../database/shop/shop.db');

shopdb.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    phone INTEGER,
    name TEXT,
    address TEXT,
    items TEXT,
    total INTEGER,
    orderdate DATETIME DEFAULT CURRENT_TIMESTAMP,
    deliverydate DATE,
    payment TEXT,
    branch_id INTEGER,
    onbranch BOOLEAN DEFAULT TRUE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP


  )
`
);
shopdb.exec(
`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER,
    name TEXT,
    user TEXT,
    service TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
);
shopdb.exec(
  `
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employees INTEGER,
      name TEXT,
      address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
);
shopdb.exec(
  `
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(id),
      name TEXT,
      number TEXT,
      password  TEXT,
      debit INTEGER,
      credit INTEGER,
      salary INTEGER,
      admin BOOLEAN DEFAULT FALSE,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
);

shopdb.exec(
  `
    CREATE TABLE IF NOT EXISTS salary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(id),
      employee_id INTEGER REFERENCES employees(id),
      debit INTEGER,
      credit INTEGER,
      salary INTEGER,
    
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
);







console.log('Connected to the database');

module.exports = {shopdb};
