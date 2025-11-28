import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../api";

export default function Upload() {
  const { user } = useContext(AuthContext);
  const userId = user?.uid || "anonymous";

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");

    setUploading(true);
    setMessage("");

    // STEP 1: Upload to Supabase via your backend
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      setMessage(uploadData.detail || "Upload failed");
      setUploading(false);
      return;
    }

    const fileUrl = uploadData.url;
    setUploading(false);
    setProcessing(true);

    // STEP 2: Send URL to FastAPI to process file
    const processRes = await fetch(`${API_BASE_URL}/api/process-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: fileUrl,
        filename: file.name,
        user_id: userId
      }),
    });

    const processData = await processRes.json();

    if (!processRes.ok) {
      setMessage(processData.detail || "Processing failed");
      setProcessing(false);
      return;
    }

    setProcessing(false);
    setMessage(`File processed successfully! File ID: ${processData.file_id}`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Upload Notes</h1>

      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleSelect} />

      <button onClick={handleUpload} disabled={uploading || processing}>
        {uploading
          ? "Uploading..."
          : processing
          ? "Processing..."
          : "Upload PDF"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
