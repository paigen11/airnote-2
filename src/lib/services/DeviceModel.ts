export interface AirnoteDevice {
	deviceUID: string;
	productUID: string | (string | null)[] | null;
	pin: string | (string | null)[] | null;
	internalNav?: string | (string | null)[] | null;
}
