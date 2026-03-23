# 🔐 RAAHI Authentication Quick Reference

## 🎯 Two Different Login Styles

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RAAHI AUTHENTICATION SYSTEM                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  👤 NORMAL TOURISTS              🏛️  TOURIST DEPARTMENTS           │
│  ═══════════════════             ═══════════════════════            │
│                                                                     │
│  📧 Email + 🔑 Password           🗺️  State + 🔑 Password           │
│                                                                     │
│  Endpoint:                       Endpoint:                         │
│  POST /api/auth/login            POST /api/auth/tourist-dept-login  │
│                                                                     │
│  Request:                        Request:                          │
│  {                               {                                 │
│    "email": "user@email.com",      "state": "Uttar Pradesh",       │
│    "password": "mypass123"         "password": "aniket1234"        │
│  }                               }                                 │
│                                                                     │
│  Examples:                       Examples:                         │
│  • tourist@gmail.com             • "Uttar Pradesh"                 │
│  • john.doe@yahoo.com            • "UP"                            │
│  • traveler@email.co             • "up"                            │
│                                  • "uttar pradesh"                 │
│                                                                     │
│  User Role: "user"               User Role: "tourist_department"   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## ⚡ Quick Test Commands

### Test Normal Tourist Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Tourist Department Login
```bash
curl -X POST http://localhost:5000/api/auth/tourist-dept-login \
  -H "Content-Type: application/json" \
  -d '{"state":"UP","password":"aniket1234"}'
```

## 🗺️ Supported States (Tourist Dept)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Uttar Pradesh   │ Maharashtra     │ Rajasthan       │ Kerala          │
│ "UP" or "up"    │ "MH" or "mh"    │ "RJ" or "rj"    │ "KL" or "kl"    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Goa             │ Himachal Pradesh│ Tamil Nadu      │ Karnataka       │
│ "GA" or "ga"    │ "HP" or "hp"    │ "TN" or "tn"    │ "KA" or "ka"    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ West Bengal     │ Gujarat         │                 │                 │
│ "WB" or "wb"    │ "GJ" or "gj"    │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## 🔄 Success Response Format (Both)

```json
{
  "success": true,
  "message": "Welcome message...",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_id",
    "firstName": "First",
    "lastName": "Last", 
    "email": "email@domain.com",
    "role": "user | tourist_department | admin",
    "location": "State Name" // (tourist_department only)
  }
}
```

## 📱 Frontend Login Forms

### Tourist Login Form
```html
<form id="touristLogin">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit">Login as Tourist</button>
</form>
```

### Department Login Form  
```html
<form id="deptLogin">
  <input type="text" name="state" placeholder="State (e.g. UP, Maharashtra)" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit">Login as Department</button>
</form>
```

## ⚠️ Current Active Account

**Uttar Pradesh Tourism Department**
- State: `"Uttar Pradesh"` / `"UP"` / `"up"`
- Password: `"aniket1234"`
- Role: `tourist_department`

---

*💡 Remember: Both methods return the same JWT token format for authenticated requests!*