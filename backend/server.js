const express    = require("express");
const fs         = require("fs");
const path       = require("path");
const cors       = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const crypto     = require("crypto");
const bcrypt     = require("bcrypt");

const app  = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// data/ klasörünü otomatik oluştur
const DATA_DIR   = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

// Yardımcı fonksiyonlar
const readUsers  = () => {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); }
  catch { return []; }
};

const writeUsers = (data) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf8");
};

// Kod deposu: { email: { code, expiresAt } }
const resetCodes = {};

// E-posta gönderici
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER || "seninmailin@gmail.com",
    pass: process.env.MAIL_PASS || "uygulama-sifresi"
  }
});

// ─── KAYIT ────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  const users = readUsers();
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  users.push({ username, email, password: hashedPassword, phone: phone || "", role: "user" });
  writeUsers(users);

  res.json({ success: true, message: "Kayıt başarılı!" });
});

// ─── GİRİŞ ────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "E-posta ve şifre zorunludur." });
  }

  const users = readUsers();
  const user  = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "E-posta veya şifre yanlış." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "E-posta veya şifre yanlış." });
  }

  // Şifreyi response'a ekleme
  const { password: _, ...safeUser } = user;
  res.json({ success: true, message: "Giriş başarılı!", user: safeUser });
});

// ─── KOD GÖNDER (şifre sıfırlama) ─────────────────────────
app.post("/api/send-reset-code", (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ message: "E-posta ve telefon zorunludur." });
  }

  const users = readUsers();
  const user  = users.find(u => u.email === email && u.phone === phone);

  if (!user) {
    return res.status(400).json({ message: "E-posta veya telefon numarası hatalı." });
  }

  const code      = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 dakika
  resetCodes[email] = { code, expiresAt };

  const mailOptions = {
    from   : `Atilla Çiçekli İç Giyim <${process.env.MAIL_USER || "seninmailin@gmail.com"}>`,
    to     : email,
    subject: "Şifre Sıfırlama Kodu",
    html   : `
      <div style="font-family:'Montserrat',sans-serif; max-width:480px; margin:0 auto;
                  padding:30px; border-radius:10px; border:1px solid #f8bbd0;">
        <h2 style="color:#e91e63;">Şifre Sıfırlama</h2>
        <p>Merhaba <strong>${user.username}</strong>,</p>
        <p>Şifre sıfırlama kodunuz:</p>
        <div style="font-size:32px; font-weight:bold; color:#e91e63;
                    letter-spacing:8px; text-align:center; padding:20px 0;">
          ${code}
        </div>
        <p style="color:#888; font-size:13px;">Bu kod 10 dakika geçerlidir.</p>
        <p style="color:#888; font-size:13px;">
          Bu işlemi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
        </p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Mail gönderilemedi:", err);
      return res.status(500).json({ message: "Kod gönderilemedi." });
    }
    console.log("Kod gönderildi:", info.response);
    res.json({ success: true, message: "Kod e-posta adresinize gönderildi." });
  });
});

// ─── KOD DOĞRULA VE ŞİFRE GÜNCELLE ───────────────────────
app.post("/api/verify-reset-code", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  const entry = resetCodes[email];
  if (!entry) {
    return res.status(400).json({ message: "Kod bulunamadı. Lütfen tekrar gönderin." });
  }

  if (Date.now() > entry.expiresAt) {
    delete resetCodes[email];
    return res.status(400).json({ message: "Kodun süresi dolmuş. Lütfen tekrar gönderin." });
  }

  if (entry.code !== code) {
    return res.status(400).json({ message: "Doğrulama kodu hatalı." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır." });
  }

  const users     = readUsers();
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  users[userIndex].password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  writeUsers(users);
  delete resetCodes[email];

  res.json({ success: true, message: "Şifre başarıyla güncellendi." });
});

// ─── SUNUCU ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});