document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const pollId = params.get("id");
  
    if (!pollId) {
      alert("ID de encuesta no válido.");
      window.location.href = "user-polls.html";
      return;
    }
  
    // Cargar los detalles de la encuesta
    fetch(`http://localhost:3000/api/poll/${pollId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar la encuesta.");
        }
        return response.json();
      })
      .then((poll) => {
        document.getElementById("question").value = poll.question;
        document.getElementById("options").value = JSON.parse(poll.options).join(", ");
      })
      .catch((error) => {
        console.error("Error al cargar la encuesta:", error);
        alert("No se pudo cargar la encuesta.");
      });
  
    // Guardar cambios en la encuesta
    document.getElementById("edit-poll-form").addEventListener("submit", (e) => {
      e.preventDefault();
  
      const question = document.getElementById("question").value;
      const options = document.getElementById("options").value.split(",").map((o) => o.trim());
  
      fetch(`http://localhost:3000/api/user-polls/edit/${pollId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ question, options }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al guardar los cambios.");
          }
          return response.json();
        })
        .then((data) => {
          alert(data.message);
          window.location.href = "user-polls.html";
        })
        .catch((error) => {
          console.error("Error al guardar los cambios:", error);
          alert("No se pudieron guardar los cambios.");
        });
    });
  });
  