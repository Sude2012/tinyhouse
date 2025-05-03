var builder = WebApplication.CreateBuilder(args);

// CORS'u EKLE
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// diğer servisler...
builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors(); // BURAYI EKLE
app.UseAuthorization();
app.MapControllers();

app.Run();