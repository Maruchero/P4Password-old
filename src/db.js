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
  // create users table
  db.prepare(
    "CREATE TABLE users (" +
      "username VARCHAR(255) PRIMARY KEY," +
      "password VARCHAR(255) NOT NULL," +
      "image VARCHAR(255)" +
      ")"
  ).run();
  // create passwords table
  db.prepare(
    "CREATE TABLE passwords (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "user_owner NOT NULL," +
      "name VARCHAR(255) NOT NULL," +
      "username VARCHAR(255) NOT NULL," +
      "password VARCHAR(255) NOT NULL," +
      "FOREIGN KEY (user_owner) REFERENCES users(username)" +
      ")"
  ).run();
  // create app_data table
  db.prepare(
    "CREATE TABLE app_data(" +
      "last_user varchar(255), " +
      "foreign key(last_user) references users(username)" +
      ")"
  ).run();
  db.prepare("INSERT INTO app_data VALUES(null)").run();
}

/*********************************************
 * User Table
 */
function getUser(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function addUser(username, password, image) {
  db.prepare(
    "INSERT INTO users (username, password, image) VALUES (?, ?, ?)"
  ).run(username, password, image);
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

/*********************************************
 * Password Table
 */
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

/*********************************************
 * App Data Table
 */
function getLastUser() {
  return db.prepare("SELECT last_user FROM app_data").get();
}

function setLastUser(username) {
  db.prepare("UPDATE app_data SET last_user = ?").run(username);
}

/*********************************************
 * Exports
 */
exports.getUser = getUser;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;

exports.getPasswords = getPasswords;
exports.addPassword = addPassword;
exports.updatePassword = updatePassword;
exports.deletePassword = deletePassword;

exports.getLastUser = getLastUser;
exports.setLastUser = setLastUser;
