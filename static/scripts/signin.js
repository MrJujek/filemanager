function signin() {
    console.log("signin");
    let login = document.getElementById("login").value;
    let password = document.getElementById("password").value;
    if (login == "" || password == "") {
        alert("Login and password are required");
        return;
    }

    fetch("/signin", {
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
            if (data == "Success") {
                //alert(data);
                window.location.href = "/";
            } else {
                document.getElementById("password").value = "";
            }
        }
        );
}