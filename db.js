const Database = require('better-sqlite3');


const shopdb = new Database('../database/shop/shop.db');

shopdb.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    phone INTEGER,
    name TEXT,
    items TEXT,
    total INTEGER,
    orderdate DATETIME DEFAULT CURRENT_TIMESTAMP,
    deliverydate DATE,
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

console.log('Connected to the database');

module.exports = {shopdb};
