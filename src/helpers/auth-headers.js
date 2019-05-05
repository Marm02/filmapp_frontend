export function authHeader() {

    let user = JSON.parse(localStorage.getItem('user'));

    if(user && user.token){
        return { 'Authorization' : 'Bearer ' + user.token};
    } else{
        return {};
    }
}

export function loginHeader(username, password){
    let loginToken = window.btoa(username + ':' + password);
    console.log("LOGIN TOKENNNNNNNNNNNNN")
    console.log(loginToken)
    return { 'Authorization':  'Basic ' +  loginToken };

}