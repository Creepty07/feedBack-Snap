// Evento al enviar el formulario de inicio de sesión
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault(); // Evita el comportamiento predeterminado del formulario

  // Obtén los valores del formulario
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Realiza una solicitud al endpoint de inicio de sesión
  fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error); // Muestra el error al usuario
      } else {
        alert(data.message); // Mensaje de éxito
        localStorage.setItem("token", data.token); // Guarda el token en el almacenamiento local
        console.log("Token almacenado en localStorage:", data.token); // Log para verificar el token
        window.location.href = "index.html"; // Redirige al usuario
      }
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error); // Log para errores de red u otros
    });
});

// Verifica el token almacenado al cargar el script
console.log("Token almacenado al cargar la página:", localStorage.getItem("token"));
