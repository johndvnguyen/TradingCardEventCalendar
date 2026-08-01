namespace TradingCardEventCalendar.Api.Dto;

public record EventDto(
    int Id,
    string Name,
    string GameType,
    string PlayFormat,
    DateTime StartDatetime,
    DateTime EndDatetime,
    int PlayerCapacity,
    int MinPlayers,
    bool ShowMinPlayersOnEvent,
    Guid RegistrationToken,
    int RegistrationCount,
    int SpotsRemaining,
    bool IsFull,
    string RegistrationUrl);

public record EventPublicDto(
    string Name,
    string GameType,
    string PlayFormat,
    DateTime StartDatetime,
    DateTime EndDatetime,
    int PlayerCapacity,
    int MinPlayers,
    bool ShowMinPlayersOnEvent,
    int RegistrationCount,
    int SpotsRemaining,
    bool IsFull,
    string RegistrationUrl);

public record RegisterRequest(string Name);

public record RegisterResponse(string Message, string PlayerName);

public record ErrorResponse(string Message);
