import React from 'react';
import logo from './logo.svg';
import './App.css';

import {
  Switch,
  Route,
  HashRouter
} from "react-router-dom";
import {Home} from "./components/Home";
import {Room} from "./components/Room";


function App() {
  return (
    <HashRouter hashType="noslash" >
      <Switch>
        <Route path="/RoleAssigner/:roomCode">
          <Room />
        </Route>
        <Route path="/RoleAssigner">
          <Home />
        </Route>
      </Switch>
    </HashRouter>
  );
}

export default App;
