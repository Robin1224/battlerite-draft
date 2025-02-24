<script lang="ts">
  import { onMount } from 'svelte';
  import { room } from './room.svelte';
  const { gameState, me } = $derived(room);

  const classes = ['Warrior', 'Mage', 'Rogue', 'Priest', 'Druid', 'Paladin', 'Shaman', 'Warlock'];

  function handlePick(className: string) {
    room.pickClass(className);
  }
</script>

<div>
  <h2>Drafting Phase</h2>
  <p>Current Pick: {gameState.currentPick}</p>
  <p>Time Remaining: {gameState.timer} seconds</p>

  {#if me && me.isCaptain && gameState.currentPick === me.team}
    <div>
      <p>Your turn to pick a class:</p>
      <div>
        {#each classes as className}
          <button on:click={() => handlePick(className)}>{className}</button>
        {/each}  
      </div>
    </div>
  {:else}
    <p>Waiting for {gameState.currentPick} captain to pick...</p>
  {/if}

  <div>
    <h3>Team 1 Composition</h3>
    <ul>
      {#each gameState.team1 as className}
        <li>{className}</li>
      {/each}
    </ul>
  </div>

  <div>  
    <h3>Team 2 Composition</h3>
    <ul>
      {#each gameState.team2 as className}
        <li>{className}</li>
      {/each}
    </ul>
  </div>
</div> 