import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { CustomUserRequest } from '../middlewares/authMiddleware';

const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logstream = fs.createWriteStream(
  path.join(__dirname, '../../logs/access.log'),
  { flags: 'a' }
);

// สร้างฟังก์ชันที่กำหนดเองสำหรับการรวมข้อมูลผู้ใช้
morgan.token('userId', (req: CustomUserRequest) =>
  req.user ? req.user.id : 'guest'
);

// ฟอร์แมตของการบันทึกล็อก
const format =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms - User: :userId';

const fileLogger = morgan(format, { stream: logstream });
const consoleLogger = morgan(format);

export { fileLogger, consoleLogger };
