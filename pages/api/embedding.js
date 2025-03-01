import OpenAI from "openai";
import { Pool } from "pg";

// Configurar OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configurar PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Se requiere un texto" });
  }

  try {
    // Generar embedding
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = response.data[0].embedding;

    // Guardar en PostgreSQL
    const client = await pool.connect();
    await client.query(
      "INSERT INTO embeddings (text, embedding) VALUES ($1, $2::vector)",
      [text, `[${embedding.join(",")}]`]
    );
    client.release();

    return res.status(200).json({ message: "Embedding guardado", embedding });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error generando el embedding" });
  }
}
