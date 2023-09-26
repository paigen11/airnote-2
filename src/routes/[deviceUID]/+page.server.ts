import { error } from '@sveltejs/kit';
import {
	getDeviceEnvironmentVariables,
	getDeviceEnvironmentVariablesByPin
} from '$lib/services/notehub';

export async function load({ params, url }) {
	const deviceUID = params.deviceUID;
	const pin = url.searchParams.get('pin');

	let erred = false;
	let notehubError: { status: number } | undefined;
	let unauthorizedError: { errorType: string } | undefined;

	const envVarResponse = await getDeviceEnvironmentVariables(deviceUID).catch((err) => {
		console.error(err);
		erred = true;
		notehubError = err;
	});
	const { environment_variables } = envVarResponse;

	if (pin === '') {
		unauthorizedError = { errorType: 'No PIN' };
	} else if (pin !== null) {
		await getDeviceEnvironmentVariablesByPin(deviceUID, pin).catch((err) => {
			console.error(err);
			unauthorizedError = { errorType: 'PIN is incorrect' };
			return unauthorizedError;
		});
	}

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
		return { environment_variables, unauthorizedError };
	}
}
