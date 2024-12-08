const request = require("supertest");
const app = require("../app"); // Importa la aplicación Express

describe("Pruebas de rutas de Feedback Snap", () => {
  // Prueba para la ruta de creación de encuestas
  it("Debería crear una encuesta y devolver el ID", async () => {
    const response = await request(app)
      .post("/api/create-poll")
      .send({
        question: "¿Cuál es tu color favorito?",
        options: ["Rojo", "Azul"],
      });
  
    if (response.status !== 201) {
      console.error("Error en la creación de encuesta:", response.body);
    }
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.message).toBe("Encuesta creada con éxito.");
  });
  

  // Prueba para obtener una encuesta por ID
  it("Debería obtener una encuesta existente por su ID", async () => {
    const createResponse = await request(app)
      .post("/api/create-poll")
      .send({
        question: "¿Cuál es tu comida favorita?",
        options: ["Pizza", "Sushi"],
      });

    const pollId = createResponse.body.id;

    const getResponse = await request(app).get(`/api/poll/${pollId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty("id", pollId);
    expect(getResponse.body).toHaveProperty("question", "¿Cuál es tu comida favorita?");
    expect(getResponse.body.options).toEqual(["Pizza", "Sushi"]);
  });

  // Prueba para registrar un voto
  it("Debería registrar un voto en una encuesta existente", async () => {
    const createResponse = await request(app)
      .post("/api/create-poll")
      .send({
        question: "¿Qué prefieres para el desayuno?",
        options: ["Panqueques", "Huevos"],
      });

    const pollId = createResponse.body.id;

    const voteResponse = await request(app)
      .post(`/api/vote/${pollId}`)
      .send({ optionIndex: 1 }); // Votamos por la opción "Huevos"

    expect(voteResponse.status).toBe(200);
    expect(voteResponse.body.message).toBe("Voto registrado con éxito.");
    expect(voteResponse.body.votes).toEqual([0, 1]); // Verifica los votos actualizados
  });

  // Prueba para manejar errores en encuestas inexistentes
  it("Debería devolver un error si la encuesta no existe", async () => {
    const response = await request(app).get("/api/poll/99999"); // ID inexistente
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Encuesta no encontrada.");
  });
});

