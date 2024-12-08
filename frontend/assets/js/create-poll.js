document.getElementById("poll-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Inicia sesión para crear una encuesta.");
    window.location.href = "login.html";
    return;
  }

  const question = document.getElementById("question").value;
  const options = [
    document.getElementById("option1").value,
    document.getElementById("option2").value,
  ];

  fetch("http://localhost:3000/api/create-poll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ question, options }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al crear la encuesta.");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
      window.location.href = "user-polls.html";
    })
    .catch((error) => {
      console.error("Error al crear la encuesta:", error);
      alert("Error al crear la encuesta. Inténtalo de nuevo.");
    });
});
