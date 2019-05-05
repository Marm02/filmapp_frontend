import React from 'react';
import {connect} from 'react-redux';

import {Alert, Button, Form, Modal} from 'react-bootstrap';

import {userActions} from "../../actions";
import {config} from "../../config";
import axios from 'axios';

class ForgotPasswordComponent extends React.Component {
    constructor(props) {
        super(props);

        this.props.dispatch(userActions.logout());

        this.state = {
            user: {
                email: ''
            },
            submitted: false,
            show: true,

            emailSending: false,
            emailSend: false,
            emailError: false,

            errorMessage: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitForgotRequest = this.handleSubmitForgotRequest.bind(this);
    }

    handleChange(e) {
        this.setState({emailError: false});

        const {name, value} = e.target;
        const {user} = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    }

    handleSubmitForgotRequest(e) {
        e.preventDefault();

        this.setState({emailSending: true, emailError: false, errorMessage: ''});

        axios.post(`${config.apiUrl}users/password/forgot`, {email: this.state.user.email} )
            .then(res => {
                console.log(res);
                this.setState({emailSend: true, emailSending: false});
            })
            .catch(err => {
                console.log(JSON.stringify(err));

                let errorMessage = '';

                if(err.response && err.response.data && err.response.data.errors)
                    errorMessage = err.response.data.errors;

                this.setState({emailError: true, emailSending: false, errorMessage: errorMessage});

            })
    };

    render() {

        let modalClose = () => {
            this.setState({show: false});
            this.props.history.goBack();
        };

        const {user, submitted, emailSending, emailSend, emailError, errorMessage} = this.state;

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
                    <Form onSubmit={this.handleSubmitForgotRequest}>
                        <Form.Group>
                            <Form.Label htmlFor="email">Email</Form.Label>
                            <Form.Control
                                isInvalid={(submitted && !user.email) || (alert.type === 'alert-danger' && alert.message)}
                                type="email" name="email" value={user.email} onChange={this.handleChange}>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {
                                    alert.message ? alert.message : "Email is required"
                                }
                            </Form.Control.Feedback>
                        </Form.Group>



                        {
                            emailSend &&
                            <Alert variant="success">
                                Email with link to reset password has been sent.
                            </Alert>
                        }

                        {
                            emailError &&
                            <Alert variant="danger">
                                {errorMessage ? errorMessage : "Error while sending email." }
                            </Alert>
                        }

                        <Form.Group>
                            <Button type="submit" className="btn-primary">
                                Reset password
                            </Button>

                            {emailSending &&
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

const connectedForgotPasswordComponent = connect(mapStateToProps)(ForgotPasswordComponent);
export {connectedForgotPasswordComponent as ForgotPasswordComponent};