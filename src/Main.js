const dgram = require("dgram");

// Get command-line arguments
const [_1, _2, name, type, port, ...enemyPorts] = process.argv;

const portNumber = Number(port);
const enemyPortNumbers = enemyPorts.map(Number).filter((n) => !isNaN(n));

const socket = dgram.createSocket("udp4");

// Track online and offline enemies
const onlineEnemies = new Set();
const lastSeen = new Map(); // Track last response time

// Handle incoming messages
socket.on("message", (msg, rinfo) => {
  const message = msg.toString();
  const senderPort = rinfo.port;

  if (senderPort !== portNumber) {
    // console.log(`[${name}]: Message from ${senderPort}: ${message}`);

    if (message === "PING") {
      const response = Buffer.from("PONG");
      socket.send(response, 0, response.length, senderPort, "127.0.0.1");
    }

    if (message === "PONG") {
      onlineEnemies.add(senderPort);
      lastSeen.set(senderPort, Date.now()); // Update last response time
      console.log(`Enemy on port ${senderPort} is ONLINE.`);
    }
  }
});

// Bind the socket
socket.bind(portNumber, () => {
  console.log(`[${name}]: Running on port ${portNumber}`);
  console.log(`Your enemies are ${enemyPortNumbers}`);
  // console.log(
  //   `[${name}]: Online enemies: ${[...onlineEnemies].join(", ") || "None"}`
  // );

  // Periodically check if enemies are still online
  const OnlineChecker = setInterval(() => {
    // console.log(`[${name}]: Checking which enemies are online...`);

    const now = Date.now();

    // Detect enemies who have stopped responding
    enemyPortNumbers.forEach((enemyPort) => {
      if (onlineEnemies.has(enemyPort)) {
        const lastResponse = lastSeen.get(enemyPort) || 0;
        if (now - lastResponse > 10000) {
          // 10 seconds timeout
          // console.log(`[${name}]: Enemy on port ${enemyPort} is OFFLINE.`);
          onlineEnemies.delete(enemyPort);
        }
      }
    });

    // Send PING only to offline enemies
    enemyPortNumbers.forEach((enemyPort) => {
      if (!onlineEnemies.has(enemyPort)) {
        // Only send if offline
        const message = Buffer.from("PING");
        socket.send(
          message,
          0,
          message.length,
          enemyPort,
          "127.0.0.1",
          (err) => {
            if (err) {
              console.error(
                `[${name}]: Failed to send PING to ${enemyPort}`,
                err
              );
            }
          }
        );
        // console.log(`[${name}]: Sent PING to ${enemyPort}`);
      }
    });

    console.log(
      `[${name}]: Online enemies: ${[...onlineEnemies].join(", ") || "None"}`
    );
    clearInterval(OnlineChecker);
  }, 10000);
  // Repeat every 5 seconds
});

// Cleanup on exit
process.on("SIGINT", () => {
  console.log("See Ya Byaches");
  socket.close();
  process.exit();
});
