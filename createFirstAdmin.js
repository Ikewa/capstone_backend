import bcrypt from 'bcrypt';
import db from './config/db.js';

const createFirstAdmin = async () => {
  // Admin details
  const email = 'ikewa@gmail.com';
  const password = 'password';
  const firstName = 'Admin';
  const lastName = 'User';
  const role = 'Extension Officer';
  const location = 'Kano State';
  
  try {
    console.log('🔐 Creating first admin account...');
    
    // Check if admin already exists
    const [existing] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log('⚠️ User with this email already exists!');
      console.log('Making them admin...');
      
      await db.promise().query(
        'UPDATE users SET is_admin = TRUE WHERE email = ?',
        [email]
      );
      
      console.log('✅ User is now an admin!');
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const [result] = await db.promise().query(
      'INSERT INTO users (first_name, last_name, email, role, location, password, is_admin) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [firstName, lastName, email, role, location, hashedPassword]
    );
    
    console.log('✅✅✅ ADMIN ACCOUNT CREATED SUCCESSFULLY! ✅✅✅');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', result.insertId);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/admin');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createFirstAdmin();