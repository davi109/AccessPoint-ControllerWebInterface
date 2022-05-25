import React from 'react';
import api from '../../services/api';
import Loading from '../Loading';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaSyncAlt } from 'react-icons/fa'
import { Modal, Button } from 'react-bootstrap'
import { Context } from '../../Context/AuthContext';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Input } from 'semantic-ui-react'

import './styles.css';

import { Menu } from '../../global.js';

import { useState, useEffect } from 'react';

import 'semantic-ui-css/semantic.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function GerenciarGrupo() {

	const { aviso } = React.useContext(Context);
	const [filter, setFilter] = useState('')
	const [status, setStatus] = useState('Todos')
	const [groups, setGroups] = useState([])
	const [carregando, setCarregando] = useState(false)
	const [totalG, settotalG] = useState([])

	const [count, setCount] = useState({
		prev: 0,
		next: 10
	})

	const [foundG, setfoundG] = useState([])

	const [hasMore, setHasMore] = useState(true);
	const [current, setCurrent] = useState(foundG.slice(count.prev, count.next))
	const [modalShow, setModalShow] = useState(false)

	const getMoreData = () => {

		if (current.length === foundG.length) {
			setHasMore(false);
			return;
		}

		if (current.length > 0) {
			setTimeout(() => {
				setCurrent(current.concat(foundG.slice(count.prev + 10, count.next + 10)))
			}, 500)
			setCount((prevState) => ({ prev: prevState.prev + 10, next: prevState.next + 10 }))
		}

	}

	useEffect(() => {
		handleRefresh()
	}, [])

	useEffect(() => {
		settotalG(foundG.length)
	}, [foundG])

	useEffect(() => {

		function inicial() {

			var keyword = filter

			setfoundG([])
			setCurrent([].slice(0, 10))

			var filteredG
			if (status !== "Todos") {
				filteredG = groups.filter(cc => groups.status == status)
			} else {
				filteredG = groups
			}

			if (keyword !== '') {

				const results = groups.filter((group) => {
					return (group.ssid.toLowerCase().includes(keyword.toLowerCase()) || group.description.toLowerCase().includes(keyword.toLowerCase()));
				});

				setHasMore(true)
				setfoundG(results);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(results.slice(0, 10))
				}, 0)


			} else {

				setHasMore(true)
				setfoundG(filteredG);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(filteredG.slice(0, 10))
				}, 0)

			}

		}

		inicial()


	}, [groups, status, filter])

	const handleRefresh = async () => {

		setCarregando(true)
		try {

			var data1, data2, data3

			await Promise.all([
				api.get('group'),
				api.get('ap'),
				api.get('ca')
			]).then(response => {
				data1 = response[0].data.resultado
				data2 = response[1].data.resultado
				data3 = response[2].data.resultado
			})


			for (var i = 0; i < data1.length; i++) {
				var count_aps
				count_aps = data2.filter(item => item.fk_group_id == data1[i].id)
				var count_clients = []
				count_aps.forEach(item => {
					count_clients = count_clients.concat(data3.filter(item2 => item2.fk_ap_id == item.id))
				})
				data1[i].count_aps = count_aps.length
				data1[i].count_clients = count_clients.length
			}

			setGroups(data1)

		} catch (error) {
			console.log(error)
			aviso('error', error)
		} finally {
			setCarregando(false)
		}

	}

	const handleDeleteGroup = (id) => {
		try {
			api.delete('group/' + id).then(() => {
				aviso("success", "Cliente deletado com sucesso")
				setGroups(groups.filter(item => item.id !== id))
			})
		} catch (error) {
			aviso("error", error)
		}
	}

	const handleEdit = (id) => {
		sessionStorage.setItem("GroupId", id)
		setModalShow(true)
	}


	return (
		<>
			<ReactTooltip place="top" effect="solid" />
			<CadastrarGrupo backdrop="static" show={modalShow} onHide={() => { setModalShow(false); handleRefresh(); sessionStorage.removeItem('GroupId') }} />

			<Menu />
			<div className="basic-content">

				<div className="titulo">
					<h1>Gerenciar grupos</h1>
				</div>

				<div className="group-box">

					<div style={{ marginLeft: "-25px", marginTop: "-10px" }}>
						<FaSyncAlt data-tip="Recarregar" className="group-icon-refresh" onClick={handleRefresh} />
					</div>

					<div className="group-P">

						<div className="group-p1">
							<label>Filtro</label>
							<Input fluid size='small' value={filter} icon='search' placeholder='Pesquise...' onChange={e => { setFilter(e.target.value) }} />
						</div>

						<div className="group-buttons">
							<button onClick={() => setModalShow(true)}>Cadastrar novo Grupo</button>
						</div>

					</div>

					<div id="scrollableDiv" className="group-ListBox">

						<InfiniteScroll
							dataLength={current.length}
							next={getMoreData}
							hasMore={hasMore}
							scrollableTarget="scrollableDiv"
						>

							{current.map((group) => (
								<div key={group.id} className="group-ListItem">
									<ReactTooltip id={toString(group.id)} place="top" effect="solid"></ReactTooltip>
									<div className="group-item">
										<div className="group-item-I">

											<div className="group-item-1">
												<a>Descrição: {group.description}</a>
												<a>SSID: {group.ssid}</a>
											</div>
											<div className="group-item-2">
												<a>Tipo de Criptografia: {group.type_password === 'wpa2'? 'WPA2-Enterprise' : 'WPA2-PSK'}</a>
												<a>Modo de seleção de canal: {group.channel_mode}</a>
											</div>

											<div className="group-item-2">
												<a>APs vinculados: {group.count_aps}</a>
												<a>Clientes conectados: {group.count_clients}</a>
											</div>

											<div className="group-item-icons">
												<i><FiEdit data-tip="Editar" data-for={toString(group.id)} className='group-edit' onClick={() => handleEdit(group.id)} /></i>
												<i><FiTrash2 data-tip="Excluir" data-for={toString(group.id)} className='group-trash'
													onClick={() => {
														const r = window.confirm('Tem certeza que deseja deletar esse registro?')
														if (r === true)
															handleDeleteGroup(group.id)
													}} /></i>
											</div>
										</div>
									</div>
								</div>

							))}

						</InfiniteScroll>
					</div>
					Total: {foundG.length}
				</div>

				<Loading loading={carregando} message='Carregando...' />



			</div>
		</>
	);
}

function CadastrarGrupo(props) {

	const { aviso } = React.useContext(Context);
	const [carregando, setCarregando] = useState(false)
	const [id, setId] = useState('')
	const [ssid2, setSsid2] = useState('')
	const [typeP2, setTypeP2] = useState('default')
	const [password2, setPassword2] = useState('')
	const [wpa2S2, setWpa2S2] = useState('')
	const [channelMode2, setChannelMode2] = useState('auto')
	const [desc, setDesc] = useState('')
	const [aps2, setAps2] = useState([])

	useEffect(() => {

		async function initial() {
			try {
				if (props.show == true) {

					setCarregando(true)
					setTypeP2('default')
					setChannelMode2('auto')
					setDesc("")
					setSsid2("")
					setPassword2("")
					setWpa2S2("")

					var grupo = sessionStorage.getItem('GroupId')
					console.log(grupo)
					setId(grupo)

					if (grupo !== null && grupo !== '') {

						try {

							setCarregando(true)
							await Promise.all([
								api.get('group'),
								api.get('ap')
							]).then(response => {
								var data = response[0].data.resultado.filter(item => item.id == grupo)[0]
								setDesc(data.description)
								setSsid2(data.ssid)
								setTypeP2(data.type_password)
								setWpa2S2(data.wpa2_server)
								setPassword2(data.password)
								setChannelMode2(data.channel_mode)
								setAps2(response[1].data.resultado)
							})

						} catch (error) {
							console.log(error)
							aviso('error', error)
						} finally {
							setCarregando(false)
						}

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

		if (password2.length < 8) {
			aviso("error", "Senha inválida", true)
			ok = false
		}

		if (ssid2 == "") {
			aviso("warning", "Campo SSID obrigatório")
			ok = false
		}

		if (typeP2 == 'wpa2' && wpa2S2 == "") {
			aviso("warning", "Campo Servidor Radius obrigatório")
			ok = false
		}

		if (ok) {

			var data = {
				description: desc,
				ssid: ssid2,
				password: password2,
				type_password: typeP2,
				channel_mode: channelMode2
			}

			if (typeP2 == "wpa2") {
				data.wpa2_server = wpa2S2
			}

			try {

				if (id !== null && id !== '') {
					console.log(id)
					var lista = []
					aps2.forEach(item => {
						if (item.fk_group_id == id) {
							lista.push(item.id)
						}
					})

					await api.put('group/' + id, data)
					if(lista.length > 0){
						await api.put('ap/' + lista, data)
					}
					

				} else {
					await api.post('group', data)
				}

				aviso("success", "Grupo atualizado com sucesso")

				setTypeP2('default')
				setChannelMode2('auto')
				setDesc("")
				setSsid2("")
				setPassword2("")
				setWpa2S2("")
				
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
					{id == null || id == ''? "Cadastrar Grupo" : "Atualizar Grupo"}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Loading loading={carregando} message='Carregando...' />
				<div>
					
					<div className='modal1-items'>

						<div className="modal1-item2">
							<label>Descrição</label>
							<Input type="text" value={desc} onChange={e => setDesc(e.target.value)} />
						</div>
						<div className="modal1-item2">
							<label>SSID</label>
							<Input type="text" value={ssid2} onChange={e => setSsid2(e.target.value)} />
						</div>
						<div className='modal1-item2'>
							<label>Tipo de Criptografia</label>
							<select className="ap-select" value={typeP2} onChange={e => setTypeP2(e.target.value)}>
								<option value={"default"}>WPA2-PSK</option>
								<option value={"wpa2"}>WPA2-Enterprise</option>
							</select>
						</div>

					</div>
					<div className='modal2-items'>

						<div className='modal2-item3'>
							<label>Senha</label>
							<Input type="text" value={password2} onChange={e => setPassword2(e.target.value)} />
						</div>
						{typeP2 == 'wpa2' ?
							<div className='modal2-item4'>
								<label>Servidor Radius</label>
								<Input type="text" value={wpa2S2} onChange={e => setWpa2S2(e.target.value)} />
							</div>
							:
							null
						}
						<div className='modal2-item5'>
							<label>Modo de seleção de canal</label>
							<select className="ap-select" value={channelMode2} onChange={e => setChannelMode2(e.target.value)}>
								<option value={"auto"}>Automático</option>
								<option value={"manual"}>Manual</option>
							</select>
						</div>
					</div>

				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={handleControle}>{id == null || id == ''? "Cadastrar" : "Atualizar"}</Button>
				<Button onClick={props.onHide}>Fechar</Button>
			</Modal.Footer>
		</Modal>
	);
}