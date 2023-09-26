<script lang="ts">
	import { onMount } from 'svelte';
	import { sampleFrequencyFull } from '$lib/stores/settingsStore';

	export let enableFields: boolean;

	const setPopup = (
		frequency: HTMLInputElement,
		popup: HTMLOutputElement,
		value: string | undefined
	) => {
		const val: number = value ? Number(value) : Number(frequency.value);
		const min: number = frequency.min ? Number(frequency.min) : 0;
		const max: number = frequency.max ? Number(frequency.max) : 100;
		const newVal = Number(((val - min) * 100) / (max - min));
		popup.innerHTML = val.toString();

		popup.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
	};

	onMount(() => {
		const allRanges = document.querySelectorAll('.frequency-wrap');
		allRanges.forEach((wrap) => {
			const frequency: HTMLInputElement | null = wrap.querySelector('#sampleFrequency');
			const popup: HTMLOutputElement | null = wrap.querySelector('.frequencyPopup');

			if (frequency && popup) {
				frequency.addEventListener('input', () => {
					setPopup(frequency, popup, undefined);
				});
				setPopup(frequency, popup, undefined);
			}
		});

		sampleFrequencyFull.subscribe((value) => {
			const allRanges = document.querySelectorAll('.frequency-wrap');
			if (allRanges.length > 0) {
				const frequency: HTMLInputElement | null = allRanges[0].querySelector('#sampleFrequency');
				const popup: HTMLOutputElement | null = allRanges[0].querySelector('.frequencyPopup');

				if (frequency && popup) {
					setPopup(frequency, popup, value);
				}
			}
		});
	});
</script>

<div class="frequency-wrap">
	<input
		type="range"
		name="sampleFrequencyFull"
		id="sampleFrequency"
		disabled={!enableFields}
		min="15"
		max="1440"
		bind:value={$sampleFrequencyFull}
		step="5"
	/>
	<output class="frequencyPopup" />
</div>
<span class="min-val">15 min</span>
<span class="max-val">1440 min</span>

<style>
	.frequency-wrap {
		position: relative;
	}
	input {
		border: none;
		height: 1px;
		outline: none;
		-webkit-appearance: none;
		margin-top: 2rem;
		background: var(--backgroundWhite);
	}

	.frequencyPopup {
		color: var(--notehubBlue);
		font-weight: 600;
		padding: 4px 12px;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}
	.frequencyPopup::after {
		content: ' min';
		position: absolute;
		width: 2px;
		height: 2px;
		color: var(--notehubBlue);
		top: 4px;
		right: 15%;
	}

	.min-val,
	.max-val {
		color: var(--medGrey);
	}
	.max-val {
		float: right;
	}
</style>
