//#region node_modules/.nitro/vite/services/ssr/assets/types-D3FEuKtl.js
var CONNECTOR_TOKEN_PENDING_CODE = "connector_token_pending";
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
var ConnectorType = {
	GoogleDrive: "GoogleDrive",
	Gmail: "Gmail",
	GoogleCalendar: "GoogleCalendar",
	Outlook: "Outlook",
	OutlookCalendar: "OutlookCalendar",
	MicrosoftTeams: "MicrosoftTeams",
	Mcp: "Mcp"
};
var GoogleDriveTools = {
	search: "google_drive_search",
	readFile: "google_drive_read_file",
	listFolder: "google_drive_list_folder",
	createFolder: "google_drive_create_folder",
	trashFile: "google_drive_trash_file"
};
var GoogleCalendarTools = {
	listCalendars: "google_calendar_list_calendars",
	search: "google_calendar_search",
	getEvent: "google_calendar_get_event",
	availability: "google_calendar_availability"
};
//#endregion
export { GoogleDriveTools as a, GoogleCalendarTools as i, CONNECTOR_TOKEN_READY_EVENT as n, ConnectorType as r, CONNECTOR_TOKEN_PENDING_CODE as t };
