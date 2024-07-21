<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		window.onbeforeunload = () => {};
	});

	let startvalue = 301;
	let htmlStartValue: HTMLInputElement;
	function onStartValueChange() {
		startvalue = Math.max(1, Math.min(501, startvalue));
	}

	let players: string[] = [''];
	function updatePlayerName(index: number, event: any) {
		players[index] = event.target.value.trim();

		if (players[index] == '') {
			players.splice(index, 1);
		}

		if (players.length == 0 || players[players.length - 1] != '') {
			players.push('');
		}
	}

	function hasDuplicates(array: string[]) {
		return new Set(array).size !== array.length;
	}

	let error = '';
	let timeout: any = null;
	function startNewGame() {
		if (players.length <= 2 || hasDuplicates(players)) {
			if (players.length <= 2) error = 'Zu wenig Spieler!';
			else if (hasDuplicates(players)) error = 'Verwende unterschiedliche Namen!';

			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => {
				error = '';
			}, 5000);
			return;
		}

		let url = new URL(document.location.href);
		url.pathname = '/game';
		url.search = '';
		url.searchParams.append('startvalue', startvalue.toString());
		players.forEach((player) => {
			if (player != '') url.searchParams.append('player', player);
		});

		location.assign(url);
	}
</script>

<Navbar addHomeLink={false} />

<div class="container">
	<h1 class="title">Neues Spiel erstellen</h1>
	<div class="startvalue">
		Startwert:
		<input
			bind:value={startvalue}
			bind:this={htmlStartValue}
			on:input={onStartValueChange}
			on:focus={() => htmlStartValue.select()}
			type="number"
			name="startvalue"
			autocomplete="off"
			min="1"
			max="501"
		/>
	</div>
	<div class="playerbox">
		Spieler:
		{#each players as player, index}
			<input
				on:input={(e) => updatePlayerName(index, e)}
				type="text"
				name="playername"
				class="playername"
				placeholder="Neuer Spieler"
				autocomplete="off"
				value={player}
			/>
		{/each}
	</div>
	<p class="error">{error}</p>
	<a on:click|preventDefault={startNewGame} href="/game" class="newgame">Runde starten!</a>
</div>

<style>
	.container {
		margin-top: 75px;
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.title {
		text-align: center;
		padding: 15px 15px 10px 15px;
		margin-bottom: 20px;
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background-color: #398dd1;
	}

	.startvalue {
		color: white;
		font-weight: bold;
	}

	input {
		padding: 5px;
		margin-left: 10px;
		font-size: 1rem;
		border-radius: 10px;
		text-align: center;
		border: 3px solid transparent;
		outline: transparent;
		transition: 0.3s;
		color: black;
	}

	input:focus {
		border: 3px solid #398dd1;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		appearance: none;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.playerbox {
		display: flex;
		flex-direction: column;
		color: white;
		margin-top: 25px;
		text-align: center;
		font-weight: bold;
		gap: 5px;
	}

	.error {
		margin-top: 10px;
		min-height: 1.3rem;
		color: #cd3232;
	}

	.newgame {
		margin: 10px 0;
		padding: 10px 75px;
		background-color: #398dd1;
		border-radius: 50px;
		text-decoration: none;
		font-weight: bold;
		text-align: center;
		font-size: 1.1rem;
	}
</style>
