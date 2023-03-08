import { Router } from "express";
import { fork } from "child_process";

const randomsRouter = Router();

randomsRouter.get("/randoms/:cant?", (req, res) => {
  const cantidad = Number(req.query.cant) || 100000;
  const forked = fork("./fork/calculoFork.js");

  forked.on("message", (msg) => {
    if (msg == "listo") {
      forked.send({ msg: "inicio", cantidad: cantidad });
    } else {
      res.json(JSON.stringify(msg));
    }
  });
});

export default randomsRouter;
