# Generar y almacenar embeddings con Next.js y PostgreSQL (pgvector)

Este proyecto utiliza **Next.js**, **OpenAI API** y **PostgreSQL con pgvector** para generar y almacenar embeddings de texto.

### 📌 Requisitos

Antes de comenzar, asegúrate de tener lo siguiente:
- Una cuenta en [OpenAI](https://platform.openai.com/)
- Un servidor PostgreSQL con la extensión `pgvector` instalada
- Node.js y npm instalados
- Un archivo `.env.local` con las siguientes variables de entorno:
  ```env
  OPENAI_API_KEY=tu_clave_de_openai
  DATABASE_URL=postgres://usuario:password@host:puerto/base_de_datos
  ```

---

## 🛠️ Instalación

1. Clona el repositorio y entra en la carpeta del proyecto:
   ```sh
   git clone tu-repositorio.git
   cd tu-repositorio
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Asegúrate de tener la tabla en PostgreSQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;

   CREATE TABLE embeddings (
     id SERIAL PRIMARY KEY,
     text TEXT,
     embedding vector(1536)  -- Dependiendo del modelo usado, este tamaño puede variar
   );
   ```

---

## 🚀 Backend: API en Next.js

Crea un archivo en `pages/api/embedding.js` con el siguiente código:

```javascript
import OpenAI from "openai";
import { Pool } from "pg";

// Configurar OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configurar PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
```

---

## 🎨 Frontend: Formulario en React (Next.js + TypeScript)

Crea un archivo en `components/TextEmbeddingForm.tsx`:

```tsx
import { useState } from "react";

const TextEmbeddingForm = () => {
  const [text, setText] = useState("");
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmbedding(null);

    try {
      const response = await fetch("/api/embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error desconocido");
      setEmbedding(data.embedding);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Generar Embedding</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ingresa un texto"
          required
        />
        <button type="submit">Generar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {embedding && (
        <div>
          <h3>Embedding:</h3>
          <pre>{JSON.stringify(embedding, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TextEmbeddingForm;
```

Para mostrar el formulario en una página, edita `pages/index.tsx`:

```tsx
import TextEmbeddingForm from "@/components/TextEmbeddingForm";

export default function Home() {
  return (
    <div>
      <h1>Embeddings con Next.js</h1>
      <TextEmbeddingForm />
    </div>
  );
}
```

---

## 📦 Ejecutar el proyecto

1. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```
2. Accede a `http://localhost:3000` en tu navegador.
3. Ingresa un texto y genera su embedding.

---

## 🔍 Consulta de Embeddings

Para encontrar textos similares, usa una consulta en PostgreSQL con `pgvector`:

```sql
SELECT text, embedding <-> '[0.2, 0.3, 0.5, ...]' AS distance
FROM embeddings
ORDER BY distance ASC
LIMIT 5;
```

Esto devuelve los textos más cercanos al embedding de consulta usando distancia de coseno.

---

## 🚀 Despliegue

Para desplegar en **Vercel**:
1. Conecta tu repo en [Vercel](https://vercel.com/).
2. Configura las variables de entorno en el panel de configuración.
3. Haz deploy con:
   ```sh
   vercel --prod
   ```

---

## 🏆 Conclusión

Este proyecto te permite generar, almacenar y consultar embeddings usando **Next.js, OpenAI, PostgreSQL y pgvector**. 🚀 ¡Ahora puedes construir aplicaciones con búsqueda semántica y recomendaciones!

📌 **Opcional**: Extiende este sistema integrando imágenes con `S3` y `CLIP` de OpenAI para embeddings visuales.

