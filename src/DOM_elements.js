// Dialogs Section
const dialogsSection = {};
dialogsSection._self = document.getElementById("dialogs");
dialogsSection.addUser = {
  username: document.getElementById("add-user-username-input"),
  password: document.getElementById("add-user-password-input"),
  confirm: document.getElementById("add-user-confirm-input"),
  image: document.getElementById("add-user-image-input"),
  output: document.getElementById("add-user-output"),
};
dialogsSection.addPassword = {
  account: document.getElementById("add-password-name-input"),
  username: document.getElementById("add-password-username-input"),
  password: document.getElementById("add-password-password-input"),
  output: document.getElementById("add-password-output"),
};
dialogsSection.changePassword = {
  account: document.getElementById("edit-password-name-input"),
  username: document.getElementById("edit-password-username-input"),
  password: document.getElementById("edit-password-password-input"),
  output: document.getElementById("edit-password-output"),
};
dialogsSection.deletePassword = {
  account: document.getElementById("delete-password-name"),
  output: document.getElementById("delete-password-output"),
};
dialogsSection.deleteUser = {
  account: document.getElementById("delete-user-name"),
};
dialogsSection.settings = {
  groups: document.querySelectorAll("#settings-dialog span.category"),
  context: document.querySelector("#settings-dialog .content"),
};

// Login Section
const loginSection = {};
loginSection._self = document.getElementById("login");
loginSection.userImage = document.getElementById("user-image");
loginSection.username = document.getElementById("username-input");
loginSection.password = document.getElementById("password-input");
loginSection.output = document.getElementById("login-output");

// Accounts Section
const accountsSection = {};
accountsSection._self = document.getElementById("passwords");

accountsSection.search = document.querySelector("input[type='search']");
accountsSection.container = document.getElementById("password-container");

accountsSection.accountOutput = document.getElementById("account-output");
accountsSection.usernameOutput = document.getElementById("username-output");
accountsSection.passwordOutput = document.getElementById("password-output");

accountsSection.buttonBar = document.querySelector(".button-bar");
accountsSection.editButton = document.querySelector(
  ".button-bar button[title='Edit']"
);
accountsSection.deleteButton = document.querySelector(
  ".button-bar button[title='Delete']"
);
accountsSection.userImage = document.getElementById("user-image-small");
