function calculoFork(cantidad) {
  const numeros = [];
  for (let index = 0; index < cantidad; index++) {
    numeros[index] = Math.floor(Math.random() * 1000) + 1;
  }
  let objNumeros = numeros.reduce((randomCount, currentValue) => {
    return (
      randomCount[currentValue]
        ? ++randomCount[currentValue]
        : (randomCount[currentValue] = 1),
      randomCount
    );
  }, {});
  return objNumeros;
}

process.on("message", (mensaje) => {
  console.log(mensaje);
  if (mensaje.msg == "inicio") {
    console.log(mensaje.msg);
    process.send(calculoFork(mensaje.cantidad));
    process.exit();
  }
});

process.on("exit", () => console.log("Termino el hilo"));

process.send("listo");
