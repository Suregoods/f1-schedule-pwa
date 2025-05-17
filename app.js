<!-- app.js -->
(async () => {
  const API_URL = 'https://ergast.com/api/f1/current.json';
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const races = data.MRData.RaceTable.Races;
    const sessions = [];
    races.forEach(race => {
      const mapping = {
        FirstPractice: 'Practice 1',
        SecondPractice: 'Practice 2',
        ThirdPractice: 'Practice 3',
        Qualifying: 'Qualifying',
        Sprint: 'Sprint',
        Race: 'Race'
      };
      Object.keys(mapping).forEach(key => {
        if (race[key]) {
          sessions.push({
            name: `${race.raceName} - ${mapping[key]}`,
            dateTime: new Date(`${race[key].date}T${race[key].time}`)
          });
        }
      });
    });
    sessions.sort((a, b) => a.dateTime - b.dateTime);
    const tbody = document.querySelector('#schedule tbody');
    const formatter = new Intl.DateTimeFormat('default', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Amsterdam'
    });
    sessions.forEach(s => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td'); tdName.textContent = s.name;
      const tdTime = document.createElement('td'); tdTime.textContent = formatter.format(s.dateTime);
      tr.appendChild(tdName); tr.appendChild(tdTime);
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    document.body.innerHTML = '<p>Failed to load schedule.</p>';
  }
})();
