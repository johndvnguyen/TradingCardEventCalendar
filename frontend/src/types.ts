export interface GameType {
  id: number;
  name: string;
  playFormats: string;
  maxCapacity: number;
  minPlayers: number;
}

export interface EventDto {
  id: number;
  name: string;
  gameType: string;
  startDatetime: string;
  endDatetime: string;
  playerCapacity: number;
  registrationToken: string;
  registrationCount: number;
  spotsRemaining: number;
  isFull: boolean;
  registrationUrl: string;
  eventPageUrl: string;
}

export interface EventPublicDto {
  name: string;
  gameType: string;
  startDatetime: string;
  endDatetime: string;
  playerCapacity: number;
  registrationCount: number;
  spotsRemaining: number;
  isFull: boolean;
  registrationUrl: string;
}

export interface EventPayload {
  id?: number;
  name: string;
  gameType: string;
  startDatetime: string;
  endDatetime: string;
  playerCapacity: number;
}

export interface RegisterResponse {
  message: string;
  playerName: string;
}

export interface ErrorResponse {
  message: string;
}
