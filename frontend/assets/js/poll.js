// Variable global para el gráfico
let resultsChart;

// Obtén el ID de la encuesta desde la URL
const params = new URLSearchParams(window.location.search);
const pollId = params.get("id");

console.log("ID de encuesta detectado:", pollId);

if (!pollId) {
  document.getElementById("poll-container").innerHTML =
    '<p class="text-danger">ID de encuesta no válido.</p>';
  throw new Error("ID de encuesta no válido.");
}

// Función para cargar la encuesta
function loadPoll() {
  fetch(`http://localhost:3000/api/poll/${pollId}`)
    .then((response) => {
      console.log("Respuesta del servidor al cargar encuesta:", response.status);
      if (!response.ok) {
        throw new Error("Error al cargar la encuesta.");
      }
      return response.json();
    })
    .then((poll) => {
      console.log("Datos de la encuesta recibidos:", poll);
      const pollContainer = document.getElementById("poll-container");
      pollContainer.innerHTML = `
        <h1>${poll.question}</h1>
        <div>
          ${poll.options
            .map(
              (option, index) =>
                `<button class="btn btn-primary m-2" onclick="vote(${poll.id}, ${index})">${option}</button>`
            )
            .join("")}
        </div>
      `;

      // Crear el gráfico inicial
      createChart(poll.options, poll.votes);

      // Actualiza los resultados en tiempo real
      updateResults(poll.id);
    })
    .catch((error) => {
      console.error("Error al cargar la encuesta:", error);
      document.getElementById("poll-container").innerHTML =
        '<p class="text-danger">Error al cargar la encuesta.</p>';
    });
}

// Función para crear el gráfico inicial
function createChart(options, votes) {
  const ctx = document.getElementById("resultsChart").getContext("2d");
  console.log("Creando gráfico con opciones:", options, "y votos:", votes);

  resultsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: options,
      datasets: [
        {
          label: "Votos",
          data: votes,
          backgroundColor: [
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
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
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Función para actualizar el gráfico dinámicamente
function updateChart(votes) {
  console.log("Actualizando gráfico con nuevos votos:", votes);
  resultsChart.data.datasets[0].data = votes;
  resultsChart.update();
}

// Función para actualizar los resultados en tiempo real
function updateResults(pollId) {
  setInterval(() => {
    fetch(`http://localhost:3000/api/poll/${pollId}/results`)
      .then((response) => {
        console.log("Respuesta al actualizar resultados:", response.status);
        if (!response.ok) {
          throw new Error("Error al actualizar los resultados.");
        }
        return response.json();
      })
      .then((poll) => {
        console.log("Resultados actualizados:", poll.votes);
        updateChart(poll.votes);
      })
      .catch((error) => {
        console.error("Error al actualizar los resultados:", error);
      });
  }, 3000);
}

// Función para votar
function vote(pollId, optionIndex) {
  console.log(`Registrando voto en la encuesta ${pollId} para la opción ${optionIndex}`);
  fetch(`http://localhost:3000/api/poll/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIndex }),
  })
    .then((response) => {
      console.log("Respuesta al registrar voto:", response.status);
      if (!response.ok) {
        throw new Error("Error al registrar el voto.");
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error("Error al registrar el voto:", error);
      alert("Error al votar. Inténtalo de nuevo.");
    });
}

// Función para guardar archivos en el servidor
function saveFileToServer(filename, content) {
  console.log("Intentando guardar archivo en el servidor:", filename);
  fetch("http://localhost:3000/api/save-results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, content }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Archivo guardado en el servidor:", data.message))
    .catch((error) => console.error("Error al guardar el archivo en el servidor:", error));
}

// Función para exportar resultados a CSV
function exportResultsToCSV(poll) {
  const headers = ["Opción", "Votos"];
  const rows = poll.options.map((option, index) => [option, poll.votes[index]]);
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const filename = `${poll.question.replace(/\s+/g, "_")}_resultados.csv`;

  console.log("Generando archivo CSV:", filename);
  saveFileToServer(filename, csvContent);

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Función para exportar resultados a PDF
async function exportResultsToPDF(poll) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Resultados de la Encuesta", 105, 20, { align: "center" });

  const tableData = poll.options.map((option, index) => [option, poll.votes[index]]);
  doc.autoTable({
    head: [["Opción", "Votos"]],
    body: tableData,
    startY: 40,
    styles: { fontSize: 12, cellPadding: 5 },
  });

  const canvas = document.getElementById("resultsChart");
  const chartImage = canvas.toDataURL("image/png");
  doc.addImage(chartImage, "PNG", 10, doc.previousAutoTable.finalY + 10, 180, 100);

  const filename = `${poll.question.replace(/\s+/g, "_")}_resultados.pdf`;
  console.log("Generando archivo PDF:", filename);

  const pdfContent = doc.output("datauristring");
  saveFileToServer(filename, pdfContent);

  doc.save(filename);
}

// Carga inicial de la encuesta
document.addEventListener("DOMContentLoaded", loadPoll);
