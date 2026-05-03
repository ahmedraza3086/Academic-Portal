const bcrypt = require('bcryptjs');

const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

// Usage: node utils/hashPassword.js "mypassword"
if (require.main === module) {
  const password = process.argv[2];
  if (!password) {
    console.log('Please provide a password as argument');
    process.exit(1);
  }
  hashPassword(password).then(hash => {
    console.log('Hashed password:', hash);
    process.exit(0);
  });
}

module.exports = hashPassword;