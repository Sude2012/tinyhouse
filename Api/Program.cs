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
app.UseStaticFiles();

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


// Ev Ekleme
app.MapPost("/api/houses", async (HttpRequest request, IConfiguration configuration) =>
{
    var form = await request.ReadFormAsync();

  var city = form["City"].ToString();
var country = form["Country"].ToString();
var bedroomCount = int.Parse(form["BedroomCount"].ToString());
var bathroomCount = int.Parse(form["BathroomCount"].ToString());
var price = decimal.Parse(form["PricePerNight"].ToString());
var rating = decimal.Parse(form["Rating"].ToString());
    var image = form.Files["Image"];

    if (image == null || image.Length == 0)
        return Results.BadRequest(new { message = "Görsel dosyası gereklidir." });

    // wwwroot/images klasörüne kaydet
    var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
    Directory.CreateDirectory(imagesPath); // yoksa oluştur

    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
    var filePath = Path.Combine(imagesPath, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await image.CopyToAsync(stream);
    }

    var imagePath = $"/images/{fileName}";

    // Veritabanına ekle
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    var query = @"INSERT INTO Houses (City, Country, BedroomCount, BathroomCount, PricePerNight, Rating, ImagePath) 
                  VALUES (@City, @Country, @BedroomCount, @BathroomCount, @PricePerNight, @Rating, @ImagePath)";
    var cmd = new SqlCommand(query, conn);
   cmd.Parameters.AddWithValue("@City", city);
cmd.Parameters.AddWithValue("@Country", country);
cmd.Parameters.AddWithValue("@BedroomCount", bedroomCount);
cmd.Parameters.AddWithValue("@BathroomCount", bathroomCount);
cmd.Parameters.AddWithValue("@PricePerNight", price);
cmd.Parameters.AddWithValue("@Rating", rating);
    cmd.Parameters.AddWithValue("@ImagePath", imagePath);

    try
    {
        await conn.OpenAsync();
        await cmd.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Ev başarıyla eklendi." });
    }
    catch (SqlException ex)
    {
        return Results.BadRequest(new { message = "Veritabanı hatası: " + ex.Message });
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

public class House
{
    public string City { get; set; }
    public string Country { get; set; }
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal Rating { get; set; }
    public IFormFile Image { get; set; } // Görsel dosyası
}


