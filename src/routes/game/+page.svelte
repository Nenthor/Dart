<script lang="ts">
	import { selectCanvas } from '$lib/components/Firework';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	interface Map {
		[name: string]: string[];
	}

	let players: Map = {};
	let playernames: string[] = [];
	let currentPlayer = -1;
	let currentDart = 0;
	let gameState = 'playing';
	let title = 'Dart Match';
	let darts = [
		{ digit: -1, type: 0 },
		{ digit: -1, type: 0 },
		{ digit: -1, type: 0 }
	];
	let htmlDartHighlight: HTMLDivElement;
	let firework: HTMLCanvasElement;

	let startValue: number = data.startvalue;
	let usernames: string[] = data.players;

	let matchName = '';
	players['Runde'] = ['Ø', '0', '1'];
	usernames.forEach((name) => {
		playernames.push(name);
		players[name] = ['-', startValue.toString()];
		matchName += name + ' vs ';
	});
	if (usernames.length <= 5) {
		title = matchName.substring(0, matchName.length - 4);
	}

	currentPlayer = 0;

	$: firework, selectCanvas(firework);

	onMount(() => {
		window.onbeforeunload = () => {
			return 'Diese Seite wirklich verlassen?';
		};
	});

	function setDartIndex(index: number) {
		if (!htmlDartHighlight) return;
		currentDart = index;
		htmlDartHighlight.style.transform = `translateX(${index * 120}px)`; // width + gap
	}

	function getDigitName(index: number) {
		if (index < 20) return (index + 1).toString();
		else if (index == 20) return 'Bull';
		else return 'Bullseye';
	}

	function getTypeName(index: number) {
		if (index == 0) return 'Einfach';
		else if (index == 1) return 'Zweifach';
		else return 'Dreifach';
	}

	function setDartValue(index: number) {
		if (darts[currentDart].digit == index) {
			darts[currentDart].digit = -1;
			darts[currentDart].type = 0;
			return;
		}

		darts[currentDart].digit = index;

		if (index >= 20) {
			darts[currentDart].type = 0; // Bull and Bullseye
		}
	}

	function setDartType(index: number) {
		if (darts[currentDart].digit >= 20) return;
		darts[currentDart].type = index;
	}

	function getDartPoints(_: any) {
		let points = 0;

		darts.forEach((dart) => {
			if (dart.digit != -1) {
				let dartValue;
				if (dart.digit == 20) dartValue = 25;
				else if (dart.digit == 21) dartValue = 50;
				else dartValue = dart.digit + 1;

				points += dartValue * (dart.type + 1);
			}
		});

		return points;
	}

	function closeTurn() {
		let points = getDartPoints(3);
		let pointArray = players[playernames[currentPlayer]];
		let currentPoints = parseInt(pointArray[pointArray.length - 1]);

		if (currentPoints - points < 0) {
			pointArray.push(currentPoints.toString());
			calcAverage();
			nextTurn();
		} else if (currentPoints - points == 0) {
			// has won!
			pointArray.push((currentPoints - points).toString());
			gameState = 'finished';
			calcAverage();
		} else {
			pointArray.push((currentPoints - points).toString());
			calcAverage();
			nextTurn();
		}
		players = players;
	}

	function calcAverage() {
		let pointArray = players[playernames[currentPlayer]];
		let playedPoints = parseInt(pointArray[1]) - parseInt(pointArray[pointArray.length - 1]);
		let currentRound = pointArray.length - 2;
		let avg = Math.round(playedPoints / currentRound);
		pointArray[0] = isNaN(avg) ? '-' : avg.toString();
	}

	function nextTurn() {
		if (currentPlayer == playernames.length - 1) {
			currentPlayer = 0;

			let roundArray = players['Runde'];
			let nextRound = parseInt(roundArray[roundArray.length - 1]) + 1;
			roundArray.push(nextRound.toString());
		} else currentPlayer++;

		setDartIndex(0);
		darts.forEach((dart) => {
			dart.digit = -1;
			dart.type = 0;
		});

		let pointArray = players[playernames[currentPlayer]];
		let isFinished =
			pointArray[pointArray.length - 1] == '0' || pointArray[pointArray.length - 1] == '-';
		if (isFinished) {
			pointArray.push('-');
			nextTurn();
		}

		darts = darts;
		players = players;
	}

	function playAgain() {
		let url = new URL(document.location.href);
		let startValue: number = data.startvalue;
		url.search = '';
		url.searchParams.append('startvalue', startValue.toString());

		url.searchParams.append('player', playernames[playernames.length - 1]);
		for (let i = 0; i < playernames.length - 1; i++) {
			url.searchParams.append('player', playernames[i]);
		}

		window.onbeforeunload = () => {};
		location.assign(url);
	}

	function continueMatch() {
		gameState = 'playing';
		nextTurn();
	}

	function allFinished() {
		for (let i = 0; i < playernames.length; i++) {
			const name = playernames[i];
			const currentPoints = players[name][players[name].length - 1];
			if (currentPoints != '0' && currentPoints != '-') return false;
		}

		return true;
	}

	function undo(recursive = false) {
		if (currentPlayer == 0 && players['Runde'][players['Runde'].length - 1] == '1') return;

		if (!recursive) {
			if (!confirm('Vorherigen Zug rückgängig machen?')) return;
		}

		if (currentPlayer == 0) {
			currentPlayer = playernames.length - 1;

			players['Runde'].pop();
		} else currentPlayer--;

		let undoValue = players[playernames[currentPlayer]].pop();

		setDartIndex(0);
		darts.forEach((dart) => {
			dart.digit = -1;
			dart.type = 0;
		});

		calcAverage();

		if (undoValue == '-') undo(true);

		darts = darts;
		players = players;
	}
</script>

<Navbar addHomeLink={false}>
	<li><a href="/">Neues Spiel</a></li>
</Navbar>

<div class="container">
	<h1 class="title">{title}</h1>
	<div class="tableBox">
		<table class="scoring">
			{#each Object.entries(players) as [name, scores]}
				<tr class="row">
					<th class="cell header">{name}</th>
					{#each scores as score}
						<td class="cell">{score}</td>
					{/each}
				</tr>
			{/each}
		</table>
	</div>

	<div class="play">
		{#if currentPlayer != -1 && gameState == 'playing'}
			<h3 class="currentPlayer">Spieler am Zug: {playernames[currentPlayer]}</h3>
			<div class="dartNumber">
				<div class="slide">
					<div bind:this={htmlDartHighlight} class="dartHighlight" />
					{#each darts as _, index}
						<button on:click={() => setDartIndex(index)}> <p>{index + 1}. Dart</p></button>
					{/each}
				</div>
			</div>
			<div class="darts">
				<div class="dartDigit">
					<p>Getroffenes Feld:</p>
					<div>
						{#each Array(22) as _, index}
							<button
								on:click={() => setDartValue(index)}
								class="digit {index >= 20 ? 'bull' : ''} {index == darts[currentDart].digit
									? 'selectedDart'
									: ''}">{getDigitName(index)}</button
							>
						{/each}
					</div>
				</div>
				<div class="dartsType">
					<p>Feldart:</p>
					<div>
						{#each Array(3) as _, index}
							<button
								on:click={() => setDartType(index)}
								class="type digit {index == darts[currentDart].type ? 'selectedDart' : ''}"
								>{getTypeName(index)}</button
							>
						{/each}
					</div>
				</div>
			</div>
			<div class="storeDart">
				<p class="pointsTxt">
					{playernames[currentPlayer]} hat {getDartPoints(darts)}
					{getDartPoints(darts) == 1 ? 'Punkt' : 'Punkte'} geworfen.
				</p>
				<ul>
					<button on:click={closeTurn} class="saveDart">Zug beenden</button>
					<button on:click={() => undo()} class="saveDart undo">Undo</button>
				</ul>
			</div>
		{/if}
		{#if gameState == 'finished'}
			<div class="finished">
				<canvas bind:this={firework} class="firework" />
				<p class="winner">{playernames[currentPlayer]} ist ein Gewinner!</p>
				<ul>
					{#if !allFinished()}
						<button on:click={continueMatch} class="finishedButton">Weiter spielen</button>
					{/if}
					<a href="/game" on:click|preventDefault={playAgain} class="finishedButton">Revanche</a>
					<a href="/" class="finishedButton">Neues Spiel erstellen</a>
				</ul>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		min-height: calc(100vh - 75px);
		display: flex;
		justify-content: start;
		align-items: center;
		gap: 20px;
		flex-direction: column;
	}

	.title {
		text-align: center;
		margin: 0 10px;
		padding: 15px 15px 10px 15px;
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background-color: #398dd1;
		user-select: none;
	}

	.tableBox {
		max-width: 95vw;
		flex-shrink: 0;
		overflow-x: auto;
	}

	.scoring {
		border-collapse: collapse;
		cursor: default;
		user-select: none;
		color: white;
		text-align: center;
		border-spacing: 10px;
	}

	.cell {
		font-weight: normal;
		border: 1px solid white;
		background-color: #323232;
		padding: 8px;
	}

	.dartNumber {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.slide {
		position: relative;
		background-color: #323232;
		display: flex;
		justify-content: center;
		border-radius: 50px;
		gap: 20px;
		margin-top: 10px;
		overflow: hidden;
	}

	.slide button {
		position: relative;
		cursor: pointer;
		height: 50px;
		line-height: 50px;
		width: 100px;
		z-index: 2;
		text-align: center;
		border: transparent;
		background-color: transparent;
		color: white;
		font-size: 1rem;
		border-radius: 50px;
	}

	.dartHighlight {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		width: 100px;
		height: 100%;
		border-radius: 30px;
		background-color: #398dd1;
		transition: transform 0.4s ease;
	}

	.darts {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: row;
		margin: 10px;
		gap: 20px;
		color: white;
		font-weight: bold;
		text-align: center;
	}

	.dartsType {
		height: 100%;
		width: 150px;
		background-color: #323232;
		border-radius: 20px;
		padding: 8px;
	}

	.dartsType div {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.dartDigit {
		max-width: 570px;
		background-color: #323232;
		border-radius: 20px;
		padding: 8px;
	}

	.dartDigit p {
		margin-bottom: 5px;
	}

	.digit {
		border: none;
		margin: 5px 3px;
		text-align: center;
		width: 50px;
		height: 35px;
		cursor: pointer;
		border-radius: 10px;
		font-size: 1.1rem;
		transition: border 0.33s ease;
	}

	.bull {
		width: 90px !important;
	}

	.type {
		width: 120px !important;
	}

	.selectedDart {
		background-color: #398dd1 !important;
		color: white !important;
	}

	.cell:last-child {
		font-weight: bold;
	}

	.cell:nth-child(even) {
		background-color: #646464;
	}

	.header {
		font-weight: bold;
	}

	.play {
		width: 100%;
	}

	.play h3 {
		padding: 10px 20px;
		border-top-right-radius: 20px;
		border-bottom-right-radius: 20px;
		background-color: #398dd1;
		width: fit-content;
	}

	.currentPlayer {
		text-align: center;
	}

	.storeDart {
		margin-top: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.storeDart ul {
		margin: 10px 0;
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	.undo {
		background-color: #cd3232 !important;
		transition: all 0.3s linear;
	}

	.undo:hover {
		background-color: #b42727 !important;
	}

	.saveDart {
		border: none;
		font-size: 1.1rem;
		border-radius: 50px;
		background-color: #398dd1;
		color: white;
		font-weight: bold;
		padding: 8px 50px;
		cursor: pointer;
		transition: all 0.3s linear;
	}

	.saveDart:hover {
		background-color: #3074ac;
	}

	.pointsTxt {
		text-align: center;
	}

	.finished {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		flex-grow: 1;
	}

	.firework {
		position: absolute;
		top: 75px;
		left: 0;
		width: 100%;
		height: calc(100% - 75px);
		z-index: -1;
	}

	.winner {
		text-align: center;
		padding: 20px min(50px, 5vw);
		border-radius: 10px;
		margin-top: 50px;
		font-size: clamp(1rem, 8vw, 1.5rem);
		font-weight: bold;
		background-color: #32cd32;
		user-select: none;
		animation: 3s linear infinite pulse;
	}

	.finished ul {
		display: flex;
		flex-direction: column;
		margin: 40px 0 15px 0;
		gap: 15px;
	}

	.finishedButton {
		text-decoration: none;
		text-align: center;
		border-radius: 50px;
		background-color: #398dd1;
		padding: 12px 40px;
		font-weight: bold;
		font-size: 1rem;
		color: white;
		border: transparent;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.finishedButton:hover {
		background-color: #3074ac;
		transform: scale(1.05);
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	@media only screen and (max-width: 800px) {
		.darts {
			flex-direction: column;
		}
	}

	@media only screen and (max-width: 400px) {
		.storeDart ul {
			flex-direction: column;
		}
	}
</style>
