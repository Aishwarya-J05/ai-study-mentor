import { useState } from "react";
import { API_BASE_URL } from "../api";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.detail || "Upload failed");
      setUploading(false);
      return;
    }

    setMessage(`Uploaded successfully → ${data.url}`);
    setUploading(false);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Upload Notes</h1>

      <input type="file" accept="application/pdf" onChange={handleSelect} />

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Processing..." : "Upload PDF"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
