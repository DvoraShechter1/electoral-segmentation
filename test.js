const select = document.getElementById("select");
fetch(
  "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&q=&limit=32000"
)
  .then((response) => response.json())
  .then((data) => {
    let cities = data.result.records.map((record) => record.שם_ישוב);

    cities.forEach((city) => {
      let option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });
  });

let myChart;

function display() {
  let q = { "שם ישוב": select.value };
  fetch(
    `https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q=${JSON.stringify(
      q
    )}&limit=32000`
  )
    .then((response) => response.json())
    .then((data) => {
      displayChart(data.result.records[0]);
    })
    .catch((error) => {
      console.log(error);
      displayMassage();
    });
}
function displayChart(record) {
  const sortedParties = Object.entries(record)
    .filter(([key, value]) => {
      const parsedValue = Number(String(value).trim());
      return (
        !isNaN(parsedValue) &&
        parsedValue > 10 &&
        key !== "מצביעים" &&
        key !== "rank שם ישוב" &&
        key !== "שם ישוב" &&
        key !== "כשרים" &&
        key !== "סמל ישוב" &&
        key !== "פסולים" &&
        key !== "_id" &&
        key !== "בזב"
      );
    })
    .map(([key, value]) => ({
      party: key,
      votes: Number(String(value).trim()),
    })) // Convert to object with parsed votes
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
