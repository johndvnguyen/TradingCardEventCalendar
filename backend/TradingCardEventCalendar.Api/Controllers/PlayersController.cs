using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Models;

namespace TradingCardEventCalendar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly AppDbContext _db;

    public PlayersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Player>>> GetAll()
    {
        return await _db.Players.OrderBy(p => p.Name).ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Player>> GetById(int id)
    {
        var player = await _db.Players.FindAsync(id);
        if (player is null)
            return NotFound();

        return player;
    }

    [HttpPost]
    public async Task<ActionResult<Player>> Create(Player player)
    {
        _db.Players.Add(player);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = player.Id }, player);
    }
}
