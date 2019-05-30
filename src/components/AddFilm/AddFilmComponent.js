import React, {Component} from 'react';
import {Button, Col, Form, FormControl, Row} from "react-bootstrap";
import connect from "react-redux/es/connect/connect";
import 'bootstrap/dist/css/bootstrap.min.css';
import './AddFilmComponent.css'

import FileDrop from 'react-file-drop';
import {config} from "../../config";
import {authHeader} from "../../helpers";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const CHOOSE_FILM = `Choose a film `;
const CHOOSE_THUMBNAIL = `Choose a thumbnail `;
const pathName = config.pathName;

class AddFilmComponent extends Component {


    constructor(props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            submitted: false,

            film: null,
            filmName: CHOOSE_FILM,
            filmPreview: null,

            thumbnail: null,
            thumbnailName: CHOOSE_THUMBNAIL,
            thumbnailPreview: null,

            isLoading: false,
            alert: {type: "", message: ""}
        };

        this.filmInput = React.createRef();
        this.thumbnailInput = React.createRef();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFileChoose = this.handleFileChoose.bind(this);
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({[name]: value});
        this.setState({
            alert: {type: "", message: ""}
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({submitted: true});
        this.setState({
            alert: {type: "", message: ""}
        });

        if (!localStorage.getItem('user')) {
            this.props.history.push(`${pathName}add/login`);
            return;
        }

        const requestOptions = {
            headers: authHeader()
        };

        let film = new FormData();
        film.set('title', this.state.title);
        film.set('description', this.state.description);
        film.set('file', this.state.film);
        film.set('thumbnail', this.state.thumbnail);


        this.setState({isLoading: true}, () =>
            axios.post(`${config.apiUrl}films`,
                film, requestOptions)

                .then((response) => {
                    this.props.history.push(`${pathName}film/${response.data.id}`);

                })
                .catch((error) => {
                    console.log(error);
                    console.log(JSON.stringify(error));
                    if (error.response && error.response.data && error.response.data.error) {
                        this.setState({
                            isLoading: false,
                            alert: {type: "alert-danger", message: error.response.data.error}
                        });
                        if (error.response.status === 422) {
                            this.setState({
                                film: null,
                                filmName: CHOOSE_FILM,
                                filmPreview: null,

                                thumbnail: null,
                                thumbnailName: CHOOSE_THUMBNAIL,
                                thumbnailPreview: null,
                            })
                        }
                    } else if (error.response && error.response.data && error.response.data.errors) {
                        if (error.response.data.errors.description)
                            this.setState({
                                isLoading: false,
                                alert: {type: "alert-danger", message: error.response.data.errors.description.message}
                            });
                        else if (error.response.data.errors.title)
                            this.setState({
                                isLoading: false,
                                alert: {type: "alert-danger", message: error.response.data.errors.title.message}
                            })
                    }

                }));

    }

    handleFileChoose(event, type) {
        event.preventDefault();
        switch (type) {
            case 'film':
                this.setState({
                    film: this.filmInput.current.files[0],
                    filmName: this.filmInput.current.files[0].name,
                    filmPreview: URL.createObjectURL(event.target.files[0])
                });
                break;

            case 'thumbnail':
                this.setState({
                    thumbnail: this.thumbnailInput.current.files[0],
                    thumbnailName: this.thumbnailInput.current.files[0].name,
                    thumbnailPreview: URL.createObjectURL(event.target.files[0])
                });
                break;
            default:
                break;
        }
    }

    handleDropFilm = (files, event) => {
        this.setState({
            film: files[0],
            filmName: files[0].name,
            filmPreview: URL.createObjectURL(files[0])
        });
    };

    handleDropThumbnail = (files, event) => {
        this.setState({
            thumbnail: files[0],
            thumbnailName: files[0].name,
            thumbnailPreview: URL.createObjectURL(files[0])
        });
    };

    render() {
        const {isLoading} = this.state;

        return (
            <Row className="mt-4 mr-2 ml-2" sm={12}>
                <Col className="mb-4" sm={6} lg={5}>

                    <Col  className="mb-4 ml-auto mr-auto" xs={10}  sm={12} lg={10} >
                        <div
                            className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                            <FileDrop onDrop={this.handleDropFilm}
                                      className="justify-content-center d-flex align-items-center embed-responsive-item text-center box has-advanced-upload">
                                <input id="film" accept="video/mp4, video/ogg"
                                       onChange={event => this.handleFileChoose(event, 'film')}
                                       type="file" ref={this.filmInput} className="inputfile" />
                                <label htmlFor="film" >

                                    {
                                        this.state.filmName === CHOOSE_FILM &&
                                        <span>{this.state.filmName}</span>
                                    }
                                </label>

                                {
                                    this.state.filmName === CHOOSE_FILM &&
                                    <span>or drop it here</span>
                                }

                                {
                                    this.state.filmPreview &&
                                    <video muted={true} autoPlay={true} className="embed-responsive-item "
                                           src={this.state.filmPreview}>
                                    </video>
                                }

                                {
                                    this.state.filmPreview &&
                                    <Col style={{left:0, top: 0, position: 'absolute', width: 100 + '%', height: 100 + '%'}} className="add-item-opacity" />
                                }

                                {
                                    this.state.filmPreview &&
                                    <FontAwesomeIcon className="add-item-middle fa-3x" style={{color: "#ffffff"}} icon="times"
                                    onClick={() => {this.setState({filmName: CHOOSE_FILM, filmPreview: null})}}/>
                                }

                            </FileDrop>
                        </div>
                    </Col>
                    <Col className="ml-auto mr-auto" xs={10} sm={12} lg={10}>
                        <div
                            className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                            <FileDrop onDrop={this.handleDropThumbnail}
                                      className="justify-content-center d-flex align-items-center embed-responsive-item text-center box has-advanced-upload">
                                <input id="thumbnail" accept="image/jpg, image/png, image/jpeg"
                                       onChange={event => this.handleFileChoose(event, 'thumbnail')}
                                       type="file" ref={this.thumbnailInput} className=" inputfile"/>
                                <label htmlFor="thumbnail">

                                    {
                                        this.state.thumbnailName === CHOOSE_THUMBNAIL &&
                                        <span>{this.state.thumbnailName}</span>
                                    }
                                </label>

                                {
                                    this.state.thumbnailName === CHOOSE_THUMBNAIL &&
                                    <span>or drop it here</span>
                                }
                                {
                                    this.state.thumbnailPreview &&
                                    <img alt=""
                                         className="embed-responsive-item"
                                         src={this.state.thumbnailPreview}/>
                                }

                                {
                                    this.state.thumbnailPreview &&
                                    <Col style={{left:0, top: 0, position: 'absolute', width: 100 + '%', height: 100 + '%'}} className="add-item-opacity" />
                                }

                                {
                                    this.state.thumbnailPreview &&
                                    <FontAwesomeIcon className="add-item-middle fa-3x" style={{color: "#ffffff"}} icon="times"
                                                     onClick={() => {this.setState({thumbnailName: CHOOSE_THUMBNAIL, thumbnailPreview: null})}}/>
                                }
                            </FileDrop>
                        </div>

                    </Col>
                </Col>
                <Col className="mb-2" sm={6} lg={5}>

                    <Col className="mb-3" sm={12}>
                        <FormControl
                            placeholder="Title"
                            aria-label="Title"
                            aria-describedby="basic-addon1"
                            name="title"
                            value={this.state.title}
                            onChange={this.handleChange}
                        />

                    </Col>

                    <Col className="mb-3" sm={12}>
                        <FormControl
                            placeholder="Description"
                            as="textarea" aria-label="With textarea"
                            name="description"
                            value={this.state.description}
                            onChange={this.handleChange}
                        />
                    </Col>

                    <Col className="mb-3" sm={12}>
                        <Form.Group>
                            <Button variant="primary"
                                    disabled={isLoading}
                                    onClick={!isLoading ? this.handleSubmit : null}
                            >
                                {isLoading ? 'Loading…' : 'Add'}
                            </Button>

                            {
                                isLoading &&
                                <img alt="loading..." className="pl-2"
                                     src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="/>

                            }
                        </Form.Group>
                    </Col>
                    {this.state.alert.message &&
                    <Col className={`alert ${this.state.alert.type}`}>{this.state.alert.message}</Col>
                    }
                </Col>


            </Row>
        )
    }
}


function mapStateToProps(state) {
    const {loggedIn} = state.auth;
    return {
        loggedIn
    };
}

const connectedAddPage = connect(mapStateToProps)(AddFilmComponent);
export {connectedAddPage as AddFilmComponent};