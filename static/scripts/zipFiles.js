function downloadZip() {
    let checked = document.querySelectorAll('input[type="checkbox"]:checked');
    let checkedFiles = [];

    let file_path
    if (!document.getElementById('file_path')) {
        file_path = "/files"
    } else {
        file_path = document.getElementById('file_path').getAttribute("href");
    }

    for (let i = 0; i < checked.length; i++) {
        console.log(checked[i].id);
        checkedFiles.push(checked[i].id);
    }

    console.log('Ziping files...');
    fetch('/zipFiles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            files_to_zip: checkedFiles,
            file_path: file_path
        })
    }).then(response => response.text())
        .then(
            data => {
                if (data == "Files zipped") {
                    alert(data)
                    location.reload()
                } else {
                    alert(data)
                }
            }
        )
}