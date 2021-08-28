import React, { useEffect, useState } from 'react';

import './styles.css';

import { Menu } from '../../global.js'
import api from '../../services/api';
import Loading from '../Loading';
import { Context } from '../../Context/AuthContext';
import { Input, Checkbox } from 'semantic-ui-react'
import { Modal, Button } from 'react-bootstrap'

import 'semantic-ui-css/semantic.min.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Dados() {

  const [carregando, setCarregando] = useState(false)
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [modalShow, setModalShow] = useState(false)
  const { aviso } = React.useContext(Context);
  const [permission, setPermission] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    handleRefresh()
  }, [])

  const handleRefresh = async () => {
    try {

      setCarregando(true)
      await api.get('user?me=true').then(response => {
        var data = response.data.resultado
        setUserId(data[0].id)
        setName(data[0].name)
        setLogin(data[0].login)
        if (data[0].permission == 0) {
          setPermission("Administrador")
        } else {
          setPermission("Normal")
        }
      })

    } catch (error) {

      console.log(error)
      aviso('error', error)
    } finally {

      setCarregando(false)

    }
  }

  return (
    <div>
      <header>
        <Menu />
      </header>
      <Loading loading={carregando} message='Carregando...' />
      <EditartUser backdrop="static" show={modalShow} onHide={() => { setModalShow(false); handleRefresh() }} />

      <div className="dados-login-content">

        <div className="dados-intro">
          <h2>Meus Dados</h2>
        </div>

        <div className="dados-retangulo-1">

          <div className="dados-info-login">
            <h2>Nome: {name}</h2>
          </div>

          <div className="dados-info-login">
            <h2>Login: {login}</h2>
          </div>

          <div className="dados-info-login">
            <h2>Permissão: {permission}</h2>
          </div>

          <div className="dados-alterar">
            <button onClick={() => setModalShow(true)}> Atualizar informações</button>
          </div>

        </div>

      </div>

    </div>

  );
}

function EditartUser(props) {

  const { aviso } = React.useContext(Context);
  const [carregando, setCarregando] = useState(false)
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [changeP, setChangeP] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {

    async function initial() {
      try {
        if (props.show == true) {
          setCarregando(true)
          await api.get('user?me=true').then(response => {
            const user = response.data.resultado[0]
            setName(user.name)
            setLogin(user.login)
            setPassword2('')
            setPassword('')
            setUserId(user.id)
          }) 

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
        
        var data

        if (changeP) {

          data = {
            name: name,
            login: login,
            password: password,
            password2: password2
          }

        } else {

          data = {
            name: name,
            login: login,
          }

        }

        await api.put('user/' + userId, data)
        aviso("success", "Usuário atualizado com sucesso")
        
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
          Atualizar usuário
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

          </div>
      
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

        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleControle}>Salvar</Button>
        <Button onClick={props.onHide}>Fechar</Button>
      </Modal.Footer>
    </Modal>
  );
}
