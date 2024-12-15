const mongoose = require('mongoose');
const dotenv = require('dotenv');

// UNCAUGHT EXCEPTIONS LIKE UNDEFIND X console.log(x)
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💣 Shtting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// console.log(x);

// Load environment variables from config file
dotenv.config({ path: './config.env' });
const app = require('./app');

// Construct the MongoDB connection string using environment variables
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// Connect to MongoDB with updated options
mongoose.connect(DB).then(() => {
  console.log('DB connection successful!');
});
// .catch((error) => {
//   console.error('DB connection error:', error);
// });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UHANDLED REJECTION! 💣 Shtting down...');
  console.log(err.name, err.message);
  // console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
