import React, {Component} from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import {NavbarComponent} from './components/Navbar/NavbarComponent';

import {HomeComponent} from './components/Home/HomeComponent';
import {FilmComponent} from './components/Film/FilmComponent';
import {LoginComponent} from './components/Login/LoginComponent';
import {RegisterComponent} from './components/Register/RegisterComponent';
import {SearchComponent} from './components/Search/SearchComponent';
import {AllPlaylistsComponent} from './components/Playlist/AllPlaylistsComponent';
import {AddFilmComponent} from './components/AddFilm/AddFilmComponent';
import NotFoundComponent from './components/NotFound/NotFoundComponent';

import {Route, Router} from 'react-router-dom';


import {history} from './helpers';
import {alertActions} from './actions';
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
    faTrashAlt,
    faTimes
} from '@fortawesome/free-solid-svg-icons'
import {Switch} from "react-router";
import {ResetPasswordComponent} from './components/ResetPassword/ResetPasswordComponent';
import {ForgotPasswordComponent} from './components/ResetPassword/ForgotPasswordComponent';
import {PrivateRoute} from './helpers/PrivateRoute';
import {ProfileComponent} from './components/Profile/ProfileComponent';

import {config} from './config';

library.add(faSearch, faPlus, faThumbsUp, faThumbsDown, faEye, faPlay, faFilter, faCaretUp, faCaretDown, faEllipsisV,
    faSortDown, faSortUp, faTrashAlt, faTimes);

const pathName = config.pathName;

class App extends Component {
    constructor(props) {
        super(props);

        const {dispatch} = this.props;

        history.listen((location, action) => {
            dispatch(alertActions.clear());
        });
    }

    render() {
        return (
            <div>
                <Router history={history}>

                    <Route  component={() => <NavbarComponent location={history.location} history={history}/>}/>

                    <Route exact path={[`${pathName}login`, `${pathName}film/:id/login`, `${pathName}search/login`, `${pathName}add/login`, `${pathName}playlists/login`]}
                           component={LoginComponent}/>

                    <Route exact path={[`${pathName}register`, `${pathName}film/:id/register`, `${pathName}search/register`, `${pathName}add/register`, `${pathName}playlists/register`]}
                           component={RegisterComponent}/>

                    <Route exact path={[`${pathName}reset/:token`, `${pathName}film/:id/reset/:token`, `${pathName}search/reset/:token`, `${pathName}add/reset/:token`, `${pathName}playlists/reset/:token`]}
                           component={ResetPasswordComponent}/>

                    <Route exact path={[`${pathName}forgot`, `${pathName}film/:id/forgot`, `${pathName}search/forgot`, `${pathName}add/forgot`, `${pathName}playlists/forgot`]}
                           component={ForgotPasswordComponent}/>

                    <Switch>

                        <Route exact path={[`${pathName}film/:id`, `${pathName}film/:id/login`, `${pathName}film/:id/register`, `${pathName}film/:id/reset/:token`,
                            `${pathName}film/:id/forgot`]} component={FilmComponent}/>

                        <Route exact path={[`${pathName}`, `${pathName}login`, `${pathName}register`,
                            `${pathName}reset/:token`, `${pathName}forgot`]} component={HomeComponent}/>

                        <Route exact path={[`${pathName}search`, `${pathName}search/login`, `${pathName}search/register`, `${pathName}search/reset/:token`, `${pathName}search/forgot`]} component={SearchComponent}/>

                        <Route exact path={[`${pathName}add`, `${pathName}add/login`, `${pathName}add/register`, `${pathName}add/reset/:token`, `${pathName}add/forgot`]} component={AddFilmComponent}/>

                        <Route exact path={[`${pathName}playlists`, `${pathName}playlists/login`, `${pathName}playlists/register`, `${pathName}playlists/reset/:token`,
                            `${pathName}playlists/forgot`]} component={AllPlaylistsComponent}/>

                        <PrivateRoute exact path={[`${pathName}profile`]} component={ProfileComponent} />

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

