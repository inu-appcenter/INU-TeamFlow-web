export interface NotificationOptionResponse {
  allEnabled: boolean;
  noticeEnabled: boolean;
  inviteEnabled: boolean;
  applicationEnabled: boolean;
  calendarEnabled: boolean;
  chatEnabled: boolean;
}

export interface NotificationOptionRequest {
  noticeEnabled: boolean;
  inviteEnabled: boolean;
  applicationEnabled: boolean;
  calendarEnabled: boolean;
  chatEnabled: boolean;
}
