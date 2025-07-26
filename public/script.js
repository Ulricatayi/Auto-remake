document.getElementById('agreeCheckbox').addEventListener('change', function () {
  document.getElementById('submitButton').disabled = !this.checked;
});

let Commands = [{ 'commands': [] }, { 'handleEvent': [] }];

function measurePing() {
  const xhr = new XMLHttpRequest();
  const startTime = Date.now();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const endTime = Date.now();
      document.getElementById("ping").textContent = "Ping: " + (endTime - startTime) + " ms";
    }
  };
  xhr.open("GET", location.href + "?t=" + new Date().getTime());
  xhr.send();
}
setInterval(measurePing, 1000);

function updateTime() {
  const now = new Date();
  document.getElementById('time').textContent = "Time: " + now.toLocaleTimeString('en-US', { hour12: true });
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
    const State = JSON.parse(jsonInput.value);
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: State,
        commands: Commands,
        prefix: document.getElementById('inputOfPrefix').value,
        admin: document.getElementById('inputOfAdmin').value,
      }),
    });
    const data = await response.json();
    showResult(data.message);
    jsonInput.value = '';
  } catch (e) {
    console.error('Error:', e);
    showResult('Error parsing JSON. Please check your input.');
    jsonInput.value = '';
  } finally {
    setTimeout(() => { button.style.display = 'block'; }, 3000);
  }
}

function showResult(msg) {
  const result = document.getElementById('result');
  result.innerHTML = "<h5>" + msg + "</h5>";
  result.style.display = 'block';
}

async function commandList() {
  try {
    const [listOfCommands, listOfCommandsEvent] = [document.getElementById('listOfCommands'), document.getElementById('listOfCommandsEvent')];
    const { commands, handleEvent } = await fetch('/commands').then(res => res.json());
    [commands, handleEvent].forEach((commandArr, i) => {
      commandArr.forEach((command, index) => {
        const container = createCommand(i === 0 ? listOfCommands : listOfCommandsEvent, index + 1, command, i === 0 ? 'commands' : 'handleEvent');
        (i === 0 ? listOfCommands : listOfCommandsEvent).appendChild(container);
      });
    });
  } catch (e) {
    console.error(e);
  }
}

function createCommand(container, order, command, type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-check';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'form-check-input ' + type;
  const label = document.createElement('label');
  label.className = 'form-check-label ' + type;
  label.textContent = order + '. ' + command;
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  wrapper.onclick = toggleCheckbox;
  return wrapper;
}

function toggleCheckbox() {
  const configs = [
    { selector: '.form-check-input.commands', labelSel: '.form-check-label.commands', store: Commands[0].commands },
    { selector: '.form-check-input.handleEvent', labelSel: '.form-check-label.handleEvent', store: Commands[1].handleEvent },
  ];
  configs.forEach(({ selector, labelSel, store }) => {
    const checkbox = this.querySelector(selector);
    const label = this.querySelector(labelSel);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      const command = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
      if (checkbox.checked) {
        label.classList.add('disable');
        store.push(command);
      } else {
        label.classList.remove('disable');
        const idx = store.indexOf(command);
        if (idx !== -1) store.splice(idx, 1);
      }
    }
  });
}

function selectAllCommands() {
  const checkboxes = document.querySelectorAll('.form-check-input.commands');
  const store = Commands[0].commands;
  const allSelected = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => {
    const label = cb.nextElementSibling;
    const cmd = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
    cb.checked = !allSelected;
    label.classList.toggle('disable', !allSelected);
    if (!allSelected && !store.includes(cmd)) store.push(cmd);
    if (allSelected) {
      const idx = store.indexOf(cmd);
      if (idx !== -1) store.splice(idx, 1);
    }
  });
}

function selectAllEvents() {
  const checkboxes = document.querySelectorAll('.form-check-input.handleEvent');
  const store = Commands[1].handleEvent;
  const allSelected = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => {
    const label = cb.nextElementSibling;
    const event = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
    cb.checked = !allSelected;
    label.classList.toggle('disable', !allSelected);
    if (!allSelected && !store.includes(event)) store.push(event);
    if (allSelected) {
      const idx = store.indexOf(event);
      if (idx !== -1) store.splice(idx, 1);
    }
  });
}

commandList();
