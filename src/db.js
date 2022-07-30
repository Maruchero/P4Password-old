const sqlite = require("better-sqlite3");

const db = new sqlite("./P4Password.db");

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

/* Exports */
exports.getUser = getUser;
exports.addUser = addUser;
exports.getPasswords = getPasswords;
exports.addPassword = addPassword;
exports.updatePassword = updatePassword;
exports.deletePassword = deletePassword;
