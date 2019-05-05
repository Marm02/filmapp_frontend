import React from 'react';
import {connect} from 'react-redux';

import {Button, Form, Modal} from 'react-bootstrap';

import {userActions} from "../../actions";

class RegisterComponent extends React.Component {
    constructor(props) {
        super(props);

        this.props.dispatch(userActions.logout());

        this.state = {
            user: {
                nick: '',
                email: '',
                password: '',
            },
            submitted: false,
            show: true
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const {name, value} = e.target;
        const {user} = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({submitted: true});
        const {user} = this.state;
        const {dispatch} = this.props;

        if (user.email && user.nick && user.password && user.password.length >= 6) {
            dispatch(userActions.register(user));
        }
    }


    render() {

        let modalClose = () => {
            this.setState({show: false});
            this.props.history.goBack();
        };

        const {registering} = this.props;
        const {user, submitted} = this.state;
        const {alert} = this.props;

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
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group>
                            <Form.Label htmlFor="nick">Nick</Form.Label>
                            <Form.Control isInvalid={submitted && !user.nick} type="text" name="nick" value={user.nick}
                                          onChange={this.handleChange}>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                Nick is required
                            </Form.Control.Feedback>
                        </Form.Group>

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

                        <Form.Group>
                            <Form.Label htmlFor="password">Password</Form.Label>
                            <Form.Control isInvalid={submitted && (user.password.length < 6)} type="password"
                                          name="password" value={user.password} maxLength="11"
                                          onChange={this.handleChange}>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {
                                    user.password.length === 0 ? "Password is required" : "Password too short (min 6 chars)"
                                }

                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group>
                            <Button type="submit" className="btn-primary">
                                Register
                            </Button>

                            {registering &&
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

const connectedRegisterPage = connect(mapStateToProps)(RegisterComponent);
export {connectedRegisterPage as RegisterComponent};