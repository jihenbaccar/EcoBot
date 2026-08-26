import { useEffect, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

export function useRobotWebSocket() {
  const [measurement, setMeasurement] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket;
    let retryTimer;
    let stopped = false;

    const connect = () => {
      socket = new WebSocket(WS_URL);
      socket.onopen = () => setConnected(true);
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "measurement") setMeasurement(message.data);
        } catch {
          // Ignore malformed messages from the server.
        }
      };
      socket.onclose = () => {
        setConnected(false);
        if (!stopped) retryTimer = window.setTimeout(connect, 3000);
      };
      socket.onerror = () => socket.close();
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);

  return { measurement, connected };
}
