using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using BCrypt.Net;
using System.Text.Json.Serialization;
using System.Data;
using Helpers;


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

var app = builder.Build();

app.UseCors("AllowAll");
app.UseStaticFiles();

// Signup - Kayıt Olma
app.MapPost("/api/signup", async (User user, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);

    // Varsayılan olarak "Tenant" ver ama geleni kullan!
    string userType = string.IsNullOrEmpty(user.UserType) ? "Tenant" : user.UserType;

    var query = "INSERT INTO Users (Username, Email, PasswordHash, UserType) VALUES (@Username, @Email, @PasswordHash, @UserType)";
    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Username", user.Username);
    cmd.Parameters.AddWithValue("@Email", user.Email);
    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password ?? "");
    cmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
    cmd.Parameters.AddWithValue("@UserType", userType);

    try
    {
        await conn.OpenAsync();
        int rowsAffected = await cmd.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Kayıt başarılı!" });
    }
    catch (SqlException ex)
    {
        return Results.BadRequest(new { message = "Kayıt başarısız: " + ex.Message });
    }
});



// Tüm evleri listeleyen endpoint
app.MapGet("/api/houses/all", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var houseList = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
    SELECT 
        h.Id,
        h.City,
        h.Country,
        h.BedroomCount,
        h.BathroomCount,
        h.PricePerNight,
        h.Description,
        h.ImagePath,
        h.RoomImagePaths,
        h.Capacity,
        dbo.ufnGetHouseAverageRating(h.Id) AS AverageRating
    FROM Houses h";
    ;
    var cmd = new SqlCommand(query, conn);
    var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        houseList.Add(new
        {
            Id = Convert.ToInt32(reader["Id"]),
            City = reader["City"].ToString(),
            Country = reader["Country"].ToString(),
            BedroomCount = reader["BedroomCount"] == DBNull.Value ? 0 : Convert.ToInt32(reader["BedroomCount"]),
            BathroomCount = reader["BathroomCount"] == DBNull.Value ? 0 : Convert.ToInt32(reader["BathroomCount"]),
            PricePerNight = reader["PricePerNight"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["PricePerNight"]),
            Description = reader["Description"].ToString(),
            Capacity = reader["Capacity"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Capacity"]),
            CoverImageUrl = reader["ImagePath"].ToString(),
            InteriorImageUrls = reader["RoomImagePaths"].ToString()
         .Split(',', StringSplitOptions.RemoveEmptyEntries)
         .Select(url => url.Trim())
         .ToList(),
            AverageRating = reader["AverageRating"] == DBNull.Value ? 0 : Convert.ToDouble(reader["AverageRating"])
        });

    }

    return Results.Ok(houseList);
});






app.MapGet("/api/houses/{id:int}", async (int id, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        SELECT
            h.Id,
            h.City,
            h.Country,
            h.BedroomCount,
            h.BathroomCount,
            h.PricePerNight,
            h.Description,
            h.ImagePath,
            h.RoomImagePaths,
            h.Capacity,
            dbo.ufnGetHouseAverageRating(h.Id) AS AverageRating
        FROM Houses h
        WHERE h.Id = @Id";

    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@Id", id);

    var reader = await cmd.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        var house = new
        {
            id = Convert.ToInt32(reader["Id"]),
            city = reader["City"].ToString(),
            country = reader["Country"].ToString(),
            bedroomCount = Convert.ToInt32(reader["BedroomCount"]),
            bathroomCount = Convert.ToInt32(reader["BathroomCount"]),
            pricePerNight = Convert.ToDecimal(reader["PricePerNight"]),
            description = reader["Description"].ToString(),
            capacity = reader["Capacity"] is DBNull ? 1 : Convert.ToInt32(reader["Capacity"]),
            coverImageUrl = reader["ImagePath"].ToString(),
            interiorImageUrls = reader["RoomImagePaths"] is DBNull || string.IsNullOrWhiteSpace(reader["RoomImagePaths"]?.ToString())
        ? new List<string>()
        : reader["RoomImagePaths"].ToString().Split(',', StringSplitOptions.RemoveEmptyEntries).Select(url => url.Trim()).ToList(),
            averageRating = reader.IsDBNull(reader.GetOrdinal("AverageRating"))
        ? 0
        : Convert.ToDouble(reader["AverageRating"])
        };

        return Results.Ok(house);
    }
    else
    {
        return Results.NotFound(new { message = "Ev bulunamadı." });
    }
});

// Evleri ID'ye göre silme
app.MapDelete("/api/houses/{id:int}", async (int id, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("DELETE FROM Houses WHERE Id = @Id", conn);
    cmd.Parameters.AddWithValue("@Id", id);

    int affected = await cmd.ExecuteNonQueryAsync();
    return affected == 0 
        ? Results.NotFound(new { message = "Ev bulunamadı." }) 
        : Results.Ok(new { message = "Ev başarıyla silindi." });
});

// Ev güncelleme (PUT)
app.MapPut("/api/houses/{id:int}", async (HttpRequest request, int id, IConfiguration configuration) =>
{
    var form = await request.ReadFormAsync();

    string? city = form["City"];
    string? country = form["Country"];
    string? description = form["Description"];
    int? bedroomCount = int.Parse(form["BedroomCount"]);
    int? bathroomCount = int.Parse(form["BathroomCount"]);
    decimal? price = decimal.Parse(form["PricePerNight"]);
    decimal? rating = decimal.Parse(form["Rating"]);

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        UPDATE Houses SET
            City = @City, Country = @Country, BedroomCount = @BedroomCount,
            BathroomCount = @BathroomCount, PricePerNight = @PricePerNight,
            Rating = @Rating, Description = @Description
        WHERE Id = @Id";

    var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@City", city);
    cmd.Parameters.AddWithValue("@Country", country);
    cmd.Parameters.AddWithValue("@BedroomCount", bedroomCount);
    cmd.Parameters.AddWithValue("@BathroomCount", bathroomCount);
    cmd.Parameters.AddWithValue("@PricePerNight", price);
    cmd.Parameters.AddWithValue("@Rating", rating);
    cmd.Parameters.AddWithValue("@Description", description);
    cmd.Parameters.AddWithValue("@Id", id);

    int affected = await cmd.ExecuteNonQueryAsync();
    return affected == 0 
        ? Results.NotFound(new { message = "Ev bulunamadı." }) 
        : Results.Ok(new { message = "Ev başarıyla güncellendi." });
});

// --------- GÜNCELLENEN KISIM -----------
app.MapGet("/api/houses", async (HttpRequest request, IConfiguration configuration) =>
{
    var email = request.Query["email"].ToString();

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var houseList = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    string query;
    SqlCommand cmd;

    if (!string.IsNullOrWhiteSpace(email))
    {
        // Sadece o kullanıcıya ait evleri getir
        var userCmd = new SqlCommand("SELECT Id FROM Users WHERE Email = @Email", conn);
        userCmd.Parameters.AddWithValue("@Email", email);
        var userIdObj = await userCmd.ExecuteScalarAsync();

        if (userIdObj == null)
            return Results.Ok(new List<object>());

        int userId = Convert.ToInt32(userIdObj);

        query = "SELECT * FROM Houses WHERE OwnerId = @OwnerId";
        cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@OwnerId", userId);
    }
    else
    {
        // Tüm evleri getir
        query = "SELECT * FROM Houses";
        cmd = new SqlCommand(query, conn);
    }

    var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        houseList.Add(new
        {
            id = Convert.ToInt32(reader["Id"]),
            city = reader["City"].ToString(),
            country = reader["Country"].ToString(),
            bedroomCount = Convert.ToInt32(reader["BedroomCount"]),
            bathroomCount = Convert.ToInt32(reader["BathroomCount"]),
            pricePerNight = Convert.ToDecimal(reader["PricePerNight"]),
            rating = Convert.ToDecimal(reader["Rating"]),
            description = reader["Description"].ToString(),
            coverImageUrl = reader["ImagePath"].ToString(),
            capacity = Convert.ToInt32(reader["Capacity"]),
            interiorImageUrls = reader["RoomImagePaths"].ToString()
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(url => url.Trim())
                .ToList()
        });
    }

    return Results.Ok(houseList);
});
// --------- GÜNCELLENEN KISIM -----------

// Ev Ekleme
app.MapPost("/api/houses", async (HttpRequest request, IConfiguration configuration) =>
{
    var form = await request.ReadFormAsync();

    string city = form["City"];
    string country = form["Country"];
    string description = form["Description"];
    string ownerEmail = form["OwnerEmail"];
    if (string.IsNullOrWhiteSpace(ownerEmail))
        return Results.BadRequest(new { message = "Ev sahibi email gereklidir." });

    if (!int.TryParse(form["BedroomCount"], out int bedroomCount) ||
        !int.TryParse(form["BathroomCount"], out int bathroomCount) ||
        !decimal.TryParse(form["PricePerNight"], out decimal price) ||
        !decimal.TryParse(form["Rating"], out decimal rating))
    {
        return Results.BadRequest(new { message = "Sayısal değerlerde geçersiz giriş." });
    }

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    int ownerId;

    using (var conn = new SqlConnection(connectionString))
    {
        await conn.OpenAsync();
        var cmd = new SqlCommand("SELECT Id FROM Users WHERE Email = @Email", conn);
        cmd.Parameters.AddWithValue("@Email", ownerEmail);

        var result = await cmd.ExecuteScalarAsync();
        if (result == null)
            return Results.BadRequest(new { message = "Kullanıcı bulunamadı." });

        ownerId = Convert.ToInt32(result);
    }

    var coverImage = form.Files["CoverImage"];
    var roomImages = form.Files.Where(f => f.Name == "InteriorImages").ToList();

    if (coverImage == null || coverImage.Length == 0)
        return Results.BadRequest(new { message = "Kapak görseli gereklidir." });

    if (roomImages.Count != 5)
        return Results.BadRequest(new { message = "5 adet iç görsel yükleyin." });
    if (!int.TryParse(form["Capacity"], out int capacity))
    {
        return Results.BadRequest(new { message = "Kapasite geçersiz." });
    }

    var wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
    var imagesPath = Path.Combine(wwwRootPath, "images");
    Directory.CreateDirectory(imagesPath);

    var coverFileName = Guid.NewGuid() + Path.GetExtension(coverImage.FileName);
    var coverFilePath = Path.Combine(imagesPath, coverFileName);
    await using (var stream = new FileStream(coverFilePath, FileMode.Create))
    {
        await coverImage.CopyToAsync(stream);
    }
    var coverImageUrl = $"/images/{coverFileName}";

    List<string> interiorImageUrls = new();
    foreach (var img in roomImages)
    {
        var fileName = Guid.NewGuid() + Path.GetExtension(img.FileName);
        var filePath = Path.Combine(imagesPath, fileName);
        await using var stream = new FileStream(filePath, FileMode.Create);
        await img.CopyToAsync(stream);
        interiorImageUrls.Add($"/images/{fileName}");
    }

    int newHouseId;
    using (var conn = new SqlConnection(connectionString))
    {
        await conn.OpenAsync();

        var query = @"
            INSERT INTO Houses
    (City, Country, BedroomCount, BathroomCount, PricePerNight, Rating, Description, ImagePath, RoomImagePaths, OwnerId, Capacity)
    VALUES
    (@City, @Country, @BedroomCount, @BathroomCount, @PricePerNight, @Rating, @Description, @ImagePath, @RoomImagePaths, @OwnerId, @Capacity);
    SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@City", city);
        cmd.Parameters.AddWithValue("@Country", country);
        cmd.Parameters.AddWithValue("@BedroomCount", bedroomCount);
        cmd.Parameters.AddWithValue("@BathroomCount", bathroomCount);
        cmd.Parameters.AddWithValue("@PricePerNight", price);
        cmd.Parameters.AddWithValue("@Rating", rating);
        cmd.Parameters.AddWithValue("@Description", description ?? "");
        cmd.Parameters.AddWithValue("@ImagePath", coverImageUrl);
        cmd.Parameters.AddWithValue("@RoomImagePaths", string.Join(",", interiorImageUrls));
        cmd.Parameters.AddWithValue("@OwnerId", ownerId);
        cmd.Parameters.AddWithValue("@Capacity", capacity);

        var idResult = await cmd.ExecuteScalarAsync();
        if (idResult == null)
            return Results.BadRequest(new { message = "Ev eklendi ama ID alınamadı." });

        newHouseId = Convert.ToInt32(idResult);
    }

    return Results.Ok(new
    {
        message = "Ev başarıyla eklendi.",
        house = new
        {
            Id = newHouseId,
            City = city,
            Country = country,
            BedroomCount = bedroomCount,
            BathroomCount = bathroomCount,
            PricePerNight = price,
            Rating = rating,
            Capacity = capacity,
            Description = description,
            CoverImageUrl = coverImageUrl,
            InteriorImageUrls = interiorImageUrls
        }
    });
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
                return Results.Ok(new { success = true, message = "Giriş başarılı!" });
            }
            else
            {
                return Results.Json(new { success = false, message = "Geçersiz e-posta ya da şifre." }, statusCode: 401);
            }
        }
        else
        {
            return Results.Json(new { success = false, message = "Kullanıcı bulunamadı." }, statusCode: 404);
        }
    }
    catch (SqlException ex)
    {
        return Results.Json(new { success = false, message = "Hata: " + ex.Message }, statusCode: 500);
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, message = "Beklenmeyen hata: " + ex.Message }, statusCode: 500);
    }
});
// rezervasyonlarım sayfası için
app.MapGet("/api/reservations/by-user", async (HttpRequest request, IConfiguration configuration) =>
{
    var email = request.Query["email"].ToString();
    if (string.IsNullOrWhiteSpace(email))
        return Results.BadRequest("Email gereklidir.");

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var result = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    // House tablosu ile join yaparak konum gösteriyoruz
    var query = @"
        SELECT r.Id, r.HouseId, r.StartDate, r.EndDate, r.TotalPrice, 
               (h.City + ', ' + h.Country) AS HouseLocation
        FROM Reservations r
        INNER JOIN Houses h ON r.HouseId = h.Id
        WHERE r.UserEmail = @UserEmail
        ORDER BY r.StartDate DESC";

    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@UserEmail", email);

    using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            id = reader.GetInt32(0),
            houseId = reader.GetInt32(1),
            startDate = reader.GetDateTime(2),
            endDate = reader.GetDateTime(3),
            totalPrice = reader.GetDecimal(4),
            houseLocation = reader.IsDBNull(5) ? null : reader.GetString(5)
        });
    }

    return Results.Ok(result);
});






//rezervasyon iptali
app.MapDelete("/api/reservations/{id:int}", async (int id, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    // Önce rezervasyonun bilgilerini çekiyoruz
    string userEmail = null;
    DateTime? startDate = null, endDate = null;
    decimal? totalPrice = null;
    int? houseId = null;

    var selectCmd = new SqlCommand("SELECT UserEmail, StartDate, EndDate, TotalPrice, HouseId FROM Reservations WHERE Id = @Id", conn);
    selectCmd.Parameters.AddWithValue("@Id", id);

    using (var reader = await selectCmd.ExecuteReaderAsync())
    {
        if (await reader.ReadAsync())
        {
            userEmail = reader["UserEmail"]?.ToString();
            startDate = reader["StartDate"] as DateTime?;
            endDate = reader["EndDate"] as DateTime?;
            totalPrice = reader["TotalPrice"] as decimal?;
            houseId = reader["HouseId"] as int?;
        }
    }

    // Önce rezervasyon var mı bak, yoksa NotFound döndür
    if (string.IsNullOrWhiteSpace(userEmail))
        return Results.NotFound(new { message = "Rezervasyon bulunamadı." });

    // Silme işlemi
    var deleteCmd = new SqlCommand("DELETE FROM Reservations WHERE Id = @Id", conn);
    deleteCmd.Parameters.AddWithValue("@Id", id);
    var rows = await deleteCmd.ExecuteNonQueryAsync();

    if (rows > 0)
    {
        // E-posta gönder
        try
        {
            string subject = "Tiny House Rezervasyon İptali";
            string body = $@"
                <h2>Rezervasyonunuz İptal Edildi</h2>
                <p>
                
                  Giriş Tarihi: <b>{startDate:dd.MM.yyyy}</b><br/>
                  Çıkış Tarihi: <b>{endDate:dd.MM.yyyy}</b><br/>
                  Toplam Tutar: <b>{totalPrice} ₺</b>
                </p>
                <p>Herhangi bir sorunuz olursa bize ulaşabilirsiniz.<br/>Tiny House Ekibi</p>
            ";

            await EmailHelper.SendEmailAsync(userEmail, subject, body);
        }
        catch (Exception ex)
        {
            // Opsiyonel: Hata loglama
            Console.WriteLine($"E-posta gönderilemedi: {ex.Message}");
        }

        return Results.Ok(new { message = "Rezervasyon silindi ve e-posta bildirimi gönderildi." });
    }
    else
    {
        return Results.NotFound(new { message = "Rezervasyon bulunamadı." });
    }
});


//rezervasyon yapma
app.MapPost("/api/reservations", async (ReservationRequest request, IConfiguration configuration) =>
{
    if (request.HouseId == null || request.StartDate == null || request.EndDate == null || request.TotalPrice == null || string.IsNullOrWhiteSpace(request.UserEmail))
    {
        return Results.BadRequest(new { message = "Eksik rezervasyon bilgisi." });
    }

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        INSERT INTO Reservations (HouseId, UserEmail, StartDate, EndDate, TotalPrice)
        VALUES (@HouseId, @UserEmail, @StartDate, @EndDate, @TotalPrice)";

    using var cmd = new SqlCommand(query, conn);
    cmd.Parameters.AddWithValue("@HouseId", request.HouseId);
    cmd.Parameters.AddWithValue("@UserEmail", request.UserEmail);
    cmd.Parameters.AddWithValue("@StartDate", request.StartDate);
    cmd.Parameters.AddWithValue("@EndDate", request.EndDate);
    cmd.Parameters.AddWithValue("@TotalPrice", request.TotalPrice);

    var rows = await cmd.ExecuteNonQueryAsync();

   
    // Rezervasyon başarılıysa mail gönder
    if (rows > 0)
    {
        try
        {
            string subject = "Tiny House Rezervasyon Onayı";
            string body = $@"
            <h2>Rezervasyonunuz Onaylandı!</h2>
            <p>
              Giriş Tarihi: <b>{Convert.ToDateTime(request.StartDate):dd.MM.yyyy}</b><br/>
              Çıkış Tarihi: <b>{Convert.ToDateTime(request.EndDate):dd.MM.yyyy}</b><br/>
              Toplam Tutar: <b>{request.TotalPrice} ₺</b>
            </p>
            <p>İyi tatiller dileriz!<br/>Tiny House Ekibi</p>
        ";

            await EmailHelper.SendEmailAsync(request.UserEmail, subject, body);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"E-posta gönderilemedi: {ex.Message}");
        }

        return Results.Ok(new { message = "Rezervasyon başarıyla kaydedildi. Onay e-postası gönderildi." });
    }
    else
    {
        return Results.BadRequest(new { message = "Rezervasyon kaydedilemedi." });
    }

});


// Admin tüm evleri kullanıcı adıyla getir
app.MapGet("/api/admin/houses", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        SELECT h.Id, h.City, h.Country, h.BedroomCount, h.BathroomCount, h.PricePerNight,
               u.Username AS OwnerName
        FROM Houses h
        JOIN Users u ON h.OwnerId = u.Id";

    using var cmd = new SqlCommand(query, conn);
    using var reader = await cmd.ExecuteReaderAsync();

    var houses = new List<object>();
    while (await reader.ReadAsync())
    {
        houses.Add(new
        {
            id = reader.GetInt32(0),
            city = reader.GetString(1),
            country = reader.GetString(2),
            bedroomCount = reader.GetInt32(3),
            bathroomCount = reader.GetInt32(4),
            price = reader.GetDecimal(5),
            ownerName = reader.GetString(6)
        });
    }

    return Results.Json(houses);
});

// Admin - ilan silme
app.MapDelete("/api/admin/houses/{id:int}", async (int id, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("DELETE FROM Houses WHERE Id = @Id", conn);
    cmd.Parameters.AddWithValue("@Id", id);

    int affected = await cmd.ExecuteNonQueryAsync();
    return affected > 0
        ? Results.Ok(new { message = "Ev silindi." })
        : Results.NotFound(new { message = "Ev bulunamadı." });
});

app.MapGet("/api/admin/payments", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        SELECT TOP 20
            r.TotalPrice,
            r.UserEmail,
            r.StartDate,
            r.EndDate,
            (h.City + ', ' + h.Country) AS HouseLocation
        FROM Reservations r
        INNER JOIN Houses h ON r.HouseId = h.Id
        ORDER BY r.Id DESC";

    using var cmd = new SqlCommand(query, conn);
    using var reader = await cmd.ExecuteReaderAsync();

    var result = new List<object>();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            amount = reader.GetDecimal(0),
            email = reader.GetString(1),
            startDate = reader.GetDateTime(2),
            endDate = reader.GetDateTime(3),
            location = reader.IsDBNull(4) ? null : reader.GetString(4)
        });
    }

    return Results.Ok(result);
});



app.MapGet("/api/admin/reservations", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var query = @"
        SELECT r.UserEmail, r.StartDate, r.EndDate, r.TotalPrice,
               (h.City + ', ' + h.Country) AS HouseLocation
        FROM Reservations r
        INNER JOIN Houses h ON r.HouseId = h.Id
        ORDER BY r.StartDate DESC";

    using var cmd = new SqlCommand(query, conn);
    using var reader = await cmd.ExecuteReaderAsync();

    var result = new List<object>();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            email = reader.GetString(0),
            startDate = reader.GetDateTime(1),
            endDate = reader.GetDateTime(2),
            totalPrice = reader.GetDecimal(3),
            houseLocation = reader.IsDBNull(4) ? null : reader.GetString(4)
        });
    }

    return Results.Ok(result);
});


app.MapGet("/api/admin/users", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var users = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("SELECT Username, Email FROM Users", conn);
    using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        var username = reader.IsDBNull(0) ? "" : reader.GetString(0);
        var email = reader.IsDBNull(1) ? "" : reader.GetString(1);

        users.Add(new { username, email });
    }

    return Results.Json(users); // BURASI!
});



app.MapGet("/api/admin/dashboard", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    int userCount = 0, reservationCount = 0, listingCount = 0;
    decimal totalPayment = 0;
    var chartData = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand(@"
        SELECT COUNT(*) FROM Users;
        SELECT COUNT(*) FROM Reservations;
        SELECT COUNT(*) FROM Houses;
        SELECT ISNULL(SUM(TotalPrice), 0) FROM Reservations;
    ", conn);

    using var reader = await cmd.ExecuteReaderAsync();

    if (await reader.ReadAsync()) userCount = reader.GetInt32(0);
    await reader.NextResultAsync();
    if (await reader.ReadAsync()) reservationCount = reader.GetInt32(0);
    await reader.NextResultAsync();
    if (await reader.ReadAsync()) listingCount = reader.GetInt32(0);
    await reader.NextResultAsync();
    if (await reader.ReadAsync()) totalPayment = reader.GetDecimal(0);
    await reader.CloseAsync();

    for (int i = 1; i <= 5; i++)
    {
        chartData.Add(new { name = new DateTime(2025, i, 1).ToString("MMM"), reservations = new Random().Next(10, 50) });
    }

    var stats = new[]
    {
        new { name = "Users", count = userCount },
        new { name = "Reservations", count = reservationCount },
        new { name = "Payments", count = (int)totalPayment },
        new { name = "Listings", count = listingCount }
    };

    return Results.Json(new { stats, chartData });
});


//yorumları listeleme
app.MapGet("/api/reviews/by-house", async (HttpRequest request, IConfiguration configuration) =>
{
    var houseIdStr = request.Query["id"].ToString();
    if (!int.TryParse(houseIdStr, out int houseId))
        return Results.BadRequest(new { message = "Geçersiz id" });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var result = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand(@"
        SELECT Id, UserEmail, Comment, Rating, CreatedAt
        FROM Reviews WHERE HouseId = @HouseId
        ORDER BY CreatedAt DESC", conn);
    cmd.Parameters.AddWithValue("@HouseId", houseId);

    using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            id = reader.GetInt32(0),
            userEmail = reader.GetString(1),
            comment = reader.GetString(2),
            rating = reader.GetInt32(3),
            createdAt = reader.GetDateTime(4)
        });
    }

    return Results.Ok(result);
});
app.MapPost("/api/reviews", async (ReviewRequest review, IConfiguration configuration) =>
{
    if (review == null || string.IsNullOrWhiteSpace(review.UserEmail) || string.IsNullOrWhiteSpace(review.Comment))
        return Results.BadRequest(new { message = "Eksik bilgi." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand(@"
        INSERT INTO Reviews (HouseId, UserEmail, Comment, Rating, CreatedAt)
        VALUES (@HouseId, @UserEmail, @Comment, @Rating, GETDATE())", conn);

    cmd.Parameters.AddWithValue("@HouseId", review.HouseId);
    cmd.Parameters.AddWithValue("@UserEmail", review.UserEmail);
    cmd.Parameters.AddWithValue("@Comment", review.Comment);
    cmd.Parameters.AddWithValue("@Rating", review.Rating);

    var affected = await cmd.ExecuteNonQueryAsync();

    // ------ BURADA DEVAM ------

    // Ev sahibinin e-posta adresini bul
    string ownerEmail = null;
    var getOwnerCmd = new SqlCommand(@"
        SELECT u.Email
        FROM Houses h
        INNER JOIN Users u ON h.OwnerId = u.Id
        WHERE h.Id = @HouseId", conn);
    getOwnerCmd.Parameters.AddWithValue("@HouseId", review.HouseId);

    var result = await getOwnerCmd.ExecuteScalarAsync();
    if (result != null)
        ownerEmail = result.ToString();

    // Eğer ev sahibi bulunduysa e-posta gönder
    if (!string.IsNullOrWhiteSpace(ownerEmail))
    {
        string subject = "Tiny House - Yeni Yorum Bildirimi";
        string body = $@"
            <h2>Ev ilanınıza yeni bir yorum geldi!</h2>
            <p>
                <b>{review.UserEmail}</b> kullanıcısı, ilanınıza {review.Rating} puan vererek şu yorumu yazdı:
            </p>
            <blockquote>{review.Comment}</blockquote>
            <p>Görmek için hemen sisteme giriş yapın.</p>";

        // Mail gönderme fonksiyonunu kullan
        await EmailHelper.SendEmailAsync(ownerEmail, subject, body);
    }

    return affected > 0 ? Results.Ok(new { message = "Yorum başarıyla eklendi." }) : Results.BadRequest(new { message = "Yorum eklenemedi." });
});




//yorum silme
app.MapDelete("/api/reviews/{id:int}", async (int id, IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("DELETE FROM Reviews WHERE Id = @Id", conn);
    cmd.Parameters.AddWithValue("@Id", id);

    var rows = await cmd.ExecuteNonQueryAsync();
    return rows > 0 ? Results.Ok(new { message = "Yorum silindi." }) : Results.NotFound(new { message = "Yorum bulunamadı." });
});





app.MapGet("/api/reviews/by-user", async (HttpRequest request, IConfiguration configuration) =>
{
    var email = request.Query["email"].ToString();
    if (string.IsNullOrWhiteSpace(email))
        return Results.BadRequest(new { message = "Email gereklidir." });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var result = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    // Evin bilgisini almak için JOIN ekliyoruz
    var cmd = new SqlCommand(@"
        SELECT r.Id, r.HouseId, r.Comment, r.Rating, r.CreatedAt, (h.City + ', ' + h.Country) AS HouseLocation
        FROM Reviews r
        INNER JOIN Houses h ON r.HouseId = h.Id
        WHERE r.UserEmail = @UserEmail
        ORDER BY r.CreatedAt DESC", conn);

    cmd.Parameters.AddWithValue("@UserEmail", email);

    using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            id = reader.GetInt32(0),
            houseId = reader.GetInt32(1),
            comment = reader.GetString(2),
            rating = reader.GetInt32(3),
            createdAt = reader.GetDateTime(4),
            houseLocation = reader.IsDBNull(5) ? null : reader.GetString(5)
        });
    }

    return Results.Ok(result);
});



//popüler evler
app.MapGet("/api/houses/popular", async (IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var popularHouses = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand("sp_GetPopularHouses", conn);
    cmd.CommandType = System.Data.CommandType.StoredProcedure;

    using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        popularHouses.Add(new
        {
            Id = Convert.ToInt32(reader["Id"]),
            City = reader["City"].ToString(),
            Country = reader["Country"].ToString(),
            BedroomCount = reader["BedroomCount"] == DBNull.Value ? 0 : Convert.ToInt32(reader["BedroomCount"]),
            BathroomCount = reader["BathroomCount"] == DBNull.Value ? 0 : Convert.ToInt32(reader["BathroomCount"]),
            PricePerNight = reader["PricePerNight"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["PricePerNight"]),
            Description = reader["Description"].ToString(),
            Capacity = reader["Capacity"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Capacity"]),
            CoverImageUrl = reader["ImagePath"].ToString(),
            InteriorImageUrls = reader["RoomImagePaths"].ToString()
         .Split(',', StringSplitOptions.RemoveEmptyEntries)
         .Select(url => url.Trim())
         .ToList(),
            AverageRating = reader["AverageRating"] == DBNull.Value ? 0 : Convert.ToDouble(reader["AverageRating"])
        });
    }
    return Results.Ok(popularHouses);
});



// rezervasyon tarihlerinin çakışmaması için

app.MapGet("/api/reservations/by-house", async (HttpRequest request, IConfiguration configuration) =>
{
    var houseIdStr = request.Query["id"].ToString();
    if (!int.TryParse(houseIdStr, out int houseId))
        return Results.BadRequest(new { message = "Geçersiz id" });

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var result = new List<object>();

    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var cmd = new SqlCommand(@"
        SELECT StartDate, EndDate
        FROM Reservations
        WHERE HouseId = @HouseId", conn);
    cmd.Parameters.AddWithValue("@HouseId", houseId);

    using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        result.Add(new
        {
            start = reader.GetDateTime(0),
            end = reader.GetDateTime(1)
        });
    }
    return Results.Ok(result);
});







// Filtreli evleri dönen endpoint
app.MapGet("/api/houses/filter", async (HttpRequest request, IConfiguration config) =>
{
    var city = request.Query["city"].ToString();
    var capacityStr = request.Query["capacity"].ToString();
    var startDateStr = request.Query["startDate"].ToString();
    var endDateStr = request.Query["endDate"].ToString();

    int? capacity = null;
    if (int.TryParse(capacityStr, out var parsedCap)) capacity = parsedCap;

    DateTime? startDate = null;
    if (DateTime.TryParse(startDateStr, out var parsedStart)) startDate = parsedStart;

    DateTime? endDate = null;
    if (DateTime.TryParse(endDateStr, out var parsedEnd)) endDate = parsedEnd;

    var houses = new List<object>();

    var connectionString = config.GetConnectionString("DefaultConnection");
    using (var conn = new SqlConnection(connectionString))
    using (var cmd = new SqlCommand("FilterHouses", conn))
    {
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@City", string.IsNullOrEmpty(city) ? (object)DBNull.Value : city);
        cmd.Parameters.AddWithValue("@Capacity", capacity ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@StartDate", startDate ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@EndDate", endDate ?? (object)DBNull.Value);

        await conn.OpenAsync();
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                houses.Add(new
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    City = reader["City"].ToString(),
                    Country = reader["Country"].ToString(),
                    BedroomCount = Convert.ToInt32(reader["BedroomCount"]),
                    BathroomCount = Convert.ToInt32(reader["BathroomCount"]),
                    PricePerNight = Convert.ToDecimal(reader["PricePerNight"]),
                    Description = reader["Description"].ToString(),
                    Capacity = Convert.ToInt32(reader["Capacity"]),
                    CoverImageUrl = reader["ImagePath"].ToString(),
                    InteriorImageUrls = reader["RoomImagePaths"].ToString()
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(url => url.Trim())
                        .ToList(),
                    AverageRating = reader.IsDBNull(10) ? 0 : Convert.ToDouble(reader["AverageRating"])
                });
            }
        }
    }

    return Results.Ok(houses);
});







app.Run();

// MODELLER
public class User
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; } // Ham şifre
    public string? UserType { get; set; }
}

public class ReservationRequest
{
    
    public int? HouseId { get; set; }
    public string? UserEmail { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? TotalPrice { get; set; }
}
public class LoginRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; } // Ham şifre
}
public class House
{
    public string City { get; set; }
    public string Country { get; set; }
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal Rating { get; set; }
    public decimal AverageRating { get; set; }
   

    public string Description { get; set; }
    public int Capacity { get; set; }
    public string CoverImageUrl { get; set; } // Kapak fotoğraf yolu
    public List<string> InteriorImageUrls { get; set; }
}


public class ReviewRequest
{
    public int HouseId { get; set; }
    public string UserEmail { get; set; }
    public string Comment { get; set; }
    public int Rating { get; set; }
}
public class HouseFormModel
{
    public string City { get; set; }
    public string Country { get; set; }
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public decimal PricePerNight { get; set; }
    public decimal Rating { get; set; }
    public decimal? AverageRating { get; set; }
    public string Description { get; set; }
    public int Capacity { get; set; }
    public IFormFile Image { get; set; }
    public List<IFormFile> RoomImages { get; set; }
}
