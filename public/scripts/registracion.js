const formRegister = document.getElementById("formRegister");
console.log("formRegister", formRegister);
formRegister.addEventListener("submit", async (e) => {
  console.log("DAEeeeTOS");

  e.preventDefault();

  const datos = {
    username: formRegister[0].value,
    password: formRegister[1].value,
  };

  console.log("DATOS", datos);
  try {
    const respuesta = await fetch("/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    console.log("sucede o no", respuesta);
    const body = await respuesta.json();
    console.log("BODyY", body);
    const { access_token } = body;

    console.log("ACCESS TOKEN " + access_token);
    localStorage.setItem("access_token", access_token);

    // if (access_token) {
    //   // location.href = "/login";
    // }
  } catch (err) {
    console.log("ERROR", err);
    // location.href = "/register-error";
  }
});
