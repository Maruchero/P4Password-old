
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
    const dialogs = document.getElementsByTagName("dialog");
    for (var i = 0; i < dialogs.length; i++) {
      dialogs[i].classList.remove("active");
      dialogSection.classList.remove("active");
    }
    setTimeout(() => {
      dialogSection.style.zIndex = "initial";
    }, 300);
  }
}

/******************************************
 * Add user dialog
 */
function addUser() {
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    const addUserOutput = document.getElementById("add-user-output");

    if (user.length === 0) {
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

    // Add user to the database and close the dialog
}
