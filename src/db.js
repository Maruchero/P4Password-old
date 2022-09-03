const sqlite = require("better-sqlite3");
const fs = require("fs");
const crypt = require("./crypt");

require("./db_updater.js");

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

// general functions
function now() {
  let date = new Date();
  let month =
    (date.getMonth() + 1).toString().length === 1
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let day =
    date.getDate().toString().length === 1
      ? "0" + date.getDate()
      : date.getDate();
  let hour =
    date.getHours().toString().length === 1
      ? "0" + date.getHours()
      : date.getHours();
  let minute =
    date.getMinutes().toString().length === 1
      ? "0" + date.getMinutes()
      : date.getMinutes();
  let second =
    date.getSeconds().toString().length === 1
      ? "0" + date.getSeconds()
      : date.getSeconds();

  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
}

// user table
async function getUser(id) {
  return db
    .prepare("SELECT * FROM users WHERE id = ? AND delete_time IS NULL")
    .get(id);
}

async function getUserByUsername(username) {
  return db
    .prepare("SELECT * FROM users WHERE username = ? AND delete_time IS NULL")
    .get(username);
}

async function addUser(username, password, image) {
  db.prepare(
    "INSERT INTO users (username, password, image, theme) VALUES (?, ?, ?, ?)"
  ).run(username, password, image, 1);
}

async function updateUserPassword(id, oldPassword, password) {
  let passwords = await getPasswords(id);

  // decrypt passwords
  await crypt.generateKey(oldPassword);
  let decrypted = [];
  for (let i = 0; i < passwords.length; i++) {
    let p = {};
    p.id = passwords[i].id;
    p.user_owner = passwords[i].user_owner;
    p.name = await crypt.decrypt(passwords[i].name);
    p.username = await crypt.decrypt(passwords[i].username);
    p.password = await crypt.decrypt(passwords[i].password);
    p.delete_time = passwords[i].delete_time;
    decrypted.push(p);
  }

  // re-encrypt all passwords
  await crypt.generateKey(password);
  for (let i = 0; i < decrypted.length; i++) {
    updatePassword(
      decrypted[i].id,
      await crypt.encrypt(decrypted[i].name),
      await crypt.encrypt(decrypted[i].username),
      await crypt.encrypt(decrypted[i].password)
    );
  }

  // update user password
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(await crypt.sha256(password), id);
}

async function updateUserImage(id, image) {
  db.prepare("UPDATE users SET image = ? WHERE id = ?").run(image, id);
}

async function updateUserTheme(id, theme) {
  db.prepare("UPDATE users SET theme = ? WHERE id = ?").run(theme, id);
}

async function deleteUser(id) {
  let delete_time = now();
  db.prepare("UPDATE users SET delete_time = ? WHERE id = ?").run(
    delete_time,
    id
  );
  // delete all passwords of the user
  db.prepare("UPDATE passwords SET delete_time = ? WHERE user_owner = ?").run(
    delete_time,
    id
  );
}

// password table
async function getPasswords(user_owner_id) {
  return db
    .prepare(
      "SELECT * FROM passwords WHERE user_owner = ? AND delete_time IS NULL"
    )
    .all(user_owner_id);
}

async function addPassword(user_owner, name, username, password) {
  db.prepare(
    "INSERT INTO passwords (user_owner, name, username, password) VALUES (?, ?, ?, ?)"
  ).run(user_owner, name, username, password);
}

async function updatePassword(id, name, username, password) {
  db.prepare(
    "UPDATE passwords SET name = ?, username = ?, password = ? WHERE id = ? AND delete_time IS NULL"
  ).run(name, username, password, id);
}

async function deletePassword(id) {
  db.prepare("UPDATE passwords SET delete_time = ? WHERE id = ?").run(
    now(),
    id
  );
}

// app_data table
function getLastUser() {
  return db.prepare("SELECT last_user FROM app_data").get();
}

async function setLastUser(username) {
  db.prepare("UPDATE app_data SET last_user = ?").run(username);
}

// theme table
async function getTheme(id) {
  return db.prepare("SELECT * FROM themes WHERE id = ?").get(id);
}

/* Exports */
exports.getUser = getUser;
exports.getUserByUsername = getUserByUsername;
exports.addUser = addUser;
exports.updateUserPassword = updateUserPassword;
exports.updateUserImage = updateUserImage;
exports.updateUserTheme = updateUserTheme;
exports.deleteUser = deleteUser;

exports.getPasswords = getPasswords;
exports.addPassword = addPassword;
exports.updatePassword = updatePassword;
exports.deletePassword = deletePassword;

exports.getLastUser = getLastUser;
exports.setLastUser = setLastUser;
exports.getTheme = getTheme;
