require("dotenv").config();

// Sem essas variaveis a API ate sobe, mas todo login da 500 e toda rota
// protegida da 401. Melhor falhar logo na subida com uma mensagem clara.
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);

if (missingEnv.length) {
  console.error(`Variaveis de ambiente obrigatorias ausentes: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
