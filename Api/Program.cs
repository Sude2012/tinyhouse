var builder = WebApplication.CreateBuilder(args);

// CORS ayarını ekliyoruz
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:3001")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Controller desteğini aktif et
builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowFrontend");

// Routing için gerekli middleware
app.MapControllers();

app.Run();
