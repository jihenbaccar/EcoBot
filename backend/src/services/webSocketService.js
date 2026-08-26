const clients = new Set();

function serializeMeasurement(measurement) {
  return JSON.parse(
    JSON.stringify(measurement, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

function registerWebSocket(webSocketServer) {
  webSocketServer.on("connection", (socket) => {
    clients.add(socket);
    console.log("Dashboard React connecté");

    socket.on("close", () => {
      clients.delete(socket);
      console.log("Dashboard React déconnecté");
    });
  });
}

function broadcastMeasurement(measurement) {
  const message = JSON.stringify({
    type: "measurement",
    data: serializeMeasurement(measurement),
  });
  for (const client of clients) {
    if (client.readyState === 1) client.send(message);
  }
}

module.exports = {
  registerWebSocket,
  broadcastMeasurement,
  serializeMeasurement,
};
