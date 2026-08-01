export interface PlayFormat {
  id: number;
  name: string;
  defaultCapacity: number;
  minPlayers: number;
  maxCapacity: number | null;
  defaultDurationHours: number;
  showMinPlayersOnEvent: boolean;
}

export interface GameTypeTemplate {
  id: number;
  name: string;
  playFormats: PlayFormat[];
}

export interface EventDto {
  id: number;
  name: string;
  gameType: string;
  playFormat: string;
  startDatetime: string;
  endDatetime: string;
  playerCapacity: number;
  minPlayers: number;
  showMinPlayersOnEvent: boolean;
  registrationToken: string;
  registrationCount: number;
  spotsRemaining: number;
  isFull: boolean;
  registrationUrl: string;
}

export interface EventPublicDto {
  name: string;
  gameType: string;
  playFormat: string;
  startDatetime: string;
  endDatetime: string;
  playerCapacity: number;
  minPlayers: number;
  showMinPlayersOnEvent: boolean;
  registrationCount: number;
  spotsRemaining: number;
  isFull: boolean;
  registrationUrl: string;
}

export interface EventPayload {
  name: string;
  gameType: string;
  playFormat: string;
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

export interface EventDisplayInfo {
  name: string;
  gameType: string;
  playFormat: string;
  startDatetime: string;
  endDatetime: string;
  playerCapacity: number;
  minPlayers: number;
  showMinPlayersOnEvent: boolean;
  registrationCount?: number;
  spotsRemaining?: number;
  isFull?: boolean;
}
