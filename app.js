(async () => {
  const ICS_URL = 'https://better-f1-calendar.vercel.app/api/calendar.ics';
  try {
    const res = await fetch(ICS_URL);
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const events = [];
    let inEvent = false;
    let dtStart = '';
    let summary = '';
    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        dtStart = '';
        summary = '';
      } else if (line === 'END:VEVENT') {
        if (inEvent && dtStart && summary) {
          events.push({ dt: dtStart, summary });
        }
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith('DTSTART')) {
          const parts = line.split(':');
          dtStart = parts[1];
        } else if (line.startsWith('SUMMARY')) {
          const parts = line.split(':');
          summary = parts.slice(1).join(':');
        }
      }
    }
    const now = new Date();
    const sessions = events.map(e => {
      const dt = e.dt; // e.g. 20250523T120000Z
      const year = +dt.substring(0,4);
      const month = +dt.substring(4,6) - 1;
      const day = +dt.substring(6,8);
      const hour = +dt.substring(9,11);
      const minute = +dt.substring(11,13);
      const second = +dt.substring(13,15);
      const dateTime = new Date(Date.UTC(year, month, day, hour, minute, second));
      return { name: e.summary, dateTime };
    }).filter(s => s.dateTime >= now)
      .sort((a, b) => a.dateTime - b.dateTime);

    const container = document.getElementById('sessions');
    const formatter = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam'
    });

    if (sessions.length === 0) {
      container.innerHTML = '<p>No upcoming sessions found.</p>';
      return;
    }
    sessions.forEach(s => {
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
