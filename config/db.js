import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Use connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000  // 60 second timeout
});

console.log("✅ Database pool created!");

// Test connection on startup
pool.promise().query('SELECT 1')
  .then(() => console.log("✅ Database connection tested successfully!"))
  .catch(err => console.error("❌ Database connection test failed:", err));

export default pool.promise();