import React from 'react';
import {connect} from 'react-redux';

import {Alert, Button, Form, Modal} from 'react-bootstrap';

import {userActions} from "../../actions";
import {config} from "../../config";
import axios from 'axios';

const pathName = config.pathName;
class ResetPasswordComponent extends React.Component {
    constructor(props) {
        super(props);

        this.props.dispatch(userActions.logout());

        this.state = {
            user: {
                password: '',
            },
            submitted: false,
            show: true,

            resetRequested: false,
            resetSuccessful: false,
            resetError: false,

            errorMessage: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitPasswordChange = this.handleSubmitPasswordChange.bind(this);
    }

    handleChange(e) {
        this.setState({submitted: false, resetError: false});

        const {name, value} = e.target;
        const {user} = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    }

    handleSubmitPasswordChange(e) {
        e.preventDefault();

        this.setState({submitted: true, resetRequested: true, resetError: false});

        const {user} = this.state;

        if (this.props.match.params.token && user.password && user.password.length >= 6) {
            axios.post(`${config.apiUrl}users/password/reset/${this.props.match.params.token}`,
                {password: this.state.user.password})
                .then(res => {

                    this.setState({resetSuccessful: true, resetRequested: false});

                    setTimeout(function () {
                        this.setState({show: false});
                        this.props.history.push(`${pathName}`);
                        setTimeout(function () {
                            this.props.history.push(`${pathName}login`);
                        }.bind(this), 500);
                    }.bind(this), 1500);

                })
                .catch(err => {
                    let errorMessage = '';

                    if(err.response && err.response.data && err.response.data.errors)
                        errorMessage = err.response.data.errors;

                    this.setState({resetError: true, resetSuccessful: false, resetRequested: false, errorMessage: errorMessage});

                })
        }else{
            this.setState({resetRequested: false});
        }
    }

    render() {

        let modalClose = () => {
            this.setState({show: false});
            this.props.history.push(`${pathName}`);
        };

        const {user, submitted, resetSuccessful, resetRequested, resetError, errorMessage} = this.state;

        return (

            <Modal
                onHide={modalClose}
                show={this.state.show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Register
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleSubmitPasswordChange}>
                        <Form.Group>
                            <Form.Label htmlFor="password">Password</Form.Label>
                            <Form.Control isInvalid={submitted && (user.password.length < 6 )} type="password"
                                          name="password" value={user.password} maxLength="11"
                                          onChange={this.handleChange}>
                            </Form.Control>
                            <Form.Control.Feedback type={"invalid"}>
                                {
                                    user.password.length === 0 ? "Password is required" : "Password too short (min 6 chars)"
                                }

                            </Form.Control.Feedback>
                        </Form.Group>

                        {
                            resetSuccessful &&
                            <Alert variant="success">
                                Password has been reseated! Redirecting to login page.
                            </Alert>
                        }

                        {
                            resetError &&
                            <Alert variant="danger">
                                {errorMessage ? errorMessage : 'Error while resetting password.'}
                            </Alert>
                        }

                        <Form.Group>
                            <Button type="submit" className="btn-primary">
                                Reset password
                            </Button>

                            {resetRequested &&
                            <img alt="loading..." className="pl-2"
                                 src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="/>
                            }
                        </Form.Group>

                    </Form>

                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={modalClose}>Close</Button>
                </Modal.Footer>


            </Modal>


        );
    }
}

function mapStateToProps(state) {
    const {registering} = state.registration;
    const {alert} = state;
    return {
        registering,
        alert
    };
}

const connectedResetPasswordComponent = connect(mapStateToProps)(ResetPasswordComponent);
export {connectedResetPasswordComponent as ResetPasswordComponent};