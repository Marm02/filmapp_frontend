import React, {Component} from 'react';
import {Col} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {PlaylistAddComponent} from './PlaylistAddComponent'
import connect from "react-redux/es/connect/connect";


class PlaylistAddButtonComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }

    componentDidMount() {
        this.setState({show: true});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.show !== this.props.show) {
            this.setState({show: this.props.show});
        }
    }

    render() {
        const {index} = this.props;
        const {show} = this.props;
        const {loggedIn} = this.props;

        const {parentName} = this.props;

        const size = parentName !== "home" ? (parentName !== "profile" ? 2 : 12) : 8;

        return (

            loggedIn ?
            <Col id="a-b-1" xs={size} sm={size}
                 className="p-0 text-center justify-content-center d-flex playlist-add-home">
                <Col id="a-b-2" xs={8} sm={8}
                     className="playlist-add-icon-holder p-0 text-center"
                     onClick={() => {
                         this.props.handleAddPlaylistButtonClick(index)
                     }}>

                    <FontAwesomeIcon id="a-b-3" style={{opacity: (show ? 1 : "")}}
                                     className="playlist-add-icon" icon="ellipsis-v"/>
                </Col>

                {
                    show && <PlaylistAddComponent parentName={this.props.parentName}
                                                  filmID={this.props.filmID}
                                                  filmTitle={this.props.filmTitle}
                                                  show={show} index={index}
                                                  playlistID = {this.props.playlistID}

                                                  handleClick={this.props.handleClick}
                                                  handleClickOutside={this.props.handleClickOutside}
                                                  handlePlaylistOperation={this.props.handlePlaylistOperation}/>

                }
            </Col>
                :
                null

        )

    }

}


function mapStateToProps(state) {
    const {loggedIn} = state.auth;

    return {
        loggedIn,
    };
}


const connectedPlaylistAddButtonComponent = connect(mapStateToProps)(PlaylistAddButtonComponent);

export { connectedPlaylistAddButtonComponent as PlaylistAddButtonComponent };
