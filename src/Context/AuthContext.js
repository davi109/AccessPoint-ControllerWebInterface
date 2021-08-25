import React, { useState, createContext, useEffect } from 'react';
import { isAdmin, isAuthenticate, logout_token, login_token } from '../services/auth';

import api from '../services/api'
import CryptoJS from 'crypto-js'


const Context = createContext();


function AuthProvider({ children }) {

    const [Authenticated, setAuthenticated] = useState(false);
    const [Admin, setAdmin] = useState(false);
    const [Load, setLoading] = useState(true);
    const [Login, setLogin] = useState(false);
    const [message, setMessage] = useState('')
    const [typeMessage, setTypeMessage] = useState('')
    const [openMessage, setOpenMessage] = useState(false)
    const [troca, setTroca] = useState('')

    useEffect(() => {

        const atualiza = async () => {

            try {

                const auth = await isAuthenticate();
                const admin = await isAdmin();

                if (auth) {
                    setAuthenticated(true);
                }

                if (admin) {
                    setAdmin(true);
                }

                setLoading(false);

            } catch (error) {
                aviso('error',error);
                setLoading(false);
            }
        };
        atualiza();

    }, []);

    function handleLogout() {
        logout_token();
        localStorage.removeItem('senha_enc')
        localStorage.removeItem('login_enc')
        setAdmin(false);
        setAuthenticated(false);
    }

    function aviso(tipo, mensagem, literal) {

        var texto = ""
        try {
            if(mensagem.response.data.mensagem !== undefined){
                texto = mensagem.response.data.mensagem
            }else{
                texto = ""
            }
        } catch (error) {
            error = error
        }
        
        if(tipo == 'error'){
            if(texto == 'Falha na autenticação'){
                setTypeMessage("warning")
                setMessage("Sessão expirada")
                handleLogout()
            }else if(texto == 'Usuário desconectado'){
                setTypeMessage("warning")
                setMessage("Conta desconectada") 
                handleLogout()
            }else if(literal == true){
                setTypeMessage(tipo)
                setMessage(mensagem) 
            }else{
                setTypeMessage(tipo)
                setMessage("Ocorreu um erro, tente novamente!") 
            }
        }else{
            setTypeMessage(tipo)
            setMessage(mensagem) 
        }
        
        if (troca === '' || troca === false) {
            setTroca(true)
        } else {
            setTroca(false)
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenMessage(false);
    };

    async function handleLogin(e, login, senha, verifica) {

        e.preventDefault();
        setAdmin(false);

        if (verifica)
            setAuthenticated(false);

        setLogin(true);

        var senha_enc = CryptoJS.AES.encrypt(senha, '@#JMV').toString();
        localStorage.setItem('senha_enc', senha_enc)
        var login_enc = CryptoJS.AES.encrypt(login, '@#JMV').toString();
        localStorage.setItem('login_enc', login_enc)

        const data = {
            login: login,
            password: senha
        }

        try {

            const resultado = await api.post('login', data);
            login_token(resultado.data.token);

            if (verifica)
                aviso("success", "Login efetuado com sucesso");

            try {

                const admin = await isAdmin();

                if (admin) {
                    setAdmin(true);
                    setAuthenticated(true);
                }

                setAuthenticated(true);

            } catch (error) {
                aviso('error',error);
            }

        } catch (error) {
            aviso('error',error);
            if (error.response.data == undefined) {
                aviso('error',error);
            } else {
                aviso('error', error.response.data.mensagem, true);
            }
        }

        setLogin(false);
    }

    return (

        <Context.Provider value={{ troca, message, typeMessage, openMessage, Authenticated, Admin, Load, Login, aviso, handleClose, handleLogout, handleLogin, setLoading, setAdmin, setAuthenticated, setOpenMessage }}>
            {children}
        </Context.Provider>
    )
}

export { Context, AuthProvider }