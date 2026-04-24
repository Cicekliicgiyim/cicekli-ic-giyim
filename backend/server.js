const express    = require("express");
const cors       = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const crypto     = require("crypto");
const bcrypt     = require("bcrypt");
const mongoose   = require("mongoose");
const axios      = require("axios");
const Iyzipay    = require("iyzipay");

const app  = express();
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10;

// ─── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://cicekliicgiyim.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ]
}));
app.use(bodyParser.json());
app.use(express.static("public"));

// ─── MONGODB BAĞLANTISI ────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cicekli")
  .then(() => console.log("✅ MongoDB bağlandı"))
  .catch(err => console.error("❌ MongoDB hatası:", err));

// ─── ŞEMALAR ───────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username     : { type: String, required: true },
  email        : { type: String, required: true, unique: true },
  password     : { type: String, required: true },
  phone        : { type: String, default: "" },
  role         : { type: String, default: "user" },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  createdAt    : { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name       : { type: String, required: true },
  description: String,
  price      : { type: Number, required: true },
  stock      : { type: Number, default: 0 },
  category   : { type: String, enum: ["sutyen", "kulot", "takim", "gecelik", "pijama", "atlet"] },
  imageUrl   : String,
  active     : { type: Boolean, default: true },
  createdAt  : { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId         : { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items          : [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name     : String,
    price    : Number,
    quantity : Number
  }],
  total          : Number,
  status         : { type: String, default: "pending", enum: ["pending","paid","shipped","delivered","cancelled"] },
  paymentId      : String,
  shippingAddress: String,
  createdAt      : { type: Date, default: Date.now }
});

const User    = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order   = mongoose.model("Order", orderSchema);

// ─── KOD DEPOSU (bellekte) ─────────────────────────────────
// { email: { code, expiresAt, type: "email"|"phone"|"reset" } }
const verificationCodes = {};

// ─── E-POSTA GÖNDERICI ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendEmail = (to, subject, html) => {
  return transporter.sendMail({
    from: `Atilla Çiçekli İç Giyim <${process.env.MAIL_USER}>`,
    to, subject, html
  });
};

const emailTemplate = (title, code, message) => `
  <div style="font-family:'Montserrat',sans-serif;max-width:480px;margin:0 auto;
              padding:30px;border-radius:10px;border:1px solid #f8bbd0;">
    <h2 style="color:#e91e63;">${title}</h2>
    <p>${message}</p>
    <div style="font-size:32px;font-weight:bold;color:#e91e63;
                letter-spacing:8px;text-align:center;padding:20px 0;">
      ${code}
    </div>
    <p style="color:#888;font-size:13px;">Bu kod 10 dakika geçerlidir.</p>
    <p style="color:#888;font-size:13px;">Bu işlemi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
  </div>
`;

// ─── SMS GÖNDERİCİ (Netgsm) ────────────────────────────────
const sendSMS = async (phone, message) => {
  // Telefonu 90XXXXXXXXXX formatına çevir
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) formattedPhone = "9" + formattedPhone;
  if (!formattedPhone.startsWith("90")) formattedPhone = "90" + formattedPhone;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company dil="TR">Netgsm</company>
    <usercode>${process.env.NETGSM_USER}</usercode>
    <password>${process.env.NETGSM_PASS}</password>
    <gsmno>${formattedPhone}</gsmno>
    <type>1:n</type>
    <msgheader>${process.env.NETGSM_HEADER || "CICEKLIGIYIM"}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
  </body>
</mainbody>`;

  const response = await axios.post(
    "https://api.netgsm.com.tr/sms/send/xml",
    xml,
    { headers: { "Content-Type": "text/xml" } }
  );

  if (!response.data.startsWith("00")) {
    throw new Error(`Netgsm hatası: ${response.data}`);
  }
  return response.data;
};

// ─── İYZİCO AYARLARI ──────────────────────────────────────
const iyzipay = new Iyzipay({
  apiKey   : process.env.IYZICO_API_KEY    || "sandbox-api-key",
  secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secret-key",
  uri      : process.env.IYZICO_URI        || "https://sandbox-api.iyzipay.com"
});

// ─── KOD OLUŞTUR ───────────────────────────────────────────
const generateCode = () => crypto.randomInt(100000, 999999).toString();
const storeCode    = (key, code, type) => {
  verificationCodes[key] = { code, type, expiresAt: Date.now() + 10 * 60 * 1000 };
};
const verifyCode   = (key, code) => {
  const entry = verificationCodes[key];
  if (!entry) return { valid: false, message: "Kod bulunamadı. Lütfen tekrar gönderin." };
  if (Date.now() > entry.expiresAt) {
    delete verificationCodes[key];
    return { valid: false, message: "Kodun süresi dolmuş. Lütfen tekrar gönderin." };
  }
  if (entry.code !== code) return { valid: false, message: "Doğrulama kodu hatalı." };
  return { valid: true };
};

// ══════════════════════════════════════════════════════════
//  AUTH ROTALARI
// ══════════════════════════════════════════════════════════

// ─── KAYIT ────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Tüm alanlar zorunludur." });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, password: hashedPassword, phone: phone || "" });

    // E-posta doğrulama kodu gönder
    const code = generateCode();
    storeCode(email, code, "email");
    await sendEmail(email, "E-posta Doğrulama Kodu",
      emailTemplate("E-posta Doğrulama", code, `Merhaba <strong>${username}</strong>, hesabınızı doğrulamak için kodu kullanın:`));

    res.json({ success: true, message: "Kayıt başarılı! E-posta doğrulama kodu gönderildi.", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── E-POSTA DOĞRULAMA ─────────────────────────────────────
app.post("/api/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = verifyCode(email, code);
    if (!result.valid) return res.status(400).json({ message: result.message });

    await User.updateOne({ email }, { emailVerified: true });
    delete verificationCodes[email];
    res.json({ success: true, message: "E-posta başarıyla doğrulandı." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── TELEFON DOĞRULAMA KODU GÖNDER ────────────────────────
app.post("/api/send-phone-code", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) return res.status(400).json({ message: "E-posta ve telefon zorunludur." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // Telefonu kaydet
    await User.updateOne({ email }, { phone });

    const code = generateCode();
    storeCode(`phone:${email}`, code, "phone");
    await sendSMS(phone, `Cicekli Ic Giyim dogrulama kodunuz: ${code} (10 dk gecerli)`);

    res.json({ success: true, message: "SMS doğrulama kodu gönderildi." });
  } catch (err) {
    console.error("SMS hatası:", err);
    res.status(500).json({ message: "SMS gönderilemedi." });
  }
});

// ─── TELEFON DOĞRULAMA ─────────────────────────────────────
app.post("/api/verify-phone", async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = verifyCode(`phone:${email}`, code);
    if (!result.valid) return res.status(400).json({ message: result.message });

    await User.updateOne({ email }, { phoneVerified: true });
    delete verificationCodes[`phone:${email}`];
    res.json({ success: true, message: "Telefon başarıyla doğrulandı." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── GİRİŞ ────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "E-posta ve şifre zorunludur." });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "E-posta veya şifre yanlış." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "E-posta veya şifre yanlış." });

    const { password: _, ...safeUser } = user.toObject();
    res.json({ success: true, message: "Giriş başarılı!", user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── ŞİFRE SIFIRLAMA - KOD GÖNDER ────────────────────────
app.post("/api/send-reset-code", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) return res.status(400).json({ message: "E-posta ve telefon zorunludur." });

    const user = await User.findOne({ email, phone });
    if (!user) return res.status(400).json({ message: "E-posta veya telefon numarası hatalı." });

    const code = generateCode();
    storeCode(`reset:${email}`, code, "reset");

    // Hem e-posta hem SMS gönder
    await Promise.allSettled([
      sendEmail(email, "Şifre Sıfırlama Kodu",
        emailTemplate("Şifre Sıfırlama", code, `Merhaba <strong>${user.username}</strong>, şifre sıfırlama kodunuz:`)),
      sendSMS(phone, `Cicekli Ic Giyim sifre sifirlama kodunuz: ${code} (10 dk gecerli)`)
    ]);

    res.json({ success: true, message: "Kod e-posta ve SMS ile gönderildi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Kod gönderilemedi." });
  }
});

// ─── ŞİFRE SIFIRLAMA - KOD DOĞRULA ───────────────────────
app.post("/api/verify-reset-code", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ message: "Tüm alanlar zorunludur." });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır." });

    const result = verifyCode(`reset:${email}`, code);
    if (!result.valid) return res.status(400).json({ message: result.message });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.updateOne({ email }, { password: hashed });
    delete verificationCodes[`reset:${email}`];

    res.json({ success: true, message: "Şifre başarıyla güncellendi." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ══════════════════════════════════════════════════════════
//  ÜRÜN ROTALARI
// ══════════════════════════════════════════════════════════

app.get("/api/products", async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = { active: true };
    if (category && category !== "all") query.category = category;

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc")  sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };

    const products = await Product.find(query).sort(sortObj);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı." });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── ADMİN: ÜRÜN EKLE ─────────────────────────────────────
app.post("/api/admin/products", async (req, res) => {
  try {
    // TODO: admin auth middleware ekle
    const product = await Product.create(req.body);
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: "Ürün eklenemedi." });
  }
});

// ─── ADMİN: ÜRÜN GÜNCELLE ─────────────────────────────────
app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: "Ürün güncellenemedi." });
  }
});

// ─── ADMİN: ÜRÜN SİL ──────────────────────────────────────
app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: "Ürün silindi." });
  } catch (err) {
    res.status(500).json({ message: "Ürün silinemedi." });
  }
});

// ══════════════════════════════════════════════════════════
//  İYZİCO ÖDEME ROTALARI
// ══════════════════════════════════════════════════════════

app.post("/api/payment/start", async (req, res) => {
  try {
    const { userId, items, cardHolder, cardNumber, expireMonth, expireYear, cvc, address } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // Toplam hesapla
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // iyzico ödeme nesnesi
    const request = {
      locale          : Iyzipay.LOCALE.TR,
      conversationId  : new mongoose.Types.ObjectId().toString(),
      price           : total.toFixed(2),
      paidPrice       : total.toFixed(2),
      currency        : Iyzipay.CURRENCY.TRY,
      installment     : "1",
      basketId        : `BASKET_${Date.now()}`,
      paymentChannel  : Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup    : Iyzipay.PAYMENT_GROUP.PRODUCT,

      paymentCard: {
        cardHolderName: cardHolder,
        cardNumber    : cardNumber.replace(/\s/g, ""),
        expireMonth,
        expireYear,
        cvc,
        registerCard  : "0"
      },

      buyer: {
        id                 : user._id.toString(),
        name               : user.username.split(" ")[0] || user.username,
        surname            : user.username.split(" ")[1] || "-",
        gsmNumber          : user.phone || "+905000000000",
        email              : user.email,
        identityNumber     : "74300864791",
        lastLoginDate      : new Date().toISOString().replace("T", " ").substring(0, 19),
        registrationDate   : user.createdAt.toISOString().replace("T", " ").substring(0, 19),
        registrationAddress: address || "Türkiye",
        ip                 : req.ip || "85.34.78.112",
        city               : "Istanbul",
        country            : "Turkey",
        zipCode            : "34000"
      },

      shippingAddress: {
        contactName: user.username,
        city       : "Istanbul",
        country    : "Turkey",
        address    : address || "Türkiye",
        zipCode    : "34000"
      },

      billingAddress: {
        contactName: user.username,
        city       : "Istanbul",
        country    : "Turkey",
        address    : address || "Türkiye",
        zipCode    : "34000"
      },

      basketItems: items.map(item => ({
        id        : item.productId,
        name      : item.name,
        category1 : "İç Giyim",
        itemType  : Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price     : (item.price * item.quantity).toFixed(2)
      }))
    };

    iyzipay.payment.create(request, async (err, result) => {
      if (err || result.status !== "success") {
        console.error("iyzico hatası:", err || result.errorMessage);
        return res.status(400).json({ message: result.errorMessage || "Ödeme başarısız." });
      }

      // Siparişi kaydet
      const order = await Order.create({
        userId,
        items,
        total,
        status         : "paid",
        paymentId      : result.paymentId,
        shippingAddress: address
      });

      // Stok güncelle
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }

      // Onay e-postası gönder
      const itemsHtml = items.map(i => `<li>${i.name} x${i.quantity} — ₺${(i.price * i.quantity).toFixed(2)}</li>`).join("");
      await sendEmail(user.email, "Siparişiniz Alındı! 🌸",
        `<div style="font-family:'Montserrat',sans-serif;max-width:500px;margin:0 auto;padding:30px;border:1px solid #f8bbd0;border-radius:10px;">
          <h2 style="color:#e91e63;">Teşekkürler ${user.username}! 🌸</h2>
          <p>Siparişiniz başarıyla alındı.</p>
          <ul>${itemsHtml}</ul>
          <p><strong>Toplam: ₺${total.toFixed(2)}</strong></p>
          <p style="color:#888;font-size:13px;">Sipariş No: ${order._id}</p>
        </div>`
      ).catch(console.error);

      res.json({ success: true, message: "Ödeme başarılı!", orderId: order._id });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ══════════════════════════════════════════════════════════
//  SİPARİŞ GEÇMİŞİ
// ══════════════════════════════════════════════════════════

app.get("/api/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── ADMİN: TÜM SİPARİŞLER ───────────────────────────────
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "username email phone").sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ─── ADMİN: SİPARİŞ DURUM GÜNCELLE ───────────────────────
app.put("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("userId", "username email");

    // Durum değişikliğinde müşteriye e-posta
    const statusMessages = {
      shipped  : "Siparişiniz kargoya verildi! 🚚",
      delivered: "Siparişiniz teslim edildi! 🎉",
      cancelled: "Siparişiniz iptal edildi."
    };
    if (statusMessages[status] && order.userId) {
      await sendEmail(order.userId.email, statusMessages[status],
        `<p>Merhaba ${order.userId.username}, sipariş #${order._id} durumu güncellendi: <strong>${status}</strong></p>`
      ).catch(console.error);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Sipariş güncellenemedi." });
  }
});

// ─── SUNUCU ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});