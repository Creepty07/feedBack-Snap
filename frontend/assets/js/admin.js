// Cargar encuestas al iniciar la página
document.addEventListener("DOMContentLoaded", loadPolls);

// Función para cargar todas las encuestas
function loadPolls() {
  fetch("http://localhost:3000/api/admin/all-polls")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener las encuestas.");
      }
      return response.json();
    })
    .then((polls) => {
      const tableBody = document.querySelector("#polls-table tbody");
      tableBody.innerHTML = ""; // Limpia la tabla

      polls.forEach((poll) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${poll.id}</td>
          <td>${poll.question}</td>
          <td>${JSON.parse(poll.options).join(", ")}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deletePoll(${poll.id})">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error al cargar las encuestas:", error);
      alert("No se pudieron cargar las encuestas.");
    });
}

// Función para eliminar una encuesta
function deletePoll(pollId) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta encuesta?")) return;

  fetch(`http://localhost:3000/api/admin/delete-poll/${pollId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al eliminar la encuesta.");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
      loadPolls(); // Recarga las encuestas
    })
    .catch((error) => {
      console.error("Error al eliminar la encuesta:", error);
      alert("No se pudo eliminar la encuesta.");
    });
}
