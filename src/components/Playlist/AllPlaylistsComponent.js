import React, {Component} from 'react';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Row, Spinner} from 'react-bootstrap';

import {config} from "../../config";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import connect from "react-redux/es/connect/connect";
import TextTruncate from "react-text-truncate";

const pathName = config.pathName;

class AllPlaylistsComponent extends Component {


    constructor(props) {
        super(props);

        this.state = {
            playlists: [],


            error: false,
            hasMore: true,
            isLoading: true,
            isMounted: false,
            playlistsPreviewLoaded: 0,

            scroll: {},
            windowWidth: window.innerWidth,

        };

    }

    componentDidMount() {

        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);


        this.setState({
            scroll: {
                scrollTop: document.documentElement.scrollTop,
                offsetHeight: document.documentElement.offsetHeight,
                innerHeight: window.innerHeight
            }
        });


        this.setState({isLoading: true}, () => {
            let limit = 3;
            const {windowWidth} = this.state;

            if (windowWidth <= 576)
                limit = 1.3;
            else if (windowWidth > 1920)
                limit = 6;
            else if (windowWidth > 1422)
                limit = 5;

            axios.get(`${config.apiUrl}playlists/all`, {params: {start: 0, limit: Math.ceil(6 * limit)}})
                .then(response => {

                    let playlists = response.data;

                    playlists.forEach(playlist => {
                        playlist.img = `${config.apiUrl}films/${playlist.filmID}/thumbnail/${playlist.thumbnail}?width=preview`
                    });

                    this.setState({
                        hasMore: playlists.length >= Math.ceil(6 * limit),
                        playlists: playlists,
                        isLoading: false,
                        isMounted: true
                    });
                });
        });


    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }


    handleScroll = () => {

        this.setState({
            scroll: {
                scrollTop: document.documentElement.scrollTop,
                offsetHeight: document.documentElement.offsetHeight,
                innerHeight: window.innerHeight
            }
        });

        const {
            loadData,
            state: {
                error,
                isLoading,
                hasMore
            }
        } = this;

        if (error || isLoading || !hasMore) return;

        if ((window.innerHeight + document.documentElement.scrollTop) >= (document.body.offsetHeight - 150)) {
            loadData();
        }
    };

    handleResize = () => {
        this.setState({windowWidth: window.innerWidth});
    };



    loadData = () => {
        this.setState({isLoading: true}, () => {
            axios.get(`${config.apiUrl}playlists/all`, {params: {start: this.state.playlists.length, limit: 6}})
                .then(response => {

                    let playlists = response.data;

                    playlists.forEach(playlist => {
                        playlist.img = `${config.apiUrl}films/${playlist.filmID}/thumbnail/${playlist.thumbnail}?width=preview`
                    });

                    this.setState({
                        hasMore: (playlists.length === 6),
                        isLoading: false,
                        playlists: [
                            ...this.state.playlists,
                            ...playlists]
                    });

                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false
                    })
                });
        })
    };

    setRedirect = (playlistID, filmID) => {
        this.props.history.push({
            pathname: `${pathName}film/` + filmID,
            search: `?list=${playlistID}`
        });
    };

    render() {
        const {isLoading} = this.state;
        const {scroll} = this.state;
        let playlistsLoaded = 0;
        let playlists = this.state.playlists.map(a => Object.assign({}, a));

        return (
            <Col>


                <Row className="mt-5">

                    {
                        playlists.map((playlist, index) => {


                                const filmID = playlist.filmID;

                                const playlistID = playlist.id;

                                if(!playlist.thumbnail){
                                    return null;
                                }

                                return <Col className="mb-5 film-preview-holder" xs={6} sm={4} md={3} lg={2} key={playlist.id}>
                                    <div onClick={() => this.setRedirect(playlistID, filmID)}
                                         className="embed-responsive embed-responsive-16by9 z-depth-1-half container">
                                        {
                                            <img
                                                onLoad={ () => {
                                                    if (playlist.img === `${config.apiUrl}films/${playlist.filmID}/thumbnail/${playlist.thumbnail}?width=preview`) {
                                                        playlist.img = `${config.apiUrl}films/${playlist.filmID}/thumbnail/${playlist.thumbnail}?width=small`;
                                                        playlistsLoaded++;
                                                        console.log(playlistsLoaded)
                                                        if(this.state.playlistsPreviewLoaded + playlistsLoaded >= playlists.length){
                                                            this.setState({
                                                                playlistsPreviewLoaded: (this.state.playlistsPreviewLoaded + playlistsLoaded),
                                                                playlists: playlists});
                                                        }
                                                    }
                                                }}
                                                alt=""
                                                className="embed-responsive-item image"
                                                src={playlist.img}
                                                onClick={() => this.setRedirect(playlistID, filmID)}/>
                                        }
                                        <Row className="middle">
                                            <Col xs={4} sm={4}>
                                                <FontAwesomeIcon icon="play"/>
                                            </Col>
                                            <Col xs={8} sm={8}>
                                                <small className="font-weight-bold" >Play all</small>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Col xs={12} sm={12} className="p-0">
                                        <TextTruncate line={2} text={playlist.title}
                                                      id="s-c-2"
                                                      className="mb-1 mt-1 title "/>
                                    </Col>
                                    <p className="mb-0 author-nick">
                                        <small>{playlist.authorName}</small>
                                    </p>

                                </Col>


                            }
                        )


                    }

                </Row>
                {
                    ((scroll.scrollTop === 0 || scroll.offsetHeight <= scroll.innerHeight) && this.state.hasMore && this.state.isMounted) &&
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

                    this.state.hasMore &&
                    <Col style={{height: 40}} sm={12} className="text-center">
                        {
                            (!(scroll.scrollTop === 0 || scroll.offsetHeight <= scroll.innerHeight) || !this.state.isMounted) &&
                        this.state.isLoading &&
                        <Spinner animation="border"/>
                        }
                    </Col>
                }

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

const connectedAllPlaylistsComponent = connect(mapStateToProps)(AllPlaylistsComponent);


export {connectedAllPlaylistsComponent as AllPlaylistsComponent};
