document.getElementById('agreeCheckbox').addEventListener('change', function () {
  document.getElementById('submitButton').disabled = !this.checked;
});

let Commands = [
  { commands: [] },
  { handleEvent: [] }
];

function showAds() {
  const ads = [
    'https://facebook.com/ulricdev',
    'https://ulric-rest-api.onrender.com'
  ];
  const randomAd = ads[Math.floor(Math.random() * ads.length)];
  window.location.href = randomAd;
}

function measurePing() {
  const xhr = new XMLHttpRequest();
  const startTime = Date.now();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const pingTime = Date.now() - startTime;
      document.getElementById("ping").textContent = `${pingTime} ms`;
    }
  };
  xhr.open("GET", `${location.href}?t=${Date.now()}`);
  xhr.send();
}
setInterval(measurePing, 1000);

function updateTime() {
  const now = new Date();
  const options = {
    timeZone: 'Africa/Porto-Novo',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const timeString = now.toLocaleTimeString('en-US', options);
  document.getElementById('time').textContent = timeString;
}
updateTime();
setInterval(updateTime, 1000);

async function State() {
  const jsonInput = document.getElementById('json-data');
  const button = document.getElementById('submitButton');

  if (!Commands[0].commands.length) {
    return showResult('Please provide at least one valid command for execution.');
  }

  try {
    button.style.display = 'none';
    const stateData = JSON.parse(jsonInput.value);

    if (stateData && typeof stateData === 'object') {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: stateData,
          commands: Commands,
          prefix: document.getElementById('inputOfPrefix').value,
          admin: document.getElementById('inputOfAdmin').value,
        }),
      });

      const data = await response.json();
      jsonInput.value = '';
      showResult(data.message);
      showAds();
    } else {
      throw new Error('Invalid state object');
    }
  } catch (error) {
    jsonInput.value = '';
    console.error('Parsing error:', error);
    showResult('Error parsing JSON. Please check your input.');
    showAds();
  } finally {
    setTimeout(() => {
      button.style.display = 'block';
    }, 4000);
  }
}

function showResult(message) {
  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = `<h5>${message}</h5>`;
  resultContainer.style.display = 'block';
}

async function commandList() {
  try {
    const res = await fetch('/commands');
    const { commands, handleEvent, aliases } = await res.json();
    const containers = [
      { listEl: document.getElementById('listOfCommands'), data: commands, type: 'commands' },
      { listEl: document.getElementById('listOfCommandsEvent'), data: handleEvent, type: 'handleEvent' }
    ];

    containers.forEach(({ listEl, data, type }) => {
      data.forEach((cmd, index) => {
        const alias = aliases[index] || [];
        const commandEl = createCommand(index + 1, cmd, type, alias);
        listEl.appendChild(commandEl);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

function createCommand(order, command, type, aliases) {
  const container = document.createElement('div');
  container.className = 'form-check form-switch';
  container.onclick = toggleCheckbox;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `switch_${type}_${order}`;
  checkbox.className = `form-check-input ${type}`;
  checkbox.role = 'switch';

  const label = document.createElement('label');
  label.className = `form-check-label ${type}`;
  label.htmlFor = checkbox.id;
  label.textContent = `${order}. ${command}`;

  container.appendChild(checkbox);
  container.appendChild(label);
  return container;
}

function toggleCheckbox() {
  const boxConfig = [
    { input: '.form-check-input.commands', label: '.form-check-label.commands', arr: Commands[0].commands },
    { input: '.form-check-input.handleEvent', label: '.form-check-label.handleEvent', arr: Commands[1].handleEvent },
  ];

  boxConfig.forEach(({ input, label, arr }) => {
    const checkbox = this.querySelector(input);
    const labelEl = this.querySelector(label);
    if (!checkbox) return;

    checkbox.checked = !checkbox.checked;
    const command = labelEl.textContent.replace(/^\d+\.\s/, '').split(" ")[0];

    if (checkbox.checked) {
      labelEl.classList.add('disable');
      if (!arr.includes(command)) arr.push(command);
    } else {
      labelEl.classList.remove('disable');
      const index = arr.indexOf(command);
      if (index !== -1) arr.splice(index, 1);
    }
  });
}

function toggleAll(selector, arr) {
  const checkboxes = document.querySelectorAll(selector);
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);

  checkboxes.forEach(cb => {
    const label = cb.nextElementSibling;
    const value = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];

    cb.checked = !allChecked;
    label.classList.toggle('disable', !allChecked);

    if (!allChecked && !arr.includes(value)) {
      arr.push(value);
    } else if (allChecked) {
      const idx = arr.indexOf(value);
      if (idx !== -1) arr.splice(idx, 1);
    }
  });
}

function selectAllCommands() {
  toggleAll('.form-check-input.commands', Commands[0].commands);
}

function selectAllEvents() {
  toggleAll('.form-check-input.handleEvent', Commands[1].handleEvent);
}

commandList();
