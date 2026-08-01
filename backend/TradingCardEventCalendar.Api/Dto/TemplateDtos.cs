namespace TradingCardEventCalendar.Api.Dto;

public record PlayFormatDto(
    int Id,
    string Name,
    int DefaultCapacity,
    int MinPlayers,
    int? MaxCapacity,
    int DefaultDurationHours,
    bool ShowMinPlayersOnEvent);

public record GameTypeTemplateDto(
    int Id,
    string Name,
    IReadOnlyList<PlayFormatDto> PlayFormats);
