import app from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";

export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = config.PORT || 3000;

  async function main() {
    try {
      await prisma.$connect();
      console.log("Connected to the database successfully.");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Error starting the server:", error);
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  main();
}
