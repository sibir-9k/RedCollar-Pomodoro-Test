const timerTop = document.querySelector('.timer-top');
const buttonsTop = timerTop.querySelectorAll('*');
const root = document.documentElement;
const timerBottom = document.querySelector('.timer-bottom');
const buttonsBottom = timerBottom.querySelectorAll('*');

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
	switchMode('pomodoro');
}

function updateClock() {
	const { remainingTime } = timer;

	const minutes = `${remainingTime.minutes}`.padStart(2, '0');
	const seconds = `${remainingTime.seconds}`.padStart(2, '0');

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
