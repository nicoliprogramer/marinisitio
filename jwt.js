import jwt from "jsonwebtoken";

const PRIVATE_KEY = "shhhhhhhhhhhhhhhhhhhhhhhhhh";

export function generateAuthToken(user) {
  return jwt.sign(user, PRIVATE_KEY, { expiresIn: "600000s" });
}

export function auth(req, res, next) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return res.status(401).json({
      error: "no header autorizado",
      detalle: "no te permito que ingreses",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      error: "no token autorizado",
      detalle: "no te permito que ingreses",
    });
  }

  try {
    req.user = jwt.verify(token, PRIVATE_KEY);
  } catch (err) {
    return res.status(401).json({
      error: "no autorizado",
      detalle: "no te permito que ingreses",
    });
  }

  next();
}
