import React from "react";
import './App.css';
import MainPage from "./Components/mainPage/mainPage";
import LoginPage from "./Components/loginPage/loginPage";
import RegisterPage from "./Components/registerPage/registerPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <MainPage /> } />
        <Route path="/login" element={ <LoginPage /> } />
        <Route path="/register" element={ <RegisterPage /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
