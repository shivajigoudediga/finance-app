---

## Setup Instructions

### Backend
1. Open `finance-backend` in IntelliJ
2. Create PostgreSQL database:
```sql
CREATE DATABASE financedb;
```
3. Update `src/main/resources/application.properties`:
4. Run `FinanceBackendApplication.java`
5. Backend runs on **http://localhost:8080**

### Frontend
```bash
cd finance-frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /finance | Get all records |
| GET | /finance/{id} | Get record by ID |
| POST | /finance | Create record |
| PUT | /finance/{id} | Update record |
| DELETE | /finance/{id} | Delete record |

### Sorting
---

## Features
- Add, Edit, Delete finance records
- INCOME / EXPENSE badge (green / red)
- Amount colored green for income, red for expense
- Sort by userName, amount, date
- Delete confirmation modal
- PostgreSQL data persistence