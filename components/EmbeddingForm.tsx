import { useState } from "react";
import axios from "axios";

const EmbeddingForm = () => {
  const [text, setText] = useState("");
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/embedding", { text });
      setEmbedding(response.data.embedding);
    } catch (err) {
      setError("Error generando el embedding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Generador de Embeddings</h2>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Ingresa tu texto aquí..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
      >
        {loading ? "Generando..." : "Generar Embedding"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {embedding && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <h3 className="font-bold">Embedding:</h3>
          <pre className="text-sm text-gray-700 overflow-auto">
            {JSON.stringify(embedding, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EmbeddingForm;
