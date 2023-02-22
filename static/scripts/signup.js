function signup() {
    console.log("signin");
    let login = document.getElementById("login").value;
    let password = document.getElementById("password").value;
    let repeatpassword = document.getElementById("repeatpassword").value;

    if (login == "" || password == "") {
        alert("Login and password are required");
        return;
    }
    if (password != repeatpassword) {
        alert("Passwords are not the same");
        return;
    }

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            login: login,
            password: password
        })
    })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            if (data == "Zarejestrowano") {
                //window.location.href = "/";
            } else {
                document.getElementById("password").value = "";
                document.getElementById("repeatpassword").value = "";
                document.getElementById("login").value = "";
                alert(data);
            }
        }
        );
}