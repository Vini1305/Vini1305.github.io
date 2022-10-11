var space = document.querySelector("#info_trajeto")
var output = document.querySelector("#distancia")
var outscore = document.querySelector("#score")

function getValues(){
    const current = document.querySelector("#current").value
    const address = document.querySelector(".onde").value

    sessionStorage.setItem("CURRENT", current)
    sessionStorage.setItem("ADDRESS", address)
}

async function getDistance(){

    output.innerHTML = ''
    outscore.innerHTML = ''

    getValues()

    let current = sessionStorage.getItem("CURRENT")
    let address = sessionStorage.getItem("ADDRESS")

    if (current != null){
        current = current.replace(/\s+/g, '').replace(/[^\w\s]/gi, '').toLocaleLowerCase()
    }

    if (address != null){
        address = address.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toLocaleLowerCase()
    }

    var distanceBetween = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+current+'&destinations='+address+'&units=imperial&key=AIzaSyBmFnBeKU2jbmBsdXTed2EYk1ZBglusu7U'

    console.log(JSON.stringify(distanceBetween))  

    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
        origins: [current],
        destinations: [address],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, function(response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
        alert('Error was: ' + status);
        } /*else {
        alert(response.originAddresses[0] + ' --> ' + response.destinationAddresses[0] + ' ==> ' + response.rows[0].elements[0].distance.text);
        }*/

        let head = document.createElement('span')
        head.innerHTML = 'distância'

        let head2 = document.createElement('span')
        head2.innerHTML = 'pontuação do trecho'

        let outputBox = document.createElement('span')
        outputBox.classList.add("dist")
        outputBox.innerHTML = response.rows[0].elements[0].distance.text

        let outscoreBox = document.createElement('span')
        outscoreBox.classList.add("scor")
        outscoreBox.innerHTML = "10"

        output.appendChild(head)
        output.appendChild(outputBox)

        outscore.appendChild(head2)
        outscore.appendChild(outscoreBox)


    });
    
}
