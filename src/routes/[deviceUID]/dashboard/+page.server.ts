import * as NotehubJs from '@blues-inc/notehub-js';
import { HUB_AUTH_TOKEN } from '$env/static/private';

const notehubJsClient = NotehubJs.ApiClient.instance;
const deviceApiInstance = new NotehubJs.DeviceApi();

const AIRNOTE_PROJECT_UID = 'app:2606f411-dea6-44a0-9743-1130f57d77d8';
const HEADERS = {
	'Content-Type': 'application/json',
	'X-SESSION-TOKEN': HUB_AUTH_TOKEN
};

const INITIAL_TIMEFRAME = '8 days';

async function getEvents(deviceUID: string, timeframe?: string) {
	if (timeframe === null) {
		/* this function is originally fetched on mount with 8 days' worth of data to
    populate the AQI average history with the previous week's data AND
    display today's most current reading as well */
		timeframe = INITIAL_TIMEFRAME;
	}

	return await fetch(`https://api.notefile.net/req?app=${AIRNOTE_PROJECT_UID}`, {
		method: 'POST',
		headers: HEADERS,
		req: 'hub.app.data.query',
		query: {
			columns:
				".body;.when;lat:(events.value->'best_lat');lon:(events.value->'best_lon');location:(events.value->'best_location')",
			limit: 1000,
			order: '.modified',
			descending: true,
			where: `.file::text='_air.qo' and .device::text='${deviceUID}' and .modified >= now()-interval '${timeframe}'`
		}
	});
}

async function getEnvironmentVariables(deviceUID: string) {
	const { api_key } = notehubJsClient.authentications;
	api_key.apiKey = HUB_AUTH_TOKEN;

	return await deviceApiInstance.getDeviceEnvironmentVariables(AIRNOTE_PROJECT_UID, deviceUID);
}

export async function load({ params, url }) {
	// console.log(params, url);
	const deviceUID = params.deviceUID;
	const timeframe = url.searchParams.get('timeframe');

	await Promise.all([getEnvironmentVariables(deviceUID), getEvents(deviceUID, timeframe)])
		.then((responses) => {
			console.log('responses------------', responses);
			const [envVarResponse, eventsResponse] = responses;
			console.log('envVarResponse', envVarResponse.environment_variables);
			console.log('eventsResponse', eventsResponse);
			// let serialNumber = envVarResponse.data.environment_variables._sn;
			// allEvents.push(...eventsResponse.data);
			// allEvents.forEach((entry) => (entry.serial_number = serialNumber));
		})
		.catch((err) => {
			console.error(err);
			erred = true;
		});
}
