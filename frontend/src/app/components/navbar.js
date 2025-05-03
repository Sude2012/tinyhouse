import React from "react";
import { FaHome } from "react-icons/fa"; // İconu burada import ediyoruz

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: "#2c3e50", padding: "1rem" }}>
      <ul style={{ listStyleType: "none", padding: 0, textAlign: "center" }}>
        <li style={{ display: "inline", margin: "0 15px" }}>
          <a href="/" style={{ color: "white", textDecoration: "none" }}>
            <FaHome style={{ marginRight: "8px" }} />{" "}
            {/* İkonu buraya ekliyoruz */}
            Home
          </a>
        </li>
        <li style={{ display: "inline", margin: "0 15px" }}>
          <a href="/about" style={{ color: "white", textDecoration: "none" }}>
            About
          </a>
        </li>
        <li style={{ display: "inline", margin: "0 15px" }}>
          <a href="/contact" style={{ color: "white", textDecoration: "none" }}>
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
