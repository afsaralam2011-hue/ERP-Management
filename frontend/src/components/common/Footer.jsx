// src/components/common/Footer.jsx
import React from "react";
import { FiGithub, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";

const Footer = ({ showFull = true }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div style={{
      background: "#1e293b",
      color: "white",
      padding: showFull ? "40px 32px 24px" : "24px 32px",
      marginTop: "auto",
      borderTop: "1px solid #334155"
    }}>
      {showFull ? (
        <>
          {/* Main Footer Content */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px"
          }}>
            {/* Company Info */}
            <div>
              <div style={{
                width: "50px",
                height: "50px",
                background: "white",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                border: "2px solid #3b82f6"
              }}>
                <span style={{ 
                  fontSize: "18px", 
                  fontWeight: "bold", 
                  color: "#3b82f6"
                }}>
                  PWI
                </span>
              </div>
              <h3 style={{ 
                margin: "0 0 12px 0", 
                fontSize: "18px",
                fontWeight: "600"
              }}>
                Pakistan Wire Industries
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: "14px",
                color: "#cbd5e1",
                lineHeight: "1.6"
              }}>
                Leading manufacturer of quality wires since 1995. 
                Committed to excellence in production and innovation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "16px",
                fontWeight: "600",
                color: "#f8fafc"
              }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { name: "Dashboard", path: "/dashboard" },
                  { name: "Production", path: "/production" },
                  { name: "HR Department", path: "/hr" },
                  { name: "Finance", path: "/finance" },
                  { name: "Sales", path: "/sales" }
                ].map((link) => (
                  <li key={link.name} style={{ marginBottom: "10px" }}>
                    <a
                      href={link.path}
                      style={{
                        color: "#cbd5e1",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.2s",
                        display: "inline-block"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#ffffff";
                        e.target.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#cbd5e1";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      → {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "16px",
                fontWeight: "600",
                color: "#f8fafc"
              }}>
                Contact Us
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <FiPhone style={{ color: "#3b82f6" }} />
                  <span style={{ fontSize: "14px", color: "#cbd5e1" }}>
                    +92 21 12345678
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <FiMail style={{ color: "#3b82f6" }} />
                  <span style={{ fontSize: "14px", color: "#cbd5e1" }}>
                    info@pwi.com.pk
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "8px" }}>
                  Industrial Area, Karachi, Pakistan
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 style={{ 
                margin: "0 0 20px 0", 
                fontSize: "16px",
                fontWeight: "600",
                color: "#f8fafc"
              }}>
                Connect With Us
              </h4>
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                {[
                  { icon: <FiGithub />, label: "GitHub" },
                  { icon: <FiLinkedin />, label: "LinkedIn" },
                  { icon: <FiMail />, label: "Email" }
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#334155",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#cbd5e1",
                      fontSize: "18px",
                      transition: "all 0.2s",
                      textDecoration: "none"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#3b82f6";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#334155";
                      e.currentTarget.style.color = "#cbd5e1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <div style={{
                background: "rgba(59, 130, 246, 0.1)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#cbd5e1"
              }}>
                ERP System v2.0
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ 
            height: "1px", 
            background: "#334155", 
            margin: "0 0 24px 0" 
          }} />
        </>
      ) : null}

      {/* Copyright */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ fontSize: "14px", color: "#94a3b8" }}>
          © {currentYear} Pakistan Wire Industries Pvt. LTD. All rights reserved.
        </div>
        
        <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#94a3b8" }}>
          <a 
            href="/privacy" 
            style={{ color: "#94a3b8", textDecoration: "none" }}
            onMouseEnter={(e) => e.target.style.color = "#ffffff"}
            onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            style={{ color: "#94a3b8", textDecoration: "none" }}
            onMouseEnter={(e) => e.target.style.color = "#ffffff"}
            onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
          >
            Terms of Service
          </a>
          <a 
            href="/help" 
            style={{ color: "#94a3b8", textDecoration: "none" }}
            onMouseEnter={(e) => e.target.style.color = "#ffffff"}
            onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
          >
            Help Center
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;