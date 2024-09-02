import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase,onDisconnect, ref, onValue, set, get, update, push, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

var chatid = localStorage.getItem("lastChatId") || "main";
var autocomp = ['namecolour', 'bgcolour', 'createdm', 'creategc', 'goto', 'info', 'clear', 'help'];
const dmChats = [];
const nonDmChats = [];
const onlineUsers = [];
const offlineUsers = [];

var chatname = localStorage.getItem("lastChatName" || "main");

var chatIdDiv = document.getElementById('chatid');
chatIdDiv.textContent = chatname;

    const firebaseConfig = {
        apiKey: "AIzaSyDjzMoF6Oq-6f86m7T0BMe2uKtGmcaisAI",
        authDomain: "april-81735.firebaseapp.com",
        databaseURL: "https://april-81735-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "april-81735",
        storageBucket: "april-81735.appspot.com",
        messagingSenderId: "588456025369",
        appId: "1:588456025369:web:ac4804c1be5ea89c167988",
        measurementId: "G-B599PWFKNQ"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    // Get a reference to the auth and database services
    const auth = getAuth(app);
    const database = getDatabase(app);

    
const msgsRef = ref(database, '/msgs/main');
const chatsRef = ref(database, '/chats');
const usersRef = ref(database, '/accounts');
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
            const allUsers = usersSnapshot.val();
            Object.keys(allUsers).forEach(userId => {
                if (allUsers[userId].online) {
                    onlineUsers.push(userId);
                } else {
                    offlineUsers.push(userId);
                }
            });

        autocomp = autocomp.concat(offlineUsers, onlineUsers);
};
const chatsSnapshot = await get(chatsRef);
    if (chatsSnapshot.exists()) {
        const allChats = chatsSnapshot.val();
        const nonDmChatNames = Object.keys(allChats).filter(chatId => !allChats[chatId].dm);

        autocomp = autocomp.concat(nonDmChatNames);
}

updateChatUI();
async function updateChatUI() {
	const onlineUsers = [];
	const offlineUsers = [];
	const dmChats = [];
	const nonDmChats = [];
    // References to the database paths

    try {
        // Fetch all chats
        const chatsSnapshot = await get(chatsRef);
        if (chatsSnapshot.exists()) {
            const allChats = chatsSnapshot.val();
            const chatEntries = Object.entries(allChats);

            // Process each chat entry
            await Promise.all(chatEntries.map(async ([chatId, chatData]) => {
                if (chatData.dm) {
                    // Fetch users for the DM chat
                    const usersRef = ref(database, `/chats/${chatId}/users`);
                    const usersSnapshot = await get(usersRef);
                    if (usersSnapshot.exists()) {
                        const users = usersSnapshot.val();
                        if (users[username]) {
                            const otherUser = Object.keys(users).find(user => user !== username);
                            if (otherUser) {
                                dmChats.push({
                                    chatId,
                                    chatname: otherUser,
                                    ...chatData
                                });

                                // Update the DOM for DM chats
                                const dmDiv = document.getElementById('dm');
                                if (dmDiv) {
                                    const chatElement = document.createElement('p');
                                    chatElement.textContent = otherUser;
                                    chatElement.classList.add('dm');
                                    dmDiv.appendChild(chatElement);
                                }
                            }
                        }
                    }
                } else {
                    // Collect non-DM chats
                    nonDmChats.push({
                        chatId,
                        ...chatData
                    });
                }
            }));

            // Update the DOM for non-DM chats
            const chatsDiv = document.getElementById('chats');
            if (chatsDiv) {
                nonDmChats.forEach(chat => {
                    const chatElement = document.createElement('p');
                    chatElement.textContent = chat.chatId;
                    chatElement.classList.add('chat-item');
                    chatsDiv.appendChild(chatElement);
                });
            }
        }

        // Fetch online and offline users
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
            const allUsers = usersSnapshot.val();
            Object.keys(allUsers).forEach(userId => {
                if (allUsers[userId].online) {
                    onlineUsers.push(userId);
                } else {
                    offlineUsers.push(userId);
                }
            });
          

            // Update online users DOM
            const onlineUsersDiv = document.getElementById("onlineusers");
            if (onlineUsersDiv) {
                onlineUsersDiv.innerHTML = "";
                onlineUsers.forEach(user => {
                    const userElement = document.createElement("p");
                    userElement.textContent = user;
                    onlineUsersDiv.appendChild(userElement);
                });
            }

            // Update offline users DOM
            const offlineUsersDiv = document.getElementById("offlineusers");
            if (offlineUsersDiv) {
                offlineUsersDiv.innerHTML = "";
                offlineUsers.forEach(user => {
                    const userElement = document.createElement("p");
                    userElement.textContent = user;
                    offlineUsersDiv.appendChild(userElement);
                });
            }
        }
    } catch (error) {
        console.error('Error updating chat UI:', error);
    }
}

function getmsg(chatid) {
    // Reference to the /msgs/{chatid} path
    const msgsRef = ref(database, `/msgs/${chatid}`);

    // Set up a listener for changes at the msgsRef path
    onValue(msgsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            // Aggregate all messages into a single array
            const allMessages = [];

            const usersRef = ref(database, `/chats/${chatid}/users`);
            get(usersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const usersData = snapshot.val();

                        // Reset notifications for the current user
                        if (usersData[username]) {
                            const userNotifRef = ref(database, `/chats/${chatid}/users/${username}`);
                            update(userNotifRef, { notif: 0 })
                                .then(() => {
                                })
                                .catch((error) => {
                                    console.error('Error resetting notifications:', error);
                                });
                        }
                    } else {
                       
                    }
                })
                .catch((error) => {
                    console.error('Error getting users data:', error);
                });

            // Iterate through the users in the chat
            for (const [username, messages] of Object.entries(data)) {
                const accRef = ref(database, `/accounts/${username}`);
                get(accRef)
                    .then((userSnapshot) => {
                        if (userSnapshot.exists()) {
                            const userData = userSnapshot.val();
                            const textColour = userData.textcolour || '#000';  // Default color if not set
                            const bgColour = userData.bgcolour || '#fff';    // Default color if not set

                            // Iterate through the message timestamps
                            Object.entries(messages).forEach(([timestamp, msg]) => {
                                allMessages.push({
                                    username,
                                    timestamp: Number(timestamp),
                                    msg,
                                    textColour,
                                    bgColour
                                });
                            });

                            // Sort messages by timestamp
                            allMessages.sort((a, b) => a.timestamp - b.timestamp);

                            // Clear previous content
                            const terminalOutput = document.querySelector('#b .terminal-output');
                            const bDiv = document.getElementById('b');
                            const wasAtBottom = (bDiv.scrollHeight - bDiv.scrollTop === bDiv.clientHeight);

                            terminalOutput.innerHTML = '';

                            // Append sorted messages
                            allMessages.forEach(message => {
                                const div = document.createElement('div');
                                div.setAttribute('data-index', message.timestamp);
                                // Create a div element to display the message
                                div.innerHTML = `
                                    <div style="display: flex;">
                                        <span style="height: fit-content; font-weight: bold; color: ${message.textColour}; background: ${message.bgColour};">
                                            ${message.username}
                                        </span>
                                        <span>:&nbsp;</span>
                                        <div style="color: #aaa; display: inline; text-wrap: pretty;">
                                            ${message.msg}
                                        </div>
                                        <span style="margin-left: auto; text-wrap: nowrap;">
                                            ${new Date(message.timestamp * 1000).toLocaleString()}&nbsp;
                                        </span>
                                    </div>
                                `;

                                terminalOutput.appendChild(div);
                            });

                            // Scroll to bottom if it was at the bottom before
                            if (wasAtBottom) {
                                bDiv.scrollTop = bDiv.scrollHeight;
                            }
                        } else {
                            console.error('No account data found for user:', username);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching account data:', error);
                    });
            }
        } else {
        	const terminalOutput = document.querySelector('#b .terminal-output');
        	setTimeout(() => {
        	    terminalOutput.innerHTML = '';
        	}, 100);
        }
    }, (error) => {
        console.error('Error getting data:', error);
    });
}

function send(...msgs) {
    const concatenatedMsg = msgs.join(" ");
    const senddate = Math.floor(Date.now() / 1000);

    // Define the path for the message
    const msgRef = ref(database, `/msgs/${chatid}/${username}/${senddate}`);

    // Set the message in Firebase
    set(msgRef, concatenatedMsg)
        .then(() => {
            // Path to the users list in the chat
            const chatUsersRef = ref(database, `/chats/${chatid}/users`);

            // Retrieve the list of users
            get(chatUsersRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const users = snapshot.val();

                        // Prepare updates to increment notifications
                        const updates = {};
                        for (const user in users) {
                            if (user !== username) {
                                // Increment notification count for each user except the sender
                                const userNotifRef = `/chats/${chatid}/users/${user}/notif`;
                                updates[userNotifRef] = (users[user].notif || 0) + 1;
                            }
                        }

                        // Apply all updates in one batch
                        update(ref(database), updates)
                            .then(() => {
                            })
                            .catch((error) => {
                                console.error('Error updating notification counts:', error);
                            });
                    } else {
                        console.log('No users found in the chat.');
                    }
                })
                .catch((error) => {
                    console.error('Error getting users list:', error);
                });
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}


function setUserOnline() {
	const userRef = ref(database, `/accounts/${username}`);   
    update(userRef, {
        online: true,
        last_active_time: new Date().toISOString()
    });

    // Set up a handler for when the user disconnects
    onDisconnect(userRef).update({
        online: false,
        last_active_time: new Date().toISOString()
    });
}
var username = null;

$(document).ready(function () {
onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email;
    username = email.replace(/@.*$/, '');
    setUserOnline();  
  } else {
    window.location.href = '/logintest/';

  }
});
getmsg(chatid);

var term = $('#a').terminal({
    namecolour: function(colour) {
    
		    const userRef = ref(database, `/accounts/${username}`);

		    update(userRef, {
		        textcolour: colour
		    })

			.then(() => {
		        term.echo(`Username colour changed to  ${colour}`);
		        getmsg(chatid);
		    })
    },

info: function(username) {

    const userRef = ref(database, `/accounts/${username}`);

    // Fetch the user data
    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userInfo = snapshot.val();

                // Convert the last active time and join date to human-readable format
                const lastActiveTime = new Date(userInfo.last_active_time).toLocaleString();
                const joinDate = new Date(userInfo.joindate).toLocaleDateString();

                // Display user information or perform further actions
                term.echo("Username: " + "[[b;" + userInfo.textcolour + ";" + userInfo.bgcolour + "]" + userInfo.username + "]");
                term.echo("Last Active Time: " + lastActiveTime);
                term.echo("Join Date: " + joinDate);
            } else {
                term.echo("User " + username + " not found");
            }
        })
        .catch((error) => {
            console.error('Error fetching user info:', error);
            term.echo("An error occurred while fetching user information.");
        });

},

    
goto: function(chat) {
    // The logged-in user's usernam
    
    // Reference to the /chats path in the Firebase database
    const database = getDatabase(); // Ensure you have initialized the database
    const chatsRef = ref(database, '/chats');
    let chatData;
     let chatUsers;
    
    // Query to find chats where dm = true
    const chatsQuery = query(chatsRef, orderByChild('dm'), equalTo(true));
    
    // Execute the query
    get(chatsQuery).then((snapshot) => {
        if (snapshot.exists()) {
            let dmFound = false;

            snapshot.forEach((childSnapshot) => {
                chatData = childSnapshot.val();
                chatUsers = chatData.users;

                // Check if the chat contains exactly the two users: username and chat
                if (chatUsers && Object.keys(chatUsers).length === 2 && chatUsers[username] && chatUsers[chat]) {
                    dmFound = true;
                    const chatid = childSnapshot.key;
                    
                    var chatIdDiv = document.getElementById('chatid');
                    chatIdDiv.textContent = chat;
                    localStorage.setItem("lastChatId", chatid);
                    localStorage.setItem("lastChatName", chat);

                    // Call the getmsg function with the found chat ID
                    getmsg(chatid);
                }
            });

            if (!dmFound) {
            	if (chatUsers && chatUsers[username]){
	                chatid = chat;
			        var chatIdDiv = document.getElementById('chatid');
			        chatIdDiv.textContent = chat;
			        localStorage.setItem("lastChatId", chatid);
			        localStorage.setItem("lastChatName", chat);
			        getmsg(chatid);
			   }
            }
            
        } else {
            console.error("No chats found with dm = true.");
        }
 
    });
    getmsg(chatid)
},


quit: function() {
	window.location.href = "/";
},

    bgcolour: function(colour) {
    
		    const userRef = ref(database, `/accounts/${username}`);

		    update(userRef, {
		        bgcolour: colour
		    })

			.then(() => {
		        term.echo(`Background colour changed to  ${colour}`);
		        getmsg(chatid);
		    })
    },
createdm: function(dm) {
    const users = [username, dm].sort();
    const chatId = `dm_${users[0]}_${users[1]}`;

    // Reference to the new chat in the database
    const chatRef = ref(database, `/chats/`);

    // Create the chat structure
    const chatData = {
    	dm: true,
        users: {
            [username]: {
                notif: 0, // Initialize notification count for user1
            },
            [dm]: {
                notif: 0, // Initialize notification count for user2
            }
        },
    };

    // Save the chat data to the database
    push(chatRef, chatData)
        .then(() => {
            console.log('DM created successfully with chat ID:', chatId);
        })
        .catch((error) => {
            console.error('Error creating DM:', error);
        });

},

creategc: function(chatname, ...args) {
    // Combine the username with the other users provided in args
    const users = [username, ...args].sort(); // Sort to maintain consistent order
    const chatId = chatname; // Use chatname as the chat ID for the group chat

    // Reference to the chat in the database
    const chatRef = ref(database, `/chats/${chatId}`);

    // Check if the chat already exists
    get(chatRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Chat with this name already exists
            term.echo('Error: A chat with this name already exists.');
            // Optionally, you can provide user feedback here
        } else {
            // Create the chat structure
            const chatData = {
                chatname: chatname, // Set the chatname provided
                users: users.reduce((acc, user) => {
                    acc[user] = { notif: 0 }; // Initialize notification count for each user
                    return acc;
                }, {}),
                dm: false // Indicates this is a group chat, not a direct message
            };

            // Save the chat data to the database
            set(chatRef, chatData)
                .then(() => {
                    console.log('Group chat created successfully with chat ID:', chatId);
                })
                .catch((error) => {
                    console.error('Error creating group chat:', error);
                });
        }
    }).catch((error) => {
        console.error('Error checking if chat exists:', error);
    });
},



help: function() {
    term.echo("Available Commands:");
    term.echo("  namecolour [colour]: Change username colour");
    term.echo("  bgcolour [colour]: Change background colour");
    term.echo("  createdm [username]: Create a dm with user");
    term.echo("  creategc [chatname] [user1] [user2] ...: Create a group chat");
    term.echo("  goto [chat]: Switch to the specified chat");
    term.echo("  info [username]: Get user information");
    term.echo("  clear: Clear the terminal output");
    term.echo("  quit: Disconnects the user from the server");
    term.echo("  help: Display this help message");
    
}
},
 {
    greetings: 'cmd\nAvailable Commands:\n' +
        '  namecolour [colour]: Change username colour\n' +
        '  bgcolour [colour]: Change background colour\n' +
        '  createdm [username]: Create a DM with user\n' +
        '  creategc [chatname] [user1] [user2] ...: Create a group chat\n' +
        '  goto [chat]: Switch to the specified chat\n' +
        '  info [username]: Get user information\n' +
        '  clear: Clear the terminal output\n' +
        '  quit: Disconnects the user from the server\n' +
        '  help: Display this help message\n' +
        '\nEnter commands below',    autocompleteMenu: true,
    completion: autocomp,
    checkArity: false
});
  
$('#b').terminal(function(command) {
        // Function to handle commands
        if (command !== '') {
          send(command);
        }
      }, {
        prompt: '>',
        greetings: ''
      });
});

