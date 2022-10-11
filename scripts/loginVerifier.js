var loginpswd = document.querySelector('#loginpaswd');

function getInfo(){
    const login = document.querySelector("#login").value
    const senha = document.querySelector("#senha").value

    sessionStorage.setItem("LOGIN", login)
    sessionStorage.setItem("SENHA", senha)
}

function verify(){

    getInfo()

    let login = sessionStorage.getItem("LOGIN")
    let senha = sessionStorage.getItem("SENHA")

    if (login=='admin'&&senha=='admin'){
        window.open("../home.html","_self")
    }else{
        alert("Login ou senha inválidos")
    }
}