(async () => {
  const API_URL = 'https://ergast.com/api/f1/current.json';
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const races = data.MRData.RaceTable.Races;
    const sessions = [];

    races.forEach(race => {
      // Practice and qualifying sessions if available
      const mapping = {
        FirstPractice: 'Practice 1',
        SecondPractice: 'Practice 2',
        ThirdPractice: 'Practice 3',
        Qualifying: 'Qualifying',
        Sprint: 'Sprint'
      };
      Object.entries(mapping).forEach(([key, label]) => {
        if (race[key] && race[key].date && race[key].time) {
          sessions.push({
            name: `${race.raceName} – ${label}`,
            dateTime: new Date(`${race[key].date}T${race[key].time}`)
          });
        }
      });
      // Main race session
      if (race.date && race.time) {
        sessions.push({
          name: `${race.raceName} – Race`,
          dateTime: new Date(`${race.date}T${race.time}`)
        });
      }
    });

    // Filter future sessions and sort
    const now = new Date();
    const upcoming = sessions
      .filter(s => s.dateTime >= now)
      .sort((a, b) => a.dateTime - b.dateTime);

    const container = document.getElementById('sessions');
    const formatter = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam'
    });

    if (!upcoming.length) {
      container.innerHTML = '<p>No upcoming sessions found.</p>';
      return;
    }
    upcoming.forEach(s => {
      const card = document.createElement('div');
      card.className = 'session-card';

      const nameEl = document.createElement('div');
      nameEl.className = 'session-name';
      nameEl.textContent = s.name;

      const timeEl = document.createElement('div');
      timeEl.className = 'session-time';
      timeEl.textContent = formatter.format(s.dateTime);

      card.appendChild(nameEl);
      card.appendChild(timeEl);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading schedule:', error);
    const container = document.getElementById('sessions');
    if (container) {
      container.innerHTML = '<p>Failed to load schedule.</p>';
    } else {
      document.body.innerHTML = '<p>Failed to load schedule.</p>';
    }
  }
})();
