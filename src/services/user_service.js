import { config } from '../config'
import { loginHeader } from '../helpers';

export const userService = {
    login,
    logout,
    register
};

function login(username, password) {

    let loginHeaderMy =  loginHeader(username, password);

    const requestOptions = {
        method: 'POST',
        headers: loginHeaderMy

    };

    return fetch(`${config.apiUrl}/users/auth`, requestOptions)
        .then(handleResponse)
        .then(user => {
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        })
}

function logout(){
    localStorage.removeItem('user');
}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };
    return fetch(`${config.apiUrl}/users/`, requestOptions)
        .then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if(!response.ok){
            if(response.status === 401){
                logout();
            }
            const error = (data && data.errors) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    })
}

