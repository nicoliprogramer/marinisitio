const formRegister = document.getElementById("formRegister");
formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    username: formRegister[0].value,
    password: formRegister[1].value,
  };

  console.log("DATOS", datos);
  const respuesta = await fetch("/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  console.log("sucede o no RESHEADERS", respuesta.headers);
  const body = await respuesta.json();
  console.log("BODyY", body);
  const { access_token } = body;

  console.log("ACCESS TOKEN " + access_token);
  localStorage.setItem("access_token", access_token);

  if (access_token) {
    localStorage.setItem("access_token", access_token);
    location.href = "/";
  } else {
    location.href = "/register-error";
  }
});
