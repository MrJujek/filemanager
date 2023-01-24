let howMany = document.getElementsByClassName("renameFolder")

let i = howMany.length
while (howMany.length > 1) {
    howMany[i - 1].remove()
    i--
    howMany = document.getElementsByClassName("renameFolder")
}