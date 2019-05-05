import React, {Component} from 'react';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Row, Spinner} from 'react-bootstrap';

import {config} from "../../config";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import {userActions} from "../../actions";
import {authHeader} from "../../helpers";
import connect from "react-redux/es/connect/connect";

class AllPlaylistsComponent extends Component {


    constructor(props) {
        super(props);

        this.state = {
            playlists: [],


            error: false,
            hasMore: false,
            isLoading: false,

            scroll: {},
            windowWidth: window.innerWidth,

        };

    }

    componentDidMount() {

        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);

        const requestParams = {
            headers: authHeader()
        };

        if (localStorage.getItem('user')) {

            axios.get(`${config.apiUrl}users/me`, requestParams)
                .then(res => {
                }).catch(err => {
                console.log(err);
                console.log(JSON.stringify(err));
                this.props.dispatch(userActions.logout());
            });
        }

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


                    this.setState({
                        hasMore: playlists.length >= Math.ceil(6 * limit),
                        playlists: playlists,
                        isLoading: false
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
            pathname: '/film/' + filmID,
            search: `?list=${playlistID}`
        });
    };


    render() {
        const {isLoading} = this.state;
        const {scroll} = this.state;

        return (
            <Col>


                <Row className="mt-5">

                    {
                        this.state.playlists.map((playlist, index) => {


                                const filmID = playlist.filmThumbnail ? playlist.filmThumbnail : playlist.films[0];

                                const playlistID = playlist.id;

                                if(!playlist.thumbnail)
                                    return null;

                                return <Col className="mb-5 film-preview-holder" xs={6} sm={4} md={3} lg={2} key={playlist.id}>
                                    <div onClick={() => this.setRedirect(playlistID, filmID)}
                                         className="embed-responsive embed-responsive-16by9 z-depth-1-half container">
                                        {
                                            <img
                                                alt=""
                                                className="embed-responsive-item image"
                                                src={`${config.apiUrl}films/${filmID}/thumbnail/${playlist.thumbnail}?width=250`}
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

                                    <p className="mb-1">
                                        <small className="font-weight-bolder">{playlist.title}</small>
                                    </p>

                                    <p className="mb-0 author-nick">
                                        <small>{playlist.authorName}</small>
                                    </p>

                                </Col>


                            }
                        )


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
