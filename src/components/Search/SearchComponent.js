import React, {Component} from 'react';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Collapse, Row, Spinner} from 'react-bootstrap';

import {config} from "../../config";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import connect from "react-redux/es/connect/connect";
import Button from '@material-ui/core/Button';

import queryString from 'query-string';
import _ from "lodash";

import "./SearchComponent.css";
import {PlaylistAddButtonComponent} from "../Playlist/PlaylistAddButtonComponent";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import TextTruncate from "react-text-truncate";
import Truncate from "react-truncate";
import {isMobile} from 'react-device-detect'

const pathName = config.pathName;

let filters = [
    {id: 'last_hour', title: 'Last hour'},
    {id: 'today', title: 'Today'},
    {id: 'this_week', title: 'This week'},
    {id: 'this_month', title: 'This month'},
    {id: 'this_year', title: 'This year'},
];


class SearchComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            films: [],
            addOpenedIndex: -1,

            click: false,

            error: false,
            hasMore: true,
            isLoading: false,
            scroll: {},
            windowWidth: window.innerWidth,

            open: false,
            openSnackbar: false,

            filter: '',
            sort: '',
            dir: 1,
            sorts: [
                {id: 'upload_date', title: 'Upload date', dir: 1},
                {id: 'view_count', title: 'View count', dir: 1},
                {id: 'rating', title: 'Rating', dir: 1},
            ]
        };

        window.onresize = () => {

            this.setState({windowWidth: window.innerWidth});

        };
    }


    componentDidMount() {

        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);

        this.setState({
            scroll: {
                scrollTop: window.pageYOffset,
                offsetHeight: document.documentElement.offsetHeight,
                innerHeight: window.innerHeight
            }
        });
        let params = queryString.parse(this.props.location.search);

        this.setState({
            isLoading: true,
            search: params.search,
            dir: params.dir ? params.dir : 1,
            sort: params.sort ? params.sort : '',
            filter: params.filter ? params.filter : ''
        }, () => {


            axios.get(`${config.apiUrl}films/filter/title/?search=${this.state.search}&sort=${this.state.sort}&filter=${this.state.filter}&dir=${this.state.dir}`,
                {params: {start: 0, limit: 5}})
                .then(res => {
                    const films = res.data;

                    films.forEach(film => {
                        film.add = false;
                    });

                    this.setState({
                        hasMore: (films.length > 0),
                        films: [...this.state.films, ...films],
                        isLoading: false
                    });
                }).catch(err => {
                console.log(err);
            });

        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.state.click) {
            this.setState({click: false});
            return;
        }

        let params = queryString.parse(this.props.location.search);
        let prevParams = queryString.parse(prevProps.location.search);

        if (_.isEqual(prevParams, params) === false) {
            this.setState({
                scroll: {
                    scrollTop: window.pageYOffset,
                    offsetHeight: document.documentElement.offsetHeight,
                    innerHeight: window.innerHeight
                }
            });


            this.setState({

                films: [],
                addOpenedIndex: -1,

                click: false,

                error: false,
                hasMore: true,
                scroll: {},
                windowWidth: window.innerWidth,

                open: false,
                openSnackbar: false,

                isLoading: true,
                search: params.search,
                dir: params.dir ? params.dir : 1,
                sort: params.sort ? params.sort : '',
                filter: params.filter ? params.filter : ''

            }, () => {

                if (params.sort && params.sort !== '') {
                    this.state.sorts.forEach(sort => {
                        if (sort.id === params.sort) {
                            sort.dir = parseInt(params.dir);
                        }
                    })
                }

                axios.get(`${config.apiUrl}films/filter/title/?search=${this.state.search}&sort=${this.state.sort}&filter=${this.state.filter}&dir=${this.state.dir}`,
                    {params: {start: 0, limit: 5}})
                    .then(res => {
                        const films = res.data;

                        films.forEach(film => {
                            film.add = false;
                        });

                        this.setState({
                            hasMore: (films.length > 0),
                            films: [...this.state.films, ...films],
                            isLoading: false
                        });
                    }).catch(err => {
                    console.log(err);
                });

            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }


    handleScroll = () => {

        if (this.state.addOpenedIndex >= 0 && !isMobile) {
            let array = this.state.films;
            array[this.state.addOpenedIndex].add = false;

            this.setState({films: array, addOpenedIndex: -1});
        }

        this.setState({
            scroll: {
                scrollTop: window.pageYOffset,
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
        if ((window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight - 150)) {
            loadData();
        }
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

    handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({openSnackbar: false});
    };


    loadData = () => {
        this.setState({isLoading: true}, () => {
            axios.get(`${config.apiUrl}films/filter/title/?search=${this.state.search}&sort=${this.state.sort}&filter=${this.state.filter}&dir=${this.state.dir}`,
                {
                    params: {
                        start: this.state.films.length,
                        limit: this.state.films.length < 5 ? 5 : this.state.films.length + 5
                    }
                })
                .then(res => {
                    const films = res.data;
                    this.setState({
                        hasMore: (films.length > 0),
                        films: [...this.state.films, ...films],
                        isLoading: false
                    });
                }).catch(err => {
                console.log(err);
            });
        });
    };

    parseDate = (film) => {

        let date = new Date(Date.parse(film.createdAt));
        let today = new Date();


        let time = Math.abs(Math.floor((
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes()) -
            Date.UTC(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                today.getHours(),
                today.getMinutes()))
            / (1000 * 60)));

        if (time / 60 >= 1) {
            time /= 60;

            if (time / 24 >= 1) {

                time /= 24;

                if (time / 30 >= 1) {

                    time /= 30;

                    if (time / 12 >= 1) {

                        time = time / 12;
                        time = Math.floor(time) + ' years ';

                    } else {
                        time = Math.floor(time) + ' months ';
                    }

                } else {
                    time = Math.floor(time) + ' days ';
                }

            } else {
                time = Math.floor(time) + ' hours ';
            }
        } else {
            time = Math.floor(time) + ' minutes ';
        }

        time = time + 'ago';

        return time;
    };

    setRedirect = (e, filmID) => {

        if (e && e.target && (e.target.id === "s-c-1"
            || e.target.id === "s-c-2" || e.target.id === "s-c-3" || e.target.id === "s-c-4"
            || (e.target.localName === "path" && e.target.parentElement && e.target.parentElement.parentElement
                && e.target.parentElement.parentElement.id !== "a-b-2"))) {
            this.props.history.push(`${pathName}film/` + filmID);
        }

    };


    handleOnclick = (state, type) => {

        this.setState({click: true});

        let filter = this.state.filter;
        let sort = this.state.sort;
        let dir = this.state.dir;

        if (state === 'filter') {
            if (this.state.filter === type.id) {
                this.setState({filter: ''});
                sort = this.state.sort;
                filter = '';
                dir = this.state.dir;
            } else {
                this.setState({filter: type.id});
                sort = this.state.sort;
                filter = type.id;
                dir = this.state.dir;
            }
        } else {
            if (this.state.sort === type.id) {
                sort = type.id;

                if (type.dir === 1) {
                    type.dir = -1;
                    this.setState({dir: -1});
                    dir = type.dir;
                } else if (type.dir === -1) {
                    this.setState({sort: ''});
                    filter = this.state.filter;
                    type.dir = 1;
                    sort = '';
                    this.setState({dir: 1});
                }

            } else {
                this.setState({sort: type.id});
                filter = this.state.filter;
                sort = type.id;
                dir = type.dir;
            }

        }


        if (sort !== '' && filter !== '') {
            this.props.history.push({
                search: `?search=${this.state.search}&sort=${sort}&dir=${dir}&filter=${filter}`,
            });

        } else if (sort === '' && filter !== '') {
            this.props.history.push({
                search: `?search=${this.state.search}&filter=${filter}`,
            });
        } else if (sort !== '' && filter === '') {
            this.props.history.push({
                search: `?search=${this.state.search}&sort=${sort}&dir=${dir}`,
            });
        } else if (sort === '' && filter === '') {
            this.props.history.push({
                search: `?search=${this.state.search}`,
            });
        }


        axios.get(`${config.apiUrl}films/filter/title/?search=${this.state.search}&sort=${sort}&filter=${filter}&dir=${dir}`,
            {params: {start: 0, limit: this.state.films.length < 5 ? 5 : this.state.films.length}})
            .then(result => {
                const films = result.data;
                this.setState({films: films});

            }).catch(err => {
        });

    };

    render() {
        const {scroll} = this.state;
        const {open} = this.state;

        return (
            <Col>

                <Button
                    onClick={() => this.setState({open: !open})}
                    aria-controls="filter-collapse"
                    aria-expanded={open}
                    className="mt-3 p-2 button-my"><FontAwesomeIcon style={{cursor: "pointer"}} icon="filter"/></Button>

                <Collapse in={this.state.open}>
                    <Row id="filter-collapse">
                        <Col className="mt-4" sm={4}>
                            <p style={{'fontWeight': 500}}>UPLOAD DATE</p>

                            <Col sm={8} className="mt-3 mb-3 divider"/>


                            {
                                filters.map((filter) => {
                                    return (<p key={filter.id} style={this.state.filter === filter.id ? {
                                            fontWeight: 700,
                                            fontSize: 80 + '%'
                                        } :
                                        {fontWeight: 400, fontSize: 80 + '%'}}
                                               onClick={() => this.handleOnclick('filter', filter)}
                                               className="filter-search">{filter.title}</p>)
                                })
                            }

                        </Col>

                        <Col className="mt-4" sm={4}>
                            <p style={{'fontWeight': 500}}>SORT BY</p>

                            <Col sm={8} className="mt-3 mb-3 divider"/>

                            {
                                this.state.sorts.map((sort) => {
                                    return (<Row key={sort.id} className="ml-0">
                                        <p style={this.state.sort === sort.id ? {
                                                fontWeight: 700,
                                                fontSize: 80 + '%'
                                            } :
                                            {fontWeight: 400, fontSize: 80 + '%'}}
                                           onClick={() => this.handleOnclick('sort', sort)}
                                           className="filter-search">{sort.title}</p>
                                        {this.state.sort === sort.id && sort.dir === 1 ?
                                            <FontAwesomeIcon className="ml-2" icon="sort-up"/> :
                                            this.state.sort === sort.id && sort.dir === -1 ?
                                                <FontAwesomeIcon className="ml-2" icon="sort-down"/> : ""}
                                    </Row>)
                                })
                            }

                        </Col>

                    </Row>
                </Collapse>

                <Col sm={12} className="mt-2 mb-3 divider"/>

                <Row>

                    {
                        <Col className="mt-4">
                            {
                                this.state.films.map((film, index) => {
                                        let time = this.parseDate(film);

                                        let lines = this.state.windowWidth < 1200 && this.state.windowWidth > 576 ? 1 : 2;

                                        return <Col xs={12} sm={12} lg={8}
                                                    className="film-preview-holder m-0 mb-1 container"
                                                    onClick={(e) => this.setRedirect(e, film.id)} key={film.id}>
                                            <Row className="d-sm-none mb-4">
                                                <Col xs={8} sm={4}>
                                                    <div className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                                                        <img alt="" id="s-c-1" className="image embed-responsive-item"
                                                             src={`${config.apiUrl}films/${film.id}/thumbnail/${film.thumbnail._id}?width=small`}/>
                                                        <FontAwesomeIcon className="middle" icon="play"/>
                                                    </div>
                                                </Col>
                                                <Col xs={4} sm={8} className="p-0">
                                                    <Row className="m-0">
                                                        <Col xs={8} sm={8} className="p-0">

                                                            <Truncate lines={1} id="s-c-2"
                                                                      className="mb-1 title-search font-weight-bold">
                                                                {film.title}
                                                            </Truncate>

                                                        </Col>

                                                        {
                                                            this.state.windowWidth < 576 &&
                                                            <PlaylistAddButtonComponent parentName="search"
                                                                                        filmID={film.id}
                                                                                        show={film.add} index={index}

                                                                                        handleAddPlaylistButtonClick={this.handleAddPlaylistButtonClick}
                                                                                        handleClick={this.handleCreatePlaylistClick}
                                                                                        handleClickOutside={this.handleClickOutside}
                                                                                        handlePlaylistOperation={this.handlePlaylistOperation}/>

                                                        }

                                                    </Row>
                                                    <p id="s-c-3" className="mb-0 author-nick">
                                                        <small>{film.author_name} &#183; {film.views} views</small>
                                                    </p>

                                                </Col>
                                            </Row>

                                            <Col className="d-none d-sm-inline">
                                                <Row className="style-search">
                                                    <Col xs={8} sm={4}>
                                                        <div
                                                            className="embed-responsive embed-responsive-16by9 z-depth-1-half">
                                                            <img alt="" id="s-c-1" className="image embed-responsive-item"
                                                                 src={`${config.apiUrl}films/${film.id}/thumbnail/${film.thumbnail._id}?width=small`}/>
                                                            <FontAwesomeIcon className="middle" icon="play"/>
                                                        </div>
                                                    </Col>
                                                    <Col xs={4} sm={8} className="p-0 ">
                                                        <Row className="m-0">
                                                            <Col xs={10} sm={10} className="p-0 mb-1">
                                                                <Truncate lines={lines} id="s-c-2"
                                                                          className="mb-0 title-search font-weight-bold">
                                                                    {film.title}
                                                                </Truncate>
                                                            </Col>

                                                            {
                                                                this.state.windowWidth >= 576 &&
                                                                <PlaylistAddButtonComponent parentName="search"
                                                                                            filmID={film.id}
                                                                                            show={film.add} index={index}

                                                                                            handleAddPlaylistButtonClick={this.handleAddPlaylistButtonClick}
                                                                                            handleClick={this.handleCreatePlaylistClick}
                                                                                            handleClickOutside={this.handleClickOutside}
                                                                                            handlePlaylistOperation={this.handlePlaylistOperation}/>
                                                            }
                                                        </Row>
                                                        <p id="s-c-3" className="mb-1 author-nick-search">
                                                            <small>{film.author_name} &#183; {film.views} views &#183; {time}</small>
                                                        </p>

                                                        <small><TextTruncate id="s-c-4" className="mb-0 author-nick-search"
                                                                             line={lines} text={film.description}/></small>

                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Col>


                                    }
                                )
                            }

                        </Col>
                    }

                </Row>

                {

                    this.state.hasMore &&
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
        loggedIn
    };
}

const connectedSearchPage = connect(mapStateToProps)(SearchComponent);


export {connectedSearchPage as SearchComponent};
