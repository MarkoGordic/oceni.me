import React, { useState } from 'react';
import './login.css';

function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="wrap">
      <div className='column background' id="left"></div>
      <div className='column' id='right'>
        <div className='login-wrap'>
          <form action="/api/login" method="post">
            <h1>PRIJAVA</h1>
            <div className='login-icon'></div>

            <p class="alert-msg"></p>

            <label for="email"><i class="fi fi-rs-envelope"></i>Elektronska pošta</label>
            <input type="email" id="email" name="email" placeholder="primer@tidajem.rs"/>

            <div class="password-group">
                <label for="password"><i class="fi fi-rr-lock"></i>Lozinka</label>
                <input type={isPasswordVisible ? "text" : "password"} id="password" name="password" placeholder="MnogoJakaSifra"/>
                <span onClick={togglePasswordVisibility} className="eye-icon">
                  <i className={isPasswordVisible ? "fi fi-rr-eye-crossed" : "fi fi-rs-eye"}></i>
                </span>
            </div>

            <button type="submit" id="login-button">PRIJAVI SE</button>
            <p className='info'>Zaboravili ste lozinku? <a href="/reset-password">Postavite novu.</a></p>
          </form>
        </div>
        <div class="footer">
            <p>made by Gordic with 💙</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
