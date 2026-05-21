const { spawn } = require("child_process");
const waitPort = require("wait-port");

function startProcess({ cwd, args, label }) {
  const isWin = process.platform === "win32";
  const command = isWin ? "cmd.exe" : "npm";
  const spawnArgs = isWin ? ["/d", "/s", "/c", `npm ${args.join(" ")}`] : args;

  const processChild = spawn(command, spawnArgs, {
    cwd,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  processChild.stdout.on("data", (data) => {
    console.log(`[${label}]: ${data}`);
  });

  processChild.stderr.on("data", (data) => {
    console.error(`[${label} Error]: ${data}`);
  });

  processChild.on("error", (error) => {
    console.error(`[${label} Error]: Failed to start process`, error);
  });

  return processChild;
}

async function startServer() {
  console.log("Starting server...");

  startProcess({
    cwd: "server",
    args: ["run", "start:dev"],
    label: "Server",
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
  startProcess({
    cwd: "client",
    args: ["run", "dev"],
    label: "Client",
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
