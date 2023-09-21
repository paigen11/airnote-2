import { error } from '@sveltejs/kit';
import * as NotehubJs from '@blues-inc/notehub-js';
import { HUB_AUTH_TOKEN } from '$env/static/private';
import { getCurrentReadings, getHistoryReadings } from '$lib/services/device.js';
import type { NotehubEvent } from '$lib/services/NotehubEventModel.js';
import type { AirnoteReading } from '$lib/services/AirReadingModel.js';
import type { AirnoteHistoryReadings } from '$lib/services/AirHistoryModel.js';

const notehubJsClient = NotehubJs.ApiClient.instance;
const deviceApiInstance = new NotehubJs.DeviceApi();

const AIRNOTE_PROJECT_UID = 'app:2606f411-dea6-44a0-9743-1130f57d77d8';

async function getEvents(deviceUID: string) {
	/* this function is originally fetched on mount with 8 days' worth of data to
		  populate the AQI average history with the previous week's data AND
		  display today's most current reading as well */
	const TIMEFRAME = '8 days';

	const body = {
		req: 'hub.app.data.query',
		query: {
			columns:
				".body;.when;lat:(events.value->'best_lat');lon:(events.value->'best_lon');location:(events.value->'best_location')",
			limit: 1000,
			order: '.modified',
			descending: true,
			where: `.file::text='_air.qo' and .device::text='${deviceUID}' and .modified >= now()-interval '${TIMEFRAME}'`
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

export async function load({ params }) {
	const deviceUID = params.deviceUID;
	const allEvents: NotehubEvent[] = [];
	let readings: AirnoteReading[] = [];
	let history: AirnoteHistoryReadings = {
		aqi: {},
		pm1_0: {},
		pm2_5: {},
		pm10_0: {}
	};

	let erred = false;
	let notehubError: { status: number } | undefined;

	await Promise.all([getEnvironmentVariables(deviceUID), getEvents(deviceUID)])
		.then((responses) => {
			const [envVarResponse, eventsResponse] = responses;
			const serialNumber = envVarResponse.environment_variables._sn;
			allEvents.push(...eventsResponse);
			allEvents.forEach((entry) => (entry.serial_number = serialNumber));
			readings = getCurrentReadings(allEvents, deviceUID);
			history = getHistoryReadings(readings);
		})
		.catch((err) => {
			console.error(err);
			erred = true;
			notehubError = err;
		});

	if (erred) {
		if (notehubError) {
			if (notehubError.status === 404) {
				throw error(404, {
					message: 'Device not found',
					errorType: 'Notehub error',
					deviceUID
				});
			} else {
				throw error(500, {
					message: 'Error fetching data from Notehub',
					errorType: 'Notehub error',
					deviceUID
				});
			}
		}
	} else {
		return {
			readings,
			history
		};
	}
}
