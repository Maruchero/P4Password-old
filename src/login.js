const attemps = [];
let blocked;
let blockInterval;

async function failedLogin() {
  // Register the attemp
  attemps.push(new Date());
  // Delete all the attemps older than 2 minutes
  const now = new Date();
  now.setSeconds(now.getSeconds() - 120);
  while (attemps[0] < now) {
    attemps.splice(0, 1);
  }
  // If there were 3 failed attemps, block the login for 5 minutes
  if (attemps.length >= 3 || blocked) {
    blocked = true;

    let blockTime = 300;
    if (blockInterval) clearInterval(blockInterval);

    loginSection.output.innerHTML = `Too many attemps, try again in ${blockTime} seconds`;
    blockInterval = setInterval(() => {
      loginSection.output.innerHTML = `Too many attemps, try again in ${--blockTime} seconds`;

      if (blockTime === 0) {
        blocked = false;
        loginSection.output.innerHTML = "";
      }
    }, 1000);
    return;
  }
}

async function login() {
  // Get credentials
  const username = loginSection.username.value;
  const password = loginSection.password.value;

  // Checks
  if (username.length === 0) {
    loginSection.output.innerHTML = "Please enter a username";
    failedLogin();
    return;
  }
  if (password.length === 0) {
    loginSection.output.innerHTML = "Please enter a password";
    failedLogin();
    return;
  }
  const user = await db.getUserByUsername(username);
  if (!user || user.password !== (await crypt.sha256(password))) {
    loginSection.output.innerHTML = "Invalid username or password";
    failedLogin();
    return;
  }

  // Update last user
  db.setLastUser(user.id);

  // User image
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
