const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const port = process.env.PORT || 3001;

// Production environment validation: fail fast if critical env vars are missing
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'MONGO_URI'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    console.error(`Missing required environment variable(s) for production: ${missing.join(', ')}`);
    // Exit with non-zero code so deployment systems (Railway, etc.) know the start failed
    process.exit(1);
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
