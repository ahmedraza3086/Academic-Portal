const bcrypt = require('bcryptjs');

const storedHash = '$2b$10$hnmc7WoPieI1b76uTuurTOa8KSKKxctNzfrBS8kl77oSQ5Ihe6lde';
const password = 'admin123';

bcrypt.compare(password, storedHash).then(match => {
    console.log('Password match:', match);
});