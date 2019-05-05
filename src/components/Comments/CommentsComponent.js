import React, {Component} from 'react';
import axios from 'axios';

import {Button, Col, Dropdown, DropdownButton, Row, Spinner} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';


import TextField from '@material-ui/core/TextField';
import {authHeader} from "../../helpers";
import {config} from "../../config";
import {connect} from "react-redux";

import "../../../node_modules/video-react/dist/video-react.css";

const CancelToken = axios.CancelToken;
let source = CancelToken.source();
const pathName = config.pathName;

class CommentsComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filmID: '',

            comments: [],

            comment: '',
            dir: 1,

            error: false,
            hasMore: true,
            isLoading: false,

            isLoaded: false,

            addedCount: 0
        };

        this.handleChange = this.handleChange.bind(this);
    }

    loadComments = () => {
        this.setState({isLoading: true}, () => {

            this.props.handleLoading(this.state);

            axios.get(`${config.apiUrl}films/${this.state.filmID}/desc`,
                {params: {start: this.state.comments.length, limit: 10}})
                .then(res => {

                    let film = res.data;

                    this.setState({
                        hasMore: (film.comments.length > 0),
                        isLoading: false,
                        comments: [...this.state.comments, ...film.comments]
                    }, () => {
                        this.props.handleLoading(this.state);
                    });

                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false
                    }, () => {
                        this.props.handleLoading(this.state);
                    })
                })
        })
    };

    addComment = () => {

        if (!localStorage.getItem('user')) {
            this.props.history.push(`${pathName}film/${this.state.filmID}/login`);
            return;
        }

        const requestOptions = {
            headers: authHeader()
        };

        axios.post(`${config.apiUrl}films/${this.state.filmID}/comments`,
            {text: this.state.comment}, requestOptions)

            .then((response) => {

                if (response.status === 200) {
                    const comment = response.data;

                    axios.get(`${config.apiUrl}users/${comment.author_id}`)
                        .then(res => {
                            let array = this.state.comments;
                            array.unshift({
                                id: comment._id,
                                author: res.data.nick,
                                comment: comment.text,
                                createdAt: comment.createdAt
                            });

                            this.setState({comment: '', comments: array,
                                addedCount: this.state.addedCount + 1
                            })

                        })

                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    sortComments = (e) => {
        let path = '';

        switch (e) {
            case 'commentByDate':
                path = 'date';

                break;
            case 'commentByName':
                path = 'author';
                break;
            default:
                break;
        }

        if (path === '')
            return;


        axios.get(`${config.apiUrl}films/${this.state.filmID}/comments/sort/${path}/${this.state.dir}`,
            {params: {start: 0, limit: this.state.comments.length}})
            .then(res => {

                const data = res.data[0].comments;

                const requests = [];

                data.forEach(comment => {
                    requests.push({
                        id: comment.comment._id,
                        author: comment.author,
                        comment: comment.comment.text,
                        createdAt: comment.comment.createdAt
                    })
                });

                Promise.all(requests).then((comments) => {
                    this.setState({comments: comments});
                });
            });

        this.setState({dir: this.state.dir * -1});
    };

    componentDidMount() {
        this.setState({isLoading: true, filmID: this.props.filmID}, () => {

            axios.get(`${config.apiUrl}films/${this.state.filmID}/desc`,
                {params: {start: this.state.comments.length, limit: 5}})
                .then(res => {

                    let film = res.data;
                    this.setState({
                        hasMore: (film.comments.length > 0),
                        isLoading: false,
                        isLoaded: true,
                        comments: [...this.state.comments, ...film.comments]
                    });

                })
                .catch((err) => {
                    this.setState({
                        error: err.message,
                        isLoading: false
                    })
                })
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.isLoading !== this.props.isLoading) {
            if (this.props.isLoading && !(this.state.error || this.state.isLoading || !this.state.hasMore)) {
                this.loadComments();
            } else {
                this.props.handleLoading(this.state)
            }
        }

        if (prevProps.filmID!== this.props.filmID ) {

            source.cancel();
            source = axios.CancelToken.source();

            this.setState({
                filmID: this.props.filmID,
                comment: '',
                dir: 1,
                comments: [],

                isLoading: true,
                isLoaded: false,
                error: false,
                hasMore: true,
                addedCount: 0
            }, () => {

                this.props.handleLoading(this.state);

                axios.get(`${config.apiUrl}films/${this.props.filmID}/desc`,
                    {cancelToken: source.token, params: {start: 0, limit: 5}})
                    .then(res => {
                        let film = res.data;

                        this.setState({
                            hasMore: (film.comments.length > 0),
                            isLoading: false,
                            isLoaded: true,
                            comments: film.comments
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
                                isLoading: false,
                                isLoaded: true,
                            }, () => {
                                this.props.handleLoading(this.state);
                            })
                        }

                    })
            })
        }

    }


    handleChange(e) {
        this.setState({comment: e.target.value});
    }

    render() {

        const displayDate = (comment) => {
            let date = new Date(Date.parse(comment.createdAt));

            return ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
                + ('0' + date.getFullYear()).slice(-2)
                + ' o ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
        };


        let {commentsLength} = this.props;
        commentsLength += this.state.addedCount;

        return (

            <Col className="p-0 mt-4">
                {
                    this.state.isLoaded &&
                    <Col>
                        <Col className="p-0" sm={12}>
                            <Row>
                                <Col xs={8} sm={10}>
                                    <TextField
                                        value={this.state.comment}
                                        onChange={this.handleChange}
                                        type="text"
                                        id="standard-multiline-flexible"
                                        label="Comment"
                                        multiline
                                        fullWidth
                                        rowsMax="4"
                                    />
                                </Col>
                                <Col xs={2} sm={2}>
                                    <Button className="mt-3" variant="primary"
                                            onClick={() => this.addComment()}>
                                        Submit
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        {
                            <Col className="p-0 mt-4 mb-4" sm={12}>
                                <Row>
                                    <Col xs={7} sm={5} md={4}>
                                        <p className="m-0">{commentsLength + " comments"}</p>
                                    </Col>
                                    <Col xs={2} sm={2}>
                                        <DropdownButton
                                            alignRight
                                            variant="secondary"
                                            title="Sort"
                                            id="dropdown-button-drop-down"
                                            onSelect={k => this.sortComments(k)}>
                                            <Dropdown.Item eventKey="commentByDate">By date</Dropdown.Item>
                                            <Dropdown.Item eventKey="commentByName">By author name</Dropdown.Item>
                                        </DropdownButton>
                                    </Col>
                                </Row>
                            </Col>
                        }

                        {

                            this.state.comments.map(comment => {
                                return (
                                    <Col className="p-0 mt-4" sm={12} key={comment.id}>
                                        <Row className="pl-3">

                                            <p className="m-0 font-weight-bold">
                                                <small className="m-0 font-weight-bold">{comment.author}</small>
                                            </p>
                                            <p>
                                                <small className="m-0">&ensp;{displayDate(comment)}</small>
                                            </p>
                                        </Row>
                                        <p>
                                            <small>{comment.comment}</small>
                                        </p>
                                    </Col>
                                )
                            })


                        }

                    </Col>

                }

                {

                    <Col style={{height: 40}} sm={12} className="mb-2 text-center">
                        {
                            (this.state.isLoading && this.state.hasMore) &&
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
    const {rated} = state.rate;

    return {
        loggedIn,
        rated,
    };
}


const connectedFilmPage = connect(mapStateToProps)(CommentsComponent);

export {connectedFilmPage as CommentsComponent};
