###
This my Backend Capstone file

###
This is the link to my frontend:

https://github.com/Ikewa/capstone_frontend.git

###
To connect the frontend and backend you use npm to install the models and install axios to connect using cors.

###
This is the link to my Figma:

https://www.figma.com/design/lULxBKtSnwNtOUGZvQzcaT/AgriFuture?node-id=0-1&t=UFyFYq4AotI6iSF5-1

###
This is the link to my Video:

https://youtu.be/W9LxmtRxwmU?si=T-SNhUV-6wKUmP9i




_____________________________________________________________________________________________________
###
Final Submission

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **Railway CLI** (for deployment) - [Install](https://docs.railway.app/develop/cli)

---

## 🚀 Installation

### 1. Clone the Repository

### 2. Backend Setup
```bash
# Navigate to backend directory
cd capstone_backend

# Install dependencies
npm install

# Create .env file

**Configure `.env` file:**
```env

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=agriconnect_db
DB_PORT=3306

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Secret (generate a strong random string)
JWT_SECRET=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Initialize Database:**
```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source database/schema.sql

# Exit MySQL
exit
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd capstone_frontend/my-frontend

# Install dependencies
npm install

# Create .env file


**Configure `.env` file:**
```env
VITE_API_URL=http://localhost:8080
```

---

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
# From capstone_backend directory
npm start

# Server will start on http://localhost:8080
```

**Expected output:**
```
 Server running on port 8080
 Socket.io ready for real-time chat
 Database connected!
```

### Start Frontend Development Server
```bash
# From capstone_frontend/my-frontend directory
npm run dev

# Application will open at http://localhost:5173
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Admin Panel:** http://localhost:5173/admin/login

### Test Accounts

**Farmer Account:**
- Email: `aisha21@gmail.com`
- Password: `password`

###
Link to my website
https://my-frontend-ten-xi.vercel.app

###
Video to the final submission
https://youtu.be/cr_KUCn9590?si=RIGrSUhdPw_BlGlm