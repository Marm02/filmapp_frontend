import React, {Component} from 'react';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Row, Spinner} from 'react-bootstrap';

import {config} from "../../config";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {userActions} from "../../actions";
import {authHeader} from "../../helpers";
import {PlaylistAddButtonComponent} from "../Playlist/PlaylistAddButtonComponent";
import TextTruncate from "react-text-truncate";
import {isMobile} from 'react-device-detect'
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import connect from "react-redux/es/connect/connect";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

const pathName = config.pathName;

class ProfileComponent extends Component {


    handleScroll = () => {
        if (this.state.addOpenedIndex >= 0 && !isMobile) {
            let array = this.state.films;
            array[this.state.addOpenedIndex].add = false;

            this.setState({films: array, addOpenedIndex: -1});
        }

        this.setState({
            scroll: {
                scrollTop: document.documentElement.scrollTop,
                offsetHeight: document.documentElement.offsetHeight,
                innerHeight: window.innerHeight
            }
        });

    };

    handleResize = () => {
        this.setState({windowWidth: window.innerWidth});
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

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({openSnackbar: false});
    };

    setRedirect = (filmID, playlistID) => {
        playlistID ?
            this.props.history.push({
                pathname: `${pathName}film/` + filmID,
                search: `?list=${playlistID}`
            })
            :
            this.props.history.push({
                pathname: `${pathName}film/` + filmID
            });
    };

    handleRemovePlaylist = (id, index) => {

        const requestParams = {
            headers: authHeader()
        };

        axios.delete(`${config.apiUrl}playlists/${id}`, requestParams)
            .then(res => {
                let playlists = this.state.playlists;
                playlists.splice(index, 1);

                this.setState({playlists: playlists, openSnackbar: true, note: "Playlist removed successfully!"});
            }).catch(err => {
            console.log(err);
        })
    };

    handleRemoveFilm = (id, index) => {

        const requestParams = {
            headers: authHeader()
        };

        axios.delete(`${config.apiUrl}films/${id}`, requestParams)
            .then(res => {

                let films = this.state.films;
                films.splice(index, 1);

                this.setState({films: films, openSnackbar: true, note: "Film removed successfully!"});
            }).catch(err => {
            console.log(JSON.stringify(err));
        })
    };


    constructor(props) {
        super(props);

        this.state = {
            films: [],
            playlists: [],

            user: {},

            addOpenedIndex: -1,

            error: false,
            isLoading: false,

            scroll: {},

            windowWidth: window.innerWidth,

            openSnackbar: false,
            note: ''
        };

    }

    componentDidMount() {

        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);

        const requestParams = {
            headers: authHeader()
        };

        if (localStorage.getItem('user')) {

          /*  axios.get(`${config.apiUrl}users/me`, requestParams)
                .then().catch(err => {
                this.props.dispatch(userActions.logout());
            });*/
        }

        this.setState({
            scroll: {
                scrollTop: document.documentElement.scrollTop,
                offsetHeight: document.documentElement.offsetHeight,
                innerHeight: window.innerHeight
            }
        });


        this.setState({isLoading: true}, async () => {

            const requestOptions = {headers: authHeader()};

            await axios.get(`${config.apiUrl}users/me/films`, requestOptions)
                .then(response => {

                    let films = response.data;

                    films.forEach(film => {
                        film.add = false;
                    });

                    this.setState({
                        films: films,
                    });
                })
                .catch(err => {
                    console.log(JSON.stringify(err));
                });


            await axios.get(`${config.apiUrl}users/me/playlists`, requestOptions)
                .then(response => {

                    let playlists = response.data;

                    this.setState({
                        isLoading: false,
                        isLoaded: true,
                        playlists: playlists
                    })

                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false,
                        isLoaded: true,
                    })
                });
        });


    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        const {isLoading} = this.state;
        const {scroll} = this.state;

        return (
            <Col>


                <Row className="mt-5">

                    {
                        this.state.films.map((film, index) => {

                            const filmID = film.id;


                            return <Col className="mb-5 film-preview-holder playlist-remove-container" xs={6} sm={4} md={3} lg={2} key={film.id}>
                                <div className="embed-responsive embed-responsive-16by9 container">
                                    {
                                        <img
                                            alt=""
                                            className="embed-responsive-item image"
                                            src={`${config.apiUrl}films/${film.id}/thumbnail/${film.thumbnail._id}?width=small`}
                                            onClick={() => this.setRedirect(filmID)}/>
                                    }
                                    <FontAwesomeIcon className="middle" icon="play"
                                                     onClick={() => this.setRedirect(filmID)}/>

                                </div>

                                <Row className="m-0 mt-1">
                                    <Col xs={8} sm={8} className="p-0">

                                        <TextTruncate line={2} text={film.title}
                                                      id="s-c-2"
                                                      className="mb-1 mt-1 title "/>

                                    </Col>


                                    <Col  style={{height: 24 + 'px', width: 24 + "px" , position: 'absolute', right: 28}}
                                         className={"playlist-remove-holder p-0 d-flex text-center justify-content-center align-items-center"}
                                         onClick={() => this.handleRemoveFilm(film.id, index)}>
                                        <ButtonBase  style={{borderRadius: 20 + "px", width: 30 + "px", height: 24 + "px"}} className="button-my" >
                                            {
                                                <FontAwesomeIcon
                                                    icon="trash-alt"/>
                                            }
                                        </ButtonBase>
                                    </Col>

                                    <Col xs={1} sm={1} className="p-0" style={{position: 'absolute', right: 8}}>
                                        <PlaylistAddButtonComponent
                                            parentName="profile"
                                            filmID={film.id}
                                            filmTitle={film.title}
                                            show={film.add} index={index}
                                            handleAddPlaylistButtonClick={this.handleAddPlaylistButtonClick}
                                            handleClick={this.handleCreatePlaylistClick}
                                            handleClickOutside={this.handleClickOutside}
                                            handlePlaylistOperation={this.handlePlaylistOperation}/>
                                    </Col>


                                </Row>
                                <p className="mb-0 mt-1 film-views">
                                    <small>{film.views} views</small>
                                </p>

                            </Col>


                        })
                    }

                    {
                        this.state.playlists.map((playlist, index) => {

                            const filmID = playlist.filmID;
                            const playlistID = playlist.id;


                            return <Col className="mb-5 playlist-remove-container" xs={6} sm={4} md={3} lg={2}
                                        key={playlist.id}>
                                <div onClick={() => this.setRedirect(filmID, playlistID)}
                                     className="embed-responsive embed-responsive-16by9 z-depth-1-half container">
                                    {
                                        filmID !== null ?
                                        <img alt=""
                                             className="embed-responsive-item image"
                                             src={`${config.apiUrl}films/${filmID}/thumbnail/${playlist.thumbnail}?width=small`}
                                             />
                                            :
                                        <img alt=""
                                             className="embed-responsive-item image"
                                        src="https://www.atelierliving.nl/wp-content/themes/ctrln/assets/images/placeholder.png"
                                             />

                                    }
                                    <Row className="middle">
                                        <Col xs={4} sm={4}>
                                            <FontAwesomeIcon icon="play" />
                                        </Col>
                                        <Col xs={8} sm={8}>
                                            <small className="font-weight-bold">Play all</small>

                                        </Col>
                                    </Row>


                                </div>
                                <Row className="p-0 m-0 mt-1">
                                    <Col className="p-0 m-0 ">

                                            <TextTruncate line={2} text={playlist.title}
                                                          id="s-c-2"
                                                          className="mb-2 mt-1 title "/>
                                    </Col>
                                    <ButtonBase  style={{borderRadius: 20 + "px", width: 24 + "px", height: 24 + "px"}} className="button-my" >
                                        {
                                            <Col
                                                style={{width: 30 + "px", height: 24 + "px"}}
                                                className={
                                                "playlist-remove-holder m-0 p-0 text-center justify-content-center d-flex align-items-center"}
                                                 onClick={() => this.handleRemovePlaylist(playlist.id, index)}>

                                                <FontAwesomeIcon icon="trash-alt"/>
                                            </Col>
                                        }
                                    </ButtonBase>
                                </Row>

                                <p className="mb-0 author-nick">
                                    <small>{playlist.authorName}</small>
                                </p>

                            </Col>


                        })
                    }

                </Row>

                {
                    ((scroll.scrollTop === 0 || scroll.offsetHeight <= scroll.innerHeight) && this.state.hasMore) &&
                    <Col sm={12} className="text-center">
                        <Button
                            className="button-my"
                            variant="contained"
                            disabled={isLoading}
                            onClick={!isLoading ? this.loadData : null}
                        >
                            {isLoading ? 'Loading…' : 'Click to load'}
                        </Button>
                    </Col>


                }

                {


                    <Col style={{height: 40}} sm={12} className="text-center">
                        {!(scroll.scrollTop === 0 || scroll.offsetHeight <= scroll.innerHeight) &&
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
                    onClose={this.handleClose}
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
        loggedIn
    };
}

const connectedProfileComponent = connect(mapStateToProps)(ProfileComponent);


export {connectedProfileComponent as ProfileComponent};
