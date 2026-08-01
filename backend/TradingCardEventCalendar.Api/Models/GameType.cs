namespace TradingCardEventCalendar.Api.Models;

public class GameType
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public ICollection<PlayFormat> PlayFormats { get; set; } = [];
}
