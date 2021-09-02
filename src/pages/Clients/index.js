import React from 'react';
import api from '../../services/api';
import Loading from '../Loading';
import { FiTrash2} from 'react-icons/fi';
import { ImBlocked } from 'react-icons/im'
import { FaSyncAlt } from 'react-icons/fa'
import { RiUserFill } from 'react-icons/ri'
import { Context } from '../../Context/AuthContext';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Input } from 'semantic-ui-react'

import './styles.css';

import { Menu } from '../../global.js';

import { useState, useEffect } from 'react';

import 'semantic-ui-css/semantic.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function GerenciarClientes() {

	const { aviso } = React.useContext(Context);
	const [filter, setFilter] = useState('')
	const [status, setStatus] = useState('Todos')
	const [cc, setCC] = useState([])
	const [carregando, setCarregando] = useState(false)
	const [totalCC, setTotalCC] = useState([])

	const [count, setCount] = useState({
		prev: 0,
		next: 10
	})

	const [foundCC, setFoundCC] = useState([])

	const [hasMore, setHasMore] = useState(true);
	const [current, setCurrent] = useState(foundCC.slice(count.prev, count.next))

	const getMoreData = () => {

		if (current.length === foundCC.length) {
			setHasMore(false);
			return;
		}

		if (current.length > 0) {
			setTimeout(() => {
				setCurrent(current.concat(foundCC.slice(count.prev + 10, count.next + 10)))
			}, 500)
			setCount((prevState) => ({ prev: prevState.prev + 10, next: prevState.next + 10 }))
		}

	}

	useEffect(() => {
		handleRefresh()
	}, [])

	useEffect(() => {
		setTotalCC(foundCC.length)
	}, [foundCC])

	useEffect(() => {

		function inicial() {

			var keyword = filter

			setFoundCC([])
			setCurrent([].slice(0, 10))

			var filteredCC
			if (status !== "Todos") {
				filteredCC = cc.filter(cc => cc.status == status)
			} else {
				filteredCC = cc
			}

			if (keyword !== '') {

				const results = cc.filter((cc) => {
					return (cc.mac.toLowerCase().includes(keyword.toLowerCase()) || cc.description.toLowerCase().includes(keyword.toLowerCase()) );
				});

				setHasMore(true)
				setFoundCC(results);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(results.slice(0, 10))
				}, 0)


			} else {

				setHasMore(true)
				setFoundCC(filteredCC);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(filteredCC.slice(0, 10))
				}, 0)

			}

		}

		inicial()


	}, [cc, status, filter])

	const handleRefresh = async () => {

		setCarregando(true)
		try {

			const response = await api.get('ca')
			var data = response.data.resultado
			const response2 = await api.get('ap')
			var data2 = response2.data.resultado

			for (var i=0;i<data.length;i++){
				if(data[i].fk_ap_id !== null){
					data[i].description = data2.filter(item => item.id == data[i].fk_ap_id)[0].description
				}else{
					data[i].description = "Nenhum"
				}
			}

			setCC(data)

		} catch (error) {
			console.log(error)
			aviso('error', error)
		} finally {
			setCarregando(false)
		}

	}

	const handleDeleteCC = (id) => {
		try {
			api.delete('ca/' + id).then(() => {
				aviso("success", "Cliente deletado com sucesso")
				setCC(cc.filter(item => item.id !== id))
			})
		} catch (error) {
			aviso("error", error)
		}
	}

	const handleBlock = async (id) => {
		try{
			var client = cc.filter(item => item.id == id)[0]
			console.log(client)
			if(client.status !== "block"){
				await api.put('ca/?mac='+client.mac+'&status=block')
			}else{
				await api.put('ca/?mac='+client.mac+'&status=unblock')
			}
			handleRefresh()
		} catch(error) {
			aviso("error",error)
		}
	}


	return (
		<>
			<ReactTooltip place="top" effect="solid" />

			<Menu />
			<div className="basic-content">

				<div className="titulo">
					<h1>Clientes conectados</h1>
				</div>

				<div className="cc-box">

					<div style={{ marginLeft: "-25px", marginTop: "-10px" }}>
						<FaSyncAlt data-tip="Recarregar" className="cc-icon-refresh" onClick={handleRefresh} />
					</div>

					<div className="cc-P">

						<div className="cc-p1">
							<label>Filtro</label>
							<Input fluid size='small' value={filter} icon='search' placeholder='Pesquise...' onChange={e => { setFilter(e.target.value) }} />
						</div>

						<div className="cc-p2">
							<label>Status</label>
							<select className="cc-select" placeholder="Status" value={status} onChange={e => { setStatus(e.target.value) }}>
								<option value="Todos">Todos</option>
								<option value="online">Online</option>
								<option value="offline">Offline</option>
								<option value="block">Block</option>
							</select>
						</div>

					</div>

					<div id="scrollableDiv" className="cc-ListBox">

						<InfiniteScroll
							dataLength={current.length}
							next={getMoreData}
							hasMore={hasMore}
							scrollableTarget="scrollableDiv"
						>

							{current.map((cc) => (
								<div key={cc.id} className="cc-ListItem">
									<ReactTooltip id={toString(cc.id)} place="top" effect="solid"></ReactTooltip>
									<div className="cc-item">
										<div className="cc-item-I">
											<div className="cc-item-1">
												<a><RiUserFill className={cc.status == 'unblock'? 'cc-offline-icon' : cc.status == 'block'? 'cc-block-icon' : cc.status == 'offline'? 'cc-offline-icon' : 'cc-online-icon'}  data-tip={cc.status == 'block'? "Bloqueado": cc.status == 'unblock'? 'offline': cc.status} data-for={toString(cc.id)} />&nbsp;&nbsp;MAC: {cc.mac}</a>	
											</div>
											<div className="cc-item-2">
												<a>AP vinculado: {cc.description}</a>
											</div>
											<div className="cc-item-1">
												<a>Status: {cc.status == 'block'? "Bloqueado": cc.status == 'unblock'? 'offline': cc.status}</a>
											</div>
										
											<div className="cc-item-icons">
												<i><ImBlocked data-tip="Bloquear" data-for={toString(cc.id)} className={cc.status == 'block'? 'cc-block': 'cc-unblock'} onClick={() => handleBlock(cc.id)} /></i>
												<i><FiTrash2 data-tip="Excluir" data-for={toString(cc.id)} className='cc-trash'
													onClick={() => {
														const r = window.confirm('Tem certeza que deseja deletar esse registro?')
														if (r === true)
															handleDeleteCC(cc.id)
													}} /></i>
											</div>
										</div>
									</div>
								</div>

							))}

						</InfiniteScroll>
					</div>
					Total: {foundCC.length}
				</div>

				<Loading loading={carregando} message='Carregando...' />



			</div>
		</>
	);
}