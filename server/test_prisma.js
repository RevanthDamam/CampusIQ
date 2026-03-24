require('dotenv').config();
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
  console.log("Success");
} catch(e) {
  console.log("Failed: " + e.message);
  console.log(e.stack);
}
