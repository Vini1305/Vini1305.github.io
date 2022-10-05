var space = document.querySelector("#info_trajeto")

function getDistance(){
    const current = document.querySelector("#current").value
    const destinations = document.querySelector(".onde").value

    sessionStorage.setItem("CURRENT", current)
    sessionStorage.setItem("DESTINATIONS", destinations)
}

let destinations = sessionStorage.getItem("DESTINATION")
let current = sessionStorage.getItem("CURRENT")

destinations = destinations.replace(/\s+/g, '')

destinations = destinations.toLocaleLowerCase()

destinations = destinations.replace(/[^\w\s]/gi, '')

current = current.replace(/\s+/g, '')

current = current.toLocaleLowerCase()

current = current.replace(/[^\w\s]/gi, '')

let distanceBetween = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+current+'destinations='+destinations+'&units=imperial&key=AIzaSyBmFnBeKU2jbmBsdXTed2EYk1ZBglusu7U'

console.log(distanceBetween)


