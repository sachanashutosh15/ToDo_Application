import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage () {
  const navigate = useNavigate();
  const serverUrl = "http://localhost:3001";
  const [userData, setUserData] = React.useState({
    name: "",
    password: "",
  });
  
  function handleChange (e) {
    const {name, value} = e.target;
    setUserData(prevData => ({...prevData, [name]: value}))
  }

  function handleSubmit() {
    console.log(userData);
    if (userData.name === "" || userData.password === "") {
      alert("Please do not leave any field empty");
      return;
    }
    fetch(`${serverUrl}/login`, {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "content-type": "application/json",
      }
    })
    .then((res) => res.json())
    .then(data => {
      if (data.result === "Logged in Successfully") {
        localStorage.setItem("token", data.accessToken);
        navigate("/");
      } else {
        alert(data.error);
      }
    })
  }

  return (
    <>
      <div className="register-card-container">
        <h1> TO-DO Application </h1>
        <div className="form-card">
          <h2> Member Log in</h2>
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
          <button
            className="register-button"
            onClick={handleSubmit}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}