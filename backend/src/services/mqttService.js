const mqtt = require("mqtt");
const { saveMeasurement } = require("./measurementService");

const dataTopic = process.env.MQTT_DATA_TOPIC || "ecobot/robot01/data";
const commandTopic = process.env.MQTT_COMMAND_TOPIC || "ecobot/robot01/command";
const allowedDeviceId = process.env.MQTT_DEVICE_ID || "ESP32_ROBOT_01";
let client;

function startMqtt() {
  client = mqtt.connect(
    process.env.MQTT_BROKER || "mqtt://172.20.10.7:1883",
    {
      clientId: process.env.MQTT_CLIENT_ID || "ECOBOT_NODE_BACKEND",
      reconnectPeriod: 5000,
    },
  );

  client.on("connect", () => {
    console.log("MQTT connecté");
    client.subscribe(dataTopic, (error) => {
      if (error) console.error("Erreur abonnement MQTT :", error.message);
      else console.log(`MQTT abonné à ${dataTopic}`);
    });
  });
  client.on("reconnect", () => console.log("MQTT reconnexion..."));
  client.on("offline", () => console.warn("MQTT connexion perdue"));
  client.on("error", (error) => console.error("Erreur MQTT :", error.message));
  client.on("message", async (topic, payload) => {
    if (topic !== dataTopic) return;
    try {
      const data = JSON.parse(payload.toString());
      if (data.deviceId !== allowedDeviceId)
        throw new Error("deviceId inconnu");
      const measurement = await saveMeasurement(data);
      console.log(`Mesure MQTT enregistrée pour ${measurement.deviceId}`);
    } catch (error) {
      console.error("Message MQTT invalide :", error.message);
    }
  });
  return client;
}

function publishCommand(deviceId, command) {
  if (deviceId !== allowedDeviceId) return false;
  if (!client || !client.connected) throw new Error("MQTT indisponible");
  client.publish(commandTopic, command);
  console.log(`Commande MQTT publiée: ${command}`);
  return true;
}

module.exports = { startMqtt, publishCommand, allowedDeviceId };
