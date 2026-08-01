using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Models;

namespace TradingCardEventCalendar.Api.Services;

public class TemplateValidationService
{
    private readonly AppDbContext _db;

    public TemplateValidationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool Success, string? ErrorMessage)> ApplyTemplateAsync(Event evt)
    {
        var format = await _db.PlayFormats
            .Include(p => p.GameType)
            .FirstOrDefaultAsync(p =>
                p.GameType.Name == evt.GameType &&
                p.Name == evt.PlayFormat);

        if (format is null)
            return (false, $"Unknown game type and format: {evt.GameType} — {evt.PlayFormat}.");

        if (evt.PlayerCapacity < format.MinPlayers)
        {
            return (false,
                $"{format.Name} requires at least {format.MinPlayers} players.");
        }

        if (format.MaxCapacity.HasValue && evt.PlayerCapacity > format.MaxCapacity.Value)
        {
            return (false,
                $"{format.Name} allows at most {format.MaxCapacity.Value} players.");
        }

        evt.MinPlayers = format.MinPlayers;
        evt.ShowMinPlayersOnEvent = format.ShowMinPlayersOnEvent;

        return (true, null);
    }
}
