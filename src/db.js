const sqlite = require("better-sqlite3");
const fs = require("fs");

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

// user table
function getUser(id) {
  return db.prepare("SELECT * FROM users WHERE id = ? AND delete_time IS NULL").get(id);
}

function getUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ? AND delete_time IS NULL").get(username);
}

function addUser(username, password, image) {
  db.prepare(
    "INSERT INTO users (username, password, image, theme) VALUES (?, ?, ?, ?)"
  ).run(username, password, image, 1);
}

function updateUser(username, password, image) {
  if (password) {
    db.prepare(
      "UPDATE users SET password = ?, image = ? WHERE username = ?"
    ).run(password, image, username);
  } else {
    db.prepare("UPDATE users SET image = ? WHERE username = ?").run(
      image,
      username
    );
  }
}

function deleteUser(username) {
  db.prepare("DELETE FROM users WHERE username = ?").run(username);

  db.prepare("DELETE FROM passwords WHERE user_owner = ?").run(username);
}

// password table
function getPasswords(user_owner_id) {
  return db
    .prepare("SELECT * FROM passwords WHERE user_owner = ? AND delete_time IS NULL")
    .all(user_owner_id);
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

function deletePassword(id) {
  let now = new Date();
  let month = (now.getMonth() + 1).toString().length === 1 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
  let day = now.getDate().toString().length === 1 ? "0" + now.getDate() : now.getDate();
  let hour = now.getHours().toString().length === 1 ? "0" + now.getHours() : now.getHours();
  let minute = now.getMinutes().toString().length === 1 ? "0" + now.getMinutes() : now.getMinutes();
  let second = now.getSeconds().toString().length === 1 ? "0" + now.getSeconds() : now.getSeconds();

  db.prepare(
    "UPDATE passwords SET delete_time = ? WHERE id = ?"
  ).run(`${now.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`, id);
}

// app_data table
function getLastUser() {
  return db.prepare("SELECT last_user FROM app_data").get();
}

function setLastUser(username) {
  db.prepare("UPDATE app_data SET last_user = ?").run(username);
}

// theme table
function getTheme(id) {
  return db.prepare("SELECT * FROM themes WHERE id = ?").get(id);
}

/* Exports */
exports.getUser = getUser;
exports.getUserByUsername = getUserByUsername;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;

exports.getPasswords = getPasswords;
exports.addPassword = addPassword;
exports.updatePassword = updatePassword;
exports.deletePassword = deletePassword;

exports.getLastUser = getLastUser;
exports.setLastUser = setLastUser;
exports.getTheme = getTheme;
