import { AIRNOTE_PRODUCT_UID } from '$lib/constants';
import queryString from 'query-string';

function saveLastViewedDevice(data) {
	localStorage.setItem('device', JSON.stringify(data));
}

function readLastViewedDevice() {
	return JSON.parse(localStorage.getItem('device')) || {};
}

export function getCurrentDeviceFromUrl(location) {
	const lastViewedDevice = readLastViewedDevice();
	const currentDevice = {};

	const query = queryString.parse(location.search);
	let pin = query['pin'] || '';
	let productUID = query['product'] || AIRNOTE_PRODUCT_UID;
	let deviceUID = location.pathname.match(/dev:\d*/)?.[0] || '';
	const internalNav = query['internalNav'];

	// If there is no device in the query string default to the
	// last viewed device.
	if (lastViewedDevice.deviceUID && !deviceUID) {
		deviceUID = lastViewedDevice.deviceUID;
	}

	// If still working with the last viewed device, and we don’t have
	// a pin or productUID in the URL, grab those from local storage.
	if (deviceUID === lastViewedDevice.deviceUID) {
		if (!pin) pin = lastViewedDevice.pin;
		if (!productUID) productUID = lastViewedDevice.productUID;
	}

	currentDevice.pin = pin;
	currentDevice.deviceUID = deviceUID;
	currentDevice.productUID = productUID;

	if (deviceUID) {
		saveLastViewedDevice(currentDevice);
	}

	// Don’t save whether this was internal navigation in local storage
	currentDevice.internalNav = internalNav;

	return currentDevice;
}
