using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace QualStream
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SyncVideo(string user, double timestamp)
        {
            await Clients.All.SendAsync("ReceiveTimestamp",user , timestamp);
        }

        public async Task PlayVideo(string user)
        {
            await Clients.All.SendAsync("ReceivePlay", user);
        }
        public async Task PauseVideo(string user)
        {
            await Clients.All.SendAsync("ReceivePause", user);
        }
    }
}
