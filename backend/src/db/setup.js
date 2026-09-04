const { createSchema } = require('./schema');
const { seed } = require('./seed');

createSchema();
console.log('Database schema created.');
seed();
console.log('Setup complete.');
