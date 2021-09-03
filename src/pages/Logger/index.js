import React from 'react';
import api from '../../services/api';
import Loading from '../Loading';
import { Context } from '../../Context/AuthContext';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FaSyncAlt } from 'react-icons/fa'
import { Input } from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { registerLocale, setDefaultLocale } from  "react-datepicker";
import br from 'date-fns/locale/pt-BR';


import './styles.css';

import { Menu } from '../../global.js';

import { useState, useEffect } from 'react';

import 'semantic-ui-css/semantic.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Logger() {

	const { aviso } = React.useContext(Context);
	const [filter, setFilter] = useState('Todos')
	const [filter2, setFilter2] = useState('Todos')
	const [Fsearch, setFsearch] = useState('')
	const [logs, setLogs] = useState([])
	const [carregando, setCarregando] = useState(false)
	const [opt, setOpt] = useState(['Todos','APs','Grupos','Clientes conectados','Usuários'])
	const [opt2, setOpt2] = useState(['Todos','create','update','delete'])

	const [inicio, setInicio] = useState('')
	const [fim, setFim] = useState('')

	registerLocale('pt-BR', br)

	const [count, setCount] = useState({
		prev: 0,
		next: 10
	})

	const [foundLogs, setFoundLogs] = useState([])

	const [hasMore, setHasMore] = useState(true);
	const [current, setCurrent] = useState(foundLogs.slice(count.prev, count.next))

	const getMoreData = () => {

		if (current.length === foundLogs.length) {
			setHasMore(false);
			return;
		}

		if (current.length > 0) {
			setTimeout(() => {
				setCurrent(current.concat(foundLogs.slice(count.prev + 10, count.next + 10)))
			}, 500)
			setCount((prevState) => ({ prev: prevState.prev + 10, next: prevState.next + 10 }))
		}

	}

	useEffect(() => {
		handleRefresh()
	}, [])


	useEffect(() => {

		function inicial() {

			var keyword = Fsearch

			setFoundLogs([])
			setCurrent([].slice(0, 10))

			var ini = new Date(inicio)
			var fi = new Date(fim)

			var filteredData
			var filteredType
			var filteredType2

			if(filter == 'Usuários'){
				setOpt2(['Todos','create','update','delete','login'])
			}else{
				setOpt2(['Todos','create','update','delete'])
			}

			if((inicio !== null && inicio !== '') && fim < inicio && (fim !== null && fim !== '')){
				aviso("warning", "Data final menor que a inicial ")
				filteredData = logs
			}else{

				if((inicio !== null && inicio !== '') && (fim == null || fim == '')){
					filteredData = logs.filter(item => new Date(item.date) >= ini)
				}else if((fim !== null && fim !== '') && (inicio == null || inicio == '')){
					filteredData = logs.filter(item => new Date(item.date) <= fi)
				}else if((inicio !== null && inicio !== '') && (fim !== null && fim !== '')){
					filteredData = logs.filter(item => (new Date(item.date) <= fi && new Date(item.date) >= ini))
				}else{
					filteredData = logs
				}
				
			}

			if(filter == 'Todos'){
				filteredType = filteredData
			}else{
				filteredType  = filteredData.filter(item => item.type == filter)
			}

			if(filter2 == 'Todos'){
				filteredType2 = filteredType
			}else{
				filteredType2  = filteredType.filter(item => item.action == filter2)
			}

			console.log(filteredType2)


			if (keyword !== '') {

				const results = filteredType2.filter((log) => {
					return (log.user.toLowerCase().includes(keyword.toLowerCase()) || log.message.toLowerCase().includes(keyword.toLowerCase()));
				});
				console.log("pina")
				setHasMore(true)
				setFoundLogs(results);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(results.slice(0, 10))
				}, 0)


			} else {

				setHasMore(true)
				setFoundLogs(filteredType2);
				setCount({
					prev: 0,
					next: 10
				})
				setTimeout(() => {
					setCurrent(filteredType2.slice(0, 10))
				}, 0)

			}

		}

		inicial()


	}, [logs, Fsearch ,filter, filter2, inicio, fim])

	const handleRefresh = async () => {

		setCarregando(true)
		try {

			await api.get('log').then(response => {
				var logs = []
				console.log(response.data.resultado)
				response.data.resultado.forEach(item => {
					try{
						logs.push(JSON.parse(item))
					}catch(error){}
				})

				setLogs(logs)
			})

		} catch (error) {
			console.log(error)
			aviso('error', error, true)
		} finally {
			setCarregando(false)
		}

	}

	return (
		<>
			<ReactTooltip place="top" effect="solid" />

			<Menu />
			<div className="basic-content">

				<div className="titulo">
					<h1>Logs do sistema</h1>
				</div>

				<div className="logs-box">

					<div style={{ marginLeft: "-25px", marginTop: "-10px" }}>
						<FaSyncAlt data-tip="Recarregar" className="logs-icon-refresh" onClick={handleRefresh} />
					</div>

					<div className="logs-P">

						<div className="logs-p2">
							<label>Filtro</label>
							<Input fluid size='small' value={Fsearch} icon='search' placeholder='Pesquise...' onChange={e => { setFsearch(e.target.value) }} />
						</div>
						<div>
							<label style={{paddingLeft:"10px"}}>Intervalo de datas</label>
							<div className="logs-p1">
								<DatePicker
									className="data-picker" 
									dateFormat="dd/MM/yyyy"
									locale="pt-BR"
									placeholderText="Data Inicial"
									selected={inicio}
									onChange={(date) => setInicio(date)}
									selectsStart
									startDate={inicio}
									endDate={fim}
									peekNextMonth
									showMonthDropdown
									showYearDropdown
									dropdownMode="select"
									isClearable
								/>
								<DatePicker
									className="data-picker" 
									dateFormat="dd/MM/yyyy"
									locale="pt-BR"
									placeholderText="Data Final"
									selected={fim}
									onChange={(date) => setFim(date)}
									selectsEnd
									startDate={inicio}
									endDate={fim}
									minDate={inicio}
									peekNextMonth
									showMonthDropdown
									showYearDropdown
									dropdownMode="select"
									isClearable
								/>
							</div>
						</div>

						<div className="logs-p2">
							<label>Tipo</label>
							<select className="logs-select" placeholder="Tipo" value={filter} onChange={e => { setFilter(e.target.value) }}>
								{opt.map((nome) => (
									<option key={nome} value={nome}>{nome}</option>
								))}
							</select>
						</div>

						<div className="logs-p2">
							<label>Ação</label>
							<select className="logs-select" placeholder="Ação" value={filter2} onChange={e => { setFilter2(e.target.value) }}>
								{opt2.map((nome) => (
									<option key={nome} value={nome}>{nome}</option>
								))}
							</select>
						</div>

					</div>

					<div id="scrollableDiv" className="logs-ListBox">

						<InfiniteScroll
							dataLength={current.length}
							next={getMoreData}
							hasMore={hasMore}
							scrollableTarget="scrollableDiv"
						>

							{current.map((log,i) => (
								<div key={i} className="logs-ListItem">
									<div className="logs-item">
										<div className="logs-item-I">
											<div className="logs-item-1">
												<a>Autor da ação: {log.user}</a>
											</div>
											<div className="logs-item-2">
												<a>Ação: {log.message}</a>
											</div>
											<div className="logs-item-3">
												<a>Data: {new Date(log.date).toLocaleDateString('pt-BR')} - {new Date(log.date).toLocaleTimeString('pt-BR')}</a>
											</div>
										</div>
									</div>
								</div>

							))}

						</InfiniteScroll>
					</div>
					Total: {foundLogs.length}
				</div>

				<Loading loading={carregando} message='Carregando...' />

			</div>
		</>
	);
}
