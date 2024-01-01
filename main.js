
const app = document.getElementById("app");

async function fetchWeatherData(city) {
  try {
    const apiKey = '1b5c3884adf12bb77e202863d535e220';
    
    // Fetch current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    const currentWeatherData = await currentWeatherResponse.json();

    // Fetch 4-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Display current weather data
    console.log('Current Weather:', currentWeatherData);

    // Display 4-day forecast data
    console.log('4-Day Forecast:', forecastData);

    displayWeatherForecast(forecastData);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert('گرفتن اطلاعات با مشکل مواجه شد لطفا اتصال اینترنت خود را چک کرده و نام شهر را وارد کنید');
  }
}

function displayWeatherForecast(forecastData) {
  const forecastContainer = document.getElementById("app");
  forecastContainer.innerHTML = ''; // Clear previous content

  const daysData = groupByDay(forecastData.list);

  for (const [day, dayData] of Object.entries(daysData)) {
    const averageTemperature = calculateAverage(dayData, 'temp');
    const averageHumidity = calculateAverage(dayData, 'humidity');
    const weatherIconCode = getMostCommonWeatherIcon(dayData);

    // Create elements for each day
    const dayCard = document.createElement("div");
    dayCard.className = "day-card";

    const summaryElement = document.createElement("div");
    summaryElement.innerHTML = `<span>${day}:</span> 
      <span>دما: ${averageTemperature.toFixed(2)}°C,</span> 
      <span>رطوبت: ${averageHumidity.toFixed(2)}%,</span> 
      <span>آب و هوا: <img src="http://openweathermap.org/img/wn/${weatherIconCode}.png" alt="Weather Icon"></span>`;

    const seeMoreButton = document.createElement("button");
    seeMoreButton.textContent = "دیدن جزئیات";
    seeMoreButton.className = "btn_more";
    seeMoreButton.addEventListener("click", () => {
      toggleDetailedInformation(dayCard, day, dayData);
    });

    const detailedInformationElement = document.createElement("div");
    detailedInformationElement.className = "detailed-information";
    dayCard.appendChild(summaryElement);
    dayCard.appendChild(seeMoreButton);
    dayCard.appendChild(detailedInformationElement);
    forecastContainer.appendChild(dayCard);
  }
}

function getMostCommonWeatherIcon(dayData) {
  // Get the most common weather icon for the day
  const weatherIcons = dayData.map((forecast) => forecast.weather[0].icon);
  const iconCounts = weatherIcons.reduce((acc, icon) => {
    acc[icon] = (acc[icon] || 0) + 1;
    return acc;
  }, {});

  const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) => (iconCounts[a] > iconCounts[b] ? a : b));

  return mostCommonIcon;
}


function groupByDay(forecastList) {
  const groupedData = {};

  forecastList.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString('fa-IR', { weekday: 'long' });

    if (!groupedData[forecastDate]) {
      groupedData[forecastDate] = [];
    }

    groupedData[forecastDate].push(forecast);
  });

  return groupedData;
}

function calculateAverage(dayData, property) {
  const values = dayData.map((forecast) => forecast.main[property]);
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function toggleDetailedInformation(dayCard, day, dayData) {
  const detailedInformationElement = dayCard.querySelector(".detailed-information");

  // Clear previous detailed information
  detailedInformationElement.innerHTML = '';

  if (dayCard.classList.contains("active")) {
    dayCard.classList.remove("active");
  } else {
    // Close previous active card
    const activeCard = document.querySelector(".day-card.active");
    if (activeCard) {
      activeCard.classList.remove("active");
    }

    dayCard.classList.add("active");

    const detailedInformation = dayData.map((forecast) => {
      const temperatureCelsius = forecast.main.temp - 273.15;
      const humidity = forecast.main.humidity;
      const rainfall = forecast.rain ? forecast.rain['3h'] : 0;

      return `دما: ${temperatureCelsius.toFixed(2)}°C, 
              رطوبت: ${humidity.toFixed(2)}%`;
    });

    // Display detailed information below the day
    detailedInformationElement.innerHTML = `<p> <span> ${day}: </span> <br/> ${detailedInformation.join('<br>')}</p>`;
  }

  
}

function getWeatherByCity() {
  const cityInput = document.getElementById("city_location");
  const city = cityInput.value.trim();

  if (city) {
    fetchWeatherData(city);
  } else {
    alert('لطفا شهر مورد نظر را در ورودی وارد کنید.');
  }
}

function getWeatherByLocation() {
  getLocationAndCity();
}

function getLocationAndCity() {
  const cityInput = document.getElementById("city_location");
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Use reverse geocoding to get the city name
        const reverseGeocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=3465314b34e941ba9e1b2a3af7c3929d`;

        try {
          const response = await fetch(reverseGeocodingUrl);
          const data = await response.json();

          // Extract the city name from the response
          const cityName = data.results[0].components.city;

          cityInput.value = cityName; // Set the city in the input field
          fetchWeatherData(cityName);
        } catch (error) {
          console.error("Error getting city name:", error);
          alert('خطا در دریافت نام شهر. لطفا شهر مورد نظر را در ورودی وارد کنید.');
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert('خطا در دریافت مکان. لطفا شهر مورد نظر را در ورودی وارد کنید.');
      }
    );
  } else {
    alert("موقعیت جغرافیایی توسط این مرورگر پشتیبانی نمی شود. لطفا شهر مورد نظر را در ورودی وارد کنید.");
  }
}

//10