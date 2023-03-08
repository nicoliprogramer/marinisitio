import express from "express";
import { engine as exphbs } from "express-handlebars";
import session from "express-session";
//----------------------------------------------------//
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
//----------------------------------------------------//
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
const mongoAdvOpt = { useNewUrlParser: true, useUnifiedTopology: true };
const usuarios = [];
import bcrypt from "bcrypt";
import * as jwt from "./jwt.js";

import path from "path";
import { fileURLToPath } from "url";
import User from "./models/modelsUsuarios.js";
import ContenedorUsuario from "./contenedor/usuarios.js";
import * as dot from "./configs/config.js";
import parseArgs from "minimist";
import randomsRouter from "./routes/random.js";

import infoNoBloqueante from "./routes/infoNoBloqueante.js";
import infoBloqueante from "./routes/infoBloqueante.js";

import cluster from "cluster";
import os from "os";
import dotenv from "dotenv";

const config = {
  alias: { p: "port", m: "modo" },
  default: { port: 8080, modo: "FORK" },
};

export const args = parseArgs(process.argv.slice(2), config);

const cantCPUs = os.cpus().length;

if (args.modo == "CLUSTER" && cluster.isPrimary) {
  console.log(`ProcessID is running in: ${process.pid} `);
  console.log(cantCPUs);

  for (let index = 0; index < cantCPUs; index++) {
    cluster.fork();

    cluster.on("exit", (worker) => {
      console.log(`worker: ${worker.process.pid} termino`);
    });
  }
} else {
  dotenv.config();

  const { port } = parseArgs(process.argv.slice(2), config);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  //----------------------------------------------------//}

  mongoose.connect(
    process.env.USERSDB_MONGO_STRINGCONN,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (error) => {
      if (error) {
        console.log("MongoError: " + error);
      } else {
        console.log("Connected DB");
      }
    }
  );

  const containerUsuario = new ContenedorUsuario();

  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        console.log("ENTRA ESTRATEGIA");
        const usuario = usuarios.find(
          (usuario) => usuario.username == username
        );
        if (usuario) {
          return done("el usuario ya esta registrado");
        }

        const newUser = {
          username,
          password,
        };
        ///
        usuarios.push(newUser);
        const access_token = jwt.generateAuthToken(newUser);
        console.log("accestoken register ", access_token);
        done(null, { ...newUser, access_token });
      }
    )
  );

  function isValidPassword(password, encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
  }

  passport.use(
    "login",
    new LocalStrategy(async (username, password, done) => {
      const usuario = await usuarios.find(
        (usuario) => usuario.username == username
      );
      if (!usuario) {
        return done(null, false);
      }

      if (usuario.password != password) {
        return done("pass incorrecta", false);
      }

      const newUser = {
        username,
        password,
      };
      ///
      const access_token = jwt.generateAuthToken(newUser);
      console.log("accestoken login", access_token);

      const verData = await containerUsuario.getUsuario();
      const strin = JSON.stringify(verData);
      const parseData = JSON.parse(strin)[0];

      const userInDb = {
        username: parseData.username,
        password: parseData.password,
      };

      console.log("verData", userInDb);

      console.log(usuario);

      if (!isValidPassword(usuario.password, userInDb.password)) {
        console.log("Pass invalida");
        return done(err, { access_token });
      }

      return done(null, { username, access_token });
    })
  );

  passport.serializeUser((user, done) => {
    console.log("userr", user);

    done(null, user.username);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  //----------------------------------------------------//

  const app = express();

  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: process.env.SESSIONSDB_MONGO_STRINGCONN,
        mongoOptions: mongoAdvOpt,
      }),
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 600000,
      },
      rolling: true,
    })
  );

  //----------------------------------------------------//
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static("public"));
  app.use("/api", randomsRouter);
  app.use("/infoNoBloqueante", infoNoBloqueante);
  app.use("/infoBloqueante", infoBloqueante);
  //----------------------------------------------------//

  app.engine(".hbs", exphbs({ extname: ".hbs", defaultLayout: "main.hbs" }));
  app.set("view engine", ".hbs");

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //-------------------//
  // Rutas de registro //
  //-------------------//

  app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
  });

  app.post(
    "/register",
    passport.authenticate("register", { failureRedirect: "/failregister" }),
    async (req, res) => {
      // guardar en base de datos.
      // const salt = 10;
      // const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // console.log(
      //   "isValidPassword",
      //   isValidPassword(req.body.password, hashedPassword)
      // );

      //save
      console.log("usuario", req.body.username);

      const testUser = new User({
        username: req.body.username,
        password: req.body.password,
      });

      await testUser.save(function (err) {
        if (err) throw err;
      });

      res.send(req.user);
    }
  );

  // failureRedirect: "/failregister",
  //     successRedirect: "/datos",
  app.get("/failregister", (req, res) => {
    res.render("register-error");
  });

  //----------------//
  // Rutas de login //
  //----------------//

  app.get("/login", (req, res) => {
    // if (req.isAuthenticated()) {
    //   res.redirect("/datos");
    // }

    res.sendFile(__dirname + "/public/login.html");
  });

  app.post(
    "/login",
    passport.authenticate("login", {
      failureRedirect: "/faillogin",
      // successRedirect: "/datos",
    })
  );

  app.get("/faillogin", (req, res) => {
    res.render("login-error");
  });

  //----------------//
  // Rutas de datos //
  //----------------//

  // function requireAuthentication(req, res, next) {
  //   if (req.isAuthenticated()) {
  //     next();
  //   } else {
  //     res.redirect("/login");
  //   }
  // }

  ///
  // jwt.auth
  ///
  app.get("/api/datos", jwt.auth, (req, res) => {
    console.log("usuarios", usuarios);
    console.log("req.user", req.user);
    const usuario = usuarios.find(
      (usuario) => usuario.username == req.user.username
    );
    if (!usuario) {
      return res.status(400).json({
        error: "usuario no encontrado",
      });
    }

    // usuario.contador++;

    res.json({
      datos: usuario,
      // contador: usuario.contador,
    });
  });
  //----------------//
  // Ruta de logout //
  //----------------//

  app.get("/logout", (req, res) => {
    req.logout((err) => {
      res.redirect("/login");
    });
  });

  //-----------//
  // Ruta raiz //
  //-----------//

  app.get("/", (req, res) => {
    res.redirect("/api/datos");
  });

  const PORT = args.port || 8080;
  app.listen(PORT, () => {
    console.log(`server is running in ${PORT}`);
  });
}
