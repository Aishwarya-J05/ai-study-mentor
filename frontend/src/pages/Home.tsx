import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome to AI Study Mentor</h1>

      <p style={{ marginTop: "10px" }}>
        Logged in as: <strong>{user?.email}</strong>
      </p>

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => navigate("/upload")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Upload Notes
        </button>

        <button
          onClick={() => navigate("/chat")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Ask Doubts
        </button>

        <button
          onClick={() => navigate("/summary")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Summaries
        </button>

        <button
          onClick={() => navigate("/flashcards")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Flashcards
        </button>

        <button
          onClick={() => navigate("/quiz")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Quiz Generator
        </button>

        <button
          onClick={() => navigate("/progress")}
          style={{
            marginRight: "20px",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Progress
        </button>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "40px",
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#ffeded",
        }}
      >
        Logout
      </button>
    </div>
  );
}
