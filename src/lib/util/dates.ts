import DATE_RANGE_OPTIONS from '$lib/constants/DateRangeOptions';

interface DateRangeOption {
	[key: string]: string;
}

export function convertDateRange(selectedDateRange: string) {
	/* grab the values from the DATE_RANGE_OPTIONS obj,
  create a new obj of just display text keys and query text values */
	const dateRangeMap: DateRangeOption = Object.values(DATE_RANGE_OPTIONS).reduce(
		(dateMap: DateRangeOption, value) => {
			dateMap[value.displayText] = value.queryText;
			return dateMap;
		},
		{}
	);
	return dateRangeMap[selectedDateRange];
}

export const dateRangeDisplayText = Object.values(DATE_RANGE_OPTIONS).map((dateInfo) => {
	return dateInfo.displayText;
});
