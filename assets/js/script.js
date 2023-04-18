window.addEventListener('load', function() {
    
    const socket = new WebSocket("wss://api.lanyard.rest/socket");
    socket.onopen = (event) => {
        setInterval(() => {
            socket.send(JSON.stringify({
                op: 3
            }))
        }, 30000);
    };

    // Set up an event listener for incoming messages
    socket.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        //console.log(receivedData)

        if(receivedData.op === 1) {
            const initialData = {
                op: 2,
                d: {
                    subscribe_to_ids: ["466182014614372362"],
                },
            };
            return socket.send(JSON.stringify(initialData));
        }

        if(receivedData.op === 0) {

            let userdata;
            if(receivedData.t == "INIT_STATE") userdata = receivedData.d['466182014614372362']
            if(receivedData.t == "PRESENCE_UPDATE") userdata = receivedData.d

            let discord_avatar = document.getElementById("discordAvatar")
            discord_avatar.src = `https://cdn.discordapp.com/avatars/${userdata.discord_user.id}/${userdata.discord_user.avatar}.png?size=4096`

            let discord_status = document.getElementById("discordStatus")
            discord_status.className = `${userdata.discord_status}`
            
            let activity = document.getElementById("activity")
            activity.className = `activity_${userdata.discord_status}`

            //background image
            const body = document.querySelector("body");
            body.style.backgroundImage = `url(${userdata.kv.bgimg})`;
            body.style.backgroundRepeat = "no-repeat";
            body.style.backgroundAttachment = "fixed";
            body.style.backgroundSize = "cover";
            body.style.color = "#1a1a1a";
            body.style.fontFamily = "'Poppins', sans-serif";


            let discord_tag = document.getElementById("discordTag")
            discord_tag.innerText = `${userdata.discord_user.username}#${userdata.discord_user.discriminator} (${userdata.discord_status})`
            //for clipboard
            discord_tag.addEventListener('click', () => {
                const textToCopy = discord_tag.innerText;
                navigator.clipboard.writeText(textToCopy)
                  .then(() => {
                    const popup = document.createElement('div');
                    popup.innerHTML = 'Username copied to clipboard';
                    popup.style.position = 'fixed';
                    popup.style.bottom = '20px';
                    popup.style.right = '20px';
                    popup.style.padding = '10px';
                    popup.style.backgroundColor = '#fff';
                    popup.style.border = '1px solid #ccc';
                    popup.style.borderRadius = '5px';
                    document.body.appendChild(popup);
                    setTimeout(() => {
                      document.body.removeChild(popup);
                    }, 2000);
                  })
                  .catch(err => console.error('Could not copy text: ', err))
              });

            let discord_name = document.getElementById("discordname")
            discord_name.innerHTML = `${userdata.discord_user.username} <b style="font-size: 14px;">(Jo Jo)</b>`

            //my custom edited element
            let discord_Rpc = document.getElementById("rpc");
            if (userdata.activities[1]) {
              const appId = userdata.activities[1].application_id;
              let largeImage = userdata.activities[1].assets.large_image;
              if (largeImage.startsWith("mp:")) {
                largeImage = largeImage.slice(3); // Remove "mp:" from the beginning
              }
              const primaryUrl = `https://cdn.discordapp.com/app-assets/${appId}/${largeImage}.png`;
              const fallbackUrl = `https://media.discordapp.net/${largeImage}`;
              discord_Rpc.innerHTML = `<h3>Now Playing</h3>
                <div class="discord-card">
                  <img src="${primaryUrl}" alt="Discord RPC Icon" style="width: 72px; height:72px;">
                  <div class="details" style="text-align: left;">
                    ${userdata.activities[1].name ? `<h3>${userdata.activities[1].name}</h3>` : ''}
                    ${userdata.activities[1].details ? `<p>${userdata.activities[1].details}</p>` : ''}
                    ${userdata.activities[1].state ? `<p>${userdata.activities[1].state}</p>`  : ''}
                  </div>
                </div>`;
              const img = discord_Rpc.querySelector("img");
              img.onerror = function() {
                img.src = fallbackUrl;
              };
            } else {
              discord_Rpc.innerHTML = `${userdata.kv.rpc}`;
            }
            
            


            // custom edited element

            let spotify_activity = document.getElementById("spotifyActivity");
            if (userdata.listening_to_spotify) {
              spotify_activity.innerHTML = `
              <i class="fab fa-spotify"></i> I am currently listening: <br> 
               <b style="color:cyan;">Song Name:</b> <a target="_blank" href="https://open.spotify.com/track/${userdata.spotify.track_id}"><b style="color:white;" class="animated-fade">${userdata.spotify.song}</b></a> <br>
               <b style="color:cyan;">Artist Name:</b> <b style="color:white;" class="animated-fade">${userdata.spotify.artist}</b> <br>
               <b style="color:cyan;">Album Name:</b> <b style="color:white;" class="animated-fade">${userdata.spotify.album}</b> <br>
               <h5 class="song-remaining"></h5>`;
            } else {
              spotify_activity.innerHTML = `<!--<i class="fab fa-spotify"></i> I'm not listening to any song right now-->${userdata.kv.musicoff}`;
            }

            //spotify avatar


            let sp_album_url = document.getElementById("spalbumurl");
            if (userdata.listening_to_spotify) {
                sp_album_url.innerHTML = `<a target="_blank" href="https://open.spotify.com/track/${userdata.spotify.track_id}"><img draggable="false" src="${userdata.spotify.album_art_url}" alt="${userdata.spotify.song}" srcset="" style="width: auto; height:50px;" class="cd-container cd"></a>`;
            } else {
                sp_album_url.innerHTML = `<!--<i class="fab fa-spotify"></i> No Avatar Available Right now -->`;
            }


            //spotify avatar
            //spotify old data
            //if(userdata.listening_to_spotify) {
            //    let spotify_activity = document.getElementById("spotifyActivity")
            //    spotify_activity.innerHTML = `<i class="fab fa-spotify"></i> Listening to: ${userdata.spotify.song} - ${userdata.spotify.artist}`
            //}

            let status_activity = document.getElementById("statusActivity")

            let status = userdata.activities.filter(a => a.name == "Custom Status")
            if(status.length > 0) {
                status_activity.innerHTML = `${status[0].emoji?.id ? `<p><u>Discord Status</u></p><br><img draggable="false" id="statusEmoji" src="https://cdn.discordapp.com/emojis/${status[0].emoji.id}.${status[0].emoji.animated ? 'gif' : 'png'}?size=28">` : ''} <br> <b><i>${status[0].state}</i></b>`
            }
            else {
                status_activity.innerHTML = `Feeling Good Ig`;
            }


            let discord_motd = document.getElementById("motd");
            if (userdata.kv.motd) {
                discord_motd.innerHTML = userdata.kv.motd;
            } else {
                discord_motd.style.display = '';
            }
            
            let discord_custom = document.getElementById("custom");
            if (userdata.kv.custom) {
                discord_custom.innerHTML = userdata.kv.custom;
            } else {
                discord_custom.style.display = '';
            }
            
            // music time converter
            function updateRemainingTime() {
                const now = new Date().getTime();
                const start = userdata.spotify.timestamps.start;
                const end = userdata.spotify.timestamps.end;
                const duration = end - start;
                const elapsed = now - start;
                const remaining = duration - elapsed;
                const remainingSeconds = Math.floor(remaining / 1000);
                let timeString = '';
              
                // Check if hours are available
                if (remaining >= 3600000) {
                  const remainingHours = Math.floor(remaining / 3600000);
                  const remainingMinutes = Math.floor((remaining % 3600000) / 60000);
                  timeString = `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
                  if (remainingMinutes > 0) {
                    timeString += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
                  }
                  timeString += '';
                }
                // Check if minutes are available
                else if (remaining >= 60000) {
                  const remainingMinutes = Math.floor(remaining / 60000);
                  const remainingSecondsInMinute = remaining % 60000 / 1000;
                  timeString = `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
                  if (remainingSecondsInMinute > 0) {
                    timeString += ` ${Math.floor(remainingSecondsInMinute)} second${Math.floor(remainingSecondsInMinute) !== 1 ? 's' : ''}`;
                  }
                  timeString += '';
                }
              
                // Display remaining seconds
                else if (remainingSeconds > 0) {
                  timeString = `${Math.floor(remainingSeconds)} second${Math.floor(remainingSeconds) !== 1 ? 's' : ''}`;
                }
              
                const songRemaining = document.querySelector('.song-remaining');
                songRemaining.innerHTML = timeString ? `<p style="color:cyan;">Time remaining:</p> <p style="color:white;">${timeString}</p>` : '';
              }
              
              // Call the updateRemainingTime function every second
              setInterval(updateRemainingTime, 1000);                       
              
            console.log(userdata)

        }

        // Use the received JSON data to modify HTML elements
        // Assuming the received data has a property called 'content' that needs to be displayed
        // if (receivedData.content) {
        //   elementToUpdate.innerHTML = receivedData.content;
        // }
    };

    window.onbeforeunload = () => {
        socket.onclose = () => {}; // Disable onclose handler first
        socket.close();
    };

})