//querySelectorAll selects all the elements from DOM for a perticuler CSS property
var addToCartNodes = document.querySelectorAll(".addToCart");

// Function to handle the popup display
function showPopup(title, description) {
    document.getElementById('popup-title').innerText = title;
    document.getElementById('popup-description').innerText = description;
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

// Function to close the popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

addToCartNodes.forEach(function(element){

    element.addEventListener("click",function(event){
        // console.log(event.target.getAttribute("id"));
        var id = event.target.getAttribute("id")

        addToCart(id);
    })

})


function addToCart(id) {
    var request = new XMLHttpRequest();
    request.open("POST", "/cart");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({ id: id }));

    request.addEventListener("load", function () {
        if (request.status === 401) {  // Use '===' for comparison
            console.log("Please login..");
            window.location.href = '/login';  
        } else {
            console.log("Sab thik hai ji");
            showPopup('Added in cart successfully','Please jump on cart section to complete this order..');
        }
    });
}
