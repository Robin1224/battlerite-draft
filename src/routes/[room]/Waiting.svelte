<script lang="ts">
	import { onMount } from 'svelte';
	import { room } from './room.svelte';
	const { gameState, me, isHost } = $derived(room);
</script>

<div>
	<h2>Waiting Room</h2>
	<p>Waiting for players to join...</p>

	<h3>Players</h3>
	<ul>
		{#each gameState.players as player}
			<li>
				{player.userName} 
				{#if player.isCaptain}(Captain){/if}
				- {player.team}
			</li>
		{/each}
	</ul>

	{#if isHost && gameState.players.length === 6}
		<button on:click={() => room.startDraft()}>Start Draft</button>
	{/if}
</div>

<div class="flex-1"></div>

{#if isHost}
	<button onclick={() => room.startGame()} class="btn btn-primary btn-lg">Start Game</button>
{:else}
	<p class="text-sm">Waiting for host to start the game</p>
{/if}
<a href="/" class="underline">Leave Game</a>
