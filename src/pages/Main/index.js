import React from 'react';
import api from '../../services/api';
import Loading from '../Loading';
import { Modal, Button } from 'react-bootstrap'
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { MdRefresh } from 'react-icons/md'
import { FaSyncAlt } from 'react-icons/fa'
import { Context } from '../../Context/AuthContext';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Input } from 'semantic-ui-react'

import './styles.css';

import { Menu } from '../../global.js';

import { useState, useEffect } from 'react';


import 'semantic-ui-css/semantic.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function GerenciarAps() {

	const { aviso } = React.useContext(Context);

	const [modalShow, setModalShow] = useState(false);
	const [modalShow2, setModalShow2] = useState(false)
	const [filter, setFilter] = useState('')
	const [status, setStatus] = useState('Todos')
	const [group, setGroup] = useState(-1)
	const [aps, setAp] = useState([])
	const [carregando, setCarregando] = useState(false)
	const [optionsSearch, setOptionsSearch] = useState([])
	const [totalAp, setTotalAp] = useState([])

	const [count, setCount] = useState({
		prev: 0,
		next: 10
	})

	const [foundAp, setFoundAp] = useState([])

	const [hasMore, setHasMore] = useState(true);
	const [current, setCurrent] = useState(foundAp.slice(count.prev, count.next))

	const getMoreData = () => {

		if (current.length === foundAp.length) {
			setHasMore(false);
			return;
		}

		if (current.length > 0) {
			setTimeout(() => {
				setCurrent(current.concat(foundAp.slice(count.prev + 10, count.next + 10)))
			}, 500)
			setCount((prevState) => ({ prev: prevState.prev + 10, next: prevState.next + 10 }))
		}

	}

	useEffect(() => {
		handleRefresh()
	}, [])

	useEffect(() => {
		setTotalAp(foundAp.length)
	}, [foundAp])

	useEffect(() => {

		function inicial() {

			var keyword = filter

			setFoundAp([])
			setCurrent([].slice(0, 10))

			var filteredAps
			if (status !== "Todos") {
				filteredAps = aps.filter(ap => ap.status == status)
			} else {
				filteredAps = aps
			}

			var filteredAps2
			if (parseInt(group) !== -1) {
				filteredAps2 = filteredAps.filter(ap => ap.fk_group_id == parseInt(group))
			} else {
				filteredAps2 = filteredAps
			}

			if (keyword !== '') {

				const results = aps.filter((ap) => {
					return (ap.mac.toLowerCase().includes(keyword.toLowerCase()) || ap.description.toLowerCase().includes(keyword.toLowerCase()) || ap.ssid.toLowerCase().includes(keyword.toLowerCase()) || ap.ipv4.toLowerCase().includes(keyword.toLowerCase()) || ap.ipv6.toLowerCase().includes(keyword.toLowerCase()));
				});

				setHasMore(true)
				setFoundAp(results);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(results.slice(0, 10))
				}, 0)


			} else {

				setHasMore(true)
				setFoundAp(filteredAps2);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(filteredAps2.slice(0, 10))
				}, 0)

			}

		}

		inicial()


	}, [aps, status, group, filter])

	const handleRefresh = async () => {

		setCarregando(true)
		try {

			await Promise.all([
				api.get('ap'),
				api.get('group')
			]).then(response => {
				var aux = []
				aux.push({ id: -1, description: "Todos" })
				response[1].data.resultado.forEach(item => {
					aux.push(item)
				})
				setOptionsSearch(aux)
				setAp(response[0].data.resultado)
			})

		} catch (error) {
			console.log(error)
			aviso('error', error)
		} finally {
			setCarregando(false)
		}

	}

	const handleApReboot = (id) => {
		try {
			api.put('ap/' + id, { "reboot": true }).then(() => {
				aviso("success", "Comando enviado com sucesso")
				handleRefresh()
			})
		} catch (error) {
			aviso("error", error)
		}
	}

	const handleDeleteAp = (id) => {
		try {
			api.delete('ap/' + id).then(() => {
				aviso("success", "AP deletado com sucesso")
				handleRefresh()
			})
		} catch (error) {
			aviso("error", error)
		}
	}

	const handleEdit = (id) => {
		sessionStorage.setItem("ApId", id)
		setModalShow(true)
	}


	return (
		<>
			<ReactTooltip place="top" effect="solid" />

			<Menu />
			<CadastrarAP backdrop="static" show={modalShow} onHide={() => { setModalShow(false); handleRefresh(); sessionStorage.removeItem('ApId') }} />
			<ChangeMany backdrop="static" show={modalShow2} onHide={() => { setModalShow2(false); handleRefresh() }} />
			<div className="basic-content">

				<div className="titulo">
					<h1>Access Points</h1>
				</div>

				<div className="ap-box">

					<div style={{ marginLeft: "-25px", marginTop: "-10px" }}>
						<FaSyncAlt data-tip="Recarregar" className="ap-icon-refresh" onClick={handleRefresh} />
					</div>

					<div className="ap-P">

						<div className="ap-p1">
							<label>Filtro</label>
							<Input fluid size='small' value={filter} icon='search' placeholder='Pesquise...' onChange={e => { setFilter(e.target.value) }} />
						</div>

						<div className="ap-p2">
							<div className="ap-p3">
								<label>Status</label>
								<select className="ap-select" placeholder="Status" value={status} onChange={e => { setStatus(e.target.value) }}>
									<option value="Todos">Todos</option>
									<option value="online">Online</option>
									<option value="offline">Offline</option>
								</select>
							</div>

							<div className="ap-p3">
								<label>Grupo</label>
								<select className="ap-select" value={group} onChange={e => { setGroup(e.target.value) }}>
									{optionsSearch.map((group) => (
										<option key={group.id} value={group.id}>{group.description}</option>
									))}
								</select>
							</div>
						</div>
						<div className="ap-buttons">
							<button onClick={() => setModalShow(true)}>Cadastrar novo AP</button>
							<button onClick={() => setModalShow2(true)}>Alterar vários APs</button>
						</div>
					</div>

					<div id="scrollableDiv" className="ap-ListBox">

						<InfiniteScroll
							dataLength={current.length}
							next={getMoreData}
							hasMore={hasMore}
							scrollableTarget="scrollableDiv"
						>

							{current.map((ap) => (
								<div key={ap.id} className="ap-ListItem">
									<ReactTooltip id={toString(ap.id)} place="top" effect="solid"></ReactTooltip>
									<div className="ap-item">
										<div className="ap-item-I">
											<div className="ap-item-1">
												<a><div data-tip={ap.reboot && ap.status == "online" ? "Reiniciando" : ap.status} data-for={toString(ap.id)} className={ap.reboot && ap.status == "online" ? "rebooting" : ap.status} />&nbsp;&nbsp;MAC: {ap.mac}</a>
												<a>Status: {ap.status}</a>
											</div>
											<div className="ap-item-2">
												<a>IPv4: {ap.ipv4}</a>
												<a>Ipv6: {ap.ipv6}</a>
											</div>
											<div className="ap-item-1">
												<a>SSID: {ap.ssid}</a>
												<a>Criptografia: {ap.type_password === 'wpa2'? 'WPA2-Enterprise' : 'WPA2-PSK'}</a>
											</div>
											<div className="ap-item-2">
												<a>Canal: {ap.channel}</a>
												<a>Modo de seleção: {ap.channel_mode}</a>
											</div>
											<div className="ap-item-1">
												{console.log(optionsSearch)}
												<a>Grupo: {ap.fk_group_id == null ? "Nenhum" : optionsSearch.filter(item => item.id == ap.fk_group_id)[0].description}</a>
												<a>Clientes conectados: {ap.n_connected_clients}</a>
											</div>

											<div className="ap-item-icons">
												<i><FiEdit data-tip="Editar" data-for={toString(ap.id)} className='ap-edit' onClick={() => handleEdit(ap.id)} /></i>
												<i><FiTrash2 data-tip="Excluir" data-for={toString(ap.id)} className='ap-trash'
													onClick={() => {
														const r = window.confirm('Tem certeza que deseja deletar esse registro?')
														if (r === true)
															handleDeleteAp(ap.id)
													}} /></i>
												<i><MdRefresh data-tip="Reiniciar AP" data-for={toString(ap.id)} className='ap-reset' onClick={() => handleApReboot(ap.id)} /></i>
											</div>
										</div>
										<div className="ap-item-II">
											<a>Descrição: {ap.description}</a>
										</div>
									</div>
								</div>

							))}

						</InfiniteScroll>
					</div>
					Total: {foundAp.length}
				</div>

				<Loading loading={carregando} message='Carregando...' />



			</div>
		</>
	);
}


function CadastrarAP(props) {

	const { aviso } = React.useContext(Context);
	const [carregando, setCarregando] = useState(false)
	const [mac2, setMac2] = useState('')
	const [desc2, setDesc2] = useState('')
	const [optionsSearch2, setOptionsSearch2] = useState([])
	const [group2, setGroup2] = useState(-1)
	const [ssid2, setSsid2] = useState('')
	const [typeP2, setTypeP2] = useState('default')
	const [password2, setPassword2] = useState('')
	const [wpa2S2, setWpa2S2] = useState('')
	const [channelMode2, setChannelMode2] = useState('auto')
	const [channel2, setChannel2] = useState(1)
	const [id, setId] = useState('')

	useEffect(() => {

		async function initial() {
			try {
				if (props.show == true) {
					setCarregando(true)
					var ap_id = sessionStorage.getItem('ApId')
					setId(ap_id)
					setTypeP2('default')
					setChannelMode2('auto')
					setChannel2(1)
					setGroup2(-1)
					if (ap_id !== null) {
						await api.get('ap').then(response => {

							var data = response.data.resultado.filter(item => item.id == ap_id)[0]
							setMac2(data.mac)
							setDesc2(data.description)
							setSsid2(data.ssid)
							if (data.fk_group_id === null) {
								setGroup2(-1)
							} else {
								setGroup2(data.fk_group_id)
							}
							setPassword2(data.password)
							setTypeP2(data.type_password)
							setWpa2S2(data.wpa2_server)
							setChannel2(data.channel)
							setChannelMode2(data.channel_mode)
						})
					}

					await api.get('group').then(response => {
						var aux = []
						aux.push({ id: -1, description: "Nenhum" })
						response.data.resultado.forEach(item => {
							aux.push(item)
						})
						setOptionsSearch2(aux)
					})
				}
			} catch (error) {
				aviso("error", error)
			} finally {
				setCarregando(false)
			}


		} initial()

	}, [props.show])

	const handleGroup = (e) => {
		if (e.target.value == -1) {
			setGroup2(e.target.value)
			setSsid2("")
			setTypeP2("")
			setPassword2("")
			setWpa2S2("")
			setChannelMode2("")
		} else {
			var g = optionsSearch2.filter(item => item.id == e.target.value)[0]
			setSsid2(g.ssid)
			setTypeP2(g.type_password)
			setPassword2(g.password)
			setWpa2S2(g.wpa2_server)
			setChannelMode2(g.channel_mode)
			setGroup2(g.id)
		}
	}

	function validateMac(mac) {
		var new_mac = mac.toUpperCase()
		var regex = /^[0-9a-f]{1,2}([.:-])[0-9a-f]{1,2}(?:\1[0-9a-f]{1,2}){4}$/i
		if (regex.test(new_mac)) {
			return true;
		}
		else {
			return false;
		}
	}

	const handleControle = async (e) => {

		var ok = true
		console.log(mac2)
		if (!validateMac(mac2)) {
			aviso("error", "Mac inválido", true)
			ok = false
		}

		if (password2.length < 8) {
			aviso("error", "Senha inválida", true)
			ok = false
		}

		if (desc2 == "") {
			aviso("warning", "Campo descrição obrigatório")
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
				mac: mac2.toUpperCase(),
				description: desc2,
				ssid: ssid2,
				password: password2,
				type_password: typeP2,
				channel_mode: channelMode2
			}

			if (channelMode2 == "manual") {
				data.channel = channel2
			}

			if (typeP2 == "wpa2") {
				data.wpa2_server = wpa2S2
			}

			if (parseInt(group2) == -1) {
				data.fk_group_id = null
			}else{
				data.fk_group_id = group2
			}

			try {
				if (id !== null && id !== '') {
					await api.put('ap/' + id, data)
					aviso("success", "Ap atualizado com sucesso")
				} else {
					await api.post('ap', data)
					aviso("success", "AP cadastrado com sucesso")
				}
				setMac2("")
				setDesc2("")
				setSsid2("")
				setTypeP2("")
				setPassword2("")
				setWpa2S2("")
				setChannelMode2("")
				setGroup2(-1)
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
					{id !== null && id !== '' ? "Atualizar AP" : "Cadastrar novo AP"}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Loading loading={carregando} message='Carregando...' />
				<div>
					<div className='modal1-items'>
						<div className="modal-item1">
							<label>MAC</label>
							<Input type="text" value={mac2} onChange={e => setMac2(e.target.value)} />
						</div>
						<div className="modal-item2">
							<label>Descrição</label>
							<Input type="text" value={desc2} onChange={e => setDesc2(e.target.value)} />
						</div>
						<div className="modal-item3">
							<label>Grupo</label>
							<select className="ap-select" value={group2} onChange={e => handleGroup(e)}>
								{optionsSearch2.map((group) => (
									<option key={group.id} value={group.id}>{group.description}</option>
								))}
							</select>
						</div>

					</div>
					<div style={{ display: "grid" }}>
						<div className='modal2-items'>
							<div className='modal2-item1'>
								<label>SSID</label>
								<Input type="text" value={ssid2} onChange={e => setSsid2(e.target.value)} />
							</div>
							<div className='modal2-item2'>
								<label>Tipo de Criptografia</label>
								<select className="ap-select" value={typeP2} onChange={e => setTypeP2(e.target.value)}>
									<option value={"default"}>WPA2-PSK</option>
									<option value={"wpa2"}>WPA2-Enterprise</option>
								</select>
							</div>
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
						</div>
						<div className='modal3-items'>
							<div className='modal2-item5'>
								<label>Modo de seleção de canal</label>
								<select className="ap-select" value={channelMode2} onChange={e => setChannelMode2(e.target.value)}>
									<option value={"auto"}>Automático</option>
									<option value={"manual"}>Manual</option>
								</select>
							</div>
							{channelMode2 == "manual" ?
								<div className='modal2-item6'>
									<label>Canal</label>
									<select className="ap-select" value={channel2} onChange={e => setChannel2(e.target.value)}>
										<option value={1}>1</option>
										<option value={2}>2</option>
										<option value={3}>3</option>
										<option value={4}>4</option>
										<option value={5}>5</option>
										<option value={6}>6</option>
										<option value={7}>7</option>
										<option value={8}>8</option>
										<option value={9}>9</option>
										<option value={10}>10</option>
										<option value={11}>11</option>
									</select>
								</div>
								:
								null
							}
						</div>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={handleControle}>{id !== null && id !== '' ? "Salvar" : "Cadastrar"}</Button>
				<Button onClick={props.onHide}>Fechar</Button>
			</Modal.Footer>
		</Modal>
	);
}

function ChangeMany(props) {

	const { aviso } = React.useContext(Context);
	const [carregando, setCarregando] = useState(false)
	const [optionsSearch3, setOptionsSearch3] = useState([])
	const [group3, setGroup3] = useState("")
	const [ssid3, setSsid3] = useState('')
	const [typeP3, setTypeP3] = useState('default')
	const [password3, setPassword3] = useState('')
	const [wpa2S3, setWpa2S3] = useState('')
	const [channelMode3, setChannelMode3] = useState('auto')
	const [aps3, setAps3] = useState([])

	useEffect(() => {

		async function initial() {
			try {
				if (props.show == true) {

					setCarregando(true)
					setTypeP3('default')
					setChannelMode3('auto')
					setGroup3("")

					await api.get('ap').then(response => {
						setAps3(response.data.resultado)
					})

					await api.get('group').then(response => {
						setOptionsSearch3(response.data.resultado)
					})

				}
			} catch (error) {
				aviso("error", error)
			} finally {
				setCarregando(false)
			}


		} initial()

	}, [props.show])

	const handleGroup = (e) => {
		setGroup3(e.target.value)
	}

	const handleControle = async (e) => {

		var ok = true

		if (password3.length < 8) {
			aviso("error", "Senha inválida", true)
			ok = false
		}

		if (ssid3 == "") {
			aviso("warning", "Campo SSID obrigatório")
			ok = false
		}

		if (typeP3 == 'wpa2' && wpa2S3 == "") {
			aviso("warning", "Campo Servidor Radius obrigatório")
			ok = false
		}

		if (ok) {

			var lista = []
			aps3.forEach(item => {
				if (item.fk_group_id == group3) {
					lista.push(item.id)
				}
			})

			var data = {
				ssid: ssid3,
				password: password3,
				type_password: typeP3,
				channel_mode: channelMode3
			}

			if (typeP3 == "wpa2") {
				data.wpa2_server = wpa2S3
			}

			try {

				await api.put('ap/' + lista, data)
				await api.put('group/'+ group3, data)
				aviso("success", "Aps atualizados com sucesso")


				setSsid3("")
				setTypeP3("")
				setPassword3("")
				setWpa2S3("")
				setChannelMode3("")
				setGroup3("")
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
					Atualizar vários Aps
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Loading loading={carregando} message='Carregando...' />
				<div>
					<div className='modal1-items'>
						<div style={{width:'100%'}}>
							<label>Grupo</label>
							<select className="ap-select" value={group3} onChange={e => handleGroup(e)}>
								<option key={-1} value="" disabled>Selecione</option>
								{optionsSearch3.map((group) => (
									<option key={group.id} value={group.id}>{group.description}</option>
								))}
							</select>
						</div>
					</div>
					{group3 !== '' ?
						<>
							<div className='modal2-items'>
								<div className="modal-item2">
									<label>SSID</label>
									<Input type="text" value={ssid3} onChange={e => setSsid3(e.target.value)} />
								</div>
								<div className='modal2-item2'>
									<label>Tipo de Criptografia</label>
									<select className="ap-select" value={typeP3} onChange={e => setTypeP3(e.target.value)}>
										<option value={"default"}>Default</option>
										<option value={"wpa2"}>WPA2</option>
									</select>
								</div>
								<div className='modal2-item3'>
									<label>Senha</label>
									<Input type="text" value={password3} onChange={e => setPassword3(e.target.value)} />
								</div>
								{typeP3 == 'wpa2' ?
									<div className='modal2-item4'>
										<label>Servidor Radius</label>
										<Input type="text" value={wpa2S3} onChange={e => setWpa2S3(e.target.value)} />
									</div>
									:
									null
								}
							</div>
							<div className='modal3-items'>
								<div className='modal2-item5'>
									<label>Modo de seleção de canal</label>
									<select className="ap-select" value={channelMode3} onChange={e => setChannelMode3(e.target.value)}>
										<option value={"auto"}>Automático</option>
										<option value={"manual"}>Manual</option>
									</select>
								</div>
							</div>

						</>
						:
						null
					}

				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={handleControle}>Atualizar</Button>
				<Button onClick={props.onHide}>Fechar</Button>
			</Modal.Footer>
		</Modal>
	);
}

