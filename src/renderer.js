let activeUser = null;

/********************************************
 * DOM Elements
 */
// Sections
const dialogSection = document.getElementById("dialogs");
const loginSection = document.getElementById("login");
const passwordSection = document.getElementById("passwords");

// Outputs (for example: User added succesfully)
const loginOutput = document.getElementById("login-output");
const addUserOutput = document.getElementById("add-user-output");
const addPasswordOutput = document.getElementById("add-password-output");
const editPasswordOutput = document.getElementById("edit-password-output");
const deletePasswordOutput = document.getElementById("delete-password-output");

// Passwords Section Elements
const passwordContainer = document.getElementById("password-container");
const accountOutput = document.getElementById("account-output");
const usernameOutput = document.getElementById("username-output");
const passwordOutput = document.getElementById("password-output");

// Dialogs presetted fields
const editPasswordName = document.getElementById("edit-password-name-input");
const editPasswordUsername = document.getElementById(
  "edit-password-username-input"
);
const editPasswordPassword = document.getElementById(
  "edit-password-password-input"
);

const deletePasswordName = document.getElementById("delete-password-name");

/*****************************************
 * Load last user
 */
let lastUser = db.getUser(db.getLastUser().last_user);
if (lastUser) {
  // Load theme
  let root = document.querySelector(":root");
  let theme = db.getTheme(lastUser.theme);
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--color", theme.text1);
  root.style.setProperty("--button-color", theme.text2);
  root.style.setProperty("--color-disabled", theme.text3);
  root.style.setProperty("--palette-1", theme.color1);
  root.style.setProperty("--palette-2", theme.color2);
  root.style.setProperty("--palette-3", theme.color3);
  root.style.setProperty("--palette-4", theme.color4);
  root.style.setProperty("--palette-5", theme.color5);
  root.style.setProperty("--palette-6", theme.color6);
  root.style.setProperty("--palette-7", theme.color7);
  root.style.setProperty("--palette-8", theme.color8);
  root.style.setProperty("--palette-9", theme.color9);
  root.style.setProperty("--palette-10", theme.color10);
  root.style.setProperty("--palette-11", theme.color11);
  root.style.setProperty("--palette-12", theme.color12);
  root.style.setProperty("--palette-13", theme.color13);
  root.style.setProperty("--palette-14", theme.color14);
  root.style.setProperty("--palette-15", theme.color15);
  root.style.setProperty("--palette-16", theme.color16);
  root.style.setProperty("--palette-17", theme.color17);
  root.style.setProperty("--palette-18", theme.color18);
  console.log(root.style);
  // Load image and username
  const usernameInput = document.getElementById("username-input");
  const userImage = document.getElementById("user-image");
  const userImageSmall = document.getElementById("user-image-small");
  // set username
  usernameInput.value = lastUser.username;
  // set the focus on the password field
  document.getElementById("password-input").focus();
  if (lastUser.image) {
    // set user image
    const imgPath = lastUser.image.replace(/\\/g, "/");
    if (fs.exists(imgPath)) {
      userImage.style.backgroundImage = `url("/${imgPath}")`;
      userImageSmall.style.backgroundImage = `url("/${imgPath}")`;
      loginSection.style.setProperty("--bg-image", `url("/${imgPath}")`);
    }
    // if user changes username reset the image
    usernameInput.addEventListener("input", () => {
      userImage.style = "";
      userImageSmall.style = "";
      loginSection.style.setProperty("--opacity", "0");
    });
  }
}

/****************************************
 * Dialog functions
 */
function openDialog(id, callback = null) {
  dialogSection.style.zIndex = "1000000";

  var dialog = document.getElementById(id);
  if (dialog) {
    dialog.classList.add("active");
    dialogSection.classList.add("active");
  }

  if (callback) callback();
}

function closeDialogs() {
  const dialogs = document.getElementsByTagName("dialog");
  for (var i = 0; i < dialogs.length; i++) {
    dialogs[i].classList.remove("active");
    dialogSection.classList.remove("active");
  }
  setTimeout(() => {
    dialogSection.style.zIndex = "initial";
  }, 300);
}

/******************************************
 * Settings dialog
 */
function setActiveCategory(category) {
  const categories = document.querySelectorAll(
    "#settings-dialog span.category"
  );
  for (let i = 0; i < categories.length; i++) {
    categories[i].classList.remove("active");
  }
  category.classList.add("active");

  // set content
  const content = document.querySelector("#settings-dialog .content");
  switch (category.dataset.category) {
    case "user-settings":
      content.innerHTML = `
          <h2>Change password</h2>
          <label for="change-password-password">Current password</label>
          <input id="change-password-password" type="password">
          <label for="change-password-new-password">New password</label>
          <input id="change-password-new-password" type="password">
          <label for="change-password-repeat-new-password">Repeat new password</label>
          <input id="change-password-repeat-new-password" type="password">
          <div class="button-bar">
            <label id="change-password-output"></label>
            <button onclick="changePassword()">Change password</button>
          </div>
          <h2>Change image</h2>
          <div>
            <span id="user-image-preview"></span>
            <button onclick="showChangeImageDialog()" style="float: left;"><i class="fa-solid fa-image"></i> Change image</button>
          </div>
          <h2>Delete user</h2>
          <button style="background: rgb(255, 101, 101); border-color: rgb(224, 74, 74);">Delete user</button>
        `;

      const user = db.getUser(activeUser);
      user.image = user.image.replace(/\\/g, "/");
      if (fs.exists(user.image))
        document.getElementById(
          "user-image-preview"
        ).style.backgroundImage = `url("/${user.image}")`;
      else document.getElementById("user-image-preview").style = "";
      break;

    default:
      content.innerHTML = "";
  }
}

async function showChangeImageDialog() {
  const path = await renderEvents.chooseImageDialog();
  if (path) {
    db.updateUser(activeUser, path);
    // Update images
    imgPath = path.replace(/\\/g, "/");
    if (fs.exists(imgPath)) {
      document.getElementById(
        "user-image-small"
      ).style.backgroundImage = `url("/${imgPath}")`;
      document.getElementById(
        "user-image-preview"
      ).style.backgroundImage = `url("/${imgPath}")`;
    } else {
      document.getElementById("user-image-small").style = "";
      document.getElementById("user-image-preview").style = "";
    }
  }
}

async function changePassword() {
  const changePasswordOutput = document.getElementById("change-password-output");

  const password = document.getElementById("change-password-password").value;
  const newPassword = document.getElementById(
    "change-password-new-password"
  ).value;
  const confirm = document.getElementById(
    "change-password-repeat-new-password"
  ).value;

  const user = db.getUser(activeUser);

  console.log(changePasswordOutput);
  if (user.password !== (await crypt.sha256(password))) {
    changePasswordOutput.innerHTML = "Wrong password";
    return;
  }
  if (newPassword.length === 0) {
    changePasswordOutput.innerHTML = "Please enter a new password";
    return;
  }
  if (newPassword !== confirm) {
    changePasswordOutput.innerHTML = "Passwords do not match";
    return;
  }

  // Add user to the database
  try {
    db.updateUser(user.username, user.image, await crypt.sha256(newPassword));
    changePasswordOutput.style.color = "var(--color-success)";
    changePasswordOutput.innerHTML = "Password changed succesfully";
  } catch (error) {
    changePasswordOutput.innerHTML = "Something went wrong";
  }

  // Close the dialog
  setTimeout(() => {
    changePasswordOutput.style = "";
    changePasswordOutput.innerHTML = "";
    document.getElementById("change-password-password").value = "";
    document.getElementById("change-password-new-password").value = "";
    document.getElementById("change-password-repeat-new-password").value = "";
 }, 2000);
}

/******************************************
 * Dropdown
 */
function toggleDropdown(dropdown) {
  const dropdownContent = dropdown.querySelector(".dropdown-content");
  let height = 0;

  const opened = dropdownContent.offsetHeight > 0;
  if (!opened) {
    const children = dropdownContent.querySelector(".container").children;
    for (let i = 0; i < children.length; i++) {
      height += children[i].offsetHeight + 5;
    }
    height += 25;
  }
  dropdownContent.style.maxHeight = `${height}px`;
}

/******************************************
 * Add user dialog
 */
async function addUser() {
  const username = document.getElementById("add-user-username-input").value;
  const password = document.getElementById("add-user-password-input").value;
  const confirm = document.getElementById("add-user-confirm-input").value;
  const image = document.getElementById("add-user-image-input").value;

  if (username.length === 0) {
    addUserOutput.innerHTML = "Please enter a username";
    return;
  }
  if (db.getUser(username)) {
    addUserOutput.innerHTML = "User already exists";
    return;
  }
  if (password.length === 0) {
    addUserOutput.innerHTML = "Please enter a password";
    return;
  }
  if (password !== confirm) {
    addUserOutput.innerHTML = "Passwords do not match";
    return;
  }

  // Add user to the database
  try {
    db.addUser(username, await crypt.sha256(password), image ? image : null);
    addUserOutput.style.color = "var(--color-success)";
    addUserOutput.innerHTML = "User added succesfully";
  } catch (error) {
    addUserOutput.innerHTML = "Something went wrong";
  }

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      addUserOutput.style = "";
      addUserOutput.innerHTML = "";
      document.getElementById("add-user-username-input").value = "";
      document.getElementById("add-user-password-input").value = "";
      document.getElementById("add-user-confirm-input").value = "";
    }, 300);
  }, 1000);
}

async function showChooseImageDialog(element) {
  const path = await renderEvents.chooseImageDialog();
  if (path) {
    document.getElementById("add-user-image-input").value = path;
    element.style.backgroundColor = "rgb(170, 230, 170)";
  }
}

/******************************************
 * Login section
 */
async function login() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;

  if (username.length === 0) {
    loginOutput.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    loginOutput.innerHTML = "Please enter a password";
    return;
  }

  // Check if user exists
  const user = db.getUserByUsername(username);
  if (!user || user.password !== (await crypt.sha256(password))) {
    loginOutput.innerHTML = "Invalid username or password";
    return;
  }

  db.setLastUser(user.id);

  const userImageSmall = document.getElementById("user-image-small");
  lastUser = db.getUser(db.getLastUser().last_user);
  if (lastUser.image) {
    const imgPath = lastUser.image.replace(/\\/g, "/");
    if (fs.exists(imgPath))
      userImageSmall.style.backgroundImage = `url("/${imgPath}")`;
  }

  // Load passwords
  crypt.generateKey(password).then(() => {
    // Login user
    activeUser = user.id;
    loginOutput.style.color = "var(--color-success)";
    loginOutput.innerHTML = "Login successful";

    passwordSection.style =
      "animation: slide-left .5s ease-in-out forwards; display: block";
    loginSection.style = "filter: brightness(.8)";

    loadPasswords(user.id);
  });
}

/****************************************
 * Password section
 */
function generatePassword() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#!$%&/()*+-_:;";
  let password = "";
  for (var i = 0; i < 16; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  // copy password to clipboard
  clipboard.copy(password);
  return password;
}

const passwordSpans = [];
let activeSpan = null;
async function loadPasswords(user) {
  // Clear previous status
  activeSpan = null;
  accountOutput.value = "";
  usernameOutput.value = "";
  passwordOutput.value = "";
  editPasswordName.value = "";
  editPasswordUsername.value = "";
  editPasswordPassword.value = "";
  deletePasswordName.innerHTML = "";
  passwordContainer.innerHTML = "";

  // Set focus on searchbar
  document.querySelector("input[type='search']").focus({ preventScroll: true });

  // Load passwords
  const passwords = db.getPasswords(user);

  for (let i = 0; i < passwords.length; i++) {
    const password = passwords[i];
    const span = document.createElement("span");
    span.classList.add("password");
    span.innerHTML = await crypt.decrypt(password.name);

    span.addEventListener("click", async () => {
      // Highlight span
      span.classList.add("active");
      if (!activeSpan) {
        // activate edit and delete buttons
        const buttonBar = passwordSection.querySelector(".button-bar");
        for (let i = 0; i < buttonBar.children.length; i++) {
          buttonBar.children[i].removeAttribute("disabled");
        }
        activeSpan = span;
      } else if (activeSpan !== span) {
        // if clicked a different span remove highlighting from the previous
        activeSpan.classList.remove("active");
      }
      activeSpan = span;
      activeSpan.dataset.id = password.id;
      // Decrypt password
      const decrypted = {};
      decrypted.name = await crypt.decrypt(password.name);
      decrypted.username = await crypt.decrypt(password.username);
      decrypted.password = await crypt.decrypt(password.password);
      // Show password
      accountOutput.value = decrypted.name;
      usernameOutput.value = decrypted.username;
      passwordOutput.value = decrypted.password;
      // Preset all dialogs
      editPasswordName.value = decrypted.name;
      editPasswordUsername.value = decrypted.username;
      editPasswordPassword.value = decrypted.password;
      deletePasswordName.innerHTML = decrypted.name;
    });
    passwordContainer.appendChild(span);
    passwordSpans.push(span);
  }
}

function search(keyword) {
  for (let i = 0; i < passwordSpans.length; i++) {
    const span = passwordSpans[i];
    if (span.innerHTML.toLowerCase().includes(keyword.toLowerCase())) {
      span.style.display = "block";
    } else {
      span.style.display = "none";
    }
  }
}

function logOut() {
  location.reload();
}

/******************************************
 * CRUD dialogs
 */
async function addPassword() {
  const name = document.getElementById("add-password-name-input").value;
  const username = document.getElementById("add-password-username-input").value;
  const password = document.getElementById("add-password-password-input").value;

  if (name.length === 0) {
    addPasswordOutput.innerHTML = "Please enter a name";
    return;
  }
  if (username.length === 0) {
    addPasswordOutput.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    addPasswordOutput.innerHTML = "Please enter a password";
    return;
  }

  // Add password to the database
  try {
    db.addPassword(
      activeUser,
      await crypt.encrypt(name),
      await crypt.encrypt(username),
      await crypt.encrypt(password)
    );
    addPasswordOutput.style.color = "var(--color-success)";
    addPasswordOutput.innerHTML = "Password added sucesfully";
  } catch (error) {
    console.error(error);
    addPasswordOutput.innerHTML = "Something went wrong";
  }

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      addPasswordOutput.style = "";
      addPasswordOutput.innerHTML = "";
      document.getElementById("add-password-name-input").value = "";
      document.getElementById("add-password-username-input").value = "";
      document.getElementById("add-password-password-input").value = "";
      // deactivate edit and delete buttons
      const editButton = passwordSection.querySelector(
        ".button-bar button[title='Edit']"
      );
      const deleteButton = passwordSection.querySelector(
        ".button-bar button[title='Delete']"
      );
      editButton.setAttribute("disabled", "disabled");
      deleteButton.setAttribute("disabled", "disabled");
      // reload passwords
      loadPasswords(activeUser);
    }, 300);
  }, 1000);
}

async function editPassword() {
  const name = editPasswordName.value;
  const username = editPasswordUsername.value;
  const password = editPasswordPassword.value;

  if (name.length === 0) {
    editPasswordOutput.innerHTML = "Please enter a name";
    return;
  }
  if (username.length === 0) {
    editPasswordOutput.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    editPasswordOutput.innerHTML = "Please enter a password";
    return;
  }

  // Edit password in the database
  try {
    db.updatePassword(
      activeSpan.dataset.id,
      activeUser,
      await crypt.encrypt(name),
      await crypt.encrypt(username),
      await crypt.encrypt(password)
    );
    editPasswordOutput.style.color = "var(--color-success)";
    editPasswordOutput.innerHTML = "Password edited sucesfully";
  } catch (error) {
    console.error(error);
    editPasswordOutput.innerHTML = "Something went wrong";
  }

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      editPasswordOutput.style = "";
      editPasswordOutput.innerHTML = "";
      document.getElementById("edit-password-name-input").value = "";
      document.getElementById("edit-password-username-input").value = "";
      document.getElementById("edit-password-password-input").value = "";
      // deactivate edit and delete buttons
      const editButton = passwordSection.querySelector(
        ".button-bar button[title='Edit']"
      );
      const deleteButton = passwordSection.querySelector(
        ".button-bar button[title='Delete']"
      );
      editButton.setAttribute("disabled", "disabled");
      deleteButton.setAttribute("disabled", "disabled");
      // reload passwords
      loadPasswords(activeUser);
    }, 300);
  }, 1000);
}

async function deletePassword() {
  // Delete password from the database
  try {
    db.deletePassword(activeSpan.dataset.id);
    deletePasswordOutput.style.color = "var(--color-success)";
    deletePasswordOutput.innerHTML = "Password deleted sucesfully";
  } catch (error) {
    console.error(error);
    deletePasswordOutput.innerHTML = "Something went wrong";
  }

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      deletePasswordOutput.style = "";
      deletePasswordOutput.innerHTML = "";
      deletePasswordName.innerHTML = "";
      // deactivate edit and delete buttons
      const editButton = passwordSection.querySelector(
        ".button-bar button[title='Edit']"
      );
      const deleteButton = passwordSection.querySelector(
        ".button-bar button[title='Delete']"
      );
      editButton.setAttribute("disabled", "disabled");
      deleteButton.setAttribute("disabled", "disabled");
      // reload passwords
      loadPasswords(activeUser);
    }, 300);
  }, 1000);
}

/******************************************
 * Events
 */
window.onload = () => {
  renderEvents.finishedLoading();
};
