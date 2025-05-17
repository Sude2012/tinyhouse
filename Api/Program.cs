using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// CORS ayarları
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend adresin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

// Signup - Kayıt Olma
app.MapPost("/api/signup", async (User user, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine("Bağlantı: " + connectionString);
    Console.WriteLine($"Kullanıcı adı: {user.Username}, Email: {user.Email}");

    using var conn = new SqlConnection(connectionString);
    var query = "INSERT INTO Users (Username, Email, PasswordHash) VALUES (@Username, @Email, @PasswordHash)";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Username", user.Username);
    cmd.Parameters.AddWithValue("@Email", user.Email);

    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password ?? "");
    cmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);

    try
    {
        await conn.OpenAsync();
        int rowsAffected = await cmd.ExecuteNonQueryAsync();
        Console.WriteLine("Eklenen satır sayısı: " + rowsAffected);

        return Results.Ok(new { message = "Kayıt başarılı!" });
    }
    catch (SqlException ex)
    {
        Console.WriteLine("HATA: " + ex.Message);
        return Results.BadRequest(new { message = "Kayıt başarısız: " + ex.Message });
    }
});

// Login - Giriş Yapma
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
            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, storedPasswordHash);

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
        return Results.BadRequest(new { message = "Hata: " + ex.Message });
    }
});

app.Run();

// MODELLER
public class User
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; } // Ham şifre
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; } // Ham şifre
}