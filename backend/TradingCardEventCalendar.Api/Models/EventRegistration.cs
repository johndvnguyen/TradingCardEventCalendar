namespace TradingCardEventCalendar.Api.Models;

public class EventRegistration
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int PlayerId { get; set; }
    public DateTime RegisteredAt { get; set; }

    public Event Event { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
