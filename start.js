const { exec } = require("child_process");
const { promisify } = require("util");
const waitPort = require("wait-port");

async function startServer() {
  console.log("Starting server...");

  const serverProcess = exec("cd server && npm run start:dev");

  serverProcess.stdout.on("data", (data) => {
    console.log(`[Server]: ${data}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[Server Error]: ${data}`);
  });

  const serverPort = 3000;

  console.log(`Waiting for server to start on port ${serverPort}...`);

  try {
    await waitPort({
      host: "localhost",
      port: serverPort,
      timeout: 60000,
      output: "silent",
    });

    console.log("Server is ready!");

    return true;
  } catch (err) {
    console.error("Server failed to start:", err);
    return false;
  }
}

async function startClient() {
  console.log("Starting client...");
  const clientProcess = exec("cd client && npm run dev");

  clientProcess.stdout.on("data", (data) => {
    console.log(`[Client]: ${data}`);
  });

  clientProcess.stderr.on("data", (data) => {
    console.error(`[Client Error]: ${data}`);
  });
}

async function startAll() {
  const serverStarted = await startServer();

  if (serverStarted) {
    await startClient();
  } else {
    console.error("Exiting because server failed to start");
    process.exit(1);
  }
}

startAll();
