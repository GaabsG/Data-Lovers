import { filterData, sortData, computeStats } from "./data.js";
import celebrities from "../data/celebrities.js";

/* FORM SECTION */

let currentTab = 0;
document.addEventListener("DOMContentLoaded", function (event) {
  showTab(currentTab);
  document
    .getElementById("prevBtn")
    .addEventListener("click", () => nextPrev(-1));
  document
    .getElementById("nextBtn")
    .addEventListener("click", () => nextPrev(1));
});

function showTab(n) {
  const x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  if (n === 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n === x.length - 1) {
    document.getElementById("nextBtn").innerHTML =
      '<i class="fa fa-angle-double-right"></i>';
  } else {
    document.getElementById("nextBtn").innerHTML =
      '<i class="fa fa-angle-double-right"></i>';
  }
  fixStepIndicator(n);
}

function nextPrev(n) {
  const x = document.getElementsByClassName("tab");
  if (n === 1 && !validateForm()) return false;
  x[currentTab].style.display = "none";
  currentTab = currentTab + n;
  if (currentTab >= x.length) {
    document.getElementById("nextprevious").style.display = "none";
    document.getElementById("all-steps").style.display = "none";
    document.getElementById("register").style.display = "none";
    document.getElementById("text-message").style.display = "block";

    console.log("Post último tab");
    data();

    // Enable selector
    const elements = document.querySelectorAll(".form-select");
    elements.forEach((element) => {
      element.disabled = false;
    });
  } else {
    showTab(currentTab);
  }
}

function validateForm() {
  let i,
    valid = true;
  const x = document.getElementsByClassName("tab");
  const y = x[currentTab].getElementsByTagName("input");
  for (i = 0; i < y.length; i++) {
    if (y[i].value === "") {
      y[i].className += " invalid";
      valid = false;
    } else {
      if (currentTab === 2) {
        const input = y[i].value;
        const dateSplitted = input.split("-");
        const userYear = dateSplitted[0];
        const dateTimeRegex = /^\d{1,4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (dateTimeRegex.test(input)) {
          const year = input.substring(0, 4);
          if (year <= new Date().getFullYear()) {
            y[i].setCustomValidity("");
          } else {
            y[i].setCustomValidity(
              " ¡Ey!, ✋🏻⚠️ No tan rápido.\n Disfruta tu año, el " +
              userYear +
              " ya llegará. 😉"
            );
            y[i].className += " invalid";
            valid = false;
          }
        } else {
          y[i].setCustomValidity(
            "Wow 😲 ¿Vienes del futuro?\nEl año " +
            userYear +
            " todavía no llega. 😅"
          );
          y[i].className += " invalid";
          valid = false;
        }
      }
    }
  }
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid;
}

const today = new Date().toLocaleString("sv-SE").replace(" ", "T").slice(0, 16);

function updateHTML(elmId, value) {
  const elem = document.getElementById(elmId);
  if (typeof elem !== "undefined" && elem !== null) {
    elem.setAttribute("max", value);
  }
}
updateHTML("DateOB", today);
const dob = document.getElementById("DateOB").value;

function fixStepIndicator(n) {
  let i;
  const x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  x[n].className += " active";
}

/* END FORM SECTION */

// FIXME: Buscar forma de sacar variable globa. Indispensable para el parametro de API
let latLong;

// Get lat & long and insert in input
function getLatLng(location) {
  latLong = JSON.stringify(location).replace(/"lat":|"lng":|/gi, "");
  document.getElementById("location").value = latLong;
}

// Show map for long/lat
function initMap() {
  const myLatlng = { lat: -14.6306, lng: -57.4633 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: myLatlng,
  });
  // Create the initial InfoWindow.
  let infoWindow = new google.maps.InfoWindow({
    content: "¡Dale click en tu ciudad de nacimiento!",
    position: myLatlng,
  });

  infoWindow.open(map);
  // Configure the click listener.
  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    infoWindow.close();
    // Create a new InfoWindow.
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(
      getLatLng(mapsMouseEvent.latLng),
      JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    infoWindow.open(map);
  });
}

window.initMap = initMap;


let dateTime;

// Get time zone from users location
async function getTimeZone() {
  const promise = new Promise((resolve) => {
    dateTime = document.getElementById("birthdaytime").value;
    const offset = new Date(dateTime).getTimezoneOffset(),
      o = Math.abs(offset);
    resolve(
      (offset < 0 ? "+" : "-") +
      ("00" + Math.floor(o / 60)).slice(-2) +
      ":" +
      ("00" + (o % 60)).slice(-2)
    );
  });

  const result = await promise;
  return result;
}



/* API SECTION */

/* END API SECTION */





const astroData = fetch("/data/astrology.json")
  .then((response) => response.json())
  .then((info) => {
    return info.data;
  })
  .catch((error) => console.error("Error:", error));

const data = async () => {
  const wait = await astroData;
  createDeck(wait);
}

/* let zodiac;
const printData = async () => {
  const a = await astroData;
  console.log("AstroData: " + astroData);
  zodiac = a["zodiac"]["name"];
  console.log("Zodiac dentro de astro " + zodiac);
}; */

/* CARD SECTION */
let zodiac;
const userName = document.getElementById("fName");
const backImg = "<img class='back' src='./images/carta.png'/>";

// Create & print main results
function createDeck(data) {
  console.log("la data", data)
  zodiac = data["zodiac"]["name"];
  console.log("Zodiac dentro de astro " + zodiac);

}


/* FILTER SECTION */

// Listener for filter data
document.querySelector("#options").addEventListener("change", () => {
  const condition = document.getElementById("options").value;
  if (!filterData(zodiac, condition)) {
    document
      .getElementById("options")
      .setCustomValidity(
        "¿Quieres saber 'qué quieres saber'? 👀 \n Esa no es una opción válida"
      );
  }
});


// Const of elements
const earth = ["Capricornio", "Tauro", "Virgo"];
const air = ["Libra", "Geminis", "Acuario"];
const water = ["Cancer", "Piscis", "Escorpio"];
const fire = ["Aries", "Leo", "Sagitario"];
const divRes = document.getElementById("mainResult");

// Get element of sign
function getElements(zodiac) {
  const msg = "Este signo pertenece al elemento de ";
  const msg2 = " igual que: ";

  // FIXME: Probar que funcione el msg impreso
  if (zodiac === "Capricorn" || zodiac === "Virgo" || zodiac === "Taurus") {
    divRes.innerText = msg + "tierra" + msg2 + earth.forEach((sign) => sign);
  } else if (
    zodiac === "Libra" ||
    zodiac === "Gemini" ||
    zodiac === "Aquarius"
  ) {
    divRes.innerText = msg + "aire" + msg2 + air.forEach((sign) => sign);
  } else if (
    zodiac === "Cancer" ||
    zodiac === "Pisces" ||
    zodiac === "Scorpio"
  ) {
    divRes.innerText = msg + "agua" + msg2 + water.forEach((sign) => sign);
  } else if (
    zodiac === "Aries" ||
    zodiac === "Leo" ||
    zodiac === "Sagittarius"
  ) {
    divRes.innerText = msg + "fuego" + msg2 + fire.forEach((sign) => sign);
  }
}

// Get generation
function getGeneration() {
  const msg = "De acuerdo a tu año de nacimiento perteneces a la generación: ";
  const date = document.getElementById("DateOB").value;
  const year = date.slice(0, 4);

  if (year <= "1960" && year >= "1949") {
    divRes.innerText = msg + "Baby Boomer";
  } else if (year <= "1980" && year >= "1969") {
    divRes.innerText = msg + "X";
  } else if (year <= "1993" && year >= "1981") {
    divRes.innerTex = msg + "Millennial";
  } else if (year <= "2010" && year >= "1994") {
    divRes.innerText = msg + "Z";
  } else if (year <= "2023" && year >= "2011") {
    divRes.innerText = msg + "Alfa";
  }
}

// Remove elements from DOM
function removeElements(id) {
  const parent = document.getElementById(id);
  let child = parent.firstChild;
  while (child) {
    parent.removeChild(child);
    child = parent.firstChild;
  }
}

// Get selected option from Categories
function getCategory(sign) {
  const categoriesList = [];
  celebrities["celebrities"].forEach((dictionary) => {
    if (sign.slice(0, 5) === dictionary["sign"].slice(0, 5)) {
      categoriesList.push(dictionary["category"]);
    }
  });
  removeElements("sortBy");

  // Filter categories repetitions
  const categoriesToPrint = categoriesList.filter(
    (item, index) => categoriesList.indexOf(item) === index
  );

  // Create new options in select
  const sel = document.getElementById("sortBy");
  sel.innerHTML =
    "<option selected disabled>Selecciona área de tu interés</option>";
  categoriesToPrint.forEach((element) => {
    const opt = document.createElement("option");
    opt.value = element;
    opt.text = element;
    opt.class = "form-option";
    sel.add(opt);
  });

  // Listener with change for select option
  const optionCategory = document.getElementById("sortBy");
  optionCategory.addEventListener("change", () => {
    removeElements("celebrity");
    const category = optionCategory.options[optionCategory.selectedIndex].value;
    sortData(sign, category, "ordenAlfabetico");
  });
}

// Show celebrities with the same sign
function getCelebrities(celebritiesNames) {
  // Create anchor for celebrities names
  const divCeleb = document.getElementById("celebrity");
  const rootList = document.createElement("ul");
  divCeleb.appendChild(rootList);
  for (let i = 0; i < celebritiesNames.length; i++) {
    const name = celebritiesNames[i];
    const itemList = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = "#displayResult";
    anchor.text = name;
    anchor.id = "celebrity" + i;
    anchor.class = "sortBy"
    rootList.appendChild(itemList);
    itemList.appendChild(anchor);


  }

  // Enable sort by Order options
  const elements = document.querySelectorAll(".sortOrder");
  elements.forEach((element) => {
    element.classList.remove("disabled");
  });

  document.getElementById("asc").addEventListener("click", (order) => {
    removeElements("celebrity");
    sortData("sign", "category", order.target.value);
  });
  document.getElementById("desc").addEventListener("click", (order) => {
    removeElements("celebrity");
    sortData("sign", "category", order.target.value);
  });
}


// Print quotes of celebrities
function printQuotes(celebName) {
  celebrities["celebrities"].forEach((dictionary) => {
    if (celebName === dictionary["name"]) {
      console.log(
        "Entro al if" +
        dictionary["quote"] +
        dictionary["name"] +
        dictionary["DOB"]
      );
      divRes.innerText = dictionary["quote"];
      document.getElementById("nameCeleb").innerText = dictionary["name"];
      document.getElementById("DOB").innerText = "<i class='fas fa-birthday-cake'></i>" + dictionary["DOB"];
    }
  });
}

document.getElementById("celebrity").addEventListener("click", (event) => {
  printQuotes(event.target.text);
});


// Listener and print of stats
document.getElementById("optionsStats").addEventListener("change", (event) => {
  const stats = computeStats(
    celebrities["celebrities"],
    event.target.value,
    zodiac
  );

  let msg1;
  let msg2 = [];

  if (event.target.value === "signStat") {
    msg1 = " de tu signo";
    for (const key in stats) {
      if (stats.hasOwnProperty(key)) {
        const value = stats[key];
        msg2.push(" " + key + ": " + value + "%");
      }
    }
  } else if (event.target.value === "elementStat") {
    msg1 = " del elemento al que pertenece tu signo";
    for (const key in stats) {
      if (stats.hasOwnProperty(key)) {
        const value = stats[key];
        msg2.push(" " + key + ": " + value + "%");
      }
    }
  }

  divRes.innerHTML =
    "De acuerdo a nuestra base de datos lo que sabemos " + msg1 +
    ", estas son nuestras estadísticas: " +
    msg2.toString();
});


/* Card Section */

// Mostrar la carta trasera
// Cortar el nombre "card-" de cada carta para utilizarla
// Asignar if para cada carta (3 cartas)

// //global variables


//Creates a tarot card deck


/* function cardsConst(displayName) {
  this.displayName = displayName;
}

let id = 0;
for (let a0 = 0; a0 < 4; a0++) {
  switch (a0) {
    case 0:
      suit = "cups";
      break;
    case 1:
      suit = "pentacles";
      break;
    case 2:
      suit = "swords";
      break;
    case 3:
      suit = "wands";
      break;
  }

  for (let a1 = 1; a1 < 15; a1++) {
    let rank = a1;
    switch (a1) {
      case 1:
        rank = "ace";
        break;
      case 2:
        rank = "two";
        break;
      case 3:
        rank = "three";
        break;
      case 4:
        rank = "four";
        break;
      case 5:
        rank = "five";
        break;
      case 6:
        rank = "six";
        break;
      case 7:
        rank = "seven";
        break;
      case 8:
        rank = "eight";
        break;
      case 9:
        rank = "nine";
        break;
      case 10:
        rank = "ten";
        break;
      case 11:
        rank = "page";
        break;
      case 12:
        rank = "knight";
        break;
      case 13:
        rank = "queen";
        break;
      case 14:
        rank = "king";
        break;
      default:
        break;
    }
    id++;

    msg = new cardsConst(displayName);
    deck[id] = msg;
  }
}

deck[57] = new cardsConst("fool");
deck[58] = new cardsConst("magician");
deck[59] = new cardsConst("high_priestess");
deck[60] = new cardsConst("empress");
deck[61] = new cardsConst("emperor");
deck[62] = new cardsConst("hierophant");
deck[63] = new cardsConst("lovers");
deck[64] = new cardsConst("chariot");
deck[65] = new cardsConst("strength");
deck[66] = new cardsConst("hermit");
deck[67] = new cardsConst("wheel_of_fortune");
deck[68] = new cardsConst("justice");
deck[69] = new cardsConst("hanged_man");
deck[70] = new cardsConst("death");
deck[71] = new cardsConst("temperance");
deck[72] = new cardsConst("devil");
deck[73] = new cardsConst("tower");
deck[74] = new cardsConst("star");
deck[75] = new cardsConst("moon");
deck[76] = new cardsConst("sun");
deck[77] = new cardsConst("judgement");
deck[78] = new cardsConst("world");

for (let t = 0; t < 78; t++) {
  deckArr.push(t + 1);
}

return deckArr;
}

//gets image i = id from createDeck()
function getFront(i) {
let img = $(
  "<img class='front' src='https://www.biddytarot.com/cards/" +
    deck[i].name +
    ".jpg' alt=" +
    deck[i].displayName +
    "/>"
);
return img;
} */

// //Past, Present, Future spread
// function pastPresentFuture() {
//   $("img, #blurb, #card-name, #rev").remove();
//   $("#pastPresentFuture").html('Another Reading?');

//     let randCardDisplayName = "<p id='card-name'>" + deck[rand].displayName + "</p>"

//       $("#td-" + b).html(randCardImg);
//       $("#td-display-name-" + b).append(randCardDisplayName);
//       $("#td-" + b).html(randCardImg).addClass("invert");
//       $("#td-display-name-" + b).append(randCardDisplayName);
//       $("#rev-" + b).html('<p id="rev"><i>Reversed</i></p>');
//     }
//   }

export {
  getElements,
  getGeneration,
  getCategory,
  getCelebrities,
};
