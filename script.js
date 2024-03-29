'use strict';
const body = document.querySelector('body');
const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const countryCard = document.querySelector('.country');
const neighboursContainer = document.querySelector('.neighbours');
const searchBar = document.getElementById("mySearch");
const menu = document.querySelector('#myMenu');
const bodyBox = document.querySelector('.container');
const infoBox = document.querySelector('#infoContainer');
const infoBtn = document.querySelector('#infoBtn');
const modal = document.querySelector('.modal');
const modalContainer = document.querySelector('.modal-container');
const modalCloseBtn = document.querySelector('.modal-close');
const loadingBox = document.querySelector('.loading-box');

let id = "";
let maxBox, neighbourCountriesData = [], images,backgroundImage,selectedImageUrls = [],infoImageType,backgroundImageType, slideBtnClasses = [],slideBtnArrowSideway;

let screenratio = ($(window).width() / $(window).height()) >= 1 ? 'Landscape' : 'Potrait';


///////////////////////////////////////


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
  if(!response.ok) throw new Error(errorMsg);
  return response.json()
}


//Getting Country Details


const getCountryData = async (countrycode) => {
  try{
    const data = await getJSON(`https://restcountries.com/v2/alpha/${countrycode}`,`Country Not Found`);

    // Render Background

    await new Promise((resolve,reject) => {
      getBackgroundImages(data.name);
      resolve();
    })  

    getInfo(data.name);

    //Showing loading box

    loadingBox.style.display = 'none';
    loadingBox.style.transform = 'translateY(-100%)';

    //Rendering Main Country
   
    renderCountry(data, countriesContainer);
    countriesContainer.style.opacity = 1;

    //Getting neighbour country details

    if(!data.borders) throw new Error(`No Neighbour country`);
    const neighbours = data.borders;
    
    // Getting and rendering neighbour countries data

    const GetNeighbourData = await Promise.allSettled(neighbours.map(async neighbour => getJSON(`https://restcountries.com/v2/alpha/${neighbour}`,`Country Not Found`)));

    neighbourCountriesData = GetNeighbourData.map(ele => ele.value);

    // Sorting neighbour countries in order of Population

    neighbourCountriesData.sort(function(a,b){ 
      if(a.population > b.population) return -1;
      else if(b.population > a.population) return 1;
      else return 0;
    });
    
    //Rendering Neighboring Country

    neighboursContainer.style.opacity = 1;
    renderNeighbourCountries(neighbourCountriesData);
  }catch(err) {
    catchError(err,`${err.message}, Try Again!!`);
    countriesContainer.style.opacity = 1;
  };
  id =  "";
}


// get background images


const getBackgroundImages = async (country) => {
  try {
    const data = await getJSON(`https://api.unsplash.com/search/photos?query=${country}&client_id=CtlEUEjgZ6YVgmNHFhvqeSn2hpMgVnSqNtD3atffqyE`);
    images = data.results;

    // Calling function to render background image

    renderBackground();
  } catch(e) {
    console.error(e);
    body.style.backgroundImage = "none";
  }
};


// render background image


const renderBackground = () => {
  let image = images.find(img => getImageInRato(img,screenratio));
  if(!image) image = images[0];
  backgroundImage = image;

  // Rendering Background Image prior to Screen width

  if($(window).width() <= 950) body.style.backgroundImage = `url('${backgroundImage.urls.regular}')`;
  
  if($(window).width() > 950) body.style.backgroundImage = `url('${backgroundImage.urls.raw}')`;
  
}


// selecting ratio of image


const getImageInRato = (img, scrnratio) => {
  if (scrnratio === 'Landscape') {
    return img.width / img.height >= 1;
  }
  if (scrnratio === 'Potrait') {
    return img.width / img.height < 1;
  }
}


// Changin Quality of Background Image


const backgroundImageQualityChange = () => {
  if($(window).width() <= 950 && backgroundImageType !== 'regular') {
    backgroundImageType = 'regular';
    body.style.backgroundImage = `url('${backgroundImage.urls.regular}')`;
  } 
  if($(window).width() > 950 && backgroundImageType !== 'raw') {
    backgroundImageType = 'raw';
    body.style.backgroundImage = `url('${backgroundImage.urls.raw}')`;
  }
}


// Selecting images for info box


const selectInfoImages = () => {
  selectedImageUrls = [];
  let infoImages = images.map(img => {
    if(img !== backgroundImage) return img;
    else return 'skip';
  });
  for(let i = 0; i < 2; i++){
    let infoImg = infoImages.find(img => getImageInRato(img,'Landscape'));
    if(!infoImg) infoImg = infoImages.find(img => img !== 'skip');
    infoImages = infoImages.map(img => {
      if(img !== infoImg) return img;
      else return 'skip';
    });
    selectedImageUrls.push(infoImg.urls);      
  } 
}


// Changina quality of Info Images


const infoImageQualityChange = () => {
  const img1 = document.querySelector('#img-1');
  const img2 = document.querySelector('#img-2');
  if((img1 && img2)) {
    if(infoBox .getBoundingClientRect().width <= 350 && infoImageType !== 'small'){
      infoImageType = 'small';
      img1.src = selectedImageUrls[0].small;
      img2.src = selectedImageUrls[1].small;
    }
    if(infoBox .getBoundingClientRect().width > 350 && infoImageType !== 'regular'){
      infoImageType ='regular';
      img1.src = selectedImageUrls[0].regular;
      img2.src = selectedImageUrls[1].regular;
    }
  }
}


// Getting Info of the country


const getInfo = async country => {
  try {

    // Removing Info icon

    infoBtn.classList.remove('fa-info-circle');

    // Getting paragraphs from Wikipedia

    const data = await getJSON(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=1&gsrsearch=${country}`); 
    const pages =  data.query.pages;
    const fullHtml = pages[Object.keys(pages)[0]].extract;
    const firstStart = fullHtml.slice(0,fullHtml.indexOf(country)).lastIndexOf('<p>');
    const firstEnd = fullHtml.indexOf('</p>',firstStart + 1);
    const secondStart = fullHtml.indexOf('<p>',firstEnd + 1);
    const secondEnd = fullHtml.indexOf('</p>',secondStart + 1);    

    // Selecting Images for Info box
    selectInfoImages();
    let sizeUrls = (infoBox .getBoundingClientRect().width <= 350) ? [selectedImageUrls[0].small,selectedImageUrls[1].small] : [selectedImageUrls[0].regular,selectedImageUrls[1].regular];

    // Creating Html for Info Box

    const headingHtml = `<h1 id="infoTitle">${country}</h1>`;
    const para1Html = fullHtml.slice(firstStart,firstEnd + 4);
    const img1Html = `<img id="img-1" src="${sizeUrls[0]}">`;
    const para2Html = fullHtml.slice(secondStart,secondEnd + 4);
    const img2Html = `<img id="img-2" src="${sizeUrls[1]}">`;
    const morebtnHtml = `<a href="https://en.wikipedia.org/wiki/${country}" class='info-more'>More...</a>`;
    
    const html = headingHtml + img1Html + para1Html + img2Html + para2Html + morebtnHtml;

    // Inserting Html into Info Box

    infoBox.insertAdjacentHTML('beforeend',html);
    const infoTitle = document.querySelector('#infoTitle');
    if(country.split(" ").length > 4) infoTitle.style.fontSize = '300%';
    else if(country.split(" ").length > 1) infoTitle.style.fontSize = '400%';
    else infoTitle.style.fontSize = '500%';
    
    // Making Slide Active

    if(!body.classList.contains('slide')) slideInfoBox('Yes');
  } catch(e) {
    console.error(e);
  }
}


// Toggling Sliding Info Box


const slideInfoBox = (active) => {
  if(active === 'Yes') body.classList.add('slide');
  if(active === 'No') body.classList.remove('slide');
  
  // Chaning Icon of Slide btn

  toggleSlideBtnClasses();
}


// toggle Slide Button Classes


const toggleSlideBtnClasses = () => {

  // Icon Changes only if there is no info icon
  
  if(infoBtn.classList.contains('fa-info-circle')) return;

  if (body.classList.contains('slide')) {
    infoBtn.classList.remove(slideBtnClasses[1]);
    infoBtn.classList.add(slideBtnClasses[0]);
  } else {
    infoBtn.classList.remove(slideBtnClasses[0]);
    infoBtn.classList.add(slideBtnClasses[1]);
  }
  
}


// Rendering Countries


const renderCountry = (data, container, classname = '') => {
  try{
    const html = `
    <article class="country ${classname}" id="${id}" data-code="${data.alpha3Code}">
      <img class="country__img" src="${data.flag}" />
      <div class="country__data">
        <h3 class="country__name">${data.name}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${populationString(data.population)}</p>
        <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
        <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
      </div>
      <button class="neighbour-cntry-srch">Click here for more</button>
    </article>`;
    container.insertAdjacentHTML('beforeend', html);
  } catch(err) {
    catchError(err,'Failed to get Data, Try again')
  }
  
}


// Rendering Neighbour Countries


const renderNeighbourCountries = (neighbourCountriesData) => {
  const boxInRow = (maxBox > 1) ? maxBox : 2;
  const neighbourCountriesChunk = sliceIntoChunks(neighbourCountriesData,boxInRow);
  neighboursContainer.classList.remove('expandOnClick')

  // Adding expandOnClick class to Neighbour container only if maxBox = 1 & there are more han one neighbour country

  if(maxBox === 1 && neighbourCountriesData.length > 1) neighboursContainer.classList.add('expandOnClick');

  // Adding neighbour country cards 

  neighbourCountriesChunk.forEach((neighbourChunk,i) => {
    const boxContainerHtml = `<div class="neighboursBox" id="boxContainer-${i}"></div>`;
    neighboursContainer.insertAdjacentHTML('beforeend', boxContainerHtml);
    const boxContainer = document.querySelector(`#boxContainer-${i}`);
    neighbourChunk.forEach((neighbour,j) => {
      id = `country_${(boxInRow * i) + j}`;
      (maxBox > 1) ? renderCountry(neighbour, boxContainer,'neighbour') : renderCountry(neighbour, boxContainer,'neighbour');
    })
    boxContainer.style.opacity = 1;
  })
}


// Slicing array into chunks


const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
  }
  return res;
}


// Catching and Rendering Errors


const catchError = (err,msg) => {
  loadingBox.style.display = 'none';
  loadingBox.style.transform = 'translateY(-100%)';
  if(err.message === 'No Neighbour country') return;
  countriesContainer.classList.add('errorBox');
  countriesContainer.insertAdjacentText('beforeend', msg);
}



// clear data


const clearData = () => {
  countriesContainer.innerHTML = "";
  countriesContainer.style.opacity = 0;
  neighboursContainer.innerHTML = "";
  neighboursContainer.style.opacity = 0;
  neighbourCountriesData = [];
  infoBox.innerHTML = "";
  selectedImageUrls = [];
  body.classList.remove('slide');
  modal.style.display = 'none';
  modal.style.opacity = 0;
  countriesContainer.classList.remove('errorBox');
  loadingBox.style.display = 'block';
  setTimeout(()=> {
    loadingBox.style.transform = 'translateY(0)';
  },10)
}


// Renders country using current position 



const whereAmI = async () => {
  clearData();
  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;
    console.log(latitude);
    console.log(longitude);
    //Getting country of our location

    const data = await getJSON(`https://geocode.xyz/${latitude},${longitude}?json=1`,`Problems with geocoding`);
    console.log(data);
    console.log(`You are in ${data.city}, ${data.country}`);
    const countrycode = countryNames.find(e => e[0] === data.country)[1];
    console.log(countrycode);

    // Getting Country Data

    getCountryData(countrycode);
    
  } catch(err) {
    catchError(err,`${err.message}, Try Again!!`);
    countriesContainer.style.opacity = 1;
  }

}


// Search the country


const searchCountry = () => {
  const input = searchBar.value.toUpperCase();
  menu.innerHTML = "";
  if(input.length < 3) {
    menu.style.display = "none";  
    return;
  };
  menu.style.display = "block";
  let linkId = "1";
  countryNames.forEach((country,i) => {
    if(country[0].toUpperCase().indexOf(input) > -1){
      const liHtml = `<li><a href="#" data-code="${country[1]}" class="link" id="${linkId}">${country[0]} (${country[1]})</a></li>`;
      menu.insertAdjacentHTML('beforeend',liHtml);
      linkId = `${(+linkId) + 1}`;
    }
  });
  if(menu.innerHTML === "") {
    menu.insertAdjacentHTML('beforeend', '<li><a href="#" class="disabled">Country Not Found</a></li>');
  }
}


// Generating Population String


const populationString = (population) => {
  if((population + '').length > 9) return `${(+population / 1000000000).toFixed(3)} Billion`;
  else if((population + '').length > 6) return `${(+population / 1000000).toFixed(1)} Million`;
  else if((population + '').length === 6) return `${(+population / 1000).toFixed(1)} Thousand`;
  else if((population + '').length === 5) return `${(+population / 1000).toFixed(2)} Thousand`;
  else if((population + '').length === 4) return `${(+population / 1000).toFixed(3)} Thousand`;
  else if((population + '').length === 3) return `${+population} Hundred`;
  else return `${+population} People`;
}


// Responsive


const responsive = () => {
  neighboursContainer.innerHTML = "";
  renderNeighbourCountries(neighbourCountriesData);
}

const resize = () => {
  if(bodyBox.getBoundingClientRect().width <= 675 && maxBox !== 1){
    maxBox = 1;
    if(neighbourCountriesData !== []) responsive();
  }
  if(body.classList.contains('slide'))responsiveVariation(1200);
  else responsiveVariation(970);
}

const responsiveVariation = (maxBox2MaxWidth) => {
  if (bodyBox.getBoundingClientRect().width <= maxBox2MaxWidth && bodyBox.getBoundingClientRect().width > 675 && maxBox !== 2) {
    maxBox = 2;
    if(neighbourCountriesData !== []) responsive();
  }
  if (bodyBox.getBoundingClientRect().width > maxBox2MaxWidth && maxBox !== 3) {
    maxBox = 3;
    if(neighbourCountriesData !== []) responsive();
  }
}

new ResizeObserver(resize).observe(bodyBox)

window.addEventListener('resize', () => {
  resize();
  
  if($(window).width() / $(window).height() >= 1 && screenratio !== 'Landscape') {
    screenratio = 'Landscape';
    if(images) {
      renderBackground();
      selectInfoImages();
    }
  }

  if($(window).width() / $(window).height() < 1 && screenratio !== 'Potrait') {
    screenratio = 'Potrait';
    if(images) {
      renderBackground();
      selectInfoImages();
    }
  }

  if ($(window).width() > 674 && slideBtnArrowSideway !== 'true'){
    slideBtnArrowSideway = 'true';
    slideBtnClasses = ['fa-arrow-alt-circle-left','fa-arrow-alt-circle-right']; 
    if(!infoBtn.classList.contains('fa-info-circle')) {
      infoBtn.removeAttribute('class');
      infoBtn.classList.add('fas');
      toggleSlideBtnClasses();
    }
  }

  if($(window).width() <= 674 && slideBtnArrowSideway !== 'false'){
    slideBtnArrowSideway = 'false';
    slideBtnClasses = ['fa-arrow-alt-circle-down','fa-arrow-alt-circle-up']; 

    if(!infoBtn.classList.contains('fa-info-circle')) {
      infoBtn.removeAttribute('class');
      infoBtn.classList.add('fas');
      toggleSlideBtnClasses();
    }
  }

  if(images) infoImageQualityChange();
  if(backgroundImage) backgroundImageQualityChange();
})


// Event Listners


body.addEventListener('click',(e) =>{

  // Event listners for neighbour country search

  if(e.target.closest('.neighbour-cntry-srch')) {
    clearData();
    try {
      const countrycode = e.target.closest('.country').dataset.code;
      getCountryData(countrycode);
    } catch(err) {
      catchError(err,`${err.message}, Try Again!!`);
      countriesContainer.style.opacity = 1;
    }
    return;
  }

  // Event listners for Modal box

  const modalClicked = (e.target.classList[0] === 'modal') || (e.target.classList[0] === 'modal-container') || (e.target.classList[2] === 'modal-close');
  
  if(modalClicked) {
    setTimeout(()=> {
      modal.style.display = 'none';
    },500)
    modal.style.opacity = 0;
  }

  // Event Listeners for Menu box and Search bar

  const linkClicked = (e.target.closest('#myMenu') || e.target.closest('#mySearch'));
  
  if(linkClicked) return;
  menu.style.display = "none"; 
});

// Event listners for search bar

searchBar.addEventListener('click',searchCountry());

searchBar.addEventListener('keypress', (e) => {
  if(e.key === "Enter"){
    searchBar.value = "";
    const link = document.querySelectorAll('.link')[0];
    if(!link) return;
    menu.style.display = "none"; 
    clearData();
    const countrycode = link.dataset.code;
    getCountryData(countrycode);
    return;
  } 
})

document.addEventListener( 'keydown', e => {
  const currentInput = document.activeElement;
  if(!((e.key === "ArrowUp" || e.key === "ArrowDown") && currentInput.id == "mySearch")) return;
    
  const links = Array.from(document.querySelectorAll('.link'));
  if(links.length === 0) return;
  let nextActLnkId;
  const cntActiveLink = links.find(link => link.classList.contains('active'));
  const cntactLnkId = (cntActiveLink) ? cntActiveLink.id : "0";
  links.map(link => link.classList.remove('active'))
  if(e.key === "ArrowDown") nextActLnkId = ((+cntactLnkId) < links.length) ? `${(+cntactLnkId) + 1}` : "1";
  if(e.key === "ArrowUp") nextActLnkId = ((+cntactLnkId) > 1) ? `${(+cntactLnkId) - 1}` : `${links.length}`;
  const selectedLink = document.getElementById(nextActLnkId);
  const selectedLinkHtml = selectedLink.innerHTML.slice(0,selectedLink.innerHTML.lastIndexOf(' '));
  selectedLink.classList.add('active');
  searchBar.value = selectedLinkHtml;
});

document.addEventListener('keyup', e => {
  const currentInput = document.activeElement;
  if(!((e.key === "ArrowUp" || e.key === "ArrowDown") && currentInput.id == "mySearch")) searchCountry();
})


// Event listners for Menu box

menu.addEventListener('click',(e) => {
  searchBar.value = "";
  const clicked = e.target.closest('.link');
  if(!clicked) return;
  menu.style.display = "none"; 
  clearData();
  const countrycode = clicked.dataset.code;
  getCountryData(countrycode);
});

// Event listners for Where am I Button

btn.addEventListener('click',whereAmI);

// Event listners for Slide Button

infoBtn.addEventListener('click',() => {
  if(!body.classList.contains('slide')) slideInfoBox('Yes');
  else slideInfoBox('No');
});

// Event listners for Neighbour Cards with expandOnCLick Class in Neighbour Countainer

neighboursContainer.addEventListener('click', (e) => {

  // Function runs only if Neighbour Countainer has expandOnCLick Class
  
  if(!neighboursContainer.classList.contains('expandOnClick')) return;

  // Function runs only if Neighbour COuntry Card is clicked

  const clicked = e.target.closest('.neighbour');
  if(!clicked) return;

  const index = +(clicked.id.slice(-1));
  modalContainer.innerHTML = '';
  renderCountry(neighbourCountriesData[index], modalContainer)
  modal.style.display = 'flex';
  setTimeout(()=> {
    modal.style.opacity = 1;
  },5)
});


// IIFE 


(() => {
  if($(window).width() > "960") maxBox = 3;
  else if($(window).width() <= "960" && $(window).width() > "675") maxBox = 2;
  else maxBox = 1;

  if(infoBox .getBoundingClientRect().width <= 350) infoImageType = 'small';
  else infoImageType = 'regular';

  if($(window).width() <= 950) backgroundImageType = 'regular';
  else backgroundImageType = 'raw';
  
  slideBtnClasses = ($(window).width() > 674) ? ['fa-arrow-alt-circle-left','fa-arrow-alt-circle-right'] : ['fa-arrow-alt-circle-down','fa-arrow-alt-circle-up']; 
  slideBtnArrowSideway = ($(window).width() > 674) ? 'true' : 'false'; 
})();


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

