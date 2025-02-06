import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./Register.css";

const Register = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Load users from localStorage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  // Function to handle user registration
  const handleRegister = () => {
    if (!name || !email || !password|| !phone) {
      alert("All fields are required!");
      return;
    }

    const newUser = { id: Date.now(), name, email, password , phone };
    const updatedUsers = [...users, newUser];

    // Save to localStorage
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Send registration details to email
    const templateParams = {
      user_name: name,
      user_email: email,
      user_password: password,
      user_phone:phone,
    };

    emailjs
      .send(
        "service_56wmy2l", // Replace with your actual EmailJS Service ID
        "template_wi10s2c", // Replace with your actual EmailJS Template ID
        templateParams,
        "thFkQv4nXc8txORfJ" // Replace with your actual EmailJS Public Key
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          alert("Registration successful! Details are saved.");
        },
        (error) => {
          console.log("FAILED...", error);
          alert("Error sending email. Please try again.");
        }
      );

    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
  };

  // Function to delete a user
  const handleDelete = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  return (
    <div className="register-container">
      <h2>User Registration</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="tel" placeholder="Contact No" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>

      <h3>Registered Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email} - {user.phone}{" "}
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Register;
