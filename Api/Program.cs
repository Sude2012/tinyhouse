var builder = WebApplication.CreateBuilder(args);

// CORS (Frontend'in erişebilmesi için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Dummy veriler
var reservations = new List<object>
{
    new {
        Id = 1,
        GuestName = "Sude",
        HouseName = "Tiny Paradise",
        CheckInDate = "2025-06-01",
        CheckOutDate = "2025-06-05"
    },
    new {
        Id = 2,
        GuestName = "Burak",
        HouseName = "Cozy Cabin",
        CheckInDate = "2025-06-10",
        CheckOutDate = "2025-06-15"
    }
};

var app = builder.Build();

app.UseCors("AllowAll");

// Endpoint: GET /api/reservations
app.MapGet("/api/reservations", () =>
{
    return Results.Ok(reservations);
});

app.Run();