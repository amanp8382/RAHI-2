# 🔐 RAAHI Backend Authentication Guide

This guide explains the different authentication methods available for different types of users in the RAAHI Backend system.

## 📋 Overview

The RAAHI Backend supports **two distinct authentication styles**:

1. **Normal Tourist/User Login** - Email + Password (Traditional)
2. **Tourist Department Login** - State Name + Password (Unique)

---

## 👤 1. Normal Tourist/User Authentication

**Who uses this:** Regular tourists, travelers, and standard users

### Endpoint
```
POST /api/auth/login
```

### Request Format
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

### Example Usage
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tourist@email.com',
    password: 'mypassword123'
  })
});
```

### Response (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "user_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "tourist@email.com",
    "role": "user"
  }
}
```

---

## 🏛️ 2. Tourist Department Authentication

**Who uses this:** State tourism department officials and administrators

### Endpoint
```
POST /api/auth/tourist-dept-login
```

### Request Format
```json
{
  "state": "Uttar Pradesh",
  "password": "aniket1234"
}
```

### Supported State Formats
Tourist departments can login using any of these formats:

| State | Supported Inputs |
|-------|------------------|
| Uttar Pradesh | `"Uttar Pradesh"`, `"UP"`, `"up"`, `"uttar pradesh"` |
| Maharashtra | `"Maharashtra"`, `"MH"`, `"mh"`, `"maharashtra"` |
| Rajasthan | `"Rajasthan"`, `"RJ"`, `"rj"`, `"rajasthan"` |
| Kerala | `"Kerala"`, `"KL"`, `"kl"`, `"kerala"` |
| Goa | `"Goa"`, `"GA"`, `"ga"`, `"goa"` |
| Himachal Pradesh | `"Himachal Pradesh"`, `"HP"`, `"hp"`, `"himachal pradesh"` |
| Tamil Nadu | `"Tamil Nadu"`, `"TN"`, `"tn"`, `"tamil nadu"` |
| Karnataka | `"Karnataka"`, `"KA"`, `"ka"`, `"karnataka"` |
| West Bengal | `"West Bengal"`, `"WB"`, `"wb"`, `"west bengal"` |
| Gujarat | `"Gujarat"`, `"GJ"`, `"gj"`, `"gujarat"` |

### Example Usage
```javascript
// All these are valid:
const loginExamples = [
  { state: "Uttar Pradesh", password: "aniket1234" },
  { state: "UP", password: "aniket1234" },
  { state: "up", password: "aniket1234" },
  { state: "uttar pradesh", password: "aniket1234" }
];

const response = await fetch('/api/auth/tourist-dept-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    state: "Uttar Pradesh",  // Flexible input
    password: "aniket1234"
  })
});
```

### Response (Success)
```json
{
  "success": true,
  "message": "Welcome, Uttar Pradesh Tourism Department!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "68cdd3ed11f2239731dd63e8",
    "firstName": "Tourist",
    "lastName": "Department",
    "email": "tourist.department.up@gmail.com",
    "role": "tourist_department",
    "location": "Uttar Pradesh"
  }
}
```

### Response (Invalid State)
```json
{
  "success": false,
  "message": "Tourist department not found for state: InvalidState. Please contact administrator.",
  "availableStates": [
    "Uttar Pradesh", "Maharashtra", "Rajasthan", "Kerala", "Goa", ...
  ]
}
```

---

## 🔑 Token Usage

Both authentication methods return a JWT token that should be used for subsequent authenticated requests:

```javascript
// Store the token
localStorage.setItem('authToken', response.data.token);

// Use in subsequent requests
const authenticatedRequest = await fetch('/api/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🛡️ User Roles

The system recognizes three user roles:

- `user` - Regular tourists/users
- `admin` - System administrators  
- `tourist_department` - State tourism department officials

---

## 🧪 Testing

### Test Normal Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Tourist Department Login
```bash
curl -X POST http://localhost:5000/api/auth/tourist-dept-login \
  -H "Content-Type: application/json" \
  -d '{"state":"Uttar Pradesh","password":"aniket1234"}'
```

### Run Test Scripts
```bash
# Test tourist department login
node test-tourist-dept-login.js

# Demo tourist department login
node demo-tourist-dept-login.js
```

---

## 📱 Frontend Integration Examples

### React Login Component
```jsx
const LoginPage = () => {
  const [userType, setUserType] = useState('tourist'); // 'tourist' or 'department'
  
  const handleTouristLogin = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    // Handle response...
  };
  
  const handleDepartmentLogin = async (state, password) => {
    const response = await fetch('/api/auth/tourist-dept-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, password })
    });
    // Handle response...
  };
  
  return (
    <div>
      <select value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="tourist">Tourist Login</option>
        <option value="department">Department Login</option>
      </select>
      
      {userType === 'tourist' ? (
        <TouristLoginForm onSubmit={handleTouristLogin} />
      ) : (
        <DepartmentLoginForm onSubmit={handleDepartmentLogin} />
      )}
    </div>
  );
};
```

---

## 🚨 Error Handling

Both authentication methods return consistent error formats:

```json
{
  "success": false,
  "message": "Error description here",
  "action": "retry" // or "login", "register", etc.
}
```

Common error scenarios:
- Invalid credentials
- User not found
- Missing required fields
- Server errors
- Invalid state (department login only)

---

## 🔧 Current Tourist Department Account

**State:** Uttar Pradesh  
**Login Credentials:**
- State: `"Uttar Pradesh"` (or `"UP"`, `"up"`, etc.)
- Password: `"aniket1234"`

---

This dual authentication system provides flexibility for different user types while maintaining security and ease of use.