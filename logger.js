import log4js from "log4js";

log4js.configure({
  appenders: {
    consola: { type: "console" },
    warningFile: { type: "file", filename: "warnings.log" },
    errorFile: { type: "file", filename: "errors.log" },

    loggerConsola: {
      type: "logLevelFilter",
      appender: "consola",
      level: "info",
    },
    loggerWarningFile: {
      type: "logLevelFilter",
      appender: "warningFile",
      level: "warn",
    },
    loggerErrorFile: {
      type: "logLevelFilter",
      appender: "errorFile",
      level: "error",
    },
  },
  categories: {
    default: {
      appenders: ["loggerConsola", "loggerWarningFile", "loggerErrorFile"],
      level: "all",
    },
    prod: {
      appenders: ["loggerWarningFile", "loggerErrorFile"],
      level: "all",
    },
  },
});

let logger = log4js.getLogger();

export default logger;
