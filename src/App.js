import React, {Component} from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import {NavbarComponent} from './components/Navbar/NavbarComponent';

import {HomeComponent} from './components/Home/HomeComponent';
import {FilmComponent} from "./components/Film/FilmComponent";
import {LoginComponent} from './components/Login/LoginComponent';
import {RegisterComponent} from "./components/Register/RegisterComponent";
import {SearchComponent} from "./components/Search/SearchComponent";
import {AllPlaylistsComponent} from "./components/Playlist/AllPlaylistsComponent";
import {AddFilmComponent} from "./components/AddFilm/AddFilmComponent";
import NotFoundComponent from "./components/NotFound/NotFoundComponent";

import {Route, Router} from 'react-router-dom';


import {history} from './helpers';
import {alertActions, userActions} from './actions';
import {connect} from 'react-redux';
//  --------- icons ------------
import {library} from '@fortawesome/fontawesome-svg-core'
import {
    faCaretDown,
    faCaretUp,
    faEllipsisV,
    faEye,
    faFilter,
    faPlay,
    faPlus,
    faSearch,
    faThumbsDown,
    faThumbsUp,
    faSortUp,
    faSortDown,
    faTrashAlt
} from '@fortawesome/free-solid-svg-icons'
import {Switch} from "react-router";
import {ResetPasswordComponent} from "./components/ResetPassword/ResetPasswordComponent";
import {ForgotPasswordComponent} from "./components/ResetPassword/ForgotPasswordComponent";
import {PrivateRoute} from "./helpers/PrivateRoute";
import {ProfileComponent} from "./components/Profile/ProfileComponent";

library.add(faSearch, faPlus, faThumbsUp, faThumbsDown, faEye, faPlay, faFilter, faCaretUp, faCaretDown, faEllipsisV,
    faSortDown, faSortUp, faTrashAlt);

class App extends Component {
    constructor(props) {
        super(props);

        const {dispatch} = this.props;

        history.listen((location, action) => {
            // clear alert on location change
            dispatch(userActions.rate('CHECK_RATE'));
            dispatch(alertActions.clear());
        });
    }

    render() {
        return (
            <div>
                <Router history={history}>

                    <Route  component={() => <NavbarComponent location={history.location} history={history}/>}/>

                    <Route exact path={["/filmapp_frontend/login", "/film/:id/login", "/search/login", "/add/login", "/playlists/login"]}
                           component={LoginComponent}/>

                    <Route exact path={["/filmapp_frontend/register", "/film/:id/register", "/search/register", "/add/register", "/playlists/register"]}
                           component={RegisterComponent}/>

                    <Route exact path={["/filmapp_frontend/reset/:token", "/film/:id/reset/:token", "/search/reset/:token", "/add/reset/:token", "/playlists/reset/:token"]}
                           component={ResetPasswordComponent}/>

                    <Route exact path={["/filmapp_frontend/forgot", "/film/:id/forgot", "/search/forgot", "/add/forgot", "/playlists/forgot"]}
                           component={ForgotPasswordComponent}/>

                    <Switch>

                        <Route exact path={["/film/:id", "/film/:id/login", "/film/:id/register", "/film/:id/reset/:token",
                            "/film/:id/forgot"]} component={FilmComponent}/>

                        <Route exact path={["/filmapp_frontend", "/filmapp_frontend/login", "/filmapp_frontend/register",
                            "/filmapp_frontend/reset/:token", "/filmapp_frontend/forgot"]} component={HomeComponent}/>

                        <Route exact path={["/search", "/search/login", "/search/register", "/search/reset/:token", "/search/forgot"]} component={SearchComponent}/>

                        <Route exact path={["/add", "/add/login", "/add/register", "/add/reset/:token", "/add/forgot"]} component={AddFilmComponent}/>

                        <Route exact path={["/playlists", "/playlists/login", "/playlists/register", "/playlists/reset/:token",
                            "/playlists/forgot"]} component={AllPlaylistsComponent}/>

                        <PrivateRoute exact path={["/profile"]} component={ProfileComponent} />

                        <Route exact path="*" component={NotFoundComponent}/>

                    </Switch>
                </Router>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {alert} = state;
    return {
        alert
    }
}

const connectedApp = connect(mapStateToProps)(App);

export {connectedApp as App};

