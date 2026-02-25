const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to connect to database...");
    await prisma.$connect();
    console.log("Database connected successfully!");
    const agentCount = await prisma.agent.count();
    console.log(`Agent count: ${agentCount}`);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
