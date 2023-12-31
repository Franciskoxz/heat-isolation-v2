var statusData = null;
let interval = null;
let previousStatus = null;
const baseUrl = `${location.protocol}//${location.host}`;

// Functions for /

/**
 * Get the status from the API
 * 
 * @returns {Promise<{internalTemp: number, externalTemp: number, desiredTemp: number, status: string}>}
 */
document.addEventListener('DOMContentLoaded', function() {
function getStatus() {
  return fetch(`${baseUrl}/status`)
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching data:', error));
}

/**
 * Initialize the device with the desired temperature and the sampling frequency
 * 
 * @param {number} desiredTemp 
 * @param {number} samplingFrequency 
 * @returns {Promise<void>}
 */
function initializeDevice(desiredTemp, samplingFrequency) {
  return fetch(`${baseUrl}`, {
    method: 'POST',
    body: JSON.stringify({
      samplingFrequency,
      desiredTemp
    })
  }).then((response) => response.json())
}

/**
 * Setup the initial configuration for the main page
 */
function setupMainPage() {
  setupForm();
  setupCurrentStatus();
}

/**
 * Setup the form with the current internal temperature as the minimum value
 */
async function setupCurrentStatus() {
  const statusData = await getStatus();
  const { internalTemp } = statusData;
  const desiredTemp = document.getElementById('desiredTemp');
  desiredTemp.min = internalTemp;
}

/**
 * Setup the initial configuration for the prototype form page
 */
function setupForm() {
  const prototypeForm = document.getElementById('prototypeForm');
  
  prototypeForm?.addEventListener("submit", function (event) {
    event.preventDefault();
    // Comparar la temperatura ingresada con la internalTemp
    const desiredTemp = +document.getElementById('desiredTemp').value;
    const samplingFrequency = +document.getElementById('samplingFrequency').value;
  
    initializeDevice(desiredTemp, samplingFrequency).then(() => {
      window.location.href = "on";
    }).catch((error) => {
      if (error.status === 400 && error.error) {
        alert(error.error);
      }
    })
  });
}


// Functions for /on

/**
 * Setup the interval to fetch data from the API
 */
function setupOnPage() {
  setDataFetchInterval();
}

/**
 * Clear the interval to fetch data from the API
 */
function clearDataFetchInterval() {
  clearInterval(interval);
}

/**
 * Set the interval to fetch data from the API every 3 seconds
 */
function setDataFetchInterval() {
  interval = setInterval(() => {
    getStatusData();
  }, 3000);
}

/**
 * Get the status from the API
 */
async function getStatusData() {
  try {
    const statusData = await getStatus();

    if (statusData) {
      const { internalTemp, externalTemp, desiredTemp, status } = statusData;
      const internalTempElement = document.getElementById('internalTemp');
      const externalTempElement = document.getElementById('externalTemp');
      const desiredTempElement = document.getElementById('desiredTemp');
      const statusElement = document.getElementById('status');

      if(internalTempElement) {
        internalTempElement.innerHTML = `${internalTemp ?? '--'} °C`;
      }
      if(externalTempElement){
        externalTempElement.innerHTML = `${externalTemp ?? '--'} °C`;
      }
      if(desiredTempElement){
        desiredTempElement.innerHTML = `${desiredTemp ?? '--'} °C`;
      }
      if(statusElement){
        statusElement.innerHTML = status;
      }
      if (previousStatus !== 'OFF' && status === 'OFF') {
        clearDataFetchInterval();
        location.href = '/';
      }
      previousStatus = status;
    } else {
      console.error('El estado devuelto por la API es undefined.');
    }
  } catch (error) {
    console.error('Error al obtener el estado:', error);
  }
}


// Functions for /report

/**
 * Get the results from the API
 * 
 * @returns {Promise<Array<{internalTemp: number, externalTemp: number, date: string}>>}
 */
function getResults() {
  return fetch(`${baseUrl}/results`)
    .then((response) => response.json())
    .catch((error) => console.error('Error fetching data:', error));
}

/**
 * Fill the table with the results from the API
 */
async function fillTable() {
  const { data } = await getResults();
  const table = document.getElementById("dataTable");
  data.forEach((medicion) => {
    const row = table.insertRow();
    addDataIntoCell(row.insertCell(0), medicion.externalTemp);
    addDataIntoCell(row.insertCell(1), medicion.internalTemp);
    addDataIntoCell(row.insertCell(3), medicion.externalTemp - medicion.internalTemp);
  });
}

/**
 * Add data into a cell
 * 
 * @param {HTMLElement} cell 
 * @param {string|number} data 
 */
function addDataIntoCell(cell, data) {
  cell.innerHTML = `${data || '--'} °C`;
}
});