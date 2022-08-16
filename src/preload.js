const { contextBridge, clipboard, ipcRenderer } = require("electron");
const fs = require("fs");
const db = require("./db");
const crypt = require("./crypt");

// db => database functions
contextBridge.exposeInMainWorld("db", {
  getUser: (username) => db.getUser(username),
  addUser: (username, password, image) => db.addUser(username, password, image),
  updateUser: (username, image, password=null) =>
    db.updateUser(username, password, image),
  deleteUser: (username) => db.deleteUser(username),

  getPasswords: (username) => db.getPasswords(username),
  addPassword: (user_owner, name, username, password) =>
    db.addPassword(user_owner, name, username, password),
  updatePassword: (id, user_owner, name, username, password) =>
    db.updatePassword(id, user_owner, name, username, password),
  deletePassword: (id, user_owner, name, username, password) =>
    db.deletePassword(id, user_owner, name, username, password),

  getLastUser: () => db.getLastUser(),
  setLastUser: (username) => db.setLastUser(username),
});

// clipboard => copy to clipboard
contextBridge.exposeInMainWorld("clipboard", {
  copy: (text) => clipboard.writeText(text),
});

// crypt => encryption and decryption functions + hash
contextBridge.exposeInMainWorld("crypt", {
  generateKey: (base) => crypt.generateKey(base),
  encrypt: (text) => crypt.encrypt(text),
  decrypt: (text) => crypt.decrypt(text),
  sha256: (text) => crypt.sha256(text),
});

// renderEvents => events sent to main process
contextBridge.exposeInMainWorld("renderEvents", {
  chooseImageDialog: () => ipcRenderer.invoke("chooseImage"),
  finishedLoading: () => ipcRenderer.send("DOM-loaded"),
});

// fs => file system functions
contextBridge.exposeInMainWorld("fs", {
  exists: (path) => fs.existsSync(path),
});
