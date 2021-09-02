import React, { useContext } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Login from './pages/Login';
import Main from './pages/Main';
import Clients from './pages/Clients'
import Groups from './pages/Groups';
import Perfil from './pages/Dados';
import Users from './pages/Users';
import Logs from './pages/Logger';


import { Context } from './Context/AuthContext';


function CustomRoute({isAdmin ,isPrivate, isPublic, ...rest }) {

  const { Admin, Authenticated, Load } = useContext(Context);

  if (Load) {
    return null;
  }

  //Verifica se a rota é privada e se o usuário está autenticado
  if (isPrivate && !Authenticated) {
    return <Redirect to='/login' />
  }

  //Verifica se a rota é publica e se o usuário está autenticado
  if (isPublic && Authenticated) {
    return <Redirect to='/main' />
  }

  if (isAdmin && !Admin && Authenticated){
    return <Redirect to='/main' />
  }

  if (isAdmin && !Authenticated){
    return <Redirect to='/login' />
  }

  return <Route {...rest} />

}

export default function Routes() {
  return (
    <BrowserRouter>
      <Switch>

        <CustomRoute isPublic exact path="/" component={Login} />
        <CustomRoute isPublic path="/login" component={Login} />
        <CustomRoute isPrivate path="/main" component={Main} />
        <CustomRoute isPrivate path="/clients" component={Clients} />
        <CustomRoute isPrivate path="/groups" component={Groups} />
        <CustomRoute isPrivate path="/perfil" component={Perfil} />
        <CustomRoute isAdmin path="/users" component={Users} />
        <CustomRoute isAdmin path="/logs" component={Logs} />

      </Switch>
    </BrowserRouter>
  );
}