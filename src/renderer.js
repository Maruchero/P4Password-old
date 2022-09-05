let activeUser = null;

/*****************************************
 * Load last user
 */
loadLastUser();
async function loadLastUser() {
  let lastUser = await db.getUser(db.getLastUser().last_user);
  if (lastUser) {
    // Load theme
    let root = document.querySelector(":root");
    let theme = await db.getTheme(lastUser.theme);
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
    // Load image and username
    // set username
    loginSection.username.value = lastUser.username;
    // set the focus on the password field
    document.getElementById("password-input").focus();
    if (lastUser.image) {
      // set user image
      const imgPath = lastUser.image.replace(/\\/g, "/");
      if (fs.exists(imgPath)) {
        loginSection.userImage.style.backgroundImage = `url("/${imgPath}")`;
        accountsSection.userImage.style.backgroundImage = `url("/${imgPath}")`;
        loginSection._self.style.setProperty(
          "--bg-image",
          `url("/${imgPath}")`
        );
      }
      // if user changes username reset the image
      loginSection.username.addEventListener("input", () => {
        loginSection.userImage.style = "";
        accountsSection.userImage.style = "";
        loginSection._self.style.setProperty("--opacity", "0");
      });
    }
  }
}

/****************************************
 * Dialog functions
 */
function openDialog(id, callback = null) {
  dialogsSection._self.style.zIndex = "1000";

  var dialog = document.getElementById(id);
  if (dialog) {
    dialog.classList.add("active");
    dialogsSection._self.classList.add("active");
  }

  if (callback) callback();
}

function closeDialogs() {
  const dialogs = document.getElementsByTagName("dialog");
  for (var i = 0; i < dialogs.length; i++) {
    dialogs[i].classList.remove("active");
    dialogsSection._self.classList.remove("active");
  }
  setTimeout(() => {
    dialogsSection._self.style.zIndex = "initial";
  }, 300);
}

/******************************************
 * Settings dialog
 */
async function setActiveCategory(category) {
  for (let i = 0; i < dialogsSection.settings.groups.length; i++) {
    dialogsSection.settings.groups[i].classList.remove("active");
  }
  category.classList.add("active");

  // set content
  switch (category.dataset.category) {
    case "user-settings":
      dialogsSection.settings.context.innerHTML = `
          <h2>Change password</h2>
          <label for="change-password-password">Current password</label>
          <input id="change-password-password" type="password">
          <label for="change-password-new-password">New password</label>
          <input id="change-password-new-password" type="password">
          <label for="change-password-repeat-new-password">Repeat new password</label>
          <input id="change-password-repeat-new-password" type="password">
          <div class="button-bar">
            <label id="change-password-output" class="dialog-output"></label>
            <button onclick="changePassword()">Change password</button>
          </div>
          <h2>Change image</h2>
          <div>
            <span id="user-image-preview"></span>
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <button onclick="showChangeImageDialog()"><i class="fa-solid fa-image"></i> Change image</button>
              <button onclick="setImage(null)"><i class="fa-solid fa-trash"></i> Remove image</button>
            </div>
          </div>
          <h2>Delete user</h2>
          <button onclick="closeDialogs(); setTimeout(()=>{openDialog('delete-user-dialog')}, 300)" style="background: rgb(255, 101, 101); border-color: rgb(224, 74, 74);">Delete user</button>
        `;

      // Set user image preview
      db.getUser(activeUser).then((user) => {
        user.image = user.image ? user.image.replace(/\\/g, "/") : null;
        if (fs.exists(user.image))
          document.getElementById(
            "user-image-preview"
          ).style.backgroundImage = `url("/${user.image}")`;
        else document.getElementById("user-image-preview").style = "";

        dialogsSection.deleteUser.account.innerHTML = user.username;
      });

      // Password minimum length
      const passwordInput = document.getElementById(
        "change-password-new-password"
      );
      const output = document.getElementById("change-password-output");

      passwordInput.addEventListener("keyup", () => {
        const password = passwordInput.value;
        if (password.length < 10) {
          output.innerHTML = "Password must be at least 10 characters long";
        } else {
          output.innerHTML = "";
        }
      });
      break;

    default:
      dialogsSection.settings.context.innerHTML = "";
  }
}

async function showChangeImageDialog() {
  const path = await renderEvents.chooseImageDialog();
  if (path) {
    setImage(path);
  }
}

async function setImage(path) {
  db.updateUserImage(activeUser, path);
  // Update images
  imgPath = path ? path.replace(/\\/g, "/") : null;
  if (fs.exists(imgPath)) {
    accountsSection.userImage.style.backgroundImage = `url("/${imgPath}")`;
    document.getElementById(
      "user-image-preview"
    ).style.backgroundImage = `url("/${imgPath}")`;
  } else {
    accountsSection.userImage.style = "";
    document.getElementById("user-image-preview").style = "";
  }
}

async function changePassword() {
  const changePasswordOutput = document.getElementById(
    "change-password-output"
  );

  const password = document.getElementById("change-password-password").value;
  const newPassword = document.getElementById(
    "change-password-new-password"
  ).value;
  const confirm = document.getElementById(
    "change-password-repeat-new-password"
  ).value;

  const user = await db.getUser(activeUser);

  if (user.password !== (await crypt.sha256(password))) {
    changePasswordOutput.innerHTML = "Wrong password";
    return;
  }
  if (newPassword.length === 0) {
    changePasswordOutput.innerHTML = "Please enter a new password";
    return;
  }
  if (newPassword.length < 10) {
    changePasswordOutput.innerHTML = "Password must be at least 10 characters long";
    return;
  }
  if (newPassword === password) {
    changePasswordOutput.innerHTML = "Please enter a different password";
    return;
  }
  if (newPassword !== confirm) {
    changePasswordOutput.innerHTML = "Passwords do not match";
    return;
  }

  // Change password
  db.updateUserPassword(user.id, password, newPassword)
    .then(async () => {
      await crypt.generateKey(newPassword);
      loadPasswords(user.id);
      // Show success message
      changePasswordOutput.style.color = "var(--color-success)";
      changePasswordOutput.innerHTML = "Password changed succesfully";
    })
    .catch((error) => {
      console.error(error);
      changePasswordOutput.innerHTML = "Something went wrong";
    });

  // Close the dialog
  setTimeout(() => {
    changePasswordOutput.style = "";
    changePasswordOutput.innerHTML = "";
    document.getElementById("change-password-password").value = "";
    document.getElementById("change-password-new-password").value = "";
    document.getElementById("change-password-repeat-new-password").value = "";
  }, 2000);
}

function deleteUser() {
  const out = document.getElementById("delete-user-output");
  db.deleteUser(activeUser)
    .then(() => {
      out.style.color = "var(--color-success)";
      out.innerHTML = "User deleted succesfully";
    })
    .catch((e) => {
      console.error(e);
      out.innerHTML = "Something went wrong";
    });
  setTimeout(() => {
    window.location.reload();
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
  const username = dialogsSection.addUser.username.value;
  const password = dialogsSection.addUser.password.value;
  const confirm = dialogsSection.addUser.confirm.value;
  const image = dialogsSection.addUser.image.value;

  if (username.length === 0) {
    dialogsSection.addUser.output.innerHTML = "Please enter a username";
    return;
  }
  if (await db.getUserByUsername(username)) {
    dialogsSection.addUser.output.innerHTML = "User already exists";
    return;
  }
  if (password.length === 0) {
    dialogsSection.addUser.output.innerHTML = "Please enter a password";
    return;
  }
  if (password.length < 10) {
    dialogsSection.addUser.output.innerHTML =
      "Password must be at least 10 characters long";
    return;
  }
  if (password !== confirm) {
    dialogsSection.addUser.output.innerHTML = "Passwords do not match";
    return;
  }

  // Add user to the database
  db.addUser(username, await crypt.sha256(password), image ? image : null)
    .then(() => {
      dialogsSection.addUser.output.style.color = "var(--color-success)";
      dialogsSection.addUser.output.innerHTML = "User added succesfully";
    })
    .catch((e) => {
      console.error(e);
      dialogsSection.addUser.output.innerHTML = "Something went wrong";
    });

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      dialogsSection.addUser.output.style = "";
      dialogsSection.addUser.output.innerHTML = "";
      dialogsSection.addUser.username.value = "";
      dialogsSection.addUser.password.value = "";
      dialogsSection.addUser.confirm.value = "";
      dialogsSection.addUser.image.value = "";
      dialogsSection._self.querySelector(
        "button.square-button"
      ).style.background = "var(--palette-6)";
    }, 300);
  }, 1000);
}

async function showChooseImageDialog(element) {
  const path = await renderEvents.chooseImageDialog();
  if (path) {
    dialogsSection.addUser.image.value = path;
    element.style.backgroundColor = "rgb(170, 230, 170)";
  }
}

dialogsSection.addUser.password.addEventListener("keyup", () => {
  const password = dialogsSection.addUser.password.value;
  if (password.length < 10) {
    dialogsSection.addUser.output.innerHTML =
      "Password must be at least 10 characters long";
  } else {
    dialogsSection.addUser.output.innerHTML = "";
  }
});

/******************************************
 * Login section
 */
async function login_() {
  const username = loginSection.username.value;
  const password = loginSection.password.value;

  if (username.length === 0) {
    loginSection.output.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    loginSection.output.innerHTML = "Please enter a password";
    return;
  }

  // Check if user exists
  const user = await db.getUserByUsername(username);
  if (!user || user.password !== (await crypt.sha256(password))) {
    loginSection.output.innerHTML = "Invalid username or password";
    return;
  }

  db.setLastUser(user.id);

  lastUser = await db.getUser(await db.getLastUser().last_user);
  if (lastUser.image) {
    const imgPath = lastUser.image.replace(/\\/g, "/");
    if (fs.exists(imgPath))
      accountsSection.userImage.style.backgroundImage = `url("/${imgPath}")`;
  }

  // Load passwords
  crypt.generateKey(password).then(() => {
    // Login user
    activeUser = user.id;
    loginSection.output.style.color = "var(--color-success)";
    loginSection.output.innerHTML = "Login successful";

    accountsSection._self.style =
      "animation: slide-left .5s ease-in-out forwards; display: block";
    loginSection._self.style = "filter: brightness(.8)";

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
  accountsSection.accountOutput.value = "";
  accountsSection.usernameOutput.value = "";
  accountsSection.passwordOutput.value = "";
  dialogsSection.changePassword.account.value = "";
  dialogsSection.changePassword.username.value = "";
  dialogsSection.changePassword.password.value = "";
  dialogsSection.deletePassword.account.innerHTML = "";
  accountsSection.container.innerHTML = "";

  // Set focus on searchbar
  accountsSection.search.focus({ preventScroll: true });

  // Load passwords
  const passwords = await db.getPasswords(user);

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
        accountsSection.editButton.removeAttribute("disabled");
        accountsSection.deleteButton.removeAttribute("disabled");
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
      accountsSection.accountOutput.value = decrypted.name;
      accountsSection.usernameOutput.value = decrypted.username;
      accountsSection.passwordOutput.value = decrypted.password;
      // Preset all dialogs
      dialogsSection.changePassword.account.value = decrypted.name;
      dialogsSection.changePassword.username.value = decrypted.username;
      dialogsSection.changePassword.password.value = decrypted.password;
      dialogsSection.deletePassword.account.innerHTML = decrypted.name;
    });
    accountsSection.container.appendChild(span);
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
  const name = dialogsSection.addPassword.account.value;
  const username = dialogsSection.addPassword.account.value;
  const password = dialogsSection.addPassword.password.value;

  if (name.length === 0) {
    dialogsSection.addPassword.output.innerHTML = "Please enter a name";
    return;
  }
  if (username.length === 0) {
    dialogsSection.addPassword.output.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    dialogsSection.addPassword.output.innerHTML = "Please enter a password";
    return;
  }

  // Add password to the database
  db.addPassword(
    activeUser,
    await crypt.encrypt(name),
    await crypt.encrypt(username),
    await crypt.encrypt(password)
  )
    .then(() => {
      dialogsSection.addPassword.output.style.color = "var(--color-success)";
      dialogsSection.addPassword.output.innerHTML = "Password added sucesfully";
    })
    .catch((e) => {
      console.error(e);
      dialogsSection.addPassword.output.innerHTML = "Something went wrong";
    });

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      dialogsSection.addPassword.output.style = "";
      dialogsSection.addPassword.output.innerHTML = "";
      dialogsSection.addPassword.account.value = "";
      dialogsSection.addPassword.username.value = "";
      dialogsSection.addPassword.password.value = "";
      // deactivate edit and delete buttons
      accountsSection.editButton.setAttribute("disabled", "disabled");
      accountsSection.deleteButton.setAttribute("disabled", "disabled");
      // reload passwords
      loadPasswords(activeUser);
    }, 300);
  }, 1000);
}

async function editPassword() {
  const name = dialogsSection.changePassword.account.value;
  const username = dialogsSection.changePassword.username.value;
  const password = dialogsSection.changePassword.password.value;

  if (name.length === 0) {
    dialogsSection.changePassword.output.innerHTML = "Please enter a name";
    return;
  }
  if (username.length === 0) {
    dialogsSection.changePassword.output.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    dialogsSection.changePassword.output.innerHTML = "Please enter a password";
    return;
  }

  // Edit password in the database
  db.updatePassword(
    activeSpan.dataset.id,
    await crypt.encrypt(name),
    await crypt.encrypt(username),
    await crypt.encrypt(password)
  )
    .then(() => {
      dialogsSection.changePassword.output.style.color = "var(--color-success)";
      dialogsSection.changePassword.output.innerHTML =
        "Password edited sucesfully";
    })
    .catch((e) => {
      console.error(e);
      dialogsSection.changePassword.output.innerHTML = "Something went wrong";
    });

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      dialogsSection.changePassword.output.style = "";
      dialogsSection.changePassword.output.innerHTML = "";
      dialogsSection.changePassword.account.value = "";
      dialogsSection.changePassword.username.value = "";
      dialogsSection.changePassword.password.value = "";
      // deactivate edit and delete buttons
      accountsSection.editButton.setAttribute("disabled", "disabled");
      accountsSection.deleteButton.setAttribute("disabled", "disabled");
      // reload passwords
      loadPasswords(activeUser);
    }, 300);
  }, 1000);
}

async function deletePassword() {
  // Delete password from the database
  db.deletePassword(activeSpan.dataset.id)
    .then(() => {
      dialogsSection.deletePassword.output.style.color = "var(--color-success)";
      dialogsSection.deletePassword.output.innerHTML =
        "Password deleted sucesfully";
    })
    .catch((e) => {
      console.error(e);
      dialogsSection.deletePassword.output.innerHTML = "Something went wrong";
    });

  // Close the dialog
  setTimeout(() => {
    closeDialogs();
    setTimeout(() => {
      dialogsSection.deletePassword.output.style = "";
      dialogsSection.deletePassword.output.innerHTML = "";
      dialogsSection.deletePassword.account.innerHTML = "";
      // deactivate edit and delete buttons
      accountsSection.editButton.setAttribute("disabled", "disabled");
      accountsSection.deleteButton.setAttribute("disabled", "disabled");
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
