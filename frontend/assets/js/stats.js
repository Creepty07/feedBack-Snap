// Obtener ID de la encuesta desde la URL
const params = new URLSearchParams(window.location.search);
const pollId = params.get("id");

if (!pollId) {
  document.getElementById("stats-container").innerHTML =
    '<p class="text-danger">ID de encuesta no válido.</p>';
  throw new Error("ID de encuesta no válido.");
}

// Función para cargar estadísticas
function loadStats() {
  fetch(`http://localhost:3000/api/stats/poll-stats/${pollId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener estadísticas.");
      }
      return response.json();
    })
    .then((stats) => {
      console.log("Estadísticas recibidas:", stats);
      const statsContainer = document.getElementById("stats-container");

      statsContainer.innerHTML = `
        <h2>${stats.question}</h2>
        <p><strong>Total de votos:</strong> ${stats.totalVotes}</p>
        <p><strong>Opción más votada:</strong> ${stats.mostVotedOption}</p>
        <h3>Porcentajes:</h3>
        <ul>
          ${stats.percentages
            .map(
              (percentage, index) =>
                `<li>Opción ${index + 1}: ${percentage}%</li>`
            )
            .join("")}
        </ul>
      `;

      // Crear gráfico de estadísticas
      createChart(stats);
    })
    .catch((error) => {
      console.error("Error al cargar estadísticas:", error);
      document.getElementById("stats-container").innerHTML =
        '<p class="text-danger">Error al cargar estadísticas.</p>';
    });
}

// Función para crear un gráfico con Chart.js
function createChart(stats) {
  const ctx = document.getElementById("statsChart").getContext("2d");
  const labels = stats.percentages.map((_, index) => `Opción ${index + 1}`);
  const data = stats.percentages.map((percentage) => parseFloat(percentage));

  new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Porcentajes",
          data,
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  });
}

// Carga inicial
document.addEventListener("DOMContentLoaded", loadStats);
