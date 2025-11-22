import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { signInWithGoogle } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  // If already logged in, go to home
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>AI Study Mentor</h1>

      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "white",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
