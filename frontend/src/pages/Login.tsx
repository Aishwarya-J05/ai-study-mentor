import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginWithGoogle, loginWithEmailAndPassword, signUpWithEmailPassword } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill in all fields");

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmailPassword(email, password);
      } else {
        await loginWithEmailAndPassword(email, password);
      }
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error) || "Authentication failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      alert(`Google login failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Animated Floating Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="floating-orb"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, -20, 0],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 300 + i * 100,
            height: 300 + i * 100,
            borderRadius: "50%",
            filter: "blur(90px)",
            opacity: 0.25,
            background: i % 2 === 0 ? "#00d0ff" : "#d900ff",
            top: `${20 + i * 15}%`,
            left: i % 2 === 0 ? "-10%" : "auto",
            right: i % 2 === 1 ? "-10%" : "auto",
            zIndex: 1,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
        >
          {/* Logo / Title */}
          <motion.div className="header">
            <h1 className="title">
              AI Study <span className="gradient-text">Mentor</span>
            </h1>
            <p className="subtitle">
              {isSignUp ? "Create your account to start learning smarter" : "Welcome back! Continue your journey"}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleEmailAuth}
            className="auth-form"
          >
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-btn"
          >
            <FcGoogle size={24} />
            <span>Continue with Google</span>
          </motion.button>

          {/* Toggle Sign Up / Login */}
          <p className="toggle-text">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setIsSignUp(!isSignUp)} className="toggle-link">
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </p>

          <p className="footer-note">
            Secured by Firebase • End-to-end encrypted • No data sold
          </p>
        </motion.div>
      </div>

      <style>{`
      html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #0a0a1a !important;
        }

        *:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .login-wrapper {
          min-height: 100vh;
          background: #0a0a1a;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(120, 0, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 200, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 200, 0.08) 0%, transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
          position: relative;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          z-index: 10;
        }

        .glass-card {
          background: rgba(15, 15, 35, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          padding: 48px 36px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(0, 180, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%);
          pointer-events: none;
          border-radius: 28px;
        }

        .header { text-align: center; margin-bottom: 32px; }
        .title {
          font-size: 40px;
          font-weight: 900;
          background: linear-gradient(120deg, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -1px;
        }
        .gradient-text {
          background: linear-gradient(90deg, #00d0ff, #8b00ff, #ff00a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: #aaa;
          margin: 12px 0 0;
          font-size: 16px;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 24px 0;
        }

        .input-field {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          color: white;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-field::placeholder { color: #888; }
        .input-field:focus {
          border-color: #00d0ff;
          box-shadow: 0 0 0 3px rgba(0, 208, 255, 0.2);
          background: rgba(255, 255, 255, 0.12);
        }

        .primary-btn, .google-btn {
          padding: 16px 24px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 10px 0;
          width: 100%;
          border: none;
          position: relative;
          overflow: hidden;
        }

        .primary-btn {
          background: linear-gradient(135deg, #00d0ff, #8b00ff);
          color: white;
          box-shadow: 0 8px 25px rgba(0, 208, 255, 0.3);
        }
        .primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(0, 208, 255, 0.4); }
        .primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .google-btn {
          background: rgba(255, 255, 255, 0.95);
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        .google-btn:hover { background: white; transform: translateY(-2px); }

        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
          color: #777;
          font-size: 14px;
        }
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0; right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
        .divider span {
          background: #0a0a1a;
          padding: 0 16px;
        }

        .toggle-text {
          text-align: center;
          margin: 24px 0 16px;
          color: #aaa;
          font-size: 14.5px;
        }
        .toggle-link {
          color: #00d0ff;
          font-weight: 600;
          cursor: pointer;
        }
        .toggle-link:hover { text-decoration: underline; }

        .footer-note {
          text-align: center;
          font-size: 12.5px;
          color: #666;
          margin-top: 20px;
        }

        @media (max-width: 480px) {
          .glass-card { padding: 40px 28px; border-radius: 24px; }
          .title { font-size: 36px; }
        }
      `}</style>
    </div>
  );
}