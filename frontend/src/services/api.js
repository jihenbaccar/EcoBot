const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function getHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la connexion");
  }

  return response.json();
}

export async function fetchResource(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(token),
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erreur API");
  }

  return response.json();
}
