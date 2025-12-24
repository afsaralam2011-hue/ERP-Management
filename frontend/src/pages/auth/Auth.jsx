import React from "react";
import Header from "./components/common/Header";
import { useState } from "react";
import axios from "../../api/axios";

export default function Auth() {
  const [tab, setTab] = useState("login");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", loginData);
      alert("Login Successful!");
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      alert("Invalid Email or Password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", registerData);
      alert("User Registered! Now Login.");
      setTab("login"); // switch tab
    } catch (err) {
      alert("Registration Failed!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setTab("login")}
            style={tab === "login" ? styles.activeTab : styles.tab}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            style={tab === "register" ? styles.activeTab : styles.tab}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form style={styles.form} onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              style={styles.input}
            />

            <button style={styles.btn}>Login</button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <form style={styles.form} onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({ ...registerData, name: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              style={styles.input}
            />

            <button style={styles.btn}>Create Account</button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f3f8"
  },
  card: {
    width: 350,
    background: "#fff",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },
  tabs: {
    display: "flex",
    marginBottom: 20
  },
  tab: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    background: "#eee",
    border: "none",
    cursor: "pointer"
  },
  activeTab: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    background: "#4a63e7",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  btn: {
    padding: 12,
    background: "#4a63e7",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
