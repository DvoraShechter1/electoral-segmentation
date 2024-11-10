function createCache() {
    const cache = {};

    return {
        get: (key) => cache[key],
        set: (key, value) => cache[key] = value
    };
}
const citiesCache = createCache();

const select = document.getElementById("select");
const cityDataUrl = "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&q=&limit=32000";
const electionDataUrl = "https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2";
let myChart;
const filteredKeys = [
    "מצביעים",
    "rank שם ישוב",
    "שם ישוב",
    "כשרים",
    "סמל ישוב",
    "פסולים",
    "_id",
    "בזב",
];

async function getCities() {
    const cachedData = citiesCache.get("cities");
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    const response = await fetch(cityDataUrl);
    const data = await response.json();
    const cities = data.result.records.map((record) => record.שם_ישוב);
    citiesCache.set("cities", JSON.stringify(cities));
    return cities;
}
async function loadCities() {
    try {
        const cities = await getCities();
        cities.forEach((city) => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            select.appendChild(option);
        });
    } catch (error) {
        displayMessage();
    }
}
async function getCityResult() {
    const cachedData = citiesCache.get(select.value);
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    const response = await fetch(`${electionDataUrl}&q={"שם ישוב":"${select.value}"}`);
    const data = await response.json();
    const record = data.result.records[0];
    citiesCache.set(select.value, JSON.stringify(record));
    return record;

}
async function display() {
    try {
        const data = await getCityResult();        
        displayChart(data);
    } catch (error) {
        displayMessage();
    }
}
function displayChart(record) {
    const sortedParties = Object.entries(record)
        .filter(([key, value]) => {
            const parsedValue = Number(String(value).trim());
            return (
                !isNaN(parsedValue) && parsedValue > 10 && !filteredKeys.includes(key)
            );
        })
        .map(([key, value]) => ({
            party: key,
            votes: Number(String(value).trim()),
        }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 7);

    if (myChart) {
        myChart.destroy();
    }

    const ctx = document.getElementById("myChart");

    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: sortedParties.map((p) => p.party),
            datasets: [
                {
                    label: "Votes",
                    data: sortedParties.map((p) => p.votes),
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
function displayMassage() {
    const p = document.createElement("p");
    p.innerHTML = "Service Error";
    document.body.appendChild(p);
}

loadCities();
