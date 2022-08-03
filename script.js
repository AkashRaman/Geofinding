'use strict';
const body = document.querySelector('body');
const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const neighboursContainer = document.querySelector('.neighbours');
const searchBar = document.getElementById("mySearch");
const menu = document.querySelector('#myMenu');

let id = "";
let maxBox = 3;
let neighbourCountriesData = []


///////////////////////////////////////


// Slicing array into chunks


function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
  }
  return res;
}


//Get Current Position


const getPosition = () => {
  return new Promise((resolve,reject) => {
    navigator.geolocation.getCurrentPosition(resolve,reject
    );
  });
};


// Fetching data and coventing into json


const getJSON = async (url, errorMsg = 'Something went wrong') => {
  const response = await fetch(url);
  //throwing errors if there is one
  // console.log(response.ok)

  if(!response.ok) throw new Error(errorMsg);

  //returning response if there is no error

  return response.json()
}


//Getting Country Details


const getCountryData = async (countrycode) => {
  try{
    const data = await getJSON(`https://restcountries.com/v2/alpha/${countrycode}`,`Country Not Found`);

    // Render Background

    const background = await renderBackground(data.name); 

  //Rendering Main Country 
    renderCountry(data, countriesContainer);
    countriesContainer.style.opacity = 1;
    //Getting neighbour country details


    if(!data.borders) throw new Error(`No Neighbour country`);
    const neighbours = data.borders;
    console.log(neighbours);
    // Getting nad rendering neighbour countries data

    const GetNeighbourData = await Promise.allSettled(neighbours.map(async neighbour => getJSON(`https://restcountries.com/v2/alpha/${neighbour}`,`Country Not Found`)));
    // console.log(GetNeighbourData);

    neighbourCountriesData = GetNeighbourData.map(ele => ele.value);
    neighbourCountriesData.sort(function(a,b){ 
      // console.log(a.population);
      // console.log(b.population);
      // console.log(a.population - b.population);
      if(a.population > b.population) return -1;
      else if(b.population > a.population) return 1;
      else return 0;
    });
    
    //Rendering Neighboring Country

    neighboursContainer.style.opacity = 1;
    renderNeighbourCountries(neighbourCountriesData);
    console.log(neighbourCountriesData);
  }catch(err) {
    catchError(err,`${err.message}, Try Again!!`);
    countriesContainer.style.opacity = 1;
  };
  id =  "";
}


// render background image


const renderBackground = async (country) => {
  try {
    const data = await getJSON(`https://api.unsplash.com/search/photos?query=${country}&client_id=CtlEUEjgZ6YVgmNHFhvqeSn2hpMgVnSqNtD3atffqyE`);
    const url = data.results.find(img => img.width / img.height >= 1).urls.raw;
    // console.log(data.results[0]);
    console.log(url);
    document.body.style.backgroundImage = `url('${url}')`;
  } catch(e) {
    document.body.style.backgroundImage = "none";
  }
};


// Rendering Countries


const renderCountry = (data, container, classname = '') => {
  try{
    const html = `<article class="country ${classname}" id="${id}">
      <img class="country__img" src="${data.flag}" />
      <div class="country__data">
        <h3 class="country__name">${data.name}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(1)} Million</p>
        <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
        <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
      </div>
    </article>`;
    container.insertAdjacentHTML('beforeend', html);
  } catch(err) {
    catchError(err,'Failed to get Data, Try again')
  }
  
}


// Rendering Neighbour Countries


const renderNeighbourCountries = (neighbourCountriesData) => {
  const neighbourCountriesChunk = sliceIntoChunks(neighbourCountriesData,maxBox);

  neighbourCountriesChunk.forEach((neighbourChunk,i) => {
    const boxContainerHtml = `<div class="neighboursBox" id="boxContainer-${i}"></div>`;
    neighboursContainer.insertAdjacentHTML('beforeend', boxContainerHtml);
    const boxContainer = document.querySelector(`#boxContainer-${i}`);
    // console.log(neighbourChunk);
    // console.log(boxContainer);
    neighbourChunk.forEach((neighbour,j) => {
      id = `country_${(maxBox * i) + j}`;
      // console.log(neighbour);
      renderCountry(neighbour, boxContainer,'neighbour')
    })
    boxContainer.style.opacity = 1;
  })
}


// Catching and Rendering Errors


const catchError = (err,msg) => {
  // console.log('catchError working');
  if(err.message === 'No Neighbour country') return;
  countriesContainer.insertAdjacentText('beforeend', msg);
}



// clear data


const clearData = () => {
  countriesContainer.innerHTML = "";
  countriesContainer.style.opacity = 0;
  neighboursContainer.innerHTML = "";
  neighboursContainer.style.opacity = 0;
}


// Renders country using current position 



const whereAmI = async () => {
  clearData();
  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;

    //Getting country of our location

    const data = await getJSON(`https://geocode.xyz/${latitude},${longitude}?json=1`,`Problems with geocoding`);
    console.log(`You are in ${data.city}, ${data.country}`);
    const countrycode = countryNames.find(e => e[0] === data.country)[1];
    console.log(countrycode);

    // Getting Country Data

    getCountryData(countrycode);

    // Testing
    // getCountryData('CHN');

  } catch(err) {
    catchError(err,`${err.message}, Try Again!!`);
    countriesContainer.style.opacity = 1;
  }

}


// Clicking on button


btn.addEventListener('click',whereAmI)


// List of Countries and their Codes 


const countryNames = [
['Afghanistan', 'AFG'],['Åland Islands', 'ALA'],['Albania', 'ALB'],['Algeria', 'DZA'],['American Samoa', 'ASM'],['Andorra', 'AND'],['Angola', 'AGO'],['Anguilla', 'AIA'],['Antarctica', 'ATA'],['Antigua and Barbuda', 'ATG'],['Argentina', 'ARG'],['Armenia', 'ARM'],['Aruba', 'ABW'],['Australia', 'AUS'],['Austria', 'AUT'],['Azerbaijan', 'AZE'],['Bahamas', 'BHS'],['Bahrain', 'BHR'],['Bangladesh', 'BGD'],['Barbados', 'BRB'],['Belarus', 'BLR'],['Belgium', 'BEL'],['Belize', 'BLZ'],['Benin', 'BEN'],['Bermuda', 'BMU'],['Bhutan', 'BTN'],['Bolivia (Plurinational State of)', 'BOL'],['Bonaire, Sint Eustatius and Saba', 'BES'],['Bosnia and Herzegovina', 'BIH'],['Botswana', 'BWA'],['Bouvet Island', 'BVT'],['Brazil', 'BRA'],['British Indian Ocean Territory', 'IOT'],['United States Minor Outlying Islands', 'UMI'],['Virgin Islands (British)', 'VGB'],['Virgin Islands (U.S.)', 'VIR'],['Brunei Darussalam', 'BRN'],['Bulgaria', 'BGR'],['Burkina Faso', 'BFA'],['Burundi', 'BDI'],['Cambodia', 'KHM'],['Cameroon', 'CMR'],['Canada', 'CAN'],['Cabo Verde', 'CPV'],['Cayman Islands', 'CYM'],['Central African Republic', 'CAF'],['Chad', 'TCD'],['Chile', 'CHL'],['China', 'CHN'],['Christmas Island', 'CXR'],['Cocos (Keeling) Islands', 'CCK'],['Colombia', 'COL'],['Comoros', 'COM'],['Congo', 'COG'],['Congo (Democratic Republic of the)', 'COD'],['Cook Islands', 'COK'],['Costa Rica', 'CRI'],['Croatia', 'HRV'],['Cuba', 'CUB'],['Curaçao', 'CUW'],['Cyprus', 'CYP'],['Czech Republic', 'CZE'],['Denmark', 'DNK'],['Djibouti', 'DJI'],['Dominica', 'DMA'],['Dominican Republic', 'DOM'],['Ecuador', 'ECU'],['Egypt', 'EGY'],['El Salvador', 'SLV'],['Equatorial Guinea', 'GNQ'],['Eritrea', 'ERI'],['Estonia', 'EST'],['Ethiopia', 'ETH'],['Falkland Islands (Malvinas)', 'FLK'],['Faroe Islands', 'FRO'],['Fiji', 'FJI'],['Finland', 'FIN'],['France', 'FRA'],['French Guiana', 'GUF'],['French Polynesia', 'PYF'],['French Southern Territories', 'ATF'],['Gabon', 'GAB'],['Gambia', 'GMB'],['Georgia', 'GEO'],['Germany', 'DEU'],['Ghana', 'GHA'],['Gibraltar', 'GIB'],['Greece', 'GRC'],['Greenland', 'GRL'],['Grenada', 'GRD'],['Guadeloupe', 'GLP'],['Guam', 'GUM'],['Guatemala', 'GTM'],['Guernsey', 'GGY'],['Guinea', 'GIN'],['Guinea-Bissau', 'GNB'],['Guyana', 'GUY'],['Haiti', 'HTI'],['Heard Island and McDonald Islands', 'HMD'],['Vatican City', 'VAT'],['Honduras', 'HND'],['Hungary', 'HUN'],['Hong Kong', 'HKG'],['Iceland', 'ISL'],['India', 'IND'],['Indonesia', 'IDN'],['Ivory Coast', 'CIV'],['Iran (Islamic Republic of)', 'IRN'],
['Iraq', 'IRQ'],['Ireland', 'IRL'],['Isle of Man', 'IMN'],['Israel', 'ISR'],['Italy', 'ITA'],['Jamaica', 'JAM'],['Japan', 'JPN'],['Jersey', 'JEY'],['Jordan', 'JOR'],['Kazakhstan', 'KAZ'],['Kenya', 'KEN'],['Kiribati', 'KIR'],['Kuwait', 'KWT'],['Kyrgyzstan', 'KGZ'],["Lao People's Democratic Republic", 'LAO'],['Latvia', 'LVA'],['Lebanon', 'LBN'],['Lesotho', 'LSO'],['Liberia', 'LBR'],['Libya', 'LBY'],['Liechtenstein', 'LIE'],['Lithuania', 'LTU'],['Luxembourg', 'LUX'],['Macao', 'MAC'],['North Macedonia', 'MKD'],['Madagascar', 'MDG'],['Malawi', 'MWI'],['Malaysia', 'MYS'],['Maldives', 'MDV'],['Mali', 'MLI'],['Malta', 'MLT'],['Marshall Islands', 'MHL'],['Martinique', 'MTQ'],['Mauritania', 'MRT'],['Mauritius', 'MUS'],['Mayotte', 'MYT'],['Mexico', 'MEX'],['Micronesia (Federated States of)', 'FSM'],['Moldova (Republic of)', 'MDA'],['Monaco', 'MCO'],['Mongolia', 'MNG'],['Montenegro', 'MNE'],['Montserrat', 'MSR'],['Morocco', 'MAR'],['Mozambique', 'MOZ'],['Myanmar', 'MMR'],['Namibia', 'NAM'],['Nauru', 'NRU'],['Nepal', 'NPL'],['Netherlands', 'NLD'],['New Caledonia', 'NCL'],['New Zealand', 'NZL'],['Nicaragua', 'NIC'],['Niger', 'NER'],['Nigeria', 'NGA'],['Niue', 'NIU'],['Norfolk Island', 'NFK'],["Korea (Democratic People's Republic of)", 'PRK'],['Northern Mariana Islands', 'MNP'],['Norway', 'NOR'],['Oman', 'OMN'],['Pakistan', 'PAK'],['Palau', 'PLW'],['Palestine, State of', 'PSE'],['Panama', 'PAN'],['Papua New Guinea', 'PNG'],['Paraguay', 'PRY'],['Peru', 'PER'],['Philippines', 'PHL'],['Pitcairn', 'PCN'],['Poland', 'POL'],['Portugal', 'PRT'],['Puerto Rico', 'PRI'],['Qatar', 'QAT'],['Republic of Kosovo', 'UNK'],['Réunion', 'REU'],['Romania', 'ROU'],['Russian Federation', 'RUS'],['Rwanda', 'RWA'],['Saint Barthélemy', 'BLM'],['Saint Helena, Ascension and Tristan da Cunha', 'SHN'],['Saint Kitts and Nevis', 'KNA'],['Saint Lucia', 'LCA'],['Saint Martin (French part)', 'MAF'],['Saint Pierre and Miquelon', 'SPM'],['Saint Vincent and the Grenadines', 'VCT'],['Samoa', 'WSM'],['San Marino', 'SMR'],['Sao Tome and Principe', 'STP'],['Saudi Arabia', 'SAU'],['Senegal', 'SEN'],['Serbia', 'SRB'],['Seychelles', 'SYC'],['Sierra Leone', 'SLE'],['Singapore', 'SGP'],['Sint Maarten (Dutch part)', 'SXM'],['Slovakia', 'SVK'],['Slovenia', 'SVN'],['Solomon Islands', 'SLB'],['Somalia', 'SOM'],['South Africa', 'ZAF'],['South Georgia and the South Sandwich Islands', 'SGS'],['Korea (Republic of)', 'KOR'],['Spain', 'ESP'],['Sri Lanka', 'LKA'],['Sudan', 'SDN'],['South Sudan', 'SSD'],['Suriname', 'SUR'],
['Svalbard and Jan Mayen', 'SJM'],['Swaziland', 'SWZ'],['Sweden', 'SWE'],['Switzerland', 'CHE'],['Syrian Arab Republic', 'SYR'],['Taiwan', 'TWN'],['Tajikistan', 'TJK'],['Tanzania, United Republic of', 'TZA'],['Thailand', 'THA'],['Timor-Leste', 'TLS'],['Togo', 'TGO'],['Tokelau', 'TKL'],['Tonga', 'TON'],['Trinidad and Tobago', 'TTO'],['Tunisia', 'TUN'],['Turkey', 'TUR'],['Turkmenistan', 'TKM'],['Turks and Caicos Islands', 'TCA'],['Tuvalu', 'TUV'],['Uganda', 'UGA'],['Ukraine', 'UKR'],['United Arab Emirates', 'ARE'],['United Kingdom of Great Britain and Northern Ireland', 'GBR'],['United States of America', 'USA'],['Uruguay', 'URY'],['Uzbekistan', 'UZB'],['Vanuatu', 'VUT'],['Venezuela (Bolivarian Republic of)', 'VEN'],['Vietnam', 'VNM'],['Wallis and Futuna', 'WLF'],['Western Sahara', 'ESH'],['Yemen', 'YEM'],['Zambia', 'ZMB'],['Zimbabwe', 'ZWE']];


//getting all country names and their codes


// (async function() {
//   try {
//     const response = await getJSON(`https://restcountries.com/v2/all`,'Problem in getting Countries list');

//     let countryNames = []
//     response.forEach(coutnry => {
//       countryNames.push([country.name,country.alpha3Code])
//     })
//     console.log(countryNames);
//   } catch(err) {
//     catchError(err,`${err.message}, Reload the Page!!`)
//   }
// })();


// Responsive

const responsive = () => {
    neighboursContainer.innerHTML = "";
    renderNeighbourCountries(neighbourCountriesData);
}

window.addEventListener("resize", () => {
  if($(window).width() <= "675" && maxBox !== 1){
    console.log($(window).width());
    maxBox = 1;
    if(neighbourCountriesData !== []) responsive();
  }
  if ($(window).width() <= "960" && $(window).width() > "675"&& maxBox !== 2) {
    console.log($(window).width());
    maxBox = 2;
    if(neighbourCountriesData !== []) responsive();
  }
  if ($(window).width() > "960" && maxBox !== 3) {
    console.log($(window).width());
    maxBox = 3;
    if(neighbourCountriesData !== []) responsive();
  }
});

(() => {
  if($(window).width() > "960") maxBox = 3;
  else if($(window).width() <= "960" && $(window).width() > "675") maxBox = 2;
  else maxBox = 1;
})();


// Search the country


const searchCountry = () => {
  const input = searchBar.value.toUpperCase();
  menu.innerHTML = "";
  if(input.length < 3) {
    menu.style.display = "none";  
    return;
  };
  menu.style.display = "block";
  countryNames.forEach(country => {
    if(country[0].toUpperCase().indexOf(input) > -1){
      const liHtml = `<li><a href="#" data-code="${country[1]}" class="link">${country[0]} (${country[1]})</a></li>`;
      menu.insertAdjacentHTML('beforeend',liHtml);
    }
  });
  if(menu.innerHTML === "") {
    menu.insertAdjacentHTML('beforeend', '<li><a href="#" class="disabled">Country Not Found</a></li>');
  }
}

body.addEventListener('click',(e) =>{
  const linkClicked = (e.target.closest('#myMenu') || e.target.closest('#mySearch'));
  if(linkClicked) return;
  menu.style.display = "none"; 
})

searchBar.addEventListener('click',searchCountry);

menu.addEventListener('click',(e) => {
  searchBar.value = "";
  const clicked = e.target.closest('.link');
  if(!clicked) return;
  menu.style.display = "none"; 
  clearData();
  const countrycode = clicked.dataset.code;
  getCountryData(countrycode);
})