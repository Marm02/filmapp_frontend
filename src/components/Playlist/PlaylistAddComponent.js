import React, {Component} from 'react';
import {Button, Col, Dropdown, Form, FormControl, Row} from "react-bootstrap";
import axios from "axios";
import {config} from "../../config";
import {authHeader} from "../../helpers";
import {userActions} from "../../actions";
import connect from "react-redux/es/connect/connect";

const enhanceWithClickOutside = require('react-click-outside');

class PlaylistAddComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {

            show: false,

            isLoading: true,
            loaded: false,

            playlists: [],

            values: [],
            title: '',

            error: false,
            errorMessage: '',

            playlistID: null
        };
        this.menuRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, index, playlisID, playlistTitle) {
        let array = this.state.playlists;
        array[index].contains = !array[index].contains;

        this.setState({playlists: array});

        const requestParams = {
            headers: authHeader()
        };

        const body = {films: [this.props.filmID]};

        let message = "";

        if (array[index].contains === false) {
            axios.put(`${config.apiUrl}playlists/${playlisID}/films/delete/`, body, requestParams)
                .then(res => {
                    message = `Deleted from playlist ${playlistTitle}`;
                    if(this.state.playlistID && this.state.playlistID === playlisID)
                        this.props.dispatch(userActions.playlistFilm('DELETED'));
                    this.props.handlePlaylistOperation(message);


                }).catch(err => {
                console.log(err);
            })
        } else {
            axios.put(`${config.apiUrl}playlists/${playlisID}/films/`, body, requestParams)
                .then(res => {
                    message = `Added to playlist ${playlistTitle}`;
                    if(this.state.playlistID && this.state.playlistID === playlisID)
                        this.props.dispatch(userActions.playlistFilm('ADDED'));
                    this.props.handlePlaylistOperation(message);


                }).catch(err => {
                console.log(err);
            })
        }


    };

    handleClick = () => {
        const requestParams = {
            headers: authHeader()
        };
        const title = this.state.title;

        const body = {title: title, films: [this.props.filmID]};


        axios.post(`${config.apiUrl}playlists`, body, requestParams)
            .then(res => {
                let message = `Added to playlist ${title}`;
                this.props.handlePlaylistOperation(message);


            }).catch(err => {
            this.setState({error: true, errorMessage: err.response.data.errors[0]});
        })
    };

    componentDidMount() {

        if(this.props.playlistID)
            this.setState({playlistID: this.props.playlistID});

        this.setState({show: true});
        this.loadPlaylist()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.show !== this.props.show) {
            this.setState({show: this.props.show});
        }
    }

    handleClickOutside() {
        this.setState({show: false});
        this.props.handleClickOutside(this.props.index);
    };

    loadPlaylist = () => {

        const requestOptions = {
            headers: authHeader()
        };

        this.setState({isLoading: true}, () => {
            axios.get(`${config.apiUrl}users/me/playlists`, requestOptions)
                .then(response => {

                    let playlists = response.data;

                    playlists.forEach(playlist => {
                        if (playlist.films.indexOf(this.props.filmID) > -1) {
                            playlist.contains = true;
                        } else {
                            playlist.contains = false;
                        }
                    });

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
    };

    render() {
        const {index} = this.props;
        const {parentName} = this.props;
        const width = window.innerWidth;
        const height = window.innerHeight;

        let drop = 'down';

        let contentHeight = 240;

        if(this.menuRef && this.menuRef.current){

            let tmpHeightBottom = height - (this.menuRef.current.getBoundingClientRect().top  +
                this.menuRef.current.getBoundingClientRect().height) ;

            let tmpHeightTop = (this.menuRef.current.getBoundingClientRect().top );

            if(tmpHeightBottom < contentHeight){
                if(tmpHeightBottom > tmpHeightTop)
                    contentHeight = tmpHeightBottom;
                else{
                    drop = 'up';
                    if(tmpHeightTop < contentHeight)
                        contentHeight = tmpHeightTop
                }

            }

        }

        let alignRight = false;
        let alignCenter = "";

        if(parentName === "search"){
            alignRight = true;
        }else if(parentName === "home" || parentName === "profile"){
            if (width >= 992) {
                if (index % 6 === 5 || index % 6 === 4) {
                    alignRight = true;
                }
            } else if (width >= 768) {
                if (index % 4 === 3 || index % 4 === 2) {
                    alignRight = true;

                }
            } else if (width >= 576) {
                if (index % 3 === 2 || index % 3 === 1) {
                    alignRight = true;
                }
            } else {
                if (index % 2 === 1) {
                    alignRight = true;
                }else if(index % 2 === 0){
                    alignCenter = "dropdown-center-playlist"
                }
            }
        }


        return (

            <Dropdown ref={this.menuRef} drop={drop} >
                {
                    this.state.loaded &&
                    <Dropdown.Menu
                            className={`${alignCenter} dropdown-bar`}
                            alignRight={alignRight}
                            style={{ height: contentHeight + "px", width: 240 + "px", overflowY: "scroll", cursor: 'context-menu'}}
                            show={this.state.show}>
                        {this.state.playlists.length > 0 &&
                        <p className="dropdown-item-my pl-4 pr-4">Save to...</p>}
                        {this.state.playlists.length > 0 && <Dropdown.Divider/>}

                        {
                            this.state.playlists.map((playlist, index) => {
                                return (<Col xs={12} sm={12} key={playlist.id} >
                                    <Row className="pl-4 pr-4" >
                                        <Col xs={12} sm={12} className="p-0 mb-2" >
                                            <Form.Check
                                                onChange={(e) => this.handleChange(e, index, playlist.id, playlist.title)}
                                                custom
                                                inline
                                                checked={playlist.contains}
                                                label={playlist.title}
                                                type="checkbox"
                                                id={playlist.id}

                                            />
                                        </Col>

                                    </Row>
                                </Col>)
                            })
                        }

                        {this.state.playlists.length > 0 && <Dropdown.Divider/>}
                        <p className="dropdown-item-my pl-4 pr-4">Create a new playlist</p>
                        <FormControl
                            isInvalid={this.state.error}
                            onChange={(e) => {
                                this.setState({error: false, title: e.target.value})
                            }}
                            className="dropdown-item-my w-75 ml-auto mr-auto mb-2 mt-2"
                            placeholder="Enter playlist name..."

                        />
                        <Form.Control.Feedback type="invalid"
                                               className="dropdown-item-my w-75 ml-auto mr-auto mb-2 mt-2">
                            Title is required
                        </Form.Control.Feedback>
                        <Col className="mb-1 text-right justify-content-end">
                            <Button onClick={this.handleClick}>Create</Button>
                        </Col>


                    </Dropdown.Menu>}

            </Dropdown>


        )

    }

}

function mapStateToProps(state) {
    const {alert} = state;
    return {
        alert
    }
}

const connectedPlaylistAddComponent = connect(mapStateToProps)(enhanceWithClickOutside(PlaylistAddComponent));
export {connectedPlaylistAddComponent as PlaylistAddComponent};
