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
    branch_id INTEGER,
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
      admin BOOLEAN DEFAULT FALSE,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
);






console.log('Connected to the database');

module.exports = {shopdb};
