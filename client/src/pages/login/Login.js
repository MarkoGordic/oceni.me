import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const errorType = queryParams.get('error');
    setErrorMessage('');
    switch (errorType) {
      case 'incorrect_password':
        setErrorMessage('Pogrešna lozinka. Molimo pokušajte ponovo.');
        break;
      case 'user_not_found':
        setErrorMessage('Korisnik nije pronađen.');
        break;
      case 'login_error':
        setErrorMessage('Došlo je do greške prilikom prijave. Molimo pokušajte ponovo.');
        break;
    }
  }, []);

  return (
    <div className="wrap">
      <div className='column background' id="left"></div>
      <div className='column' id='right'>
        <div className='login-wrap'>
          <form action={"http://localhost:8000/auth/login?redirect=" + from} method="post">
            <h1 style={{ marginBottom: errorMessage ? '0px' : '20px' }}>PRIJAVA</h1>
            {errorMessage && <p className="error-msg">{errorMessage}</p>}

            <label htmlFor="email"><i className="fi fi-rs-envelope"></i>Elektronska pošta</label>
            <input type="email" id="email" name="email" placeholder="primer@tidajem.rs"/>

            <div className="password-group">
                <label htmlFor="password"><i className="fi fi-rr-lock"></i>Lozinka</label>
                <input type={isPasswordVisible ? "text" : "password"} id="password" name="password" placeholder="MnogoJakaSifra"/>
                <span onClick={togglePasswordVisibility} className="eye-icon">
                  <i className={isPasswordVisible ? "fi fi-rr-eye-crossed" : "fi fi-rs-eye"}></i>
                </span>
            </div>

            <button type="submit" id="login-button">PRIJAVI SE</button>
            <p className='info'>Svaki neovlaščeni pokušaj pristupa je kažnjiv</p>
            <p className='info'>u skladu sa odredbana Krivičnog zakona Republike Srbije</p>
          </form>
        </div>
        <div className="footer">
            <p>💙</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
