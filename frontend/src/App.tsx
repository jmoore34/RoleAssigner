import React from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {Home} from "./components/Home";
import {Room} from "./components/Room";


function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:roomCode">
          <Room />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
