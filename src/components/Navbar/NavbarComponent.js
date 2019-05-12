import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Avatar from '@material-ui/core/Avatar';

import {Button, Col, Form, Nav, Navbar} from 'react-bootstrap';
import {userActions} from "../../actions";
import {connect} from "react-redux";

import axios from 'axios'

import {config} from "../../config";

import './NavbarComponent.css';
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

import ico from '../../images/ico.png';

import {AsyncTypeahead } from 'react-bootstrap-typeahead';

const pathName = config.pathName;



class NavbarComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            anchorEl: null,
            films: [],
            isLoading: false,
            options: [],
            selected: ''
        };

        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);

    }

    _handleKeyDown = (event) => {
        if(event && event.target && event.target.className &&
            event.target.className === "rbt-input-main form-control rbt-input  focus") {
            switch (event.keyCode) {
                case 13:
                        this.handleSearchSubmit(event);
                    break;
                default:
                    break;
            }
        }
    };

    componentDidMount(){
        document.addEventListener("keydown", this._handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown);
    }

    handleSelect(eventKey) {
        if (eventKey === 'login') {
            if (this.props.loggedIn) {
                this.props.dispatch(userActions.logout());
            }
        } else if (eventKey === 'add_film') {
            this.props.history.push(`${pathName}add`);

        }else if (eventKey === 'playlists'){
            this.props.history.push(`${pathName}playlists`)
        }
    }


    handleSearchSubmit(e) {
        e.preventDefault();

        const search = this.state.title;
        this.setState({title: ''});

        document.getElementById("search-form").reset();
        this.typeahead.getInstance().clear();

        axios.get(`${config.apiUrl}films/filter/title?search=${search}`)
            .then(result => {

                const films = result.data;
                if (films.length === 0) {

                    this.props.history.push({
                        pathname: `${pathName}search`,
                        search: `?search=${search}`,
                        state: {films: films}
                    });

                } else if (films.length === 1) {
                    this.props.history.push(`${pathName}film/${films[0].id}`);

                } else {


                    this.props.history.push({
                        pathname: `${pathName}search`,
                        search: `?search=${search}`,
                        state: {films: films}
                    });


                }


            }).catch(err => {

        });

    }

    handleProfileMenuOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleProfileMenuClose = () => {
        this.setState({ anchorEl: null });
    };

    handleLogoutClick = () => {
        this.setState({ anchorEl: null });

        this.props.dispatch(userActions.rate(''));
        this.props.dispatch(userActions.logout());
    };

    handleProfileClick = () => {
        this.setState({ anchorEl: null });
        this.props.history.push(`${pathName}profile`);
    };


    render() {

        const {loggedIn} = this.props;
        const {anchorEl} = this.state;
        const isProfileMenuOpen = Boolean(anchorEl);

        const renderProfileMenu = (
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isProfileMenuOpen}
                onClose={this.handleProfileMenuClose}
            >
                <MenuItem key="placeholder" style={{display: "none"}}/>
                <MenuItem onClick={this.handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={this.handleLogoutClick}>Logout</MenuItem>
            </Menu>
        );

        return (

            <Navbar
                    expand="md" bg="light" variant="light"
                    onSelect={k => this.handleSelect(k)}>

                <Col xs={{span: 6, order: 1}} sm={{span: 2, order: 1}} md={{span: 4, order: 1}}>
                    <Navbar.Brand href={pathName}>
                        <Navbar.Brand>
                            {
                                <img alt=""
                                     src={ico} width="30"
                                     height="30"/>
                            }
                        </Navbar.Brand>
                        {<p className="d-none d-md-inline">FilmApp</p>}
                    </Navbar.Brand>
                </Col>

                <Col xs={{span: 12, order: 12}} sm={{span: 8, order: 2}} md={{span: 5, order: 5}}>
                    <Form id="search-form" inline>


                        <AsyncTypeahead
                            ref={(typeahead) => this.typeahead = typeahead}
                            id="async_typeahead"
                            placeholder="Search"
                            labelKey="title"
                            minLength={1}
                            className="search-bar"
                            onChange={(selected) => {
                                const title = selected.length > 0 ? selected[0].title : '';
                                this.setState({ title : title});
                            }}
                            isLoading={this.state.isLoading}
                            onSearch={query => {
                               this.setState({isLoading: true, title: query});
                                axios.get(`${config.apiUrl}films/titles?search=${query}`)
                                    .then(res => this.setState({
                                        options: res.data,
                                    }, () => {
                                        this.setState({isLoading: false})
                                    }));
                            }}
                            options={this.state.options}
                        />

                        <Button onClick={this.handleSearchSubmit} className="d-none d-sm-inline ml-1"
                                variant="light"><FontAwesomeIcon icon="search"/></Button>
                    </Form>
                </Col>

                <Col className="text-right d-md-none " xs={{span: 6, order: 7}} sm={{span: 2, order: 10}}>
                    <Navbar.Toggle className="button-my" aria-controls="responsive-navbar-nav" onToggle={this.handleToggle}/>
                </Col>

                <Col xs={{span: 12, order: 12}} sm={{span: 12, order: 12}} md={{span: 3, order: 9}}>

                    <Navbar.Collapse className="justify-content-end" id="responsive-navbar-nav">

                        <Nav activeKey="">
                            <Nav.Link className="pr-2 pl-2" eventKey="playlists">Playlists</Nav.Link>
                            <Nav.Link className="pr-2 pl-2" eventKey="add_film">Add</Nav.Link>


                            {
                                loggedIn ?
                                    (

                                        <Avatar onClick={this.handleProfileMenuOpen}
                                                className="pr-2 pl-2 custom-avatar button-my">{
                                            JSON.parse(localStorage.getItem('user')).user.nick.toUpperCase().charAt(0)}</Avatar>

                                        ) :
                                    (<Nav.Link onClick={() => {
                                        if (this.props.location.pathname === '/filmapp_frontend/')
                                            this.props.history.push(`${pathName}login`);
                                        else
                                            this.props.history.push(`${this.props.location.pathname}/login${this.props.location.search}`)
                                    }
                                    } className="pr-2 pl-2" eventKey="login">Login</Nav.Link>)
                            }
                        </Nav>

                    </Navbar.Collapse>

                </Col>

                {renderProfileMenu}

            </Navbar>
        )
    }
}

function mapStateToProps(state) {
    const {loggedIn} = state.auth;
    return {
        loggedIn
    };
}

const connectedCustomNavbar = connect(mapStateToProps)(NavbarComponent);
export {connectedCustomNavbar as NavbarComponent};