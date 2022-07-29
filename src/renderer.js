/****************************************
 * Dialog functions
 */

const dialogSection = document.getElementById("dialogs");

function openDialog(id) {
  dialogSection.style.zIndex = "1000000";

  var dialog = document.getElementById(id);
  if (dialog) {
    dialog.classList.add("active");
    dialogSection.classList.add("active");
  }
}

function closeDialogs(event) {
  if (event.target === dialogSection) {
    _closeDialogs();
  }
}

function _closeDialogs() {
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
 * Add user dialog
 */
function addUser() {
  const username = document.getElementById("add-user-username-input").value;
  const password = document.getElementById("add-user-password-input").value;
  const passwordConfirm = document.getElementById(
    "add-user-confirm-input"
  ).value;

  const addUserOutput = document.getElementById("add-user-output");

  if (username.length === 0) {
    addUserOutput.innerHTML = "Please enter a username";
    return;
  }
  if (password.length === 0) {
    addUserOutput.innerHTML = "Please enter a password";
    return;
  }
  if (password !== passwordConfirm) {
    addUserOutput.innerHTML = "Passwords do not match";
    return;
  }
  if (db.getUser(username)) {
    addUserOutput.innerHTML = "User already exists";
    return;
  }

  // Add user to the database
  try {
    db.addUser(username, password, null);
    addUserOutput.style.color = "var(--color-success)";
    addUserOutput.innerHTML = "User added sucesfully";
  } catch (error) {
    addUserOutput.innerHTML = "Something went wrong";
  }

  // Close the dialog
  setTimeout(() => {
    _closeDialogs();
    setTimeout(() => {
      addUserOutput.style = "";
    }, 300);
  }, 1000);
}
