import React from 'react';

import './styles.css';

import { Menu } from '../../global.js'


export default function Dados() {

  return (
    <div>
      <header>
        <Menu />
      </header>

      <div className="dados-login-content">
        <div>
          <div className="dados-intro">
            <h2>Meus Dados</h2>
          </div>

          <div className="dados-retangulo-1">

            <div className="dados-info-login">
              <h2>Nome: Exemplo</h2>
            </div>

            <div className="dados-info-login">
              <h2>E-mail: exemplo@yahoo.com</h2>
            </div>

          </div>

          <div className="dados-intro">
            <h2>Ativar Licença</h2>
          </div>

          <div className="dados-retangulo-2">

            <div className="dados-info-login">
              <h2>Seu usuário ainda não tem permissão para a
              utilização do sistema, por favor, compre a licença
                    e insira logo abaixo</h2>
            </div>

            <div className="dados-license">

              <input
                type="text"
                placeholder="Código da liçenca"
              />

              <div className="dados-ativar">
                <button className="dados-login" type="submit"> &nbsp; Ativar</button>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>

  );
}