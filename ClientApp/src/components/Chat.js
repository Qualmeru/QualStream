import React, { Component } from 'react';
import * as signalR from "@microsoft/signalr";
import YouTube from 'react-youtube';

const opts = {
    height: '400',
    width: '700',
    playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        start: 0,
        end: 0
    }
  };
export class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nick: '',
            message: '',
            messages: [],
            hubConnection: null,
            currentvideotime: 0,
        };
    }
    componentDidMount = () => {
        const nick = window.prompt('Your name:', 'John');
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub")
            .build();
        this.setState({ hubConnection, nick }, () => {
            this.state.hubConnection
              .start()
              .then(() => console.log('Connection started!'))
              .catch(err => console.log('Error while establishing connection :('));
              this.state.hubConnection.on("ReceiveMessage", (nick, message) => {
                const text = `${nick}: ${message}`;
                const messages = this.state.messages.concat([text]);
                this.setState({ messages });
                const chatContainer = document.querySelector(".ChatContainer");
                chatContainer.scrollTop = chatContainer.scrollHeight;
               });
               this.state.hubConnection.on("ReceiveTimestamp", (nick, timestap) => { 
                if(this.state.nick !== nick) {
                 if(this.state.currentvideotime  <  timestap -6 || this.state.currentvideotime  >  timestap +20) {
                    //  console.log(timestap, this.state.currentvideotime);
                    this.state.player.seekTo(timestap, true);
                 }
                }
               });
               this.state.hubConnection.on("ReceivePlay", (nick) => {
                if(this.state.nick !== nick) {
                    this.state.player.playVideo();
                }
               });
               this.state.hubConnection.on("ReceivePause", (nick) => {
                if(this.state.nick !== nick) {
                    this.state.player.pauseVideo();
                }
               });
          });
          
    
    }
    sendMessage = (e) => {
        if(!this.state.nick)
        {
            const nick = window.prompt('Your name:', 'John');
            this.setState({  nick });
        }
        this.state.hubConnection
        .invoke('SendMessage', this.state.nick, this.state.message)
        .catch(err => console.error(err));

        this.setState({message: ''});
 
    }
    inputChanged = (e) => {
        this.setState({ message: e.target.value });
    }
    onKeyPressed = (e) => {
        if (e.which === 13 || e.keyCode === 13) {
            this.sendMessage(e);
        }
    }
    onReady = (e) => {
        // access to player in all event handlers via event.target
        this.setState({ player: e.target });
       e.target.playVideo();
        setInterval(() => {
            this.updateytplayerInfo(e);
        }, 500);
    }
    updateytplayerInfo = (e) => {
        var currentvideotime = e.target.getCurrentTime();
        
        if (currentvideotime !== this.state.currentvideotime) {
            this.setState({ currentvideotime });
             this.syncVideo(e, currentvideotime);
        }
    }
    syncVideo = (e, timestap) => {

        this.state.hubConnection
        .invoke('SyncVideo', this.state.nick, timestap)
        .catch(err => console.error(err));
    }
    onStateChange = (e) => {
       
    }
    onPlay = (e) => {
        this.state.hubConnection
        .invoke('PlayVideo', this.state.nick)
        .catch(err => console.error(err));
    }
    onPause = (e) => {
        this.state.hubConnection
        .invoke('PauseVideo', this.state.nick)
        .catch(err => console.error(err));
    }
    render() {

        return (
            <div className="videoChatContainer">

                <YouTube className="youtubeplayer" id="youtube" videoId="2g811Eo7K8U"
                    opts={opts}
                    onReady={this.onReady}
                    onPlay={this.onPlay}
                    onPause={this.onPause}
                    onStateChange={this.onStateChange}
                    />
                <div className="chatContainer" >
                <div className="ChatTextArea">
                {this.state.messages.map((message, index) => (
                  <span style={{display: 'block'}} key={index}> {message} </span>
                ))}
              </div>
              <br />
              <input
                type="text"
                value={this.state.message}
                onChange={this.inputChanged}
                onKeyDown={this.onKeyPressed}
                tabIndex="0"
              />
              <button onClick={this.sendMessage}>Send</button>
                </div>
            </div>
          );
    }
}
