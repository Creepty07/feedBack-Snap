document.addEventListener("DOMContentLoaded", () => {
    const pollsContainer = document.getElementById("polls-container");
  
    // Solicitud GET al backend para obtener encuestas
    fetch("http://localhost:3000/api/poll")
      .then((response) => response.json())
      .then((polls) => {
        if (polls.length === 0) {
          pollsContainer.innerHTML = '<p class="text-center">No hay encuestas disponibles.</p>';
          return;
        }
  
        // Crear tarjetas para cada encuesta
        polls.forEach((poll) => {
          const pollCard = `
            <div class="col-md-4">
              <div class="card mb-4">
                <div class="card-body">
                  <h5 class="card-title">${poll.question}</h5>
                  <a href="poll.html?id=${poll.id}" class="btn btn-primary">Votar</a>
                </div>
              </div>
            </div>
          `;
          pollsContainer.innerHTML += pollCard;
        });
      })
      .catch((error) => {
        console.error("Error al obtener las encuestas:", error);
        pollsContainer.innerHTML = '<p class="text-center text-danger">Error al cargar las encuestas.</p>';
      });
  });
  