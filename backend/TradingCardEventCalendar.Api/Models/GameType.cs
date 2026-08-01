namespace TradingCardEventCalendar.Api.Models;

public class GameType
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string PlayFormats { get; set; }
    public int MaxCapacity { get; set; }
    public int MinPlayers { get; set; }
}
