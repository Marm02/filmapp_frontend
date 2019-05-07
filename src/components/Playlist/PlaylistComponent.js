import React, {Component} from 'react';
import axios from 'axios';

import {Col, Row} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import './PlaylistComponent.css';
import {config} from "../../config";
import {connect} from "react-redux";

import "../../../node_modules/video-react/dist/video-react.css";

import 'react-perfect-scrollbar/dist/css/styles.css';

import PerfectScrollbar from 'react-perfect-scrollbar'
import {userActions} from "../../actions";
import {authHeader} from "../../helpers";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import TextTruncate from "react-text-truncate";

const pathName = config.pathName;

class PlaylistComponent extends Component {


    setRedirect = (filmID) => {
        this.props.history.push(
            {
                pathname: `${pathName}film/` + filmID,
                search: `?list=${this.state.playlist.id}`
            });
        this.props.handleSubmit(filmID);

    };

    handleResize = () => {
        this.setState({
            playlistHeight: this.props.filmElement.clientHeight,

            playlistHeaderHeight: (this.playlistHeader !== null &&
                this.playlistHeader.current !== null && this.playlistHeader.current.clientHeight != null) ?
                this.playlistHeader.current.clientHeight : this.state.playlistHeaderHeight
        });
    };

    loadFilm = () => {

        axios.get(`${config.apiUrl}playlists/${this.props.id}`)
            .then(res => {
                this.setState({playlist: res.data});
                const playlistFilms = res.data.films;
                const requests = [];

                playlistFilms.forEach((film, index) => {

                    if (film === this.state.currentFilm)
                        this.setState({index: index + 1});

                    requests.push(axios.get(`${config.apiUrl}films/${film}/desc/no`)
                        .then(res => {
                            let film = res.data;
                            return film;
                        })
                        .catch((err) => {
                            this.setState({
                                error: err.message,
                            })
                        }));


                });

                Promise.all(requests).then((films) => {
                    this.setState({
                        films: films,
                        playlistHeight: this.props.filmElement.clientHeight,
                        isPlaylistLoaded: true
                    }, () => {
                        this.setState({
                            playlistHeaderHeight: (this.playlistHeader !== null &&
                                this.playlistHeader.current !== null && this.playlistHeader.current.clientHeight != null) ?
                                this.playlistHeader.current.clientHeight : this.state.playlistHeaderHeight
                        });
                    });
                });

            }).catch((error) => {
            console.log(error)
        });
    };

    checkOwnerOfPlaylist = (playlistID) => {
        if (localStorage.getItem('user')) {
            const requestOptions = {
                headers: authHeader()
            };

            this.setState({isLoading: true}, () => {
                axios.get(`${config.apiUrl}users/me`, requestOptions)
                    .then(response => {

                        let playlists = response.data.playlists;
                        if (playlists.indexOf(playlistID) > -1)
                            this.setState({ownerOfPlaylist: true});

                        this.setState({
                            isLoading: false,
                            loaded: true,
                            playlists: playlists
                        })

                    })
                    .catch((err) => {
                        this.setState({
                            error: err.message,
                            isLoading: false,
                            loaded: true,
                        })
                    });
            })
        }
    };

    handleRemoveFromPlaylist = (filmID) => {
        const requestParams = {
            headers: authHeader()
        };

        const body = {films: [filmID]};

        axios.put(`${config.apiUrl}playlists/${this.state.id}/films/delete/`, body, requestParams)
            .then(res => {

                this.setState({openSnackbar: true, note: "Deleted from playlist!"});

                this.props.dispatch(userActions.playlistFilm('DELETED'));

            }).catch(err => {
            console.log(err);
        })
    };

    handleRemovePlaylist = () => {

        const requestParams = {
            headers: authHeader()
        };

        axios.delete(`${config.apiUrl}playlists/${this.state.id}`, requestParams)
            .then(res => {
                this.setState({openSnackbar: true, note: "Playlist deleted!"});
                this.props.handleDeletePlaylist();
            }).catch(err => {
            console.log(err);
        })
    };

    handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({openSnackbar: false});
    };

    constructor(props) {
        super(props);

        this.playlistHeader = React.createRef();

        this.state = {

            currentFilm: null,
            id: null,

            error: false,
            hasMore: true,
            isLoading: false,

            films: [],
            playlist: '',
            playlistHeight: 300,
            playlistHeaderHeight: 50,

            index: 1,

            isPlaylistLoaded: false,
            ownerOfPlaylist: false,
            openSnackbar: false,
            note: ''

        };
    }

    componentDidMount() {
        if (!this.props.id) {
            console.log("Error loading playlist...");
            return;
        }

        window.addEventListener('resize', this.handleResize);

        this.setState({id: this.props.id, currentFilm: this.props.filmID}, () => {
            this.checkOwnerOfPlaylist(this.state.id)
        });

        this.loadFilm();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.filmID !== this.props.filmID) {
            this.setState({
                currentFilm: this.props.filmID,
                index: this.state.films.findIndex((film => film !== null && film !== undefined && film.id === this.props.filmID)) + 1
            });
        }


        if (this.props.playlistFilm !== '' && prevProps.playlistFilm !== this.props.playlistFilm) {
            if (this.props.playlistFilm === 'ADDED' || this.props.playlistFilm === 'DELETED') {
                this.loadFilm();
            }

            this.props.dispatch(userActions.playlistFilm(''));

        }

        if (this.props.loggedIn !== prevProps.loggedIn) {
            if (this.props.loggedIn) {
                this.checkOwnerOfPlaylist(this.state.id)

            } else {
                this.setState({ownerOfPlaylist: false});
            }
        }

    }

    render() {

        const {windowWidth} = this.props;

        const lines = windowWidth > 768 && windowWidth < 1024 ? 1 : 2;

        return (

            (this.state.isPlaylistLoaded) &&
            <Col className="p-0  mt-4 mb-5">
                <Col className="pt-2 pb-2 playlist-header" sm={12} ref={this.playlistHeader}>
                    <Row className="m-0 p-0">
                        <Col className="m-0 p-0" id="playlist_remove_header" xs={10} sm={10}>
                            <p className="mb-1">{this.state.playlist.title}</p>
                            <small>Marcin</small>
                            <small
                                className="playlist-index">- {this.state.films.length > 0 ? this.state.index : 0}/{this.state.films.length}</small>
                        </Col>
                        {
                            this.state.ownerOfPlaylist &&
                            <Col id="playlist_remove" xs={2} sm={2} className={
                                "m-0 p-0 text-center justify-content-center d-flex align-items-center"}
                                 onClick={() => this.handleRemovePlaylist()}>
                                <FontAwesomeIcon id="playlist_remove_film_icon" icon="trash-alt"/>
                            </Col>
                        }
                    </Row>
                </Col>
                <Col style={{height: this.state.playlistHeight - this.state.playlistHeaderHeight + 'px'}}
                     className="p-0 playlist-container" xs={12} sm={12}>
                    <PerfectScrollbar
                        onYReachEnd={() => {
                        }} onScrollY={() => {
                    }}>
                        {
                            this.state.films.map((film, index) => {
                                    if (film !== null && film !== undefined) {
                                       return (
                                            <Row xs={12} sm={12} className="m-0 p-0 playlist-remove-container" key={film.id}>
                                                <Col xs={10} sm={10}
                                                     className={index === this.state.films.length - 1 ?
                                                         "mt-3 mb-3" :
                                                         "mt-3"}
                                                     onClick={() => this.setRedirect(film.id)}
                                                >
                                                    <Row>
                                                        <Col
                                                            className="text-center justify-content-center d-flex align-items-center p-0 pl-1"
                                                            xs={1} sm={1}>
                                                            {
                                                                (this.state.currentFilm === film.id && this.state.index === index + 1) ?
                                                                    <small><FontAwesomeIcon style={{fontWeight: 300}}
                                                                                            icon="play"/></small>
                                                                    :
                                                                    <small>{index + 1}</small>

                                                            }
                                                        </Col>
                                                        <Col className="pr-2 pl-2" xs={6} sm={6}>
                                                            <div
                                                                className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                                                                <img alt="" className="image embed-responsive-item"
                                                                     src={`${config.apiUrl}films/${film.id}/thumbnail/${film.thumbnail._id}?width=small`}/>
                                                                <FontAwesomeIcon className="middle" icon="play"/>
                                                            </div>
                                                        </Col>
                                                        <Col xs={5} sm={5} className="p-0">
                                                            <TextTruncate line={lines} text={film.title}
                                                                          className="mb-0 title font-weight-bold"/>
                                                            <p className="mb-1 author-nick">
                                                                <small>{film.author_name}</small>
                                                            </p>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {
                                                    this.state.ownerOfPlaylist &&
                                                    <Col xs={2} sm={2}
                                                         className={index === this.state.films.length - 1 ?
                                                             "playlist-remove-holder mt-3 mb-3 text-center justify-content-center d-flex align-items-center" :
                                                             "playlist-remove-holder mt-3 text-center justify-content-center d-flex align-items-center"}>
                                                        <FontAwesomeIcon
                                                            onClick={() => this.handleRemoveFromPlaylist(film.id)}
                                                            icon="trash-alt"/>
                                                    </Col>
                                                }

                                            </Row>
                                        )
                                    }else{
                                        return (
                                            <Row xs={12} sm={12} className="m-0 p-0 playlist-remove-container" key={index}>
                                                <Col xs={10} sm={10}
                                                     className={index === this.state.films.length - 1 ?
                                                         "mt-3 mb-3" :
                                                         "mt-3"}
                                                >
                                                    <Row>
                                                        <Col
                                                            className="text-center justify-content-center d-flex align-items-center p-0 pl-1"
                                                            xs={1} sm={1}>
                                                            {
                                                                (this.state.index === index + 1) ?
                                                                    <small><FontAwesomeIcon style={{fontWeight: 300}}
                                                                                            icon="play"/></small>
                                                                    :
                                                                    <small>{index + 1}</small>

                                                            }
                                                        </Col>
                                                        <Col className="pr-2 pl-2" xs={6} sm={6}>
                                                            <div
                                                                className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                                                                <img alt="" className=" embed-responsive-item"
                                                                     src="https://www.atelierliving.nl/wp-content/themes/ctrln/assets/images/placeholder.png"/>
                                                                <FontAwesomeIcon className="middle" icon="play"/>
                                                            </div>
                                                        </Col>
                                                        <Col xs={5} sm={5} className="p-0">
                                                            <p className="mb-0 title font-weight-bold mb-1 author-nick">[Film delted]</p>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                {
                                                    this.state.ownerOfPlaylist &&
                                                    <Col xs={2} sm={2}
                                                         className={index === this.state.films.length - 1 ?
                                                             "playlist-remove-holder mt-3 mb-3 text-center justify-content-center d-flex align-items-center" :
                                                             "playlist-remove-holder mt-3 text-center justify-content-center d-flex align-items-center"}>
                                                        <FontAwesomeIcon
                                                            onClick={() => this.handleRemoveFromPlaylist(this.state.playlist.films[index])}
                                                            icon="trash-alt"/>
                                                    </Col>
                                                }

                                            </Row>)
                                    }
                                }
                            )}
                    </PerfectScrollbar>

                </Col>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.openSnackbar}
                    autoHideDuration={3000}
                    onClose={this.handleCloseSnackbar}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.note}</span>}
                />

            </Col>


        )
    }
}

function mapStateToProps(state) {
    const {loggedIn} = state.auth;
    const {rated} = state.rate;
    const {playlistFilm} = state.playlistFilm;

    return {
        loggedIn,
        rated,
        playlistFilm
    };
}

const connectedPlaylistPage = connect(mapStateToProps)(PlaylistComponent);

export {connectedPlaylistPage as PlaylistComponent};
