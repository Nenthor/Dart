<slot />

<style global>
	@font-face {
		font-family: 'comfortaa';
		src: url(/fonts/comfortaa/comfortaa.woff2) format('woff2');
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'montserrat';
		src: url(/fonts/montserrat/montserrat.woff2) format('woff2');
		font-style: normal;
		font-display: swap;
	}
	@font-face {
		font-family: 'roboto';
		src: url(/fonts/roboto/roboto.woff2) format('woff2');
		font-style: normal;
		font-display: swap;
	}

	* {
		margin: 0;
		padding: 0;
		font-family: montserrat;
	}

	html {
		min-height: 100%;
		width: 100%;
	}

	body {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		width: 100%;
		background-color: #161616;
		position: relative;
	}

	a {
		-webkit-user-drag: none;
	}

	a:visited {
		text-decoration: none;
	}

	div,
	button {
		-webkit-tap-highlight-color: rgba(255, 255, 255, 0);
	}

	p,
	a,
	h1,
	h2,
	h3,
	h4,
	h5 {
		color: white;
	}

	::-webkit-scrollbar {
		width: 6px;
	}

	::-webkit-scrollbar-track {
		background: #323232;
	}

	::-webkit-scrollbar-thumb {
		border-radius: 10px;
		background-image: linear-gradient(#38d, #4fe);
	}

	::-webkit-scrollbar-thumb:hover {
		background-image: linear-gradient(#16b, #2dc);
	}

	body > div > div {
		margin-top: 75px;
		width: 100%;
		max-height: calc(100vh - 75px);
		overflow-y: auto;
	}
</style>
