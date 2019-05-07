import React, {Component} from 'react';
import axios from 'axios';

import {Button, Col, Row} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import './FilmComponent.css';

import {authHeader} from "../../helpers";
import {config} from "../../config";
import {connect} from "react-redux";
import {userActions} from "../../actions"

import "../../../node_modules/video-react/dist/video-react.css";
import {FilmsPreviewComponent} from "./FilmsPreviewComponent";
import {PlaylistComponent} from "../Playlist/PlaylistComponent";
import {CommentsComponent} from "../Comments/CommentsComponent";
import queryString from "query-string";
import {Player} from 'video-react';
import TextTruncate from 'react-text-truncate';

const CancelToken = axios.CancelToken;
let source = CancelToken.source();

const windowBreakpoint = 768;
const pathName = config.pathName;

class FilmComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            film: {},

            isMounted: false,

            isLoading: false,

            isLoadingFilms: false,
            isLoadingComments: false,

            hasMoreFilms: true,

            scroll: {},
            windowWidth: window.innerWidth,

            displayPlaylist: false,
            playlistHeight: 400,
            playlistID: null,
            error: false,

            expanded: false,
            truncated: false
        };

        this.handleTruncate = this.handleTruncate.bind(this);
        this.toggleLines = this.toggleLines.bind(this);
    }

    handleTruncate(event) {

        event.preventDefault();
        this.setState({
            truncated: false,
            expanded: true
        });
    }

    toggleLines(event) {
        event.preventDefault();

        this.setState({
            expanded: !this.state.expanded
        });
    }

    handleScroll = () => {

        this.setState({
            scroll: {
                scrollTop: document.documentElement.scrollTop,
                offsetHeight: document.documentElement.offsetHeight,
                innerHeight: window.innerHeight
            }
        });


        if ((window.innerHeight + document.documentElement.scrollTop) >= (document.body.offsetHeight - 150)) {
            this.setState({isLoadingFilms: true});
            if(window.innerWidth <= windowBreakpoint){
                if(!this.state.hasMoreFilms){
                    this.setState({isLoadingComments: true});
                }
            }else{
                this.setState({isLoadingComments: true});
            }
        }
    };

    handleResize = () => {

        this.setState({windowWidth: window.innerWidth});

        let params = queryString.parse(this.props.location.search);

        if (params && params.list) {
            this.setState({
                playlistHeight: this.filmElement.clientHeight
            });
        }
    };

    updateMeta = (meta) => {

        if (meta !== 'views' && !localStorage.getItem('user')) {
            this.props.history.push(`${pathName}film/${this.state.film.filmID}/login`);
            return;
        }

        const options = {headers: {'Content-Type': 'application/json'}};

        if (meta === 'views') {
            return axios.put(`${config.apiUrl}films/${this.state.film.filmID}/meta`, JSON.stringify({'views': 1}),
                options)
                .then(data => {
                    this.setState({
                        isLoading: false
                    });
                }).catch(err => {
                    this.setState({
                        isLoading: false
                    });
                });
        }

        const requestOptions = {headers: authHeader()};

        return axios.put(`${config.apiUrl}users/update/meta`, {[meta]: this.state.film.filmID},
            requestOptions)
            .then(data => {

                const value = data.data;
                return axios.put(`${config.apiUrl}films/${this.state.film.filmID}/meta`, value,
                    options)
                    .then(data => {

                        this.props.dispatch(userActions.rate(meta.toString().toUpperCase()));

                        this.setState({
                            film: {
                                ...this.state.film,
                                'dislikes': data.data.thumbsDown,
                                'likes': data.data.thumbsUp
                            }
                        });
                    }).catch(err => {
                    });

            }).catch(err => {
                console.log(err);
            });
    };

    checkRate = () => {

        if (this.props.rated === 'CHECK_RATE') {

            let user = JSON.parse(localStorage.getItem('user'));

            if (!user)
                return;

            if (user.user.meta.liked.indexOf(this.state.film.filmID) > -1) {
                this.props.dispatch(userActions.rate('LIKED'));
            }

            if (user.user.meta.disliked.indexOf(this.state.film.filmID) > -1) {
                this.props.dispatch(userActions.rate('DISLIKED'));
            }

        }

    };

    handleSetThumbnail = (filmID) => {
        this.setState({
            film: {
                ...this.state.film,
                poster: "https://thumbs.gfycat.com/VibrantHeavyFrogmouth-size_restricted.gif"
            }
        }, () => {
            this.props.history.push(`${pathName}film/` + filmID);
            this.props.dispatch(userActions.rate('CHECK_RATE'));
            window.scrollTo(0, 0);

        })
    };

    handleSetThumbnailPlaylist = (filmID) => {
        if( this.props.match.params.id !== filmID){
            this.setState({
                film: {
                    ...this.state.film,
                    poster: "https://thumbs.gfycat.com/VibrantHeavyFrogmouth-size_restricted.gif"
                }
            }, () => {
                this.props.dispatch(userActions.rate('CHECK_RATE'));
            })

        }
        window.scrollTo(0, 0);
    };

    handleLoadingFilms = (_State) => {
        this.setState({isLoadingFilms: _State.isLoading});
        this.setState({hasMoreFilms: _State.hasMore});
    };

    handleLoadingComments = (_State) => {
        this.setState({isLoadingComments: _State.isLoading});
    };

    handleDeletePlaylist = () => {
      this.setState({displayPlaylist: false});
    };

    componentDidMount() {

        let params = queryString.parse(this.props.location.search);


        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);

        this.setState({
            film: {
                ...this.state.film,
                filmID: this.props.match.params.id
            }
        }, () => {

            axios.get(`${config.apiUrl}films/${this.props.match.params.id}/desc/no`)
                .then(res => {

                    const film = res.data;

                    const requestParams = {
                        headers: authHeader()
                    };

                    if (localStorage.getItem('user')) {

                        axios.get(`${config.apiUrl}users/me`, requestParams)
                            .then(res => {


                                if (res.data.meta.liked.indexOf(this.state.film.filmID) > -1) {
                                    this.props.dispatch(userActions.rate('LIKED'));
                                }

                                if (res.data.meta.disliked.indexOf(this.state.film.filmID) > -1) {
                                    this.props.dispatch(userActions.rate('DISLIKED'));
                                }

                            });
                    }

                    if (params && params.list) {
                        this.setState({
                            displayPlaylist: true,
                            playlistHeight: this.filmElement.clientHeight,
                            playlistID: params.list
                        });
                    }

                    this.setState({
                        film: {
                            ...this.state.film,
                            thumbnail: film.thumbnail,
                            poster: `${config.apiUrl}films/${this.state.film.filmID}/thumbnail/${film.thumbnail._id}?width=poster`,
                            views: film.views + 1,
                            title: film.title,
                            description: film.description,
                            likes: film.thumbsUp,
                            dislikes: film.thumbsDown,
                            //videoSrc: `${config.apiUrl}films/${this.props.match.params.id}`,
                            commentsLength: film.commentsLength
                        },
                        isMounted: true
                    });


                    this.updateMeta('views');


                }).catch(err => {
            })
        });
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }


    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.match.params.id !== this.props.match.params.id) {

            source.cancel();
            source = axios.CancelToken.source();

            let params = queryString.parse(this.props.location.search);

            this.setState({
                isLoading: true,

                film: {
                    ...this.state.film,
                    filmID: this.props.match.params.id,
                },

                isLoadingFilms: false,
                isLoadingComments: false,

                hasMoreFilms: true,
                expanded: false,
                truncated: false

            }, () => {

                axios.get(`${config.apiUrl}films/${this.props.match.params.id}/desc/no`, {
                    cancelToken: source.token
                })
                    .then(res => {
                        if (!params || !params.list) {
                            this.setState({
                                displayPlaylist: false,
                                playlistHeight: 400,
                                playlistID: null
                            });
                        } else {
                            this.setState({
                                displayPlaylist: true,
                                playlistHeight: this.filmElement.clientHeight,
                                playlistID: params.list
                            });
                        }

                        const film = res.data;

                        const requestParams = {
                            headers: authHeader()
                        };

                        if (localStorage.getItem('user')) {

                            axios.get(`${config.apiUrl}users/me`, requestParams)
                                .then(res => {


                                    if (res.data.meta.liked.indexOf(this.state.film.filmID) > -1) {
                                        this.props.dispatch(userActions.rate('LIKED'));
                                    }

                                    if (res.data.meta.disliked.indexOf(this.state.film.filmID) > -1) {
                                        this.props.dispatch(userActions.rate('DISLIKED'));
                                    }

                                });
                        }

                        this.setState({
                            film: {
                                ...this.state.film,
                                thumbnail: film.thumbnail,
                                views: film.views + 1,
                                title: film.title,
                                description: film.description,
                                likes: film.thumbsUp,
                                dislikes: film.thumbsDown,
                               // videoSrc: `${config.apiUrl}films/${this.props.match.params.id}`,
                                commentsLength: film.commentsLength
                            },
                            isMounted: true
                        });

                        this.setState({
                            film: {
                                ...this.state.film,
                                poster: `${config.apiUrl}films/${this.state.film.filmID}/thumbnail/${film.thumbnail._id}?width=poster`,
                            }
                        });

                        this.updateMeta('views');


                    }).catch(err => {
                        console.log(JSON.stringify(err));
                })
            });

        }
    }

    render() {

        const {rated} = this.props;
        const {loggedIn} = this.props;
        const {
            expanded,
            truncated
        } = this.state;


        this.checkRate();

        return (


            <Col>
                <Row>
                    <Col md={8}>
                        {
                                <Col className="mt-4" sm={12}>
                                <div className=""
                                     ref={(filmElement) => this.filmElement = filmElement}>
                                    <Player className=""
                                            playsInline
                                            poster={this.state.film.poster}
                                            src={this.state.film.videoSrc}
                                    />
                                </div>
                            </Col>
                        }

                        {
                            (this.state.isMounted && !this.state.isLoading) ?
                                <Col className="pl-3 pr-3 mt-4" sm={12}>
                                    <Row>
                                        <Col sm={12}>
                                            <p className="font-weight-bold">{this.state.film.title}</p>
                                        </Col>
                                        <Col xs={4} sm={4}>
                                            <p><FontAwesomeIcon icon="eye"/> &ensp;{this.state.film.views}</p>
                                        </Col>
                                        <Col xs={4} sm={4} className="text-right">

                                            <p className={`${loggedIn && rated === 'LIKED' ? "blue" : ""} font-weight-bold`}>
                                                <FontAwesomeIcon cursor="pointer"
                                                                 onClick={() => this.updateMeta('liked')}
                                                                 icon="thumbs-up"/>
                                                &ensp;{this.state.film.likes}</p>
                                        </Col>
                                        <Col xs={4} sm={4}>
                                            <p className={`${loggedIn && rated === 'DISLIKED' ? "blue" : ""} font-weight-bold`}>
                                                <FontAwesomeIcon cursor="pointer"
                                                                 onClick={() => this.updateMeta('disliked')}
                                                                 icon="thumbs-down"/>
                                                &ensp;{this.state.film.dislikes}</p>
                                        </Col>
                                        <Col sm={12} className="mt-4 mb-4 divider" />

                                        <Col sm={12}>
                                            <TextTruncate line={!expanded && 2}
                                                          truncateText="…"
                                                          text= {this.state.film.description}
                                                          textTruncateChild={
                                                              <span id="s-c-2" >
                                                                  <Button variant="link" style={{display: 'block'}}
                                                                          className="p-0 m-0 mb-1 title font-weight-bold"
                                                                          onClick={this.handleTruncate}>Read more</Button></span>

                                                          }>

                                            </TextTruncate>

                                            {!truncated && expanded && (
                                                <span style={{display: 'block'}} >
                                                    <Button className="p-0 m-0 mb-1 title font-weight-bold" variant="link" onClick={this.toggleLines}>Show less</Button></span>
                                            )}
                                        </Col>
                                    </Row>
                                </Col>
                                :
                                this.state.isMounted ?
                                <Col style={{height: 80}} sm={12}
                                     className="pl-3 pr-3 mb-2 text-center justify-content-center d-flex align-items-center">
                                    {
                                    }
                                </Col>
                                :
                                null

                        }
                        <Col sm={12} className="mt-4 mb-2 divider d-block d-md-none"/>
                        {
                            (this.state.displayPlaylist) && (this.state.windowWidth <= windowBreakpoint) && this.state.isMounted &&
                            <Col
                                className="p-0 d-block d-md-none">
                                <PlaylistComponent id={this.state.playlistID}
                                                   filmID={this.props.match.params.id}
                                                   filmElement={this.filmElement}
                                                   history={this.props.history}
                                                   windowWidth={this.state.windowWidth}

                                                   handleSubmit={this.handleSetThumbnailPlaylist}
                                                   handleDeletePlaylist={this.handleDeletePlaylist}
                                />
                            </Col>
                        }
                        {
                            (this.state.windowWidth <= windowBreakpoint) && this.state.isMounted &&
                            <Col className="mt-4 d-block d-md-none">
                                <FilmsPreviewComponent hasMoreFilms={this.state.hasMoreFilms}
                                                       isLoading={this.state.isLoadingFilms}
                                                       filmID={this.props.match.params.id}
                                                       history={this.props.history}
                                                       playlistID={this.state.playlistID}

                                                       handleLoading={this.handleLoadingFilms}
                                                       handleThumbnail={this.handleSetThumbnail}
                                />
                            </Col>
                        }


                        {
                            ((this.state.windowWidth <= windowBreakpoint && !this.state.hasMoreFilms)  || (this.state.windowWidth > windowBreakpoint))
                            && this.state.isMounted &&
                            <Col className="p-0 ">
                                <Col sm={12} className="mt-4 mb-2 divider"/>
                                <CommentsComponent isLoading={this.state.isLoadingComments}
                                                   filmID={this.props.match.params.id}
                                                   history={this.props.history}
                                                   commentsLength={this.state.film.commentsLength}

                                                   handleLoading={this.handleLoadingComments}
                                />
                            </Col>
                        }


                    </Col>

                    {

                        <Col sm={4}>

                            {

                                (this.state.displayPlaylist) && (this.state.windowWidth > windowBreakpoint) && this.state.isMounted &&
                                <Col
                                    className="p-0 d-none d-md-block" sm={10}>
                                    <PlaylistComponent id={this.state.playlistID}
                                                       filmID={this.props.match.params.id}
                                                       filmElement={this.filmElement}
                                                       history={this.props.history}
                                                       windowWidth={this.state.windowWidth}

                                                       handleSubmit={this.handleSetThumbnailPlaylist}
                                                       handleDeletePlaylist={this.handleDeletePlaylist}
                                    />
                                </Col>
                            }

                            {
                                (this.state.windowWidth > windowBreakpoint) && this.state.isMounted &&
                                <Col className="p-0 mt-4 d-none d-md-block" sm={12}>
                                    <FilmsPreviewComponent hasMoreFilms={this.state.hasMoreFilms}
                                                           isLoading={this.state.isLoadingFilms}
                                                           filmID={this.props.match.params.id}
                                                           history={this.props.history}
                                                           playlistID={this.state.playlistID}

                                                           handleLoading={this.handleLoadingFilms}
                                                           handleThumbnail={this.handleSetThumbnail}
                                    />
                                </Col>
                            }


                        </Col>
                    }

                </Row>

            </Col>

        )
    }
}

function mapStateToProps(state) {
    const {loggedIn} = state.auth;
    const {rated} = state.rate;

    return {
        loggedIn,
        rated,
    };
}


const connectedFilmPage = connect(mapStateToProps)(FilmComponent);

export {connectedFilmPage as FilmComponent};
