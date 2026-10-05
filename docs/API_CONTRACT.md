# API Contract

Backend API specification for NUTRIGUARD (Node.js + Express + PostgreSQL)

## Base URL
```
Production: https://api.nutriguard.com
Development: http://localhost:3000/api
```

## Authentication
All endpoints (except public ones) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

---

## Calendar / Compliance

### Get Compliance Log
```
GET /calendar/compliance?userId={userId}
```

**Response:**
```json
{
  "data": [
    {
      "id": "compliance_user123_2026-10-01",
      "userId": "user123",
      "date": "2026-10-01",
      "status": "followed",
      "updatedAt": "2026-10-01T20:30:00.000Z"
    }
  ]
}
```

### Get Compliance for Date
```
GET /calendar/compliance/{date}?userId={userId}
```

**Response:**
```json
{
  "data": {
    "id": "compliance_user123_2026-10-01",
    "userId": "user123",
    "date": "2026-10-01",
    "status": "followed",
    "updatedAt": "2026-10-01T20:30:00.000Z"
  }
}
```

### Set Compliance
```
POST /calendar/compliance
```

**Request:**
```json
{
  "userId": "user123",
  "date": "2026-10-01",
  "status": "followed"
}
```

**Response:**
```json
{
  "data": {
    "id": "compliance_user123_2026-10-01",
    "userId": "user123",
    "date": "2026-10-01",
    "status": "followed",
    "updatedAt": "2026-10-01T20:30:00.000Z"
  }
}
```

### Delete Compliance
```
DELETE /calendar/compliance/{date}?userId={userId}
```

**Response:**
```json
{
  "success": true
}
```

---

## Diet Plans

### Get Active Plan
```
GET /plans/active?userId={userId}
```

**Response:**
```json
{
  "data": {
    "id": "plan_abc123",
    "userId": "user123",
    "goal": "weight-loss",
    "dietType": "high-protein",
    "duration": 14,
    "dailyBudget": 25,
    "calorieTarget": 1800,
    "startDate": "2026-10-01",
    "endDate": "2026-10-14",
    "createdAt": "2026-10-01T10:00:00.000Z"
  }
}
```

### Get Plan Meals
```
GET /plans/{planId}/meals?date={YYYY-MM-DD}
```

**Response:**
```json
{
  "data": [
    {
      "id": "pm_123",
      "planId": "plan_abc123",
      "mealId": "meal_456",
      "date": "2026-10-01",
      "mealType": "breakfast",
      "scheduledTime": "08:00",
      "meal": {
        "id": "meal_456",
        "name": "Greek Yogurt Parfait",
        "mealType": "breakfast",
        "dietTags": ["high-protein", "vegetarian"],
        "kcal": 487,
        "protein": 24,
        "carbs": 45,
        "fat": 12,
        "cost": 6.50,
        "prepMinutes": 10,
        "allergens": ["dairy", "nuts"]
      }
    }
  ]
}
```

### Create Plan
```
POST /plans
```

**Request:**
```json
{
  "userId": "user123",
  "goal": "weight-loss",
  "dietType": "high-protein",
  "duration": 14,
  "dailyBudget": 25,
  "calorieTarget": 1800,
  "lifestyleChanges": "More vegetables",
  "mealTimings": {
    "breakfast": "08:00",
    "lunch": "13:00",
    "dinner": "19:00",
    "snack": "16:00"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "plan_abc123",
    "userId": "user123",
    "goal": "weight-loss",
    "dietType": "high-protein",
    "duration": 14,
    "dailyBudget": 25,
    "calorieTarget": 1800,
    "startDate": "2026-10-01",
    "endDate": "2026-10-14",
    "createdAt": "2026-10-01T10:00:00.000Z"
  }
}
```

### Swap Meal
```
POST /plans/{planId}/meals/{mealId}/swap
```

**Request:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "data": {
    "id": "pm_789",
    "planId": "plan_abc123",
    "mealId": "meal_999",
    "date": "2026-10-01",
    "mealType": "breakfast",
    "scheduledTime": "08:00",
    "meal": {
      "id": "meal_999",
      "name": "Protein Smoothie Bowl",
      "mealType": "breakfast",
      "dietTags": ["high-protein", "vegetarian"],
      "kcal": 495,
      "protein": 26,
      "carbs": 48,
      "fat": 11,
      "cost": 6.80,
      "prepMinutes": 8,
      "allergens": ["dairy"]
    }
  }
}
```

---

## Barcode Scanner

### Lookup Barcode
```
GET /scan/lookup/{barcode}?userId={userId}
```

**Response:**
```json
{
  "data": {
    "barcode": "5000159484695",
    "productName": "Organic Peanut Butter",
    "brand": "Meridian",
    "imageUrl": "https://...",
    "ingredients": "Roasted peanuts (100%)",
    "allergens": ["peanuts", "may contain traces of nuts"],
    "nutrition": {
      "per100g": {
        "energy": 2570,
        "fat": 50.0,
        "saturatedFat": 9.0,
        "carbohydrates": 12.5,
        "sugars": 5.3,
        "protein": 26.0,
        "salt": 0.01
      }
    },
    "verdict": "unsafe",
    "reasons": [
      "Contains peanuts (user allergen)",
      "High in fat (>17.5g per 100g)"
    ]
  }
}
```

### Save Scan History
```
POST /scan/history
```

**Request:**
```json
{
  "userId": "user123",
  "barcode": "5000159484695",
  "productName": "Organic Peanut Butter",
  "verdict": "unsafe"
}
```

**Response:**
```json
{
  "data": {
    "id": "scan_xyz789",
    "userId": "user123",
    "barcode": "5000159484695",
    "productName": "Organic Peanut Butter",
    "verdict": "unsafe",
    "scannedAt": "2026-10-01T15:30:00.000Z"
  }
}
```

### Get Scan History
```
GET /scan/history?userId={userId}&limit=20
```

**Response:**
```json
{
  "data": [
    {
      "id": "scan_xyz789",
      "userId": "user123",
      "barcode": "5000159484695",
      "productName": "Organic Peanut Butter",
      "verdict": "unsafe",
      "scannedAt": "2026-10-01T15:30:00.000Z"
    }
  ]
}
```

---

## Restaurants (I'm Busy)

### Search Nearby
```
GET /restaurants/nearby?lat={lat}&lng={lng}&radius=5000&dietType={dietType}
```

**Response:**
```json
{
  "data": [
    {
      "id": "rest_123",
      "name": "GreenLeaf Kitchen",
      "lat": 51.5074,
      "lng": -0.1278,
      "distance": 1200,
      "isOpen": true,
      "dietTags": ["high-protein", "diabetic-safe", "vegetarian"],
      "priceRange": 15,
      "address": "123 High Street, London",
      "googleMapsUrl": "https://maps.google.com/?q=..."
    }
  ]
}
```

---

## User Constraints

### Get Constraints
```
GET /users/{userId}/constraints
```

**Response:**
```json
{
  "data": {
    "userId": "user123",
    "goal": "weight-loss",
    "dietType": "high-protein",
    "dailyBudget": 25,
    "calorieTarget": 1800,
    "mealTimings": {
      "breakfast": "08:00",
      "lunch": "13:00",
      "dinner": "19:00",
      "snack": "16:00"
    },
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

### Update Constraints
```
PUT /users/{userId}/constraints
```

**Request:**
```json
{
  "goal": "muscle-gain",
  "dietType": "high-protein",
  "dailyBudget": 30,
  "calorieTarget": 2200,
  "mealTimings": {
    "breakfast": "07:00",
    "lunch": "12:30",
    "dinner": "18:30",
    "snack": "15:00"
  }
}
```

**Response:**
```json
{
  "data": {
    "userId": "user123",
    "goal": "muscle-gain",
    "dietType": "high-protein",
    "dailyBudget": 30,
    "calorieTarget": 2200,
    "mealTimings": {
      "breakfast": "07:00",
      "lunch": "12:30",
      "dinner": "18:30",
      "snack": "15:00"
    },
    "updatedAt": "2026-10-03T14:07:00.000Z"
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Notes

1. All dates in ISO 8601 format (YYYY-MM-DD for dates, full ISO string for timestamps)
2. All responses wrapped in `{ data: ... }` or `{ error: ... }`
3. Authentication via JWT in Authorization header
4. User ID typically from JWT token, but can be passed as query param for development
5. Pagination: Use `?limit=N&offset=M` where applicable
6. All endpoints return JSON with `Content-Type: application/json`
