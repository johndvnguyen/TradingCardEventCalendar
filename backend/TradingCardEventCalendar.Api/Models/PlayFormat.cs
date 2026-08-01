namespace TradingCardEventCalendar.Api.Models;

public class PlayFormat
{
    public int Id { get; set; }
    public int GameTypeId { get; set; }
    public required string Name { get; set; }
    public int DefaultCapacity { get; set; }
    public int MinPlayers { get; set; }
    public int? MaxCapacity { get; set; }
    public int DefaultDurationHours { get; set; }
    public bool ShowMinPlayersOnEvent { get; set; }

    public GameType GameType { get; set; } = null!;
}
