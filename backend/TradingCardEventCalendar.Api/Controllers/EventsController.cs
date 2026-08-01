using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Models;

namespace TradingCardEventCalendar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EventsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Event>>> GetAll(
        [FromQuery] DateTime? start,
        [FromQuery] DateTime? end)
    {
        var query = _db.Events.AsQueryable();

        if (start.HasValue)
            query = query.Where(e => e.StartDatetime >= start.Value);

        if (end.HasValue)
            query = query.Where(e => e.StartDatetime <= end.Value);

        return await query.OrderBy(e => e.StartDatetime).ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Event>> GetById(int id)
    {
        var evt = await _db.Events.FindAsync(id);
        if (evt is null)
            return NotFound();

        return evt;
    }

    [HttpPost]
    public async Task<ActionResult<Event>> Create(Event evt)
    {
        _db.Events.Add(evt);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = evt.Id }, evt);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Event evt)
    {
        if (id != evt.Id)
            return BadRequest();

        var existing = await _db.Events.FindAsync(id);
        if (existing is null)
            return NotFound();

        existing.Name = evt.Name;
        existing.GameType = evt.GameType;
        existing.StartDatetime = evt.StartDatetime;
        existing.PlayerCapacity = evt.PlayerCapacity;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var evt = await _db.Events.FindAsync(id);
        if (evt is null)
            return NotFound();

        _db.Events.Remove(evt);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
