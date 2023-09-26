<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Slider from './Slider.svelte';
	import { deviceName, displayValue, indoorDevice } from '$lib/stores/settingsStore';
	import type { DeviceDisplayOption } from '$lib/services/DeviceDisplayModel';

	const dispatch = createEventDispatcher();

	export let enableFields: boolean;
	export let deviceDisplayOptions: DeviceDisplayOption[] = [];

	const save = (event: { preventDefault: () => void }) => {
		event.preventDefault();
		dispatch('submit');
	};
</script>

<h4 data-cy="device-settings-title">Device Settings</h4>

<form on:submit={save}>
	<div>
		<label for="deviceName">Device name</label>
		<input
			disabled={!enableFields}
			type="text"
			name="name"
			id="deviceName"
			bind:value={$deviceName}
			placeholder="my-airnote-name"
		/>
	</div>

	<div>
		<label for="displayValue"> Airnote screen display value </label>
		<select disabled={!enableFields} bind:value={$displayValue} name="display" id="displayValue">
			{#each deviceDisplayOptions as option}
				<option value={option['value']}>{option['text']}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="sampleFrequency">Sample frequency (minutes)</label>
		<Slider {enableFields} />
	</div>

	<div>
		<label class="checkbox-label">
			<input
				disabled={!enableFields}
				bind:checked={$indoorDevice}
				type="checkbox"
				name="indoor"
				id="indoorDevice"
			/>
			<span> Indoor device (Will not be visible on the Safecast global map) </span>
		</label>
	</div>

	{#if enableFields}
		<div class="form-buttons">
			<button>Update Device Settings</button>
		</div>
	{/if}
</form>

<style>
	h4 {
		text-align: center;
	}
	label[for='sampleFrequency'] {
		margin-bottom: 0.5rem;
	}
	.form-buttons {
		text-align: center;
	}
</style>
