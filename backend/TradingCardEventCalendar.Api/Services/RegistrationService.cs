using System.Data;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Dto;
using TradingCardEventCalendar.Api.Models;

namespace TradingCardEventCalendar.Api.Services;

public class RegistrationService
{
    private readonly AppDbContext _db;

    public RegistrationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool Success, string? ErrorMessage, RegisterResponse? Response)> RegisterAsync(
        Guid token,
        string playerName)
    {
        var normalizedName = playerName.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
            return (false, "Name is required.", null);

        if (normalizedName.Length > 100)
            return (false, "Name must be 100 characters or fewer.", null);

        await using var transaction =
            await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var evt = await _db.Events
            .FirstOrDefaultAsync(e => e.RegistrationToken == token);

        if (evt is null)
            return (false, "Event not found.", null);

        var registrationCount = await _db.EventRegistrations
            .CountAsync(r => r.EventId == evt.Id);

        if (registrationCount >= evt.PlayerCapacity)
            return (false, "This event is full. Registration is closed.", null);

        var nameTaken = await _db.EventRegistrations
            .AnyAsync(r =>
                r.EventId == evt.Id &&
                r.Player.Name.ToLower() == normalizedName.ToLower());

        if (nameTaken)
            return (false, "This name is already registered for this event.", null);

        var player = new Player { Name = normalizedName };
        var registration = new EventRegistration
        {
            EventId = evt.Id,
            Player = player,
            RegisteredAt = DateTime.UtcNow
        };

        _db.EventRegistrations.Add(registration);
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return (true, null, new RegisterResponse(
            "You're registered! See you at the event.",
            normalizedName));
    }

    public static EventPublicDto ToPublicDto(Event evt, int registrationCount, string baseUrl)
    {
        var spotsRemaining = Math.Max(0, evt.PlayerCapacity - registrationCount);
        var registrationUrl = BuildRegistrationUrl(baseUrl, evt.RegistrationToken);

        return new EventPublicDto(
            evt.Name,
            evt.GameType,
            evt.PlayFormat,
            evt.StartDatetime,
            evt.EndDatetime,
            evt.PlayerCapacity,
            evt.MinPlayers,
            evt.ShowMinPlayersOnEvent,
            registrationCount,
            spotsRemaining,
            spotsRemaining == 0,
            registrationUrl);
    }

    public static EventDto ToDto(Event evt, int registrationCount, string baseUrl)
    {
        var spotsRemaining = Math.Max(0, evt.PlayerCapacity - registrationCount);
        var registrationUrl = BuildRegistrationUrl(baseUrl, evt.RegistrationToken);

        return new EventDto(
            evt.Id,
            evt.Name,
            evt.GameType,
            evt.PlayFormat,
            evt.StartDatetime,
            evt.EndDatetime,
            evt.PlayerCapacity,
            evt.MinPlayers,
            evt.ShowMinPlayersOnEvent,
            evt.RegistrationToken,
            registrationCount,
            spotsRemaining,
            spotsRemaining == 0,
            registrationUrl);
    }

    public static string BuildRegistrationUrl(string baseUrl, Guid token) =>
        $"{baseUrl.TrimEnd('/')}/register/{token:D}";

}
