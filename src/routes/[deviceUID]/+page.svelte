<script lang="{ts}">
	export let pin;
	export let productUID;
	export let deviceUID;
	let enableFields = false;
	let error = false;
	let errorType;
	let notify;
</script>

<svelte:head>
	<title>Airnote Device Configuration</title>
</svelte:head>

<h1>Welcome to Airnote Settings page!</h1>

{#if error}
	{@html renderErrorMessage(errorType, deviceUID)}
{/if}

<section>
	<h1>Welcome to Airnote!</h1>
	<p>You're now part of a community of citizens helping to monitor the air we breathe.</p>
	<p>You can view your device’s dashboard or use the forms below to personalize your device.</p>
	<p>
		<a href="/{deviceUID}/dashboard" class="btn">View your device’s dashboard</a>
	</p>
	<p>
		<i>
			For help setting up your Airnote, visit
			<a href="https://start.airnote.live">start.airnote.live</a>.
		</i>
	</p>
</section>

<hr />

<!-- <NotificationDisplay bind:this={notify} /> -->

<section>
	<DeviceSettings {enableFields} {displayOptions} on:submit={handleSettingsSave} />
</section>

<hr />

<section>
	<DeviceOwner {enableFields} on:submit={handleSettingsSave} />
</section>

<hr />

<section>
	<p>
		<a href={eventsUrl} target="_new" data-cy="notehub-link">
			View live Airnote events on Notehub.io
		</a>
	</p>
</section>

<hr />

<section>
	<p>
		<i>
			By using your Airnote device, or completing the optional fields on this page, you consent to
			openly sharing your device data and the optional contact information under Creative Commons
			CC0. For the benefit of the community, all devices' data, maps, dashboards, and contact
			information are openly published to the public. If you do not wish your contact information to
			be published, please do not supply it.
		</i>
	</p>
</section>

<style>
	h1 {
		text-align: center;
	}
	a {
		text-align: center;
	}
	p {
		text-align: center;
	}
	section {
		margin: 0 auto;
	}
	@media (max-width: 992px) {
		section {
			max-width: 720px;
			padding: 0 1rem;
		}
	}
</style>
