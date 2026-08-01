using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Models;

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
    public async Task<ActionResult<IEnumerable<GameType>>> GetAll()
    {
        return await _db.GameTypes.OrderBy(g => g.Name).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<GameType>> Create(GameType gameType)
    {
        _db.GameTypes.Add(gameType);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = gameType.Id }, gameType);
    }
}
