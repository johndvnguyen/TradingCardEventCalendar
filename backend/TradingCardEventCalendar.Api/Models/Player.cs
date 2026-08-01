namespace TradingCardEventCalendar.Api.Models;

public class Player
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public ICollection<EventRegistration> Registrations { get; set; } = [];
}
