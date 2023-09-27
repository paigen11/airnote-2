import * as NotehubJs from '@blues-inc/notehub-js';
import { HUB_AUTH_TOKEN } from '$env/static/private';
import type { DeviceEnvVars } from './DeviceEnvVarModel';

const AIRNOTE_PROJECT_UID = 'app:2606f411-dea6-44a0-9743-1130f57d77d8';

const notehubJsClient = NotehubJs.ApiClient.instance;
const deviceApiInstance = new NotehubJs.DeviceApi();

// read env vars only
export async function getDeviceEnvironmentVariables(deviceUID: string) {
	const { api_key } = notehubJsClient.authentications;
	api_key.apiKey = HUB_AUTH_TOKEN;
	return await deviceApiInstance.getDeviceEnvironmentVariables(AIRNOTE_PROJECT_UID, deviceUID);
}

// read and write env vars
export async function getDeviceEnvironmentVariablesByPin(deviceUID: string, pinNumber: string) {
	const { pin } = notehubJsClient.authentications;
	pin.apiKey = pinNumber;
	return await deviceApiInstance.getDeviceEnvironmentVariablesByPin(AIRNOTE_PROJECT_UID, deviceUID);
}

export async function updateDeviceEnvironmentVariablesByPin(
	deviceUID: string,
	pinNumber: string,
	environmentVariables: DeviceEnvVars
) {
	const { pin } = notehubJsClient.authentications;
	pin.apiKey = pinNumber;
	const deviceEnvironmentVariables = new NotehubJs.EnvironmentVariables(environmentVariables);
	return await deviceApiInstance.putDeviceEnvironmentVariablesByPin(
		AIRNOTE_PROJECT_UID,
		deviceUID,
		deviceEnvironmentVariables
	);
}

export async function getEvents(deviceUID: string) {
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
