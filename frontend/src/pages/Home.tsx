import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUpload, FiMessageSquare, FiFileText, FiLayers, FiZap, FiTrendingUp, FiLogOut } from "react-icons/fi";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const features = [
    { title: "Upload Notes", icon: <FiUpload />, path: "/upload", color: "#00d0ff" },
    { title: "Ask Doubts", icon: <FiMessageSquare />, path: "/chat", color: "#8b00ff" },
    { title: "Summaries", icon: <FiFileText />, path: "/summary", color: "#ff00c8" },
    { title: "Flashcards", icon: <FiLayers />, path: "/flashcards", color: "#00ff9d" },
    { title: "Quiz Generator", icon: <FiZap />, path: "/quiz", color: "#ff9500" },
    { title: "Progress", icon: <FiTrendingUp />, path: "/progress", color: "#6e00ff" },
  ];

  return (
    <div className="home-wrapper">
      {/* Animated Background Orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="floating-orb"
          animate={{
            y: [0, -40, 10, -30, 0],
            x: [0, 30, -20, 10, 0],
          }}
          transition={{
            duration: 18 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 400 + i * 120,
            height: 400 + i * 120,
            borderRadius: "50%",
            filter: "blur(100px)",
            opacity: 0.2,
            background: i % 2 === 0 ? "#00d0ff" : "#d900ff",
            top: `${15 + i * 20}%`,
            left: i % 2 === 0 ? "-15%" : "auto",
            right: i % 2 === 1 ? "-15%" : "auto",
            zIndex: 0,
          }}
        />
      ))}

      <div className="home-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="header-section"
        >
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-name">{user?.displayName || user?.email?.split("@")[0]}</span>
          </h1>
          <p className="welcome-subtitle">
            Your AI-powered study companion is ready. Choose a tool below to get started.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="feature-card"
              onClick={() => navigate(feature.path)}
              style={{ "--card-color": feature.color } as React.CSSProperties}
            >
              <div className="icon-wrapper" style={{ backgroundColor: feature.color + "20" }}>
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <h3>{feature.title}</h3>
              <p>Quick access to {feature.title.toLowerCase()}</p>
            </motion.div>
          ))}
        </div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="logout-section"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="logout-btn"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </motion.button>
          <p className="session-info">
            Signed in as <strong>{user?.email}</strong>
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
        .home-wrapper {
          min-height: 100vh;
          background: #0a0a1a;
          background-image: 
            radial-gradient(circle at 10% 90%, rgba(0, 208, 255, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 90% 10%, rgba(139, 0, 255, 0.12) 0%, transparent 50%);
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .header-section {
          text-align: center;
          margin-bottom: 60px;
        }

        .welcome-title {
          font-size: 44px;
          font-weight: 900;
          background: linear-gradient(120deg, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .gradient-name {
          background: linear-gradient(90deg, #00d0ff, #8b00ff, #ff00c8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }

        .welcome-subtitle {
          color: #aaa;
          font-size: 18px;
          margin: 16px 0 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Force 3 per row */
  gap: 28px;
  margin-bottom: 80px;
}

/* Tablet (2 per row) */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile (1 per row) */
@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}


        .feature-card {
          background: rgba(20, 20, 45, 0.6);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: var(--card-color);
          opacity: 0.7;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
                      0 0 30px rgba(0, 208, 255, 0.15);
          border-color: var(--card-color)40;
        }

        .icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 32px;
        }

        .feature-card h3 {
          color: white;
          font-size: 20px;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .feature-card p {
          color: #999;
          font-size: 14px;
          margin: 0;
        }

        .logout-section {
          text-align: center;
        }

        .logout-btn {
          background: rgba(255, 100, 100, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(255, 100, 100, 0.3);
          padding: 14px 32px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 100, 100, 0.25);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255, 100, 100, 0.2);
        }

        .session-info {
          margin-top: 20px;
          color: #777;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .welcome-title { font-size: 36px; }
          .features-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
          .feature-card { padding: 28px 20px; }
        }

        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr; }
          .welcome-title { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}




