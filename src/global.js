import React, { useContext } from 'react';
import { FiMenu, FiUser, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom'; //usado para linkar outras paginas.
import { Context } from './Context/AuthContext';
import { useHistory } from 'react-router-dom';

import './global.css';

import logoImg from './assets/logo.png';


export function Menu() {

	const { handleLogout, Authenticated } = useContext(Context);

	const history = useHistory();

	function fazerLogout() {
		handleLogout();
		history.push('/login')
	}


	return (
		<>
			<div className="navbar">
				<div className="menuIcon">
					<i onClick={HideRigth}><FiMenu /></i>
				</div>

				<img src={logoImg} alt="Controller" />

				<div className="userIcon">
					<i onClick={HideUserLeft}><FiUser /></i>
				</div>
			</div>


			<div className="box-menu-lateral" id="sidemenu">

				<div className="back-icon" >
					<i onClick={HideLeft}><FiArrowLeft /></i>
				</div>

				<div className="sidemenu-list">

					<Link style={{textDecoration:"none"}} disabled={!Authenticated} to="/main">
						<div className="sidemenu-item">
							<h3>Principal</h3>
						</div>
					</Link>

					<Link style={{textDecoration:"none"}} disabled={!Authenticated} to="/groups">
						<div className="sidemenu-item">
							<h3>Grupos</h3>
						</div>
					</Link>

					<Link style={{textDecoration:"none"}} disabled={!Authenticated} to="/clients">
						<div className="sidemenu-item">
							<h3>Clientes conectados</h3>
						</div>
					</Link>

					<Link style={{textDecoration:"none"}} disabled={!Authenticated} to="/users">
						<div className="sidemenu-item">
							<h3>Usuários</h3>
						</div>
					</Link>

				</div>

			</div>


			<div className="box-menu-user" id="sidemenu-user">
				<div className="back-icon-user" >
					<i onClick={HideUserRigth}><FiArrowRight /></i>
				</div>
				<div className="sidemenu-list">
					<Link style={{textDecoration:"none"}} to='/perfil'>
						<div className="sidemenu-item">
							<h3>Meus dados</h3>
						</div>
					</Link>
					<div onClick={fazerLogout} className="sidemenu-item">
						<h3 >Sair</h3>
					</div>
				</div>
			</div>

			{/* Fim do Menu Lateral */}
		</>
	);
}

function HideLeft() {
	document.getElementById('sidemenu').style.marginLeft = '-200%'
}

function HideRigth() {
	document.getElementById('sidemenu').style.marginLeft = '0%'
}

function HideUserRigth() {
	document.getElementById('sidemenu-user').style.marginRight = '-200%'
}

function HideUserLeft() {
	document.getElementById('sidemenu-user').style.marginRight = '0%'
}







