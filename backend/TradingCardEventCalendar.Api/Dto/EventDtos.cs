namespace TradingCardEventCalendar.Api.Dto;

public record EventDto(
    int Id,
    string Name,
    string GameType,
    DateTime StartDatetime,
    DateTime EndDatetime,
    int PlayerCapacity,
    Guid RegistrationToken,
    int RegistrationCount,
    int SpotsRemaining,
    bool IsFull,
    string RegistrationUrl,
    string EventPageUrl);

public record EventPublicDto(
    string Name,
    string GameType,
    DateTime StartDatetime,
    DateTime EndDatetime,
    int PlayerCapacity,
    int RegistrationCount,
    int SpotsRemaining,
    bool IsFull,
    string RegistrationUrl);

public record RegisterRequest(string Name);

public record RegisterResponse(string Message, string PlayerName);

public record ErrorResponse(string Message);
