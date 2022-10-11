var feed = document.querySelector(".feed_box_alertas")

function getAdd(){
    const address = document.querySelector(".onde").value

    sessionStorage.setItem("ADDRESS", address)
    
}

let destination = sessionStorage.getItem("ADDRESS")

destination = destination.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toLocaleLowerCase()

var source = 'https://maps.googleapis.com/maps/api/staticmap?center=%22+enderecoGoogle+%22&zoom=14&size=800x600&markers=color:yellow%7Clabel:P%7C'+destination+'&key=AIzaSyBmFnBeKU2jbmBsdXTed2EYk1ZBglusu7U'

let miniMap = document.createElement('img')
miniMap.classList.add("alert")
miniMap.src = source

feed.appendChild(miniMap)