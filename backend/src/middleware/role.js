function requireSupervisor(req, res, next) {
  if (!req.user || req.user.role !== "SUPERVISEUR") {
    return res.status(403).json({ error: "Accès interdit" });
  }
  next();
}

module.exports = { requireSupervisor };
