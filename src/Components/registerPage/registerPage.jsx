import React from "react";
import "./registerPage.css";
import { useNavigate } from "react-router-dom";

export default function RegisterPage () {
  const navigate = useNavigate();
  const serverUrl = "http://localhost:3001";

  const [userData, setUserData] = React.useState({
    name: "",
    password: "",
    re_password: "",
  })

  function handleSubmit () {
    if (userData.password !== userData.re_password) {
      alert("Passwords do not match");
      return;
    }
    if (userData.name === "" || userData.password === "") {
      alert("Please do not leave any field empty");
      return;
    }
    fetch(`${serverUrl}/register`, {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "content-type": "application/json",
      }
    })
    .then((res) => res.json())
    .then(data => {
      if (data.result) {
        navigate("/login");
      } else {
        alert(data.error);
      }
    })
  }

  function handleChange (e) {
    const {name, value} = e.target;
    setUserData(prevData => ({...prevData, [name]: value}))
  }

  return (
    <>
      <div className="register-card-container">
        <h1> TO-DO Application </h1>
        <div className="form-card">
          <h2>Register</h2>
          <input
            className="input-field"
            type="text"
            autoComplete="off"
            name="name"
            id="name"
            placeholder="User Name"
            onChange={handleChange}
            value={userData.name}
            required
          />
          <input
            className="input-field"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            onChange={handleChange}
            value={userData.password}
            required
          />
          <input
            className="input-field"
            type="password"
            name="re_password"
            id="re_password"
            placeholder="Confirm Password"
            onChange={handleChange}
            value={userData.re_password}
            required
          />
          <button
            className="register-button"
            onClick={handleSubmit}
          >
            Register
          </button>
        </div>
      </div>
    </>
  );
}