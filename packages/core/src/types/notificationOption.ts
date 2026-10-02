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

export interface NotificationSettingsProps {
  showErrorMessage: (message: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface NotificationToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export interface NotificationItem {
  key: keyof NotificationOptionRequest;
  title: string;
  description: string;
}
