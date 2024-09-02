import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth, setPersistence, signOut, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, set, get, update, push } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

$(document).ready(function () {

    // Firebase configuration object
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
        // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    // Get a reference to the auth and database services
    const auth = getAuth(app);
    const database = getDatabase(app);

//    var xhr = new XMLHttpRequest();
//    xhr.open("GET", "autologin.php", true);
//    xhr.onreadystatechange = function() {
//        if (xhr.readyState === XMLHttpRequest.DONE) {
//            if (xhr.status === 200) {
//               window.location.href = "https://april.lexiqqq.com/login/stuff";
//            }
 //       }
//    };
//    xhr.send();

    // Initialize jQuery Terminal
    var term = $('#terminal').terminal({
        // Function for the /register command
        "/register": function () {
            const { input, password } = $.terminal.forms.types;

            var spec = [
                {
                    type: input,
                    prompt: 'username: ',
                    name: 'name'
                },
                {
                    type: password,
                    prompt: 'password: ',
                    name: 'password'
                }
            ];

            $.terminal.forms.form(term, spec).then(function (form) {
                // Check if username is not empty
                if (form.name !== "") {
                    // Hash the password
                    var passwordBytes = new TextEncoder().encode(form.password);
                    crypto.subtle.digest('SHA-256', passwordBytes).then(function(hashBuffer) {
                     var hashedPassword = Array.prototype.map.call(new Uint8Array(hashBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
                     const usernameemail = form.name + "@aprillexiqq.com";
						var newAccount = {
						    username: form.name,
						    last_active_time: new Date().toISOString(),  // Sets the current timestamp
						    bgcolour: "black",  // Default color, or you can change it based on user input
						    textcolour: "white",  // Default text color, or you can change it based on user input
						    joindate: new Date().toISOString(),  // Sets the join date to the current date/time
						    online: false
						};

						var chat = {
							notif: 0
						};
						
						console.log(chat);

createUserWithEmailAndPassword(auth, usernameemail, hashedPassword)
    .then((userCredential) => {
        // Get the authenticated user's UID
        const userId = userCredential.user.uid;

        // Reference to the chats node for this user
        const chatRef = ref(database, "/chats/main/users/" + form.name);
        set(chatRef, chat);

        // Reference to the userMappings node to link the custom ID to the UID
        const userMappingRef = ref(database, "/usermappings/" + form.name);
        set(userMappingRef, userId);
                // Reference to the accounts node using the custom ID (form.name)
        const accountRef = ref(database, "/accounts/" + form.name);
        set(accountRef, newAccount);

        console.log("User account created and mapped:", form.name, userId);
    })
    	                })
                } else {
                    term.echo("Please provide a username.");
                }
            });
        },

        // Function for the /login command
        "/login": function () {
            const { input, password } = $.terminal.forms.types;

            var spec = [
                {
                    type: input,
                    prompt: 'username: ',
                    name: 'name'
                },
                {
                    type: password,
                    prompt: 'password: ',
                    name: 'password'
                }
            ];

            $.terminal.forms.form(term, spec).then(function (form) {
                // Check if username is not empty
                if (form.name !== "") {
                    // Hash the password
                    var passwordBytes = new TextEncoder().encode(form.password);
                    crypto.subtle.digest('SHA-256', passwordBytes).then(function(hashBuffer) {
                     var hashedPassword = Array.prototype.map.call(new Uint8Array(hashBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
                     const usernameemail = form.name + "@aprillexiqq.com";
signOut(auth)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Sign in with email and password
    return signInWithEmailAndPassword(auth, usernameemail, hashedPassword);
  })
  .then((userCredential) => {
    // Redirect after successful sign-in
    window.location.href = '/login/stuff';
  })
  .catch((error) => {
    term.echo('Incorrect details');
  });

    					
	                })
                } else {
                    term.echo("Please provide a username.");
                }

            });
        }
    }, {
        greetings: 'Use /register to register and /login to login',
        prompt: '>'
    });
});
