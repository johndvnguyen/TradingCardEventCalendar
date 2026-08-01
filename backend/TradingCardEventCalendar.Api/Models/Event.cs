namespace TradingCardEventCalendar.Api.Models;

public class Event
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string GameType { get; set; }
    public required string PlayFormat { get; set; }
    public DateTime StartDatetime { get; set; }
    public DateTime EndDatetime { get; set; }
    public int PlayerCapacity { get; set; }
    public int MinPlayers { get; set; }
    public bool ShowMinPlayersOnEvent { get; set; }
    public Guid RegistrationToken { get; set; }

    public ICollection<EventRegistration> Registrations { get; set; } = [];
}
