import React from 'react';
import api from '../../services/api';
import Loading from '../Loading';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaAllergies, FaSyncAlt } from 'react-icons/fa'
import { Context } from '../../Context/AuthContext';
import { RiUserFill } from 'react-icons/ri'
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Input, Checkbox } from 'semantic-ui-react'
import { Modal, Button } from 'react-bootstrap'


import './styles.css';

import { Menu } from '../../global.js';

import { useState, useEffect } from 'react';

import 'semantic-ui-css/semantic.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function GerenciarUsuarios() {

	const { aviso } = React.useContext(Context);
	const [filter, setFilter] = useState('')
	const [permission, setPermission] = useState('Todos')
	const [users, setUsers] = useState([])
	const [carregando, setCarregando] = useState(false)
	const [totalUsers, setTotalUsers] = useState([])

	const [count, setCount] = useState({
		prev: 0,
		next: 10
	})

	const [foundUsers, setFoundUsers] = useState([])

	const [hasMore, setHasMore] = useState(true);
	const [current, setCurrent] = useState(foundUsers.slice(count.prev, count.next))
	const [modalShow, setModalShow] = useState(false)

	const getMoreData = () => {

		if (current.length === foundUsers.length) {
			setHasMore(false);
			return;
		}

		if (current.length > 0) {
			setTimeout(() => {
				setCurrent(current.concat(foundUsers.slice(count.prev + 10, count.next + 10)))
			}, 500)
			setCount((prevState) => ({ prev: prevState.prev + 10, next: prevState.next + 10 }))
		}

	}

	useEffect(() => {
		handleRefresh()
	}, [])

	useEffect(() => {
		setTotalUsers(foundUsers.length)
	}, [foundUsers])

	useEffect(() => {

		function inicial() {

			var keyword = filter

			setFoundUsers([])
			setCurrent([].slice(0, 10))

			var filteredUsers
			if (permission == "Todos") {
				filteredUsers = users
			} else if (permission == "Admins") {
				filteredUsers = users.filter(item => item.permission == 0)
			} else {
				filteredUsers = users.filter(item => item.permission == 1)
			}

			if (keyword !== '') {

				const results = users.filter((user) => {
					return (user.name.toLowerCase().includes(keyword.toLowerCase()) || user.login.toLowerCase().includes(keyword.toLowerCase()));
				});

				setHasMore(true)
				setFoundUsers(results);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(results.slice(0, 10))
				}, 0)


			} else {

				setHasMore(true)
				setFoundUsers(filteredUsers);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(filteredUsers.slice(0, 10))
				}, 0)

			}

		}

		inicial()


	}, [users, permission, filter])

	const handleRefresh = async () => {

		setCarregando(true)
		try {

			await api.get('user').then(response => {
				setUsers(response.data.resultado)
			})

		} catch (error) {
			console.log(error)
			aviso('error', error)
		} finally {
			setCarregando(false)
		}

	}

	const handleDeleteUser = (id) => {

			api.delete('user/' + id).then(() => {
				aviso("success", "Usuário deletado com sucesso")
				setUsers(users.filter(item => item.id !== id))
			}).catch(error => {
				aviso('error',error.response.data.mensagem, true)
			})

	}

	const handleEdit = (id) => {
		sessionStorage.setItem("UserId", id)
		setModalShow(true)
	}


	return (
		<>
			<ReactTooltip place="top" effect="solid" />
			<CadastrarUser backdrop="static" show={modalShow} onHide={() => { setModalShow(false); handleRefresh(); sessionStorage.removeItem('UserId'); sessionStorage.removeItem('lastAdmin') }} />

			<Menu />
			<div className="basic-content">

				<div className="titulo">
					<h1>Gerenciar usuários</h1>
				</div>

				<div className="users-box">

					<div style={{ marginLeft: "-25px", marginTop: "-10px" }}>
						<FaSyncAlt data-tip="Recarregar" className="users-icon-refresh" onClick={handleRefresh} />
					</div>

					<div className="users-P">

						<div className="users-p1">
							<label>Filtro</label>
							<Input fluid size='small' value={filter} icon='search' placeholder='Pesquise...' onChange={e => { setFilter(e.target.value) }} />
						</div>

						<div className="users-p2">
							<label>Permissão</label>
							<select className="users-select" placeholder="Permissão" value={permission} onChange={e => { setPermission(e.target.value) }}>
								<option value="Todos">Todos</option>
								<option value="Admins">Administradores</option>
								<option value="Normal">Normal</option>
							</select>
						</div>

						<div className="users-buttons">
							<button onClick={() => setModalShow(true)}>Cadastrar novo usuário</button>
						</div>

					</div>

					<div id="scrollableDiv" className="users-ListBox">

						<InfiniteScroll
							dataLength={current.length}
							next={getMoreData}
							hasMore={hasMore}
							scrollableTarget="scrollableDiv"
						>

							{current.map((user) => (
								<div key={user.id} className="users-ListItem">
									<ReactTooltip id={toString(user.id)} place="top" effect="solid"></ReactTooltip>
									<div className="users-item">
										<div className="users-item-I">
											<div className="users-item-1">
												<a><RiUserFill/> {user.name}</a>
											</div>
											<div className="users-item-2">
												<a>Login: {user.login}</a>
											</div>
											<div className="users-item-1">
												<a>Permissão: {user.permission === 0 ? "Administrador" : "Normal"}</a>
											</div>

											<div className="users-item-icons">
												<i><FiEdit data-tip="Editar" data-for={toString(user.id)} className='users-edit' onClick={() => handleEdit(user.id)} /></i>
												<i><FiTrash2 data-tip="Excluir" data-for={toString(user.id)} className='users-trash'
													onClick={() => {
														const r = window.confirm('Tem certeza que deseja deletar esse registro?')
														if (r === true)
															handleDeleteUser(user.id)
													}} /></i>
											</div>
										</div>
									</div>
								</div>

							))}

						</InfiniteScroll>
					</div>
					Total: {foundUsers.length}
				</div>

				<Loading loading={carregando} message='Carregando...' />

			</div>
		</>
	);
}

function CadastrarUser(props) {

	const { aviso } = React.useContext(Context);
	const [carregando, setCarregando] = useState(false)
	const [name, setName] = useState('')
	const [login, setLogin] = useState('')
	const [permission, setPermission] = useState(1)
	const [password, setPassword] = useState('')
	const [password2, setPassword2] = useState('')
	const [changeP, setChangeP] = useState(false)

	const [id, setId] = useState('')

	useEffect(() => {

		async function initial() {
			try {
				if (props.show == true) {
					setCarregando(true)
					var user_id = sessionStorage.getItem('UserId')
					setId(user_id)
					setName('')
					setLogin('')
					setPermission(1)
					setChangeP(false)
					setPassword('')
					setPassword2('')

					if (user_id !== null) {

						await api.get('user').then(response => {

							var data = response.data.resultado.filter(item => item.id == user_id)[0]
							setName(data.name)
							setLogin(data.login)
							setPermission(data.permission)
							setPassword2('')
							setPassword('')

						})
					}

				}
			} catch (error) {
				aviso("error", error)
			} finally {
				setCarregando(false)
			}


		} initial()

	}, [props.show])


	const handleControle = async (e) => {

		var ok = true

		if (name == "") {
			aviso("warning", "Campo nome obrigatório")
			ok = false
		}

		if (login == "") {
			aviso("warning", "Campo login obrigatório")
			ok = false
		}

		if ((password == '' || password2 == '') && changeP) {
			aviso('warning', 'Campo senha obrigatório')
			ok = false
		} else {

			if ((password !== password2) && changeP) {
				aviso("warning", "Senhas não conferem")
				ok = false
			}

		}

		if (ok) {

			try {
				if (id !== null) {
					var data

					if(changeP){

						data = {
							name: name,
							login: login,
							permission: permission,
							password: password,
							password2: password2
						}

					}else{

						data = {
							name: name,
							login: login,
							permission: permission,
						}

					}

					await api.put('user/' + id, data)
					aviso("success", "Usuário atualizado com sucesso")
				} else {

					data = {
						name: name,
						login: login,
						permission: permission,
						password: password,
						password2: password2
					}
					
					await api.post('user', data)
					aviso("success", "Usuário cadastrado com sucesso")
				}

				setPermission(1)
				setPassword('')
				setPassword2('')
				setChangeP(false)
				setName('')
				setLogin('')
				props.onHide()
			} catch (error) {

				if (error.response.data.mensagem !== undefined) {
					aviso("error", error.response.data.mensagem, true)
				} else {
					aviso("error", error)
				}
			}

		}

	}

	return (

		<Modal
			{...props}
			size="lg"
			aria-labelledby="contained-modal-title-vcenter"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					{id !== null && id !== '' ? "Atualizar usuário" : "Cadastrar novo usuário"}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Loading loading={carregando} message='Carregando...' />
				<div>
					<div className='modal1-items'>
						<div className="modal-item1">
							<label>Nome</label>
							<Input type="text" value={name} onChange={e => setName(e.target.value)} />
						</div>
						<div className="modal-item2">
							<label>Login</label>
							<Input type="text" value={login} onChange={e => setLogin(e.target.value)} />
						</div>
						<div className="modal-item3">
							<label>Permissão</label>
							<select className="ap-select" value={permission} onChange={e => setPermission(e.target.value)}>
								<option value={0}>Administrador</option>
								<option value={1}>Normal</option>
							</select>
						</div>

					</div>
					{id !== null ?
						<div className='modal2-items'>
							<div className='modal2-item1'>
								<label>Alterar senha?</label>
								<Checkbox toggle onClick={() => setChangeP(!changeP)} />
							</div>
							{changeP ?
								<div style={{ display: 'flex', width: '100%' }}>
									<div className='modal2-item2'>
										<label>Senha</label>
										<Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
									</div>
									<div className='modal2-item3'>
										<label>Confirme a senha</label>
										<Input type="password" value={password2} onChange={e => setPassword2(e.target.value)} />
									</div>
								</div>
								:
								null}
						</div>
						:
						<div className='modal2-items'>
							<div className='modal2-item2'>
								<label>Senha</label>
								<Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
							</div>
							<div className='modal2-item3'>
								<label>Confirme a senha</label>
								<Input type="password" value={password2} onChange={e => setPassword2(e.target.value)} />
							</div>
						</div>
					}

				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={handleControle}>{id !== null && id !== '' ? "Salvar" : "Cadastrar"}</Button>
				<Button onClick={props.onHide}>Fechar</Button>
			</Modal.Footer>
		</Modal>
	);
}
