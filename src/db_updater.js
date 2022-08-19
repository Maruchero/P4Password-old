const sqlite = require("better-sqlite3");
const fs = require("fs");

// Get/Create database
let path;
if (process.env.DATABASE_PATH) {
  path = process.env.DATABASE_PATH;
} else {
  path = `${process.env.APPDATA}\\P4Password\\db\\`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
const dbPath = `${path}P4Password.db`;
const db = new sqlite(dbPath);

// Get version
let dbVersion;
try {
  dbVersion = db.prepare("SELECT db_version FROM app_data").get().db_version;
} catch(e) {}

if (!dbVersion) {
  dbVersion = 0;
}

console.log(dbVersion);
db.close();

updateDb(dbVersion);

/*********************************************** */
/* Update function */
function updateDb(oldVersion) {
  let newDb, oldDb, oldDbPath;

  // update core
  switch (oldVersion) {
    case 0:
      // rename the db to 'P4Password_v{oldVersion}.db'
      oldDbPath = `${path}P4Password_v${oldVersion}.db`;
      fs.renameSync(dbPath, oldDbPath);
      // open a new connection to the old database
      oldDb = new sqlite(oldDbPath);
      // create a new db with the new standards
      newDb = new sqlite(dbPath);
      // create users table
      newDb
        .prepare(
          "CREATE TABLE users (" +
            "username VARCHAR(255) PRIMARY KEY," +
            "password VARCHAR(255) NOT NULL," +
            "image VARCHAR(255)" +
            ")"
        )
        .run();
      // create passwords table
      newDb
        .prepare(
          "CREATE TABLE passwords (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "user_owner NOT NULL," +
            "name VARCHAR(255) NOT NULL," +
            "username VARCHAR(255) NOT NULL," +
            "password VARCHAR(255) NOT NULL," +
            "FOREIGN KEY (user_owner) REFERENCES users(username)" +
            ")"
        )
        .run();
      // create app_data table
      newDb
        .prepare(
          "CREATE TABLE app_data(" +
            "last_user VARCHAR(255), " +
            "db_version INTEGER NOT NULL, " +
            "FOREIGN KEY(last_user) REFERENCES users(username)" +
            ")"
        )
        .run();

      // copy the data from the old db to the new db
      try {
        let users = oldDb.prepare("SELECT * FROM users").all();
        for (let { username, password, image } of users) {
          newDb
            .prepare(
              "INSERT INTO users (username, password, image) VALUES (?, ?, ?)"
            )
            .run(username, password, image);
        }
      } catch (e) {}

      try {
        let passwords = oldDb.prepare("SELECT * FROM passwords").all();
        for (let { user_owner, name, username, password } of passwords) {
          newDb
            .prepare(
              "INSERT INTO passwords (user_owner, name, username, password) VALUES (?, ?, ?, ?)"
            )
            .run(user_owner, name, username, password);
        }
      } catch (e) {}

      try {
        let appData = oldDb.prepare("SELECT * FROM app_data").get();
        newDb
          .prepare("INSERT INTO app_data(last_user, db_version) VALUES(?, ?)")
          .run(appData.last_user, 1);
      } catch (e) {
        newDb
          .prepare(
            "INSERT INTO app_data(last_user, db_version) VALUES(null, 1)"
          )
          .run();
      }

      // Set version to the new version
      oldVersion = 1;
      // Close connections
      oldDb.close();
      newDb.close();
  }
}
