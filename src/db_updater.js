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
} catch (e) {}

if (!dbVersion) {
  dbVersion = 0;
}

db.close();

updateDb(dbVersion);

/**********************************************************
 * Update function
 */
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

    case 1:
      // rename the db to 'P4Password_v{oldVersion}.db'
      oldDbPath = `${path}P4Password_v${oldVersion}.db`;
      fs.renameSync(dbPath, oldDbPath);
      // open a new connection to the old database
      oldDb = new sqlite(oldDbPath);
      // create a new db with the new standards
      newDb = new sqlite(dbPath);
      // create theme table
      newDb
        .prepare(
          "CREATE TABLE themes(" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "background VARCHAR(28) NOT NULL," +
            "text1 VARCHAR(28) NOT NULL," +
            "text2 VARCHAR(28) NOT NULL," +
            "text3 VARCHAR(28) NOT NULL," +
            "color1 VARCHAR(28) NOT NULL," +
            "color2 VARCHAR(28) NOT NULL," +
            "color3 VARCHAR(28) NOT NULL," +
            "color4 VARCHAR(28) NOT NULL," +
            "color5 VARCHAR(28) NOT NULL," +
            "color6 VARCHAR(28) NOT NULL," +
            "color7 VARCHAR(28) NOT NULL," +
            "color8 VARCHAR(28) NOT NULL," +
            "color9 VARCHAR(28) NOT NULL," +
            "color10 VARCHAR(28) NOT NULL," +
            "color11 VARCHAR(28) NOT NULL," +
            "color12 VARCHAR(28) NOT NULL," +
            "color13 VARCHAR(28) NOT NULL," +
            "color14 VARCHAR(28) NOT NULL," +
            "color15 VARCHAR(28) NOT NULL," +
            "color16 VARCHAR(28) NOT NULL," +
            "color17 VARCHAR(28) NOT NULL," +
            "color18 VARCHAR(28) NOT NULL" +
            ")"
        )
        .run();
      // create users table
      newDb
        .prepare(
          "CREATE TABLE users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "username VARCHAR(255) NOT NULL," +
            "password VARCHAR(255) NOT NULL," +
            "image VARCHAR(255)," +
            "theme INTEGER NOT NULL," +
            "delete_time DATETIME," +
            "FOREIGN KEY(theme) REFERENCES themes(id)" +
            ")"
        )
        .run();
      // create passwords table
      newDb
        .prepare(
          "CREATE TABLE passwords (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "user_owner INTEGER NOT NULL," +
            "name VARCHAR(255) NOT NULL," +
            "username VARCHAR(255) NOT NULL," +
            "password VARCHAR(255) NOT NULL," +
            "delete_time DATETIME," +
            "FOREIGN KEY (user_owner) REFERENCES users(id)" +
            ")"
        )
        .run();
      // create app_data table
      newDb
        .prepare(
          "CREATE TABLE app_data(" +
            "last_user INTEGER, " +
            "db_version INTEGER NOT NULL, " +
            "FOREIGN KEY(last_user) REFERENCES users(id)" +
            ")"
        )
        .run();

      // insert the default theme
      newDb
        .prepare(
          "INSERT INTO themes(background, text1, text2, text3, color1, color2, color3, color4, color5, color6, color7, color8, color9, color10, color11, color12, color13, color14, color15, color16, color17, color18) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          "#fff",
          "#000",
          "#000",
          "#777",
          "#333",
          "#444",
          "#666",
          "#999",
          "#b0b0b0",
          "#f0f0f0",
          "#f5f5f5",
          "#fcfcfc",
          "#fff",
          "#f0f0f0",
          "#f0f0f0",
          "#f0f0f0",
          "#0001",
          "#rgba(0,0,0,0.5)",
          "#fffa",
          "#rgba(200, 227, 236, 0.5)",
          "#acc3d3",
          "#c8e3ec"
        );

      // copy the data from the old db to the new db
      try {
        let users = oldDb.prepare("SELECT * FROM users").all();
        for (let { username, password, image } of users) {
          newDb
            .prepare(
              "INSERT INTO users (username, password, image, theme) VALUES (?, ?, ?, ?)"
            )
            .run(username, password, image, 1);
        }
      } catch (e) {}

      let users = newDb.prepare("SELECT * FROM users").all();
      try {
        let passwords = oldDb.prepare("SELECT * FROM passwords").all();
        for (let { user_owner, name, username, password } of passwords) {
          // convert username of the user _owner to the new id
          let user_id = users.find((user) => user.username === user_owner).id;
          // insert
          newDb
            .prepare(
              "INSERT INTO passwords (user_owner, name, username, password) VALUES (?, ?, ?, ?)"
            )
            .run(user_id, name, username, password);
        }
      } catch (e) {console.error(e);}

      try {
        let appData = oldDb.prepare("SELECT * FROM app_data").get();
        // convert username of the user _owner to the new id
        let user_id = users.find((user) => user.username === appData.last_user).id;
        // insert
        newDb
          .prepare("INSERT INTO app_data(last_user, db_version) VALUES(?, ?)")
          .run(user_id, 2);
      } catch (e) {console.error(e);
        newDb
          .prepare(
            "INSERT INTO app_data(last_user, db_version) VALUES(null, 2)"
          )
          .run();
      }

      // Set version to the new version
      oldVersion = 2;
      // Close connections
      oldDb.close();
      newDb.close();
  }
}
