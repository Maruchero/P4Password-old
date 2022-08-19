const sqlite = require("better-sqlite3");
const fs = require("fs");
require("./db_updater");

let path;
if (process.env.DATABASE_PATH) {
  path = process.env.DATABASE_PATH;
} else {
  path = `${process.env.APPDATA}\\P4Password\\db\\`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

const db = new sqlite(`${path}P4Password.db`);
// get all database tables
try {
  db.prepare("SELECT * FROM app_data").all();
} catch (e) {
  console.error(e);
}

function getUser(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function addUser(username, password, image) {
  db.prepare(
    "INSERT INTO users (username, password, image) VALUES (?, ?, ?)"
  ).run(username, password, image);
}

function getPasswords(username) {
  return db
    .prepare("SELECT * FROM passwords WHERE user_owner = ?")
    .all(username);
}

function addPassword(user_owner, name, username, password) {
  db.prepare(
    "INSERT INTO passwords (user_owner, name, username, password) VALUES (?, ?, ?, ?)"
  ).run(user_owner, name, username, password);
}

function updatePassword(id, user_owner, name, username, password) {
  db.prepare(
    "UPDATE passwords SET user_owner = ?, name = ?, username = ?, password = ? WHERE id = ?"
  ).run(user_owner, name, username, password, id);
}

function deletePassword(id, user_owner, name, username, password) {
  db.prepare(
    "DELETE FROM passwords WHERE id = ? AND user_owner = ? AND name = ? AND username = ? AND password = ?"
  ).run(id, user_owner, name, username, password);
}

function getLastUser() {
  return db.prepare("SELECT last_user FROM app_data").get();
}

function setLastUser(username) {
  db.prepare("UPDATE app_data SET last_user = ?").run(username);
}

/* Exports */
exports.getUser = getUser;
exports.addUser = addUser;
exports.getPasswords = getPasswords;
exports.addPassword = addPassword;
exports.updatePassword = updatePassword;
exports.deletePassword = deletePassword;
exports.getLastUser = getLastUser;
exports.setLastUser = setLastUser;
