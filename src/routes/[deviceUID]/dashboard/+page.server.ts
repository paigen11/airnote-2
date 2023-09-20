import { error } from '@sveltejs/kit';
import * as NotehubJs from '@blues-inc/notehub-js';
import { HUB_AUTH_TOKEN } from '$env/static/private';
import { getReadings } from '$lib/services/device.js';
import type { NotehubEvent } from '$lib/services/NotehubEventModel.js';

const notehubJsClient = NotehubJs.ApiClient.instance;
const deviceApiInstance = new NotehubJs.DeviceApi();

const AIRNOTE_PROJECT_UID = 'app:2606f411-dea6-44a0-9743-1130f57d77d8';

const INITIAL_TIMEFRAME = '8 days';

async function getEvents(deviceUID: string, timeframe?: string) {
	if (timeframe === null) {
		/* this function is originally fetched on mount with 8 days' worth of data to
    populate the AQI average history with the previous week's data AND
    display today's most current reading as well */
		timeframe = INITIAL_TIMEFRAME;
	}

	console.log('timeframe', timeframe);

	const body = {
		req: 'hub.app.data.query',
		query: {
			columns:
				".body;.when;lat:(events.value->'best_lat');lon:(events.value->'best_lon');location:(events.value->'best_location')",
			limit: 1000,
			order: '.modified',
			descending: true,
			where: `.file::text='_air.qo' and .device::text='${deviceUID}' and .modified >= now()-interval '${timeframe}'`
		}
	};

	const res = await fetch(`https://api.notefile.net/req?app=${AIRNOTE_PROJECT_UID}`, {
		method: 'POST',
		body: JSON.stringify(body)
	});

	return res.json();
}

async function getEnvironmentVariables(deviceUID: string) {
	const { api_key } = notehubJsClient.authentications;
	api_key.apiKey = HUB_AUTH_TOKEN;
	return await deviceApiInstance.getDeviceEnvironmentVariables(AIRNOTE_PROJECT_UID, deviceUID);
}

export async function load({ params, url }) {
	const deviceUID = params.deviceUID;
	const timeframe = url.searchParams.get('timeframe');
	const allEvents: NotehubEvent[] = [];
	let data = {};

	let erred = false;

	await Promise.all([getEnvironmentVariables(deviceUID), getEvents(deviceUID, timeframe)])
		.then((responses) => {
			const [envVarResponse, eventsResponse] = responses;
			const serialNumber = envVarResponse.environment_variables._sn;
			allEvents.push(...eventsResponse);
			allEvents.forEach((entry) => (entry.serial_number = serialNumber));

			const temp = getReadings(allEvents, deviceUID);
			console.log(temp);
			data = temp;
		})
		.catch((err) => {
			console.error(err);
			erred = true;
		});

	if (erred) {
		throw error(500, {
			message: 'Error fetching data from Notehub',
			errorType: 'Notehub error',
			deviceUID
		});
	} else {
		return {
			data
		};
	}
}
