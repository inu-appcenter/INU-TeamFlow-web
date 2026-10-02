export type FcmTokenRequest = {
  token: string;
  deviceType: 'web';
};

export type FcmTokenResponse = {
  tokenId: number;
  createdAt: string;
};
