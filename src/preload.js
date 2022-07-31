const { contextBridge, clipboard } = require("electron");
const db = require("./db");
const crypt = require("./crypt");

// make db accessible from renderer
contextBridge.exposeInMainWorld("db", {
  getUser: (username) => db.getUser(username),
  addUser: (username, password, image) => db.addUser(username, password, image),
  getPasswords: (username) => db.getPasswords(username),
  addPassword: (user_owner, name, username, password) =>
    db.addPassword(user_owner, name, username, password),
  updatePassword: (id, user_owner, name, username, password) =>
    db.updatePassword(id, user_owner, name, username, password),
  deletePassword: (id, user_owner, name, username, password) =>
    db.deletePassword(id, user_owner, name, username, password),
});

contextBridge.exposeInMainWorld("clipboard", {
  copy: (text) => clipboard.writeText(text),
});

contextBridge.exposeInMainWorld("crypt", {
  encrypt: (text) => crypt.encrypt(text),
  decrypt: (text) => crypt.decrypt(text),
  sha256: (text) => crypt.sha256(text),
});
