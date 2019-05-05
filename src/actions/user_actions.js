import { userConstants } from "../constants";
import { userService } from "../services/user_service";
import { alertActions } from "./alert_actions";
import { history } from "../helpers";

export const userActions = {
    login,
    logout,
    register,
    rate,
    playlistFilm
};

function login(username, password) {
    return dispatch => {
        dispatch(request({username}));

        userService.login(username, password)
            .then(user => {
                dispatch(success(user));
                dispatch(userActions.rate('CHECK_RATE'));
                history.goBack();
            },
            error =>{
                dispatch(failure(error.toString()));
                dispatch(alertActions.error(error.toString()));
            }
        );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user}}
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user }}
    function failure(error) {return { type: userConstants.LOGIN_FAILURE, error }}
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT }
}

function register(user) {
    return dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(

                user => {
                    dispatch(success());
                    dispatch(alertActions.success('Registration successful'));
                    history.goBack();
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            )
    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }

}


function rate(meta) {

    return dispatch => {
        dispatch(request(meta));

    };

    function request(meta) { return { type: userConstants.RATED, meta } }

}

function playlistFilm(action) {

    return dispatch => {
        dispatch(operation(action));
    };

    function operation(operation) { return { type: userConstants.PLAYLIST_FILM_ACTION, operation } }
}

