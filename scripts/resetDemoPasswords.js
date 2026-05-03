const bcrypt = require('bcryptjs');
const db = require('../config/db');

const run = async () => {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const facultyHash = await bcrypt.hash('faculty123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    const [adminResult] = await db.query(
      'UPDATE admin SET password_hash = ? WHERE email = ?',
      [adminHash, 'admin@portal.com']
    );

    const [facultyResult] = await db.query(
      'UPDATE faculty SET password_hash = ?',
      [facultyHash]
    );

    const [studentResult] = await db.query(
      'UPDATE student SET password_hash = ?',
      [studentHash]
    );

    console.log('Demo passwords reset successfully:');
    console.log(`- Admin updated rows: ${adminResult.affectedRows}`);
    console.log(`- Faculty updated rows: ${facultyResult.affectedRows}`);
    console.log(`- Student updated rows: ${studentResult.affectedRows}`);
    console.log('Credentials:');
    console.log('admin@portal.com / admin123');
    console.log('Any faculty email / faculty123');
    console.log('Any student email / student123');
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset demo passwords:', error.message);
    process.exit(1);
  }
};

run();
