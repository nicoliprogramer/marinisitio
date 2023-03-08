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

const infoNoBloqueante = Router();

infoNoBloqueante.get("/", (req, res) => {
  res.send(datos);
  logger.info("Route /info access granted");
});

infoNoBloqueante.get("/gzip", compression(), (req, res) => {
  res.send(data);
  logger.info("Route /info/gzip access granted");
});

export default infoNoBloqueante;
