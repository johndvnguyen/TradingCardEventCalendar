using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Dto;

namespace TradingCardEventCalendar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public GameTypesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameTypeTemplateDto>>> GetAll()
    {
        var gameTypes = await _db.GameTypes
            .Include(g => g.PlayFormats)
            .OrderBy(g => g.Name)
            .ToListAsync();

        return gameTypes.Select(g => new GameTypeTemplateDto(
            g.Id,
            g.Name,
            g.PlayFormats
                .OrderBy(p => p.Name)
                .Select(p => new PlayFormatDto(
                    p.Id,
                    p.Name,
                    p.DefaultCapacity,
                    p.MinPlayers,
                    p.MaxCapacity,
                    p.DefaultDurationHours,
                    p.ShowMinPlayersOnEvent))
                .ToList()))
            .ToList();
    }
}
