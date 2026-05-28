const { spawn } = require("child_process");
const net = require("net");
const waitPort = require("wait-port");

function startProcess({ cwd, args, label }) {
  const isWin = process.platform === "win32";
  const command = isWin ? process.env.ComSpec || "cmd.exe" : "npm";
  const spawnArgs = isWin ? ["/d", "/s", "/c", "npm", ...args] : args;

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

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "localhost", port });

    const done = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(500);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function startServer() {
  console.log("Starting server...");

  const serverPort = 3000;

  if (await isPortOpen(serverPort)) {
    console.log(`Server port ${serverPort} is already in use. Using the existing server.`);
    return true;
  }

  const serverProcess = startProcess({
    cwd: "server",
    args: ["run", "start:dev"],
    label: "Server",
  });

  console.log(`Waiting for server to start on port ${serverPort}...`);

  try {
    const result = await Promise.race([
      waitPort({
        host: "localhost",
        port: serverPort,
        timeout: 60000,
        output: "silent",
      }).then(({ open }) => ({ ready: open })),
      new Promise((resolve) => {
        serverProcess.once("exit", (code, signal) => {
          resolve({ ready: false, code, signal });
        });
      }),
    ]);

    if (!result.ready) {
      console.error("Server did not open the port:", result);
      if (serverProcess.exitCode === null) {
        serverProcess.kill();
      }
      return false;
    }

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
