import React, {Component} from 'react';
import axios from 'axios';

import {Col, Row, Spinner} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import './FilmComponent.css';
import {config} from "../../config";
import {connect} from "react-redux";

import "../../../node_modules/video-react/dist/video-react.css";
import {PlaylistAddButtonComponent} from "../Playlist/PlaylistAddButtonComponent";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import TextTruncate from 'react-text-truncate';

import {isMobile} from 'react-device-detect'

const CancelToken = axios.CancelToken;
let source = CancelToken.source();

class FilmsPreviewComponent extends Component {

    loadFilms = () => {

        source.cancel();
        source = axios.CancelToken.source();

        this.setState({isLoading: true}, () => {

            this.props.handleLoading(this.state);

            axios.get(`${config.apiUrl}films`, {
                cancelToken: source.token,
                params: {
                    exclude: this.state.filmID,
                    start: this.state.films.length,
                    limit: 8
                }
            })
                .then(res => {

                    let films = res.data;


                    const maxSize = films.length === 0 && this.state.films.length < 20 ? this.state.films.length : 20;

                    films.forEach(film => {
                        film.add = false;
                    });
                    this.setState({
                        hasMore: (this.state.films.length + films.length < maxSize),
                        isLoading: false,
                        films: [
                            ...this.state.films,
                            ...films], isLoaded: true
                    }, () => {
                        this.props.handleLoading(this.state);
                    });
                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false, isLoaded: true
                    }, () => {
                        this.props.handleLoading(this.state);
                    })
                })
        })

    };


    setRedirect = (e, filmID) => {
        if (e && e.target && (e.target.id === "s-c-1"
            || e.target.id === "s-c-2" || e.target.id === "s-c-3" || e.target.id === "s-c-4"
            || (e.target.localName === "path" && e.target.parentElement && e.target.parentElement.parentElement
                && e.target.parentElement.parentElement.id !== "a-b-2")))
            this.props.handleThumbnail(filmID);
    };

    handleScroll = () => {

        if (this.state.addOpenedIndex >= 0 && !isMobile) {
            let array = this.state.films;
            array[this.state.addOpenedIndex].add = false;

            this.setState({films: array, addOpenedIndex: -1});
        }
    };

    handleResize = () => {
    };

    handlePlaylistOperation = (message) => {
        if (this.state.addOpenedIndex >= 0) {
            let array = this.state.films;
            array.forEach((film) => {
                film.add = false;
            });
            this.setState({films: array, addOpenedIndex: -1})
        }

        this.setState({openSnackbar: true, note: message});
    };

    handleClickOutside = (index) => {
        if (this.state.addOpenedIndex >= 0) {
            let array = this.state.films;
            array.forEach((film) => {
                film.add = false;
            });
            this.setState({films: array, addOpenedIndex: index})
        }
    };

    handleCreatePlaylistClick = () => {
        this.setState({addOpenedIndex: -1});
    };

    handleAddPlaylistButtonClick = (index) => {
        let array = this.state.films;
        array[index].add = !array[index].add;

        this.setState({films: array, addOpenedIndex: index})

    };

    handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({openSnackbar: false});
    };

    constructor(props) {
        super(props);
        this.state = {

            filmID: '',

            error: false,
            hasMore: true,
            isLoading: false,

            isLoaded: false,

            films: [],
            addOpenedIndex: -1,
            openSnackbar: false,
            note: ''

        };
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);

        this.setState({filmID: this.props.filmID});
        this.loadFilms();
    }


    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.isLoading !== this.props.isLoading) {
            if (this.props.isLoading && !(this.state.error || this.state.isLoading || !this.state.hasMore)) {
                this.loadFilms();
            }
        }
        if (prevProps.filmID !== this.props.filmID) {

            source.cancel();
            source = axios.CancelToken.source();

            this.setState({
                isLoading: true,
                isLoaded: false,
                filmID: this.props.filmID,
                error: false,
                hasMore: true,
                films: [],
                addOpenedIndex: -1,
                openSnackbar: false
            }, () => {

                this.props.handleLoading(this.state);

                axios.get(`${config.apiUrl}films`, {
                    cancelToken: source.token,
                    params: {
                        exclude: this.state.filmID,
                        start: 0,
                        limit: 8
                    }
                })
                    .then(res => {

                        let films = res.data;

                        films.forEach(film => {
                            film.add = false;
                        });

                        this.setState({
                            isLoaded: true,
                            hasMore: films.length < 20,
                            isLoading: false,
                            films: films
                        }, () => {
                            this.props.handleLoading(this.state);
                        });
                    })
                    .catch((err) => {
                        if (axios.isCancel(err)) {
                            console.log('Request canceled', err.message);
                        } else {
                            this.setState({
                                error: err.message,
                                isLoading: false
                            }, () => {
                                this.props.handleLoading(this.state);
                            })
                        }
                    })
            })
        }
    }

    render() {


        return (

            <Col className="p-0">

                {
                    this.state.films.map((film, index) => {


                        return (
                            <Col className="film-preview-holder p-0 mb-4 container" onClick={(e) => this.setRedirect(e, film.id)}
                                 key={film.id}>
                                <Row>
                                    <Col xs={7} sm={7}>
                                        <div
                                            className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                                            <img alt="" id="s-c-1" className="image embed-responsive-item"
                                                 src={`${config.apiUrl}films/${film.id}/thumbnail/${film.thumbnail._id}?width=small`}/>
                                            <FontAwesomeIcon className="middle" icon="play"/>
                                        </div>
                                    </Col>
                                    <Col xs={5} sm={5} className="p-0 ">
                                        <Row className="m-0">
                                            <Col xs={10} sm={10} className="p-0">
                                                <TextTruncate line={2} text={film.title}
                                                              id="s-c-2" className="mb-1 title font-weight-bold"/>

                                            </Col>
                                            <PlaylistAddButtonComponent parentName="search"
                                                                        filmID={film.id}
                                                                        show={film.add} index={index}
                                                                        playlistID={this.props.playlistID}

                                                                        handleAddPlaylistButtonClick={this.handleAddPlaylistButtonClick}
                                                                        handleClick={this.handleCreatePlaylistClick}
                                                                        handleClickOutside={this.handleClickOutside}
                                                                        handlePlaylistOperation={this.handlePlaylistOperation}/>

                                        </Row>
                                        <p id="s-c-3" className="mb-0 author-nick">
                                            <small>{film.author_name}</small>
                                        </p>
                                        <p id="s-c-4" className="film-views">
                                            <small>{film.views} views</small>
                                        </p>
                                    </Col>
                                </Row>
                            </Col>
                        )
                    })
                }
                {
                    this.state.hasMore &&
                    <Col style={{height: 40}} sm={12} className="mb-2 text-center">
                        {
                            this.state.isLoading &&
                            <Spinner animation="border"/>
                        }
                    </Col>
                }
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.openSnackbar}
                    autoHideDuration={1500}
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

    return {
        loggedIn,
    };
}


const connectedFilmPage = connect(mapStateToProps)(FilmsPreviewComponent);

export {connectedFilmPage as FilmsPreviewComponent};
