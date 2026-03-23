# 🤖 Gemini API Key Setup Guide

## 🎯 **Where to Add Your Gemini API Key**

Your Gemini API key goes in the `.env` file on line 28:

```bash
# Current line in .env file:
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Replace `your_actual_gemini_api_key_here` with your real API key.**

---

## 🔑 **How to Get a Gemini API Key**

### Step 1: Visit Google AI Studio
1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account

### Step 2: Create a New API Key
1. Click **"Create API Key"**
2. Choose your Google Cloud project (or create a new one)
3. Your API key will be generated

### Step 3: Copy Your API Key
1. Click the **copy button** next to your API key
2. **Important:** Save it securely - you won't be able to see it again!

---

## ⚙️ **Setting Up the API Key**

### Option 1: Edit .env File Directly
1. Open `.env` file in your backend folder
2. Find line 28: `GEMINI_API_KEY=your_actual_gemini_api_key_here`
3. Replace the placeholder with your actual key:
   ```bash
   GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Option 2: Use PowerShell (Windows)
```powershell
# Navigate to your backend directory
cd "D:\Smart tourism\Documents\GitHub\rahinew\RAAHI Web\RAAHI Backend"

# Replace YOUR_API_KEY with your actual key
(Get-Content .env) -replace 'your_actual_gemini_api_key_here', 'YOUR_API_KEY' | Set-Content .env
```

---

## ✅ **Verify Your Setup**

### 1. Check if API Key is Loaded
Create a simple test file to check if your API key is loaded:

```javascript
// test-gemini-key.js
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_actual_gemini_api_key_here') {
  console.log('❌ Gemini API key not set or still using placeholder');
  console.log('📋 Current value:', apiKey);
} else {
  console.log('✅ Gemini API key is set');
  console.log('🔑 Key preview:', apiKey.substring(0, 10) + '...');
}
```

Run it: `node test-gemini-key.js`

### 2. Test AI Service
```bash
# Start your server
npm start

# Test the AI endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"message": "Hello, tell me about tourism in India"}'
```

---

## 🚨 **Troubleshooting**

### Error: "Gemini API key not configured"
- **Solution:** Make sure your API key is properly set in the `.env` file
- Check there are no extra spaces or quotes around the key

### Error: "API key invalid"
- **Solution:** Verify your API key is correct and active
- Generate a new key if needed

### Error: "Quota exceeded"
- **Solution:** Check your Google Cloud billing and quota limits
- Gemini API has free tier limits

### AI responses show "fallback" instead of "gemini"
- **Solution:** This means the API key isn't working
- Check the server console for error messages

---

## 🔒 **Security Best Practices**

### 1. Keep Your API Key Secret
- ✅ Store in `.env` file (not tracked by git)
- ❌ Never commit API keys to version control
- ❌ Don't share API keys in code or screenshots

### 2. Use Environment Variables
Your app is already set up correctly:
```javascript
// In your code (already implemented):
const apiKey = process.env.GEMINI_API_KEY;
```

### 3. Add .env to .gitignore
Make sure `.env` is in your `.gitignore` file:
```bash
# .gitignore
.env
.env.local
.env.production
```

---

## 📊 **API Usage & Limits**

### Free Tier Limits (as of 2024)
- **15 requests per minute**
- **1 request per minute per user**
- **1,500 requests per day**

### Monitor Usage
- Visit: https://makersuite.google.com/app/apikey
- Check your quota usage and billing

---

## 🧪 **Example API Key Format**

Your Gemini API key should look like this:
```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Starts with `AIzaSyD`
- About 39 characters long
- Contains letters, numbers, and some special characters

---

## 🔄 **Restart Required**

After updating your `.env` file:
1. **Stop your server** (Ctrl+C)
2. **Restart it:** `npm start`
3. Look for: `✅ Gemini AI service initialized`

---

## 📱 **Current AI Features**

Once your API key is set up, your RAAHI app will have:

- 🤖 **Smart Chatbot** - AI-powered travel assistant
- 🛡️ **Safety Recommendations** - Location-based safety tips  
- ⚠️ **Risk Analysis** - Travel risk assessment
- 🗺️ **Tourism Guidance** - Personalized travel advice

---

## 🆘 **Need Help?**

If you're still having issues:
1. Check the server console for error messages
2. Run the test script above
3. Verify your API key at Google AI Studio
4. Make sure `.env` file is in the correct directory

**Ready to test?** Restart your server and try the chatbot! 🚀