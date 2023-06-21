const timerTop = document.querySelector('.timer-top');
const buttonsTop = timerTop.querySelectorAll('*');
const root = document.documentElement;
const timerBottom = document.querySelector('.timer-bottom');
const buttonsBottom = timerBottom.querySelectorAll('*');
const minute = document.querySelector('.minute');
const seconds = document.querySelector('.seconds');

const modal = document.querySelector('.modal');
const closeBtnModal = document.querySelector('.close-btn');
const settingBtn = document.querySelector('.setting');
const pomodoroInput = document.querySelector('.pomodoro__input');
const shortInput = document.querySelector('.short-break__input');
const longInput = document.querySelector('.long-break__input');
const checkBtn = document.querySelector('.check');

let interval = null;

const colors = {
	pomodoro: 'rgb(217, 85, 80)',
	'short-break': 'rgb(76, 145, 149)',
	'long-break': 'rgb(69, 124, 163)',
};

const timer = {
	pomodoro: 25,
	'short-break': 5,
	'long-break': 15,
	'long-break-interval': 4,
	sessions: 0,
};

closeBtnModal.addEventListener('click', () => {
	modal.classList.add('closed');
});
modal.addEventListener('click', (e) => {
	if (e.target.className == 'modal') {
		modal.classList.add('closed');
	}
});
settingBtn.addEventListener('click', () => {
	modal.classList.remove('closed');
});

pomodoroInput.valueAsNumber = timer.pomodoro;
shortInput.valueAsNumber = timer['short-break'];
longInput.valueAsNumber = timer['long-break'];

function handleInputUpdate(selector, timerProp) {
	selector.addEventListener('input', () => {
		const value = selector.valueAsNumber;
		timer[timerProp] = value;
		timer.remainingTime.minutes = value;
		minute.innerHTML = value;
	});
}

handleInputUpdate(pomodoroInput, 'pomodoro');
handleInputUpdate(shortInput, 'short-break');
handleInputUpdate(longInput, 'long-break');

checkBtn.addEventListener('click', validateInput);

function validateInput() {
  let inputs = [pomodoroInput, shortInput, longInput];
  let valid = true;
  inputs.forEach((input) => {
    if (input.value <= 0 || input.value > 60) {
      valid = false;
    }
  });
	if (!valid) {
		document.getElementById('error-message').style.display = 'block';
	} else {
		document.getElementById('error-message').style.display = 'none';
    stopTimer();
		if (timer.mode === 'pomodoro') {
			timer.pomodoro = pomodoroInput.valueAsNumber;
			timer.remainingTime.minutes = pomodoroInput.valueAsNumber; 
			timer.remainingTime.total = pomodoroInput.valueAsNumber * 60; 
      timer.remainingTime.seconds = 0
			minute.innerHTML = pomodoroInput.valueAsNumber;
			seconds.innerHTML = '00';
		} else if (timer.mode === 'short-break') {
			timer['short-break'] = shortInput.valueAsNumber;
			timer.remainingTime.minutes = shortInput.valueAsNumber; 
      timer.remainingTime.total = shortInput.valueAsNumber * 60;
      timer.remainingTime.seconds = 0
			minute.innerHTML = shortInput.valueAsNumber;
      seconds.innerHTML = '00';
		} else if (timer.mode === 'long-break') {
			timer['long-break'] = longInput.valueAsNumber;
			timer.remainingTime.minutes = longInput.valueAsNumber;
      timer.remainingTime.total = longInput.valueAsNumber * 60; 
      timer.remainingTime.seconds = 0
			minute.innerHTML = longInput.valueAsNumber;
      seconds.innerHTML = '00';
		}
    
		modal.classList.add('closed');
	}
}

buttonsBottom.forEach((button) => {
	button.addEventListener('click', (e) => {
		const { active } = button.dataset;
		switch (active) {
			case 'start':
				startTimer();
				break;
			case 'stop':
				stopTimer();
				break;
			case 'reset':
				resetTimer();
				break;
			default:
				break;
		}
	});
});

function getRemainingTime(endTime) {
	const currentTime = Date.parse(new Date());
	const difference = endTime - currentTime;
	const total = Number.parseInt(difference / 1000, 10);
	const minutes = Number.parseInt((total / 60) % 60, 10);
	const seconds = Number.parseInt(total % 60, 10);

	return {
		total,
		minutes,
		seconds,
	};
}

function startTimer() {
	if (interval) return;
	let { total } = timer.remainingTime;
	const endTime = Date.parse(new Date()) + total * 1000;
	if (timer.mode === 'pomodoro') timer.sessions++;

	interval = setInterval(function () {
		timer.remainingTime = getRemainingTime(endTime);
		updateClock();

		total = timer.remainingTime.total;
		if (total <= 0) {
			clearInterval(interval);
			interval = null;

			switch (timer.mode) {
				case 'pomodoro':
					if (timer.sessions % timer['long-break-interval'] === 0) {
						switchMode('long-break');
					} else {
						switchMode('short-break');
					}
					break;
				default:
					switchMode('pomodoro');
			}

			startTimer();
		}
	}, 1000);
}

function stopTimer() {
	clearInterval(interval);
	interval = null;
}

function resetTimer() {
	stopTimer();
	timer.pomodoro = 25;
	timer['short-break'] = 5;
	timer['long-break'] = 15;
	timer['long-break-interval'] = 4;
	timer.sessions = 0;

	pomodoroInput.valueAsNumber = timer.pomodoro;
	shortInput.valueAsNumber = timer['short-break'];
	longInput.valueAsNumber = timer['long-break'];
	switchMode('pomodoro');
}

function updateClock() {
	const { remainingTime } = timer;

	const minutes = remainingTime.minutes.toString().padStart(2, '0');
	const seconds = remainingTime.seconds.toString().padStart(2, '0');

	const min = document.querySelector('.minute');
	const sec = document.querySelector('.seconds');
	min.textContent = minutes;
	sec.textContent = seconds;
}

function switchMode(id) {
	timer.mode = id;
	timer.remainingTime = {
		total: timer[id] * 60,
		minutes: timer[id],
		seconds: 0,
	};
	buttonsTop.forEach((button) => {
		if (button.id === id) {
			button.setAttribute('active', 'true');
		} else {
			button.setAttribute('active', 'false');
		}
		changeColorTheme(id);
	});
	updateClock();
}

buttonsTop.forEach((button) => {
	button.addEventListener('click', (e) => {
		cleanButtonsAttributes();

		const button = e.target;
		button.setAttribute('active', 'true');
		const id = button.getAttribute('id');

		changeColorTheme(id);
		switchMode(id);
		validateInput(id);
		stopTimer();
	});
});

function cleanButtonsAttributes() {
	buttonsTop.forEach((button) => {
		button.setAttribute('active', 'false');
	});
}

function changeColorTheme(id) {
	const color = colors[id];
	root.style.setProperty('--main-bg-color', color);
}

document.addEventListener('DOMContentLoaded', () => {
	switchMode('pomodoro');
});
