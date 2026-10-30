const theme = { city: document.querySelector('#cityInput'), weatherButton: document.querySelector('#weatherButton'), weatherResult: document.querySelector('#weatherResult') };

// Open-Meteo provides geocoding and forecasts without a browser-side API key.
async function getWeather() {
  const city = theme.city.value.trim();
  if (!city) { theme.weatherResult.textContent = 'Enter a city to get its forecast.'; theme.city.focus(); return; }
  theme.weatherButton.disabled = true;
  theme.weatherResult.textContent = 'Looking up the forecast…';
  try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geoResponse.ok) throw new Error('Could not search for that location.');
    const place = (await geoResponse.json()).results?.[0];
    if (!place) throw new Error('No matching city found. Try another spelling.');
    const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&timezone=auto`);
    if (!forecastResponse.ok) throw new Error('The forecast is unavailable right now.');
    const current = (await forecastResponse.json()).current;
    theme.weatherResult.replaceChildren();
    const temp = document.createElement('p'); temp.className = 'weather-temp'; temp.textContent = `${Math.round(current.temperature_2m)}°C`;
    const desc = document.createElement('p'); desc.textContent = `${weatherDescription(current.weather_code)} · Feels like ${Math.round(current.apparent_temperature)}°C`;
    const location = document.createElement('p'); location.textContent = `${place.name}${place.country ? `, ${place.country}` : ''} · ${current.relative_humidity_2m}% humidity`;
    theme.weatherResult.append(temp, desc, location);
  } catch (error) { theme.weatherResult.textContent = error.message || 'Weather is unavailable. Please try again.'; }
  finally { theme.weatherButton.disabled = false; }
}

function weatherDescription(code) {
  if (code === 0) return 'Clear sky';
  if ([1, 2, 3].includes(code)) return ['Mainly clear', 'Partly cloudy', 'Overcast'][code - 1];
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Current conditions';
}

theme.weatherButton.addEventListener('click', getWeather);
theme.city.addEventListener('keydown', event => { if (event.key === 'Enter') getWeather(); });

const chatInput = document.querySelector('#userInput');
const chatMessages = document.querySelector('#chatMessages');
const chatStatus = document.querySelector('#chatStatus');
const chatButton = document.querySelector('#sendButton');
const answers = [
  { keys: ['skill', 'know', 'tool'], answer: 'Rohit is building skills in C++, data structures and algorithms, HTML, CSS, JavaScript, and prompt engineering.' },
  { keys: ['project', 'work', 'made'], answer: 'The portfolio features three practice projects: an Amazon-inspired storefront, a color detection model, and a book reading companion concept.' },
  { keys: ['study', 'college', 'year', 'btech'], answer: 'Rohit is a second-year B.Tech student.' },
  { keys: ['weather', 'forecast'], answer: 'The mini lab includes a city weather lookup using Open-Meteo, which does not require a browser-side API key.' },
  { keys: ['prompt', 'engineering'], answer: 'Prompt engineering is part of Rohit’s current class work. The assistant here is a small local FAQ experiment.' },
  { keys: ['hello', 'hi', 'hey'], answer: 'Hello! You can ask me about Rohit’s studies, skills, projects, or the weather demo.' },
];

function addMessage(role, content) {
  const item = document.createElement('p'); item.className = `chat-message chat-${role}`; item.textContent = content; chatMessages.append(item); chatMessages.scrollTop = chatMessages.scrollHeight;
}
function answerQuestion() {
  const question = chatInput.value.trim();
  if (!question) { chatStatus.textContent = 'Type a question first.'; chatInput.focus(); return; }
  addMessage('user', question); chatInput.value = ''; chatStatus.textContent = '';
  const normalized = question.toLowerCase();
  const match = answers.find(item => item.keys.some(key => normalized.includes(key)));
  addMessage('assistant', match?.answer || 'I can help with questions about Rohit’s studies, skills, projects, and weather demo.');
}
chatButton.addEventListener('click', answerQuestion);
chatInput.addEventListener('keydown', event => { if (event.key === 'Enter') answerQuestion(); });
document.querySelector('#year').textContent = new Date().getFullYear();

const promptTask = document.querySelector('#promptTask');
const promptTone = document.querySelector('#promptTone');
const promptPreview = document.querySelector('#promptPreview');
const copyPromptButton = document.querySelector('#copyPrompt');
const promptToast = document.querySelector('#promptToast');
let generatedPrompt = '';

document.querySelector('#buildPrompt').addEventListener('click', () => {
  const task = promptTask.value.trim();
  if (!task) {
    promptToast.textContent = 'Add a rough idea first, and I’ll help shape it.';
    promptTask.focus();
    return;
  }
  generatedPrompt = `Act as a ${promptTone.value}. Help me with this task: ${task}.\n\nFirst, give a clear and accurate response using simple language. Organize the key ideas into helpful steps or sections. Include one concrete example, and finish with one question that helps me think further. If important details are missing, state your assumptions.`;
  promptPreview.textContent = generatedPrompt;
  copyPromptButton.disabled = false;
  promptToast.textContent = 'Nice—your prompt now has a role, task, and response guidance.';
});

copyPromptButton.addEventListener('click', async () => {
  if (!generatedPrompt) return;
  try {
    await navigator.clipboard.writeText(generatedPrompt);
    promptToast.textContent = 'Copied. Ready to try in your prompt tool.';
  } catch {
    promptToast.textContent = 'Select the prompt text above and copy it.';
  }
});
