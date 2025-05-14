using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using BCrypt.Net;
System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;

var builder = WebApplication.CreateBuilder(args);

// CORS ayarları
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// List<Reservation> DI container'a ekleniyor
builder.Services.AddSingleton<List<Reservation>>(); 

var app = builder.Build();

app.UseCors("AllowAll");

// Rezervasyon GET
app.MapGet("/api/reservations", ([FromServices] List<Reservation> reservations) =>
{
    return Results.Ok(reservations);
});

// Rezervasyon POST
app.MapPost("/api/reservations", (Reservation reservation, [FromServices] List<Reservation> reservations) =>
{
    reservations.Add(reservation);
    return Results.Ok(new { message = "Rezervasyon eklendi!" });
});

// Kayıt (Signup)
app.MapPost("/api/signup", async (User user, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var conn = new SqlConnection(connectionString);
    var query = "INSERT INTO Users (Username, Email, PasswordHash) VALUES (@Username, @Email, @PasswordHash)";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Username", user.Username);
    cmd.Parameters.AddWithValue("@Email", user.Email);

    // Şifre null gelirse boş string kullanılır (null hatası engellenir)
    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash ?? "");
    cmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);

    try
    {
        await conn.OpenAsync();
        await cmd.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Kayıt başarılı!" });
    }
    catch (SqlException ex)
    {
        return Results.BadRequest(new { message = "Kayıt başarısız: " + ex.Message, inner = ex.InnerException?.Message });
    }
});

// Giriş (Login)
app.MapPost("/api/login", async (LoginRequest request, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    using var conn = new SqlConnection(connectionString);
    var query = "SELECT PasswordHash FROM Users WHERE Email = @Email";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Email", request.Email);

    try
    {
        await conn.OpenAsync();
        var result = await cmd.ExecuteScalarAsync();

        if (result != null)
        {
            var storedPasswordHash = result.ToString();
            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.PasswordHash, storedPasswordHash);

            if (isPasswordValid)
            {
                return Results.Ok(new { message = "Giriş başarılı!" });
            }
            else
            {
                return Results.Json(new { message = "Geçersiz e-posta ya da şifre." }, statusCode: 401);
            }
        }
        else
        {
            return Results.Json(new { message = "Kullanıcı bulunamadı." }, statusCode: 404);
        }
    }
    catch (SqlException ex)
    {
        return Results.BadRequest(new { message = "Hata: " + ex.Message, inner = ex.InnerException?.Message });
    }
});

app.Run();

// MODELLER
public class User
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}

public class Reservation
{
    public int Id { get; set; }
    public string GuestName { get; set; }
    public string HouseName { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
}