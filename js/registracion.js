const formRegister = document.getElementById("formRegister");
formRegister.addEventListener("submit", async (e) => {
  console.log("DAEeeeTOS");

  e.preventDefault();

  const datos = {
    username: formRegister[0].value,
    password: formRegister[1].value,
  };

  console.log("DATOS", datos);

  console.log("LAAAAAAAAAAAAAAAAAAAAAAAAA");
  const respuesta = await fetch("/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  console.log("sucede o no", respuesta);

  const content = await respuesta.json();

  const { access_token } = content;

  if (access_token) {
    localStorage.setItem("access_token", access_token);
    // location.href = "/datos";
  } else {
    location.href = "/register-error";
  }
});
