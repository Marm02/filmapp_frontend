import React from 'react';
import {connect} from 'react-redux';

import {Button, Col, Form, Modal} from 'react-bootstrap';

import {userActions} from "../../actions";

class LoginComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            submitted: false,
            show: true
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({submitted: true});
        const {email, password} = this.state;
        const {dispatch} = this.props;

        if (email && password) {
            dispatch(userActions.login(email, password));
        }
    }

   handleForgotPassword = () => {
        this.props.history.goBack();

        setTimeout(function () {
                this.props.history.push(`${this.props.location.pathname.slice(0, -5)}forgot${this.props.location.search}`);
            }.bind(this),
            500);
    };



    render() {

        let modalClose = () => {
            this.setState({show: false});
            this.props.history.goBack();
        };

        let handleRegister = () => {
            this.props.history.goBack();

            setTimeout(function () {
                    this.props.history.push(`${this.props.location.pathname.slice(0, -5)}register${this.props.location.search}`);
                }.bind(this),
                500);
        };


        const {loggingIn} = this.props;
        const {alert} = this.props;
        const {email, password, submitted} = this.state;
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
                        Login
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleSubmit}>

                        <Form.Group>
                            <Form.Label htmlFor="email">Email</Form.Label>
                            <Form.Control isInvalid={submitted && !email} type="email" name="email" value={email}
                                          onChange={this.handleChange}>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                Email is required
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label htmlFor="password">Password</Form.Label>
                            <Form.Control isInvalid={submitted && !password} type="password" name="password"
                                          value={password} onChange={this.handleChange}>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                Password is required
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group>
                            <Button type="submit" className="btn-primary">
                                Login
                            </Button>

                            {loggingIn &&
                            <img alt="loading..." className="pl-2"
                                 src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="/>
                            }
                        </Form.Group>

                    </Form>

                    {alert.message &&
                    <Col className={`alert ${alert.type}`}>{alert.message}</Col>
                    }

                    <Button variant="link" onClick={handleRegister} className="p-0 m-0 btn btn-link">Register</Button>

                    <Col className="p-0 m-0 " xs={12} sm={12}>
                        <Button variant="link" onClick={this.handleForgotPassword} className="p-0 m-0 btn btn-link">Forgot password?</Button>
                    </Col>

                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={modalClose}>Close</Button>
                </Modal.Footer>


            </Modal>


        );
    }
}

function mapStateToProps(state) {
    const {loggingIn} = state.auth;
    const {alert} = state;
    return {
        loggingIn,
        alert
    };
}

const connectedLoginPage = connect(mapStateToProps)(LoginComponent);
export {connectedLoginPage as LoginComponent};