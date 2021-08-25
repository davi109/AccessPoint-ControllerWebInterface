import React, { useState, useContext } from 'react';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiUser } from 'react-icons/fi';

import { useHistory } from 'react-router-dom'; //usado para linkar outras paginas.
import { Context } from '../../Context/AuthContext';

import './styles.css';

import logoImg from '../../assets/logo.png';

import Loading from '../Loading'

export default function Login() {

  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [hidden, setHidden] = useState(true);
  const history = useHistory();

  const { handleLogin, Login, Authenticated } = useContext(Context);

  function switchHidden() {
    setHidden(!hidden);
  }

  function fazerLogin(e) {
    e.persist();
    handleLogin(e, login, senha, true);
  }

  return (
    <div>
      <header>
        <div className="navbar-login">
          <img src={logoImg} alt="Controller" />
        </div>
      </header>

      <div className="login-content">
        <div>
          <div className="intro">
            <h2>Entre com seu cadastro</h2>
          </div>

          <div className="login-box">

            <div className="form-box">

              <form onSubmit={e => fazerLogin(e)}>

                <div className="inputWithIcon">

                  <input
                    type="text"
                    placeholder="Login"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                  /> <i><FiUser /></i>

                </div>

                <div className="input-group">
                  <div className="inputWithIcon">
                    <input
                      type={hidden ? "password" : "text"}
                      placeholder="Senha"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                    /> <i><FiLock /></i>
                  </div>

                  <button type="button" onClick={switchHidden} >{hidden ? <FiEye /> : <FiEyeOff />}</button>
                </div>

                <div className="entrar">
                  <button type="submit"><FiLogIn /> &nbsp; Entrar</button>
                </div>

              </form>
            </div>

            <div className="back">
              <a className="back-link" onClick={() => alert("Entre em contato com o administrador")}>Não consegue entrar?</a>
            </div>

          </div>

        </div>
      </div>
      <Loading loading={Login} message='Carregando...' />
      {Authenticated ? history.push('/') : null}

    </div>

  );
}