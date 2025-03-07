export function setupGracefulShutdown(cleanup: () => Promise<void>) {
  const safeCleanup = async () => {
    try {
      await cleanup();
    } catch (error) {
      console.error("Cleanup error", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", async () => {
    await safeCleanup();
    process.exit();
  });

  process.on("SIGTERM", async () => {
    await safeCleanup();
    process.exit();
  });

  process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await safeCleanup();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason) => {
    console.error("Unhandled Rejection:", reason);
    await safeCleanup();
    process.exit(1);
  });
}
