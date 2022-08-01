let key;
let iv;

async function generateKey(base) {
  let str = "";
  while (str.length < 32) {
    str += base;
  }
  str = str.substring(0, 32);
  let raw = new TextEncoder().encode(str);
  // user key
  key = await window.crypto.subtle.importKey(
    "raw",
    raw.buffer,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
  // app key
  iv = new Uint8Array([193, 178, 212, 199, 3, 161, 245, 215, 169, 55, 50, 89]);
}

async function encrypt(string) {
  if (!key) throw new Error("Key not generated");
  // Encrypt
  let encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new TextEncoder().encode(string)
  );
  return Buffer.from(new Uint8Array(encrypted)).toString("base64");
}

async function decrypt(string) {
  if (!key) throw new Error("Key not generated");
  // Decrypt
  let decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new Uint8Array(Buffer.from(string, "base64"))
  );
  return new TextDecoder().decode(decrypted);
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

exports.generateKey = generateKey;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.sha256 = sha256;
