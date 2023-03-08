import { Router } from "express";
import os from "os";
import compression from "compression";
import logger from "../logger.js";

const Argumentos = process.argv.slice(2);
const Plataforma = process.platform;
const Version = process.version;
const Memoria = process.memoryUsage().rss;
const Path = process.execPath;
const Id = process.pid;
const Carpeta = process.cwd();
const cantCPUs = os.cpus().length;

const data = {
  Argumentos: Argumentos,
  CPUS: `[${cantCPUs}]`,
  Plataforma: `[Sistema Operativo: ${Plataforma}]`,
  Version: `[Node: ${Version}]`,
  Memoria: `[${Memoria}]`,
  Path: `[${Path}]`,
  Id: `[${Id}]`,
  Carpeta: `[${Carpeta}]`,
};

const infoBloqueante = Router();

infoBloqueante.get("/", (req, res) => {
  console.log(`Ruta bloqueante de /info`);
  console.log(`un log`);
  console.log("Route /info access granted");
  res.send(datos);
});

export default infoBloqueante;
