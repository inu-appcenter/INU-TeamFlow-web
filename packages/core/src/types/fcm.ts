export type PushProvider = "FCM" | "EXPO";
export type PushDeviceType = "web" | "ios";

export type PushTokenRequest = {
  token: string;
  deviceType: PushDeviceType;
  provider: PushProvider;
};

export type PushTokenResponse = {
  tokenId: number;
  createdAt: string;
};

// 기존 web 코드 호환용
export type FcmTokenRequest = {
  token: string;
  deviceType: "web";
};
export type FcmTokenResponse = PushTokenResponse;
