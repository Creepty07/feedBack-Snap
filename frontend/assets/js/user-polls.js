document.addEventListener("DOMContentLoaded", loadUserPolls);

function loadUserPolls() {
    const token = localStorage.getItem("token");
    console.log("Token desde localStorage:", token);
    
    if (!token) {
      alert("Inicia sesión para gestionar tus encuestas.");
      window.location.href = "login.html";
      return;
    }
    

    fetch("http://localhost:3000/api/user-polls", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al cargar las encuestas.");
      }
      return response.json();
    })
    .then((polls) => {
      console.log("Encuestas cargadas:", polls);
      const tableBody = document.querySelector("#polls-table tbody");
      tableBody.innerHTML = "";

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
      alert("No se pudieron cargar tus encuestas.");
    });
}


// Crear nueva encuesta
function createPoll() {
  window.location.href = "create-poll.html";
}

// Eliminar una encuesta
function deletePoll(pollId) {
  const token = localStorage.getItem("token");

  if (!confirm("¿Estás seguro de que deseas eliminar esta encuesta?")) return;

  fetch(`http://localhost:3000/api/user-polls/delete/${pollId}`, {
    method: "DELETE",
    headers: { Authorization: token },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al eliminar la encuesta.");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
      loadUserPolls();
    })
    .catch((error) => {
      console.error("Error al eliminar la encuesta:", error);
      alert("No se pudo eliminar la encuesta.");
    });
}

// Filtrar encuestas
document.getElementById("search-bar").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#polls-table tbody tr");
  
    rows.forEach((row) => {
      const question = row.cells[1].textContent.toLowerCase();
      row.style.display = question.includes(searchTerm) ? "" : "none";
    });
  });
  