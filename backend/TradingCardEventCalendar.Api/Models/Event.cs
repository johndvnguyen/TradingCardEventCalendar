namespace TradingCardEventCalendar.Api.Models;

public class Event
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string GameType { get; set; }
    public DateTime StartDatetime { get; set; }
    public int PlayerCapacity { get; set; }
    public Guid RegistrationToken { get; set; }

    public ICollection<EventRegistration> Registrations { get; set; } = [];
}
