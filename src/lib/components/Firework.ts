const LAUNCH_DELAY = 600;
const SPREAD_DELAY = 30;
const FADE_SPEED = 10;
const MIN_TRACE = 30;
const PARTICLE_RADIUS = 4;
const PARTICLE_DISTANCE = 1;
const ROCKET_LAUNCH_ANGLE = 1;
const POP_POWER = 400;
const POP_MIN_RADIUS = 1;
const RADIUS_SHRINK_FACTOR = 0.05;
const GRAVITY = 9.81;
const RAINBOW_ROCKET_PERCANTAGE = 0.01;
const BACKGROUND: Color = { r: 22, g: 22, b: 22 };

let width: number, height: number;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let launchInterval: NodeJS.Timeout;
let spreadInterval: NodeJS.Timeout;
let rockets: Rocket[] = [];
let particles: Particle[] = [];
let rainbowColors: Color[] = [
	rgb(255, 0, 0),
	rgb(255, 127, 0),
	rgb(255, 255, 0),
	rgb(127, 255, 0),
	rgb(0, 255, 0),
	rgb(0, 255, 127),
	rgb(0, 255, 255),
	rgb(0, 127, 255),
	rgb(0, 0, 255),
	rgb(127, 0, 255),
	rgb(255, 0, 255),
	rgb(255, 0, 127)
];

interface Particle {
	coord: Vector;
	color: Color;
	alpha: number;
	radius: number;
}

interface Rocket {
	coord: Vector;
	direction: Vector;
	color: Color;
	poped: boolean;
	power: number;
	radius: number;
	rainbow: {
		enabled: boolean;
		index: number;
	};
}

interface Vector {
	x: number;
	y: number;
}

interface Color {
	r: number;
	g: number;
	b: number;
}

export function selectCanvas(c: HTMLCanvasElement | undefined) {
	if (c) {
		canvas = c;
		let context = canvas.getContext('2d');
		if (context) ctx = context;

		rockets = [];
		particles = [];

		window.addEventListener('resize', fixDPI);
		document.addEventListener('visibilitychange', setState);

		setState();
	} else stopFirework();
}

function setState() {
	document.visibilityState == 'visible' ? startFirework() : stopFirework();
}

function stopFirework() {
	if (spreadInterval) clearInterval(spreadInterval);
	if (launchInterval) clearInterval(launchInterval);
}

function startFirework() {
	stopFirework();
	fixDPI();
	spreadInterval = setInterval(spread, SPREAD_DELAY);
	launchInterval = setInterval(launch, LAUNCH_DELAY);
}

function launch() {
	// launch new Rocket
	rockets.push({
		coord: { x: Math.random() * width, y: height },
		direction: { x: Math.random() * ROCKET_LAUNCH_ANGLE - ROCKET_LAUNCH_ANGLE / 2, y: -1 },
		color: getRandomColor(),
		poped: false,
		power: (Math.random() * height * 3) / 4 + height / 4,
		radius: PARTICLE_RADIUS,
		rainbow: {
			enabled: Math.random() <= RAINBOW_ROCKET_PERCANTAGE,
			index: 0
		}
	});
}

function getRandomColor(): Color {
	let color: Color = {
		r: Math.random() * 255,
		g: Math.random() * 255,
		b: Math.random() * 255
	};

	let traceBuffer = MIN_TRACE * PARTICLE_RADIUS * PARTICLE_DISTANCE;

	if (
		color.r <= BACKGROUND.r + traceBuffer &&
		color.g <= BACKGROUND.g + traceBuffer &&
		color.b <= BACKGROUND.b + traceBuffer
	) {
		return { r: 255, g: 255, b: 255 };
	} else return color;
}

function colorToString(color: Color) {
	return `rgb(${color.r},${color.g},${color.b})`;
}

function rgb(r: number, g: number, b: number): Color {
	return { r, g, b };
}

function getRainbowColor(index: number) {
	return rgb(rainbowColors[index].r, rainbowColors[index].g, rainbowColors[index].b);
}

function spread() {
	// Reduce alpha of particles
	let i = 0;
	while (i < particles.length) {
		const color = particles[i].color;
		color.r = Math.max(BACKGROUND.r, color.r - FADE_SPEED);
		color.g = Math.max(BACKGROUND.g, color.g - FADE_SPEED);
		color.b = Math.max(BACKGROUND.b, color.b - FADE_SPEED);

		if (color.r == BACKGROUND.r && color.g == BACKGROUND.g && color.b == BACKGROUND.b) {
			particles.splice(i, 1);
		} else i++;
	}

	// Move rocket
	i = 0;
	while (i < rockets.length) {
		const rocket = rockets[i];

		rocket.power -= PARTICLE_RADIUS * PARTICLE_DISTANCE;
		if (rocket.power <= 0 || rocket.radius < POP_MIN_RADIUS) {
			// Pop rocket
			pop(rockets.splice(i, 1)[0]);
		} else {
			let color: Color;
			if (rocket.rainbow.enabled) {
				color = getRainbowColor(rocket.rainbow.index);

				rocket.rainbow.index++;
				if (rocket.rainbow.index == rainbowColors.length) {
					rocket.rainbow.index = 0;
				}
			} else color = { r: rocket.color.r, g: rocket.color.g, b: rocket.color.b };

			particles.push({
				coord: { x: rocket.coord.x, y: rocket.coord.y },
				alpha: 255,
				radius: rocket.radius,
				color
			});

			rocket.coord.x += rocket.direction.x * PARTICLE_RADIUS * PARTICLE_DISTANCE;
			rocket.coord.y += rocket.direction.y * PARTICLE_RADIUS * PARTICLE_DISTANCE;

			if (rocket.poped) {
				rocket.radius *= 1 - RADIUS_SHRINK_FACTOR;

				// Apply gravity vector
				rocket.direction.y += GRAVITY / rocket.power;
			}
			i++;
		}
	}

	draw();
}

function pop(rocket: Rocket) {
	if (rocket.poped) return;

	rocket.power = POP_POWER;
	rocket.poped = true;

	for (let x = -1; x <= 1; x += 0.4) {
		for (let y = -1; y <= 1; y += 0.4) {
			if (x == 0 && y == 0) continue;
			if (Math.abs(x) + Math.abs(y) >= 1.5) continue;

			let newRocket = structuredClone(rocket);
			newRocket.direction = { x, y };
			newRocket.power *= 0.25 + 0.75 * Math.random();
			rockets.push(newRocket);
		}
	}
}

function draw() {
	let dpi = window.devicePixelRatio;

	// Clear canvas
	ctx.fillStyle = colorToString(BACKGROUND);
	ctx.fillRect(0, 0, width * dpi, height * dpi);

	// Draw particle
	particles.forEach((p) => {
		ctx.fillStyle = colorToString(p.color);
		ctx.beginPath();
		ctx.arc(p.coord.x * dpi, p.coord.y * dpi, p.radius * dpi, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
	});
}

function fixDPI() {
	let dpi = window.devicePixelRatio;
	let styleHeight = parseInt(getComputedStyle(canvas).getPropertyValue('height').slice(0, -2));
	let styleWidth = parseInt(getComputedStyle(canvas).getPropertyValue('width').slice(0, -2));

	canvas.setAttribute('height', (styleHeight * dpi).toString());
	canvas.setAttribute('width', (styleWidth * dpi).toString());
	width = canvas.offsetWidth;
	height = canvas.offsetHeight;
}
