import { useState } from "react";

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
    if (!file) return alert("Please select a PDF first.");

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Your FastAPI backend URL
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setMessage("Uploaded and processed successfully!");
      console.log("Backend response:", data);

    } catch (error) {
      console.error(error);
      setMessage("Upload failed");
    }

    setUploading(false);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Upload Notes</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleSelect}
        style={{ marginTop: "20px" }}
      />

      <br />

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        {uploading ? "Processing..." : "Upload PDF"}
      </button>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </div>
  );
}
