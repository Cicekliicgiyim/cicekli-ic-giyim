const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Kullanıcı verilerini okuma/yazma fonksiyonları
const readJSON = (filename) => {
  try {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (err) {
    return [];
  }
};

const writeJSON = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
};

// Kayıt
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const users = readJSON("data/users.json");

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
  }

  users.push({ name, email, password });
  writeJSON("data/users.json", users);

  res.json({ message: "Kayıt başarılı!" });
});

// Giriş
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON("data/users.json");

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "E-posta veya şifre yanlış." });
  }

  res.json({ message: "Giriş başarılı!", user });
});

// Doğrulama kodlarını geçici olarak tut
let resetCodes = {};

// Kod gönderme (şifre sıfırlama için)
app.post("/api/send-reset-code", (req, res) => {
  const { email, phone } = req.body;
  const users = readJSON("data/users.json");

  const user = users.find(u => u.email === email && u.phone === phone);
  if (!user) {
    return res.status(400).json({ message: "E-posta veya telefon numarası hatalı." });
  }

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  resetCodes[email] = verificationCode;

  // E-posta gönderici
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "seninmailin@gmail.com", // kendi mailin
      pass: "uygulama-sifresi"       // Gmail uygulama şifresi
    }
  });

  const mailOptions = {
    from: "Çiçekli İç Giyim <seninmailin@gmail.com>",
    to: email,
    subject: "Şifre Sıfırlama Kodu",
    text: `Merhaba, şifre sıfırlama kodunuz: ${verificationCode}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Mail gönderilemedi:", error);
      return res.status(500).json({ message: "Kod gönderilemedi." });
    }
    console.log("Kod gönderildi:", info.response);
    res.json({ message: "Kod e-posta adresinize gönderildi." });
  });
});

// Kod doğrulama ve şifre güncelleme
app.post("/api/verify-reset-code", (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  const users = readJSON("data/users.json");

  if (resetCodes[email] !== verificationCode) {
    return res.status(400).json({ message: "Doğrulama kodu hatalı." });
  }

  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  users[userIndex].password = newPassword;
  writeJSON("data/users.json", users);

  delete resetCodes[email]; // kodu temizle

  res.json({ message: "Şifre başarıyla güncellendi." });
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);
});
