var feed = document.querySelector(".feed_box_alertas")

function getAdd(){
    const address = document.querySelector(".onde").value

    sessionStorage.setItem("ADDRESS", address)
}

let destination = sessionStorage.getItem("ADDRESS")

destination = destination.replace(/\s+/g, '')

destination = destination.toLocaleLowerCase()

destination = destination.replace(/[^\w\s]/gi, '')

var source = 'https://maps.googleapis.com/maps/api/staticmap?center=%22+enderecoGoogle+%22&zoom=14&size=400x400&markers=color:yellow%7Clabel:P%7C'+destination+'&key=AIzaSyBmFnBeKU2jbmBsdXTed2EYk1ZBglusu7U'

let miniMap = document.createElement('img')
miniMap.classList.add("alert")
miniMap.src = source

feed.appendChild(miniMap)