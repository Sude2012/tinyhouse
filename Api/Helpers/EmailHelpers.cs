using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace Helpers
{
    public static class EmailHelper
    {
        public static async Task SendEmailAsync(string to, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Tiny House", "tiny.house.project.reservation@gmail.com"));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = body };

            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, false);
            await client.AuthenticateAsync("tiny.house.project.reservation@gmail.com", "rpdlmcjefqxplbwm");
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
