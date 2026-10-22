# EduPrep AI — Telegram Mini App (Fizika & Ingliz Tili) ⚛️🇬🇧

Fizika va Ingliz tili fanlarini sun'iy intellekt (AI) yordamida o'rgatuvchi zamonaviy **Telegram Mini App (TMA)** loyihasi.

---

## 🌟 Asosiy Imkoniyatlar

### ⚛️ 1. Fizika Moduli
* **AI Masala Yechuvchi:** Fizika masalalarini 4 bosqichda tahlil qilib beradi:
  1. *Berilgan kattaliklar (Given)*
  2. *Kerakli formulalar (Formulas)*
  3. *Bosqichma-bosqich hisoblash (Step-by-step)*
  4. *Fizik mohiyat va xulosa*
* **Interaktiv Testlar (Quiz):** DTM va SAT formatidagi savollar, to'g'ri/noto'g'ri animatsiyasi va tushuntirishlar.
* **Formulalar Ma'lumotnomasi:** Barcha muhim formulalar bo'yicha tezkor qidiruv.

### 🇬🇧 2. Ingliz Tili Moduli
* **AI Speaking Examiner:** 
  * Haqiqiy ovoz (Web Speech Recognition) yoki matn orqali suhbat.
  * Ovozli javob (Text-to-Speech) va IELTS Speaking mavzulari.
  * Grammatika, ravonlik (*fluency*) va leksika bo'yicha tezkor AI tavsiyalar.
* **Writing & Essay Checker:** Insholarni IELTS mezonlari (Task Achievement, Cohesion, Lexical Resource, Grammar) bo'yicha tahlil qilish va taxminiy Band ball berish.
* **Kunlik Lug'at (Flashcards):** IELTS 7.5+ so'zlar, transkripsiya, o'zbekcha tarjima va audio talaffuz.

### 🚀 3. Physics in English (Dual Mode)
* Xalqaro universitetlarga (SAT, AP Physics, A-Levels) tayyorlanuvchilar uchun fizik terminlar lug'ati (*Science Glossary*) va ingliz tilidagi amaliy masalalar.

### 🤖 4. AI Shaxsiy Ustoz (24/7 Chat)
* Fizika va ingliz tili bo'yicha har qanday savollarga darhol javob beruvchi intellektual chat.

---

## 🚀 Qanday Ishga Tushiriladi?

### 1. Lokal serverni yoqish (Brauzerda test qilish):
Hech qanday qo'shimcha `npm install` kutubxonalarisiz, toza Node.js da ishlaydi:
```bash
cd /home/davronjon/.gemini/antigravity/scratch/eduprep-tma
npm start
```
Brauzerda oching: **`http://localhost:3000`**

### 2. Telegram Bot bilan ulash:

#### 1-qadam: Bot yaratish
1. Telegramda [@BotFather](https://t.me/botfather) ga kiring.
2. `/newbot` buyrug'ini yuboring va bot nomi hamda usernameni belgilang.
3. BotFather sizga bergan **Bot Token**ni nusxalab oling.

#### 2-qadam: Mini App yaratish
1. @BotFather da `/newapp` buyrug'ini bering.
2. O'z botingizni tanlang.
3. Ilova nomi va rasmini kiriting.
4. **Web App URL** so'ralganda, serveringizning HTTPS manzilini bering (Lokal test uchun `ngrok http 3000` orqali olingan HTTPS havola yoki Vercel/Netlify domeni).
5. Qisqa nom (short name) bering (masalan: `app`).

#### 3-qadam: Botni ishga tushirish
```bash
BOT_TOKEN="sizning_bot_tokeningiz" WEBAPP_URL="https://sizning-saytingiz.ngrok-free.app" npm run bot
```
Endi Telegramda botingizga kiring va `/start` tugmasini bosing! 🚀
