// Since we are using the compat libraries loaded via script tags in index.html,
// the firebase object is available globally.

// =================================================================================
// Firebase Configuration
// =================================================================================
// Configuration provided by the user.
const firebaseConfig = {
  apiKey: "AIzaSyCvxyd9Q37Zu4wMv-dGhcrom-En2Ja9n0o",
  authDomain: "chat-8c7f5.firebaseapp.com",
  projectId: "chat-8c7f5",
  storageBucket: "chat-8c7f5.appspot.com",
  messagingSenderId: "566550384400",
  appId: "1:566550384400:web:6438e3fb134edfc6649f95",
  measurementId: "G-ZV55RSVRX6"
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// =================================================================================
// Constants
// =================================================================================
const DEFAULT_AVATAR_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2372767d'/%3E%3C/svg%3E";

// =================================================================================
// App State
// =================================================================================
let currentUser = null;
let activeView = 'servers'; // 'servers' or 'home'
let activeServerId = null;
let activeChannelId = null; // Can be a server channel ID or a DM channel ID
let messageUnsubscribe = () => {};
let channelUnsubscribe = () => {};
let usersUnsubscribe = () => {};
let serversUnsubscribe = () => {};
let friendsUnsubscribe = () => {};

// =================================================================================
// Authentication
// =================================================================================
auth.onAuthStateChanged(async (user) => {
  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const appErrorOverlay = document.getElementById('app-error-overlay');
  const appErrorMessage = document.getElementById('app-error-message');
  const appErrorTitle = document.getElementById('app-error-title');

  if (user) {
    try {
      appErrorOverlay.classList.add('hidden');
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        const displayName = user.displayName || user.email.split('@')[0];
        const photoURL = user.photoURL || `https://i.pravatar.cc/64?u=${user.uid}`;

        if (!user.displayName || !user.photoURL) {
          await user.updateProfile({ displayName, photoURL });
        }
        
        await userDocRef.set({ displayName, photoURL, status: 'online', friends: [] });
        currentUser = { uid: user.uid, displayName, photoURL };
      } else {
        await userDocRef.update({ status: 'online' });
        const userData = userDoc.data();
        currentUser = { uid: user.uid, displayName: userData.displayName, photoURL: userData.photoURL };
      }
      
      loginView.classList.add('hidden');
      appView.classList.remove('hidden');
      renderUserInfo();
      loadServers();
      loadFriends();
      setupPresence();
      selectHome(); // Default to home view on login

    } catch (error) {
        console.error("Firestore error:", error);
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
            appErrorTitle.textContent = "Database Index Required";
            appErrorMessage.innerHTML = `A database index is required for this app to function. Please open the developer console (F12), find the error message from Firebase, and click the link to create the index in your Firebase project. It may take a few minutes to build.`;
        } else {
            appErrorTitle.textContent = "Connection Error";
            appErrorMessage.textContent = 'Failed to connect to the database. Please ensure Cloud Firestore has been created and configured in your Firebase project.';
        }
        appErrorOverlay.classList.remove('hidden');
    }
  } else {
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ status: 'offline' }).catch((e) => console.error("Failed to update status on logout", e));
    }
    currentUser = null;
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
    appErrorOverlay.classList.add('hidden');
    // Cleanup listeners
    if(serversUnsubscribe) serversUnsubscribe();
    if(channelUnsubscribe) channelUnsubscribe();
    if(messageUnsubscribe) messageUnsubscribe();
    if(usersUnsubscribe) usersUnsubscribe();
    if(friendsUnsubscribe) friendsUnsubscribe();
  }
});

const setupPresence = () => {
    const userStatusRef = db.collection('users').doc(currentUser.uid);
    window.addEventListener('beforeunload', () => {
        userStatusRef.update({ status: 'offline' });
    });
}

const showLoginError = (message) => {
    const loginErrorContainer = document.getElementById('login-error-container');
    loginErrorContainer.textContent = message;
    loginErrorContainer.classList.remove('hidden');
};

const clearLoginError = () => {
    const loginErrorContainer = document.getElementById('login-error-container');
    loginErrorContainer.textContent = '';
    loginErrorContainer.classList.add('hidden');
};

const signInWithGoogle = () => {
    clearLoginError();
    auth.signInWithPopup(provider).catch((error) => {
        let message = "An unknown error occurred during Google sign-in.";
        switch (error.code) {
            case 'auth/popup-closed-by-user': message = 'Sign-in cancelled.'; break;
            case 'auth/cancelled-popup-request': message = 'Sign-in cancelled.'; break;
        }
        showLoginError(message);
    });
};

const handleSignUp = async (e) => {
    e.preventDefault();
    clearLoginError();
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        let message = "An unknown error occurred.";
        switch (error.code) {
            case 'auth/email-already-in-use': message = 'An account with this email already exists.'; break;
            case 'auth/invalid-email': message = 'Please enter a valid email.'; break;
            case 'auth/weak-password': message = 'Password must be at least 6 characters.'; break;
        }
        showLoginError(message);
    }
};

const handleSignIn = async (e) => {
    e.preventDefault();
    clearLoginError();
    const signinEmailInput = document.getElementById('signin-email');
    const signinPasswordInput = document.getElementById('signin-password');
    const email = signinEmailInput.value;
    const password = signinPasswordInput.value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        let message = "An unknown error occurred.";
        switch(error.code) {
            case 'auth/user-not-found': message = 'No account found with this email.'; break;
            case 'auth/wrong-password': message = 'Incorrect password.'; break;
            case 'auth/invalid-email': message = 'Please enter a valid email.'; break;
        }
        showLoginError(message);
    }
};

const signOut = () => auth.signOut().catch((error) => console.error("Sign out error", error));

// =================================================================================
// UI Rendering Functions
// =================================================================================
const renderUserInfo = () => {
  if (!currentUser) return;
  const userInfoPanel = document.getElementById('user-info-panel');
  const userInfoPanelHome = document.getElementById('user-info-panel-home');

  const userInfoHTML = `
    <div class="relative mr-2">
        <img src="${currentUser.photoURL}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_SVG}';" alt="${currentUser.displayName}" class="w-10 h-10 rounded-full"/>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
    </div>
    <div class="truncate">
        <p class="text-sm font-semibold text-white truncate">${currentUser.displayName}</p>
        <p class="text-xs text-gray-400">Online</p>
    </div>
  `;
  if (userInfoPanel) userInfoPanel.innerHTML = userInfoHTML;
  if (userInfoPanelHome) userInfoPanelHome.innerHTML = userInfoHTML;
};

const renderServers = (servers) => {
    const serverListContainer = document.getElementById('server-list-container');
    if (!serverListContainer) return;

    serverListContainer.innerHTML = '';
    
    // Home Button
    const homeButton = document.createElement('div');
    homeButton.className = "relative group mb-2";
    const isHomeActive = activeView === 'home';
    homeButton.innerHTML = `
      <div class="absolute left-0 h-0 w-1 bg-white rounded-r-full transition-all duration-200 ${isHomeActive ? 'h-10' : 'group-hover:h-5'}"></div>
      <button class="flex items-center justify-center w-12 h-12 rounded-3xl transition-all duration-200 group-hover:rounded-2xl ${isHomeActive ? 'bg-blue-500 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500'} focus:outline-none">
        <svg class="w-7 h-7 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
      </button>
      <span class="absolute left-16 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">Home</span>
    `;
    homeButton.querySelector('button').onclick = selectHome;
    serverListContainer.appendChild(homeButton);

    const separator = document.createElement('div');
    separator.className = "w-8 border-t border-gray-700 my-2";
    serverListContainer.appendChild(separator);
    
    const serverListElement = document.createElement('div');
    serverListElement.id = 'server-list';
    serverListContainer.appendChild(serverListElement);

    servers.forEach(server => {
        const isActive = server.id === activeServerId;
        const serverIcon = document.createElement('div');
        serverIcon.className = "relative group mb-2";
        serverIcon.innerHTML = `
            <div class="absolute left-0 h-0 w-1 bg-white rounded-r-full transition-all duration-200 ${isActive ? 'h-10' : 'group-hover:h-5'}"></div>
            <button class="flex items-center justify-center w-12 h-12 rounded-3xl transition-all duration-200 group-hover:rounded-2xl ${isActive ? 'bg-blue-500 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500'} focus:outline-none">
                <img src="${server.iconUrl}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_SVG}';" alt="${server.name}" class="w-full h-full object-cover rounded-3xl group-hover:rounded-2xl transition-all duration-200" />
            </button>
            <span class="absolute left-16 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">${server.name}</span>
        `;
        serverIcon.querySelector('button').onclick = () => selectServer(server.id);
        serverListElement.appendChild(serverIcon);
    });
    
    // Add "Add Server" button
    const addServerButton = document.createElement('div');
    addServerButton.innerHTML = `
      <div class="w-full border-t border-gray-700 my-2"></div>
      <button class="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-3xl hover:bg-green-500 hover:rounded-2xl transition-all duration-200 group focus:outline-none">
        <svg class="w-6 h-6 text-green-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </button>
    `;
    addServerButton.querySelector('button').onclick = () => {
      const addServerModal = document.getElementById('add-server-modal');
      if (addServerModal) addServerModal.style.display = 'flex';
    };
    serverListContainer.appendChild(addServerButton);
};

const renderChannels = (server, channels) => {
    const serverNameText = document.getElementById('server-name-text');
    const channelList = document.getElementById('channel-list');
    if (!serverNameText || !channelList) return;

    serverNameText.textContent = server.name;
    channelList.innerHTML = `
        <div class="flex items-center justify-between px-2 pt-2 pb-1">
            <h2 class="text-xs font-bold tracking-wider text-gray-400 uppercase">Text Channels</h2>
        </div>
    `;
    channels.forEach(channel => {
        const isActive = channel.id === activeChannelId;
        const channelLink = document.createElement('button');
        channelLink.className = `flex items-center w-full px-2 py-1.5 text-left rounded-md transition-colors duration-150 ${isActive ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`;
        channelLink.innerHTML = `
            <svg class="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 9h4V7h-4v2zm-2 4h4v-2H8v2zm10-4v2h-4V9h4zm2-2h-4V5h4v2zm-4 8h4v-2h-4v2zm-2-4h-4v2h4v-2zm-2 4h2v2h-2v-2zm-6-4H4v2h2v-2zM6 7H4v2h2V7zm10 10v-2h-4v2h4zm-6 0v-2H8v2h2z"></path></svg>
            <span class="font-medium truncate">${channel.name}</span>
        `;
        channelLink.onclick = () => selectChannel(channel.id);
        channelList.appendChild(channelLink);
    });
};

const renderFriends = (friends) => {
    const friendList = document.getElementById('friend-list');
    if (!friendList) return;

    friendList.innerHTML = `<h2 class="text-xs font-bold tracking-wider text-gray-400 uppercase px-2 pt-2 pb-1">Friends — ${friends.length}</h2>`;
    friends.forEach(friend => {
        const friendEl = document.createElement('button');
        const isActive = activeView === 'home' && activeChannelId === getDmChannelId(friend.id);
        friendEl.className = `flex items-center w-full px-2 py-1.5 text-left rounded-md transition-colors duration-150 ${isActive ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`;
        friendEl.innerHTML = `
            <div class="relative mr-2">
                <img src="${friend.photoURL}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_SVG}';" alt="${friend.displayName}" class="w-8 h-8 rounded-full" />
                <div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-800 rounded-full"></div>
            </div>
            <span class="font-medium truncate">${friend.displayName}</span>
        `;
        friendEl.onclick = () => selectDmChannel(friend);
        friendList.appendChild(friendEl);
    });
};

const renderMessages = (messages) => {
    const messageList = document.getElementById('message-list');
    if (!messageList) return;

    let lastMessageUid = null;
    let lastMessageTimestamp = null;
    const FIVE_MINUTES = 5 * 60 * 1000;

    messageList.innerHTML = ''; // Clear existing messages

    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        const currentTimestamp = msg.timestamp ? msg.timestamp.toDate() : new Date();

        // Check if this message should be grouped with the previous one
        const shouldGroup = 
            msg.user.uid === lastMessageUid &&
            lastMessageTimestamp &&
            (currentTimestamp - lastMessageTimestamp < FIVE_MINUTES);

        if (shouldGroup) {
            // Render a compact message (only the text and a hoverable timestamp)
            messageEl.className = 'flex items-center pl-14 pr-4 py-0.5 hover:bg-gray-800/50 group';
            messageEl.innerHTML = `
                <p class="text-gray-200 whitespace-pre-wrap break-words">${msg.text}</p>
                <span class="text-xs text-gray-500 ml-auto pl-4 opacity-0 group-hover:opacity-100 transition-opacity">${msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            `;
        } else {
            // Render a full message with the user header
            messageEl.className = 'flex p-4 hover:bg-gray-800/50 pt-6';
            const timestamp = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'sending...';
            messageEl.innerHTML = `
                <img src="${msg.user.photoURL}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_SVG}';" alt="${msg.user.displayName}" class="w-10 h-10 rounded-full mr-4" />
                <div>
                    <div class="flex items-baseline">
                        <span class="font-semibold text-white mr-2">${msg.user.displayName}</span>
                        <span class="text-xs text-gray-500">${timestamp}</span>
                    </div>
                    <p class="text-gray-200 whitespace-pre-wrap break-words">${msg.text}</p>
                </div>
            `;
        }
        
        messageList.appendChild(messageEl);

        // Update last message details for the next iteration
        lastMessageUid = msg.user.uid;
        lastMessageTimestamp = currentTimestamp;
    });

    messageList.scrollTop = messageList.scrollHeight;
};

const renderUsers = (users) => {
    const userListAside = document.getElementById('user-list-aside');
    if (!userListAside) return;

    userListAside.innerHTML = `<h3 class="text-xs font-bold uppercase text-gray-400 px-2 pt-2 pb-1">Members — ${users.length}</h3>`;
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = "flex items-center justify-between p-2 rounded-md";
        userEl.innerHTML = `
            <div class="flex items-center">
                <div class="relative mr-3">
                    <img src="${user.photoURL}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_SVG}';" alt="${user.displayName}" class="w-8 h-8 rounded-full" />
                    <div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-800 rounded-full"></div>
                </div>
                <span class="text-sm font-medium text-gray-300">${user.displayName}</span>
            </div>
        `;
        userListAside.appendChild(userEl);
    });
}

// =================================================================================
// Data Handling & State Management
// =================================================================================
const getDmChannelId = (friendId) => {
    return [currentUser.uid, friendId].sort().join('_');
};

const loadServers = () => {
    if (serversUnsubscribe) serversUnsubscribe();
    if (!currentUser) return;
    
    serversUnsubscribe = db.collection('servers')
        .where('members', 'array-contains', currentUser.uid)
        .onSnapshot((snapshot) => {
            const userServers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            renderServers(userServers);

            if (activeView !== 'home' && !activeServerId && userServers.length > 0) {
                selectServer(userServers[0].id);
            } else if (userServers.length === 0 && activeView !== 'home') {
                selectHome();
            } else if (activeServerId && !userServers.some(s => s.id === activeServerId)) {
                selectHome();
            }
        }, (error) => {
            console.error("Error loading servers:", error);
            const appErrorOverlay = document.getElementById('app-error-overlay');
            const appErrorTitle = document.getElementById('app-error-title');
            const appErrorMessage = document.getElementById('app-error-message');

            if (error.code === 'failed-precondition') {
                appErrorTitle.textContent = "Database Index Required";
                appErrorMessage.innerHTML = `A database index is required for this app to function. Please open the developer console (F12), find the error message from Firebase, and click the link to create the index in your Firebase project. It may take a few minutes to build.`;
                appErrorOverlay.classList.remove('hidden');
            }
        });
};

const loadFriends = () => {
    if (friendsUnsubscribe) friendsUnsubscribe();
    if (!currentUser) return;
    
    friendsUnsubscribe = db.collection('users').doc(currentUser.uid).onSnapshot(async (doc) => {
        if (doc.exists) {
            const userData = doc.data();
            const friendIds = userData.friends || [];
            if (friendIds.length > 0) {
                const friendDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', friendIds).get();
                const friends = friendDocs.docs.map(d => ({ id: d.id, ...d.data() }));
                renderFriends(friends);
            } else {
                renderFriends([]);
            }
        }
    });
};


const selectHome = () => {
    activeView = 'home';
    activeServerId = null;
    activeChannelId = null;

    if (messageUnsubscribe) messageUnsubscribe();
    if (channelUnsubscribe) channelUnsubscribe();
    if (usersUnsubscribe) usersUnsubscribe();
    
    const homeView = document.getElementById('home-view');
    const channelListPanel = document.getElementById('channel-list-panel');
    const chatView = document.getElementById('chat-view');
    const userListAside = document.getElementById('user-list-aside');
    const placeholderView = document.getElementById('placeholder-view');

    if(homeView) homeView.style.display = 'flex';
    if(channelListPanel) channelListPanel.style.display = 'none';
    if(chatView) chatView.style.display = 'none';
    if(userListAside) userListAside.style.display = 'none';
    if(placeholderView) {
        placeholderView.style.display = 'flex';
        placeholderView.innerHTML = `
        <div class="text-center text-gray-400">
            <h2 class="text-2xl font-bold">Direct Messages</h2>
            <p class="mt-2">Select a friend to start a conversation.</p>
        </div>
        `;
    }

    // Re-render servers to update active state
    db.collection('servers').where('members', 'array-contains', currentUser.uid).get().then(snap => {
        renderServers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    // Re-render friends list to clear active state
    loadFriends();
};

const selectServer = async (serverId) => {
    if (activeServerId === serverId && activeView === 'servers') return;

    activeView = 'servers';
    activeServerId = serverId;
    activeChannelId = null;

    if (channelUnsubscribe) channelUnsubscribe();
    if (usersUnsubscribe) usersUnsubscribe();
    if (messageUnsubscribe) messageUnsubscribe();
    
    const homeView = document.getElementById('home-view');
    const channelListPanel = document.getElementById('channel-list-panel');
    const userListAside = document.getElementById('user-list-aside');
    const placeholderView = document.getElementById('placeholder-view');
    const chatView = document.getElementById('chat-view');

    if(homeView) homeView.style.display = 'none';
    if(channelListPanel) channelListPanel.style.display = 'flex';
    if(userListAside) userListAside.style.display = 'block';

    // Re-render servers to update active state
    const snapshot = await db.collection('servers').where('members', 'array-contains', currentUser.uid).get();
    const allUserServers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderServers(allUserServers);

    if(placeholderView) placeholderView.style.display = 'flex';
    if(chatView) chatView.style.display = 'none';
    if(placeholderView) placeholderView.innerHTML = `
        <div class="text-center text-gray-400">
            <h2 class="text-2xl font-bold">Select a channel</h2>
            <p class="mt-2">Pick a channel to get the conversation started.</p>
        </div>
    `;

    const serverRef = db.collection('servers').doc(serverId);

    // Listener for server details (name) and members
    usersUnsubscribe = serverRef.onSnapshot(async (doc) => {
        if (doc.exists) {
            const serverData = doc.data();
            const memberUIDs = serverData.members || [];
            if (memberUIDs.length > 0) {
                // BUG FIX: Only fetch users who are members of the current server.
                const userDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', memberUIDs).get();
                const users = userDocs.docs.map(d => ({ id: d.id, ...d.data() }));
                renderUsers(users);
            } else {
                renderUsers([]);
            }
        }
    });

    // Listener for channels in the server
    channelUnsubscribe = serverRef.collection('channels').orderBy('name').onSnapshot((snapshot) => {
        serverRef.get().then((serverDoc) => {
            if (!serverDoc.exists) return;
            const channels = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            renderChannels(serverDoc.data(), channels);
            if (!activeChannelId && channels.length > 0) {
                selectChannel(channels[0].id);
            }
        });
    });
};

const selectChannel = (channelId) => {
    activeChannelId = channelId;
    if (messageUnsubscribe) messageUnsubscribe();

    const placeholderView = document.getElementById('placeholder-view');
    const chatView = document.getElementById('chat-view');
    const chatHeader = document.getElementById('chat-header');
    const messageInput = document.getElementById('message-input');

    if(placeholderView) placeholderView.style.display = 'none';
    if(chatView) chatView.style.display = 'flex';

    const channelRef = db.collection('servers').doc(activeServerId).collection('channels').doc(channelId);

    channelRef.get().then((doc) => {
        if (doc.exists) {
            const channelData = doc.data();
            if(chatHeader) chatHeader.innerHTML = `
            <svg class="w-6 h-6 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10 9h4V7h-4v2zm-2 4h4v-2H8v2zm10-4v2h-4V9h4zm2-2h-4V5h4v2zm-4 8h4v-2h-4v2zm-2-4h-4v2h4v-2zm-2 4h2v2h-2v-2zm-6-4H4v2h2v-2zM6 7H4v2h2V7zm10 10v-2h-4v2h4zm-6 0v-2H8v2h2z"></path></svg>
            <h2 class="font-semibold text-lg text-white">${channelData.name}</h2>
            `;
            if(messageInput) messageInput.placeholder = `Message #${channelData.name}`;
        }
    });

    messageUnsubscribe = channelRef.collection('messages').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
        const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        renderMessages(messages);
    });

    // Re-render channels to show active state
    db.collection('servers').doc(activeServerId).get().then((serverDoc) => {
        db.collection('servers').doc(activeServerId).collection('channels').orderBy('name').get().then((channelDocs) => {
            renderChannels(serverDoc.data(), channelDocs.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
    });
};

const selectDmChannel = (friend) => {
    activeChannelId = getDmChannelId(friend.id);
    if (messageUnsubscribe) messageUnsubscribe();
    
    const placeholderView = document.getElementById('placeholder-view');
    const chatView = document.getElementById('chat-view');
    const userListAside = document.getElementById('user-list-aside');
    const chatHeader = document.getElementById('chat-header');
    const messageInput = document.getElementById('message-input');

    if(placeholderView) placeholderView.style.display = 'none';
    if(chatView) chatView.style.display = 'flex';
    if(userListAside) userListAside.style.display = 'none';

    if(chatHeader) chatHeader.innerHTML = `
        <div class="relative mr-2">
            <img src="${friend.photoURL}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR_SVG}';" alt="${friend.displayName}" class="w-7 h-7 rounded-full" />
            <div class="absolute bottom-0 right-0 w-2 h-2 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border border-gray-800 rounded-full"></div>
        </div>
        <h2 class="font-semibold text-lg text-white">${friend.displayName}</h2>
    `;
    if(messageInput) messageInput.placeholder = `Message @${friend.displayName}`;

    const dmRef = db.collection('dms').doc(activeChannelId);
    messageUnsubscribe = dmRef.collection('messages').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderMessages(messages);
    });

    // Re-render friends list to show active state
    loadFriends();
};


const handleSendMessage = (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message-input');
  const text = messageInput.value.trim();
  if (text && currentUser) {
      const messageData = {
          text: text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          user: {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
          }
      };
      
      if (activeView === 'servers' && activeServerId && activeChannelId) {
          db.collection('servers').doc(activeServerId).collection('channels').doc(activeChannelId).collection('messages').add(messageData);
      } else if (activeView === 'home' && activeChannelId) {
          db.collection('dms').doc(activeChannelId).collection('messages').add(messageData);
      }
      messageInput.value = '';
  }
};

const handleCreateServer = async (e) => {
    e.preventDefault();
    const serverNameInput = document.getElementById('server-name-input');
    const addServerModal = document.getElementById('add-server-modal');
    const serverName = serverNameInput.value.trim();
    if(serverName && currentUser) {
        const newServerRef = db.collection('servers').doc();
        await newServerRef.set({
            name: serverName,
            iconUrl: `https://picsum.photos/seed/${Date.now()}/64/64`,
            owner: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            members: [currentUser.uid]
        });
        await newServerRef.collection('channels').doc('general').set({
            name: 'general'
        });
        
        serverNameInput.value = '';
        if (addServerModal) addServerModal.style.display = 'none';
        selectServer(newServerRef.id);
    }
};

const handleAddFriend = async (e) => {
    e.preventDefault();
    const addFriendInput = document.getElementById('add-friend-input');
    const addFriendStatus = document.getElementById('add-friend-status');
    const friendId = addFriendInput.value.trim();
    if (!friendId || friendId === currentUser.uid) return;

    addFriendStatus.textContent = '...';
    addFriendStatus.className = 'text-xs mt-1 h-3 text-gray-400';

    const friendRef = db.collection('users').doc(friendId);
    const friendDoc = await friendRef.get();

    if (!friendDoc.exists) {
        addFriendStatus.textContent = 'User not found.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-red-400';
        return;
    }

    const currentUserRef = db.collection('users').doc(currentUser.uid);
    await currentUserRef.update({
        friends: firebase.firestore.FieldValue.arrayUnion(friendId)
    });
    await friendRef.update({
        friends: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    
    addFriendStatus.textContent = 'Friend added!';
    addFriendStatus.className = 'text-xs mt-1 h-3 text-green-400';
    addFriendInput.value = '';
    setTimeout(() => { addFriendStatus.textContent = ''; }, 2000);
};

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const profileUsernameInput = document.getElementById('profile-username-input');
    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const profileModal = document.getElementById('profile-modal');

    const newUsername = profileUsernameInput.value.trim();
    const newAvatarUrl = profileAvatarInput.value.trim();
    if (!newUsername) return;

    try {
        const user = auth.currentUser;
        await user.updateProfile({
            displayName: newUsername,
            photoURL: newAvatarUrl || currentUser.photoURL // Keep old one if new is empty
        });

        await db.collection('users').doc(user.uid).update({
            displayName: newUsername,
            photoURL: newAvatarUrl || currentUser.photoURL
        });
        
        // Update local state and UI
        currentUser.displayName = newUsername;
        currentUser.photoURL = newAvatarUrl || currentUser.photoURL;
        renderUserInfo();
        
        if (profileModal) profileModal.style.display = 'none';

    } catch(error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
    }
};

async function deleteServer(serverRef) {
  const channelsSnapshot = await serverRef.collection('channels').get();
  for (const channelDoc of channelsSnapshot.docs) {
    const messagesSnapshot = await channelDoc.ref.collection('messages').get();
    const batch = db.batch();
    messagesSnapshot.forEach(msgDoc => {
      batch.delete(msgDoc.ref);
    });
    await batch.commit();
    await channelDoc.ref.delete();
  }
  await serverRef.delete();
  console.log(`Server ${serverRef.id} and all its content have been deleted.`);
}

const handleLeaveServer = async () => {
    if (!activeServerId || !currentUser) return;
    const serverRef = db.collection('servers').doc(activeServerId);
    const serverDoc = await serverRef.get();
    if (!serverDoc.exists) return;

    const serverName = serverDoc.data().name;

    if (confirm(`Are you sure you want to leave ${serverName}?`)) {
        try {
            await serverRef.update({
                members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            });

            const updatedServerDoc = await serverRef.get();
            if (updatedServerDoc.exists) {
                const members = updatedServerDoc.data().members || [];
                if (members.length === 0) {
                    console.log(`Server ${serverName} is now empty. Deleting...`);
                    await deleteServer(serverRef);
                }
            }
            
            selectHome();
        } catch (error) {
            console.error("Error leaving server:", error);
            alert("Failed to leave server.");
        }
    }
};

const handleInviteFriend = async (e) => {
    e.preventDefault();
    const friendCodeInput = document.getElementById('friend-code-input');
    const inviteStatusMessage = document.getElementById('invite-status-message');
    const inviteModal = document.getElementById('invite-modal');

    const friendId = friendCodeInput.value.trim();
    if (!friendId || !activeServerId) return;

    inviteStatusMessage.textContent = 'Sending...';
    inviteStatusMessage.className = 'text-sm mt-2 h-4 text-gray-400';

    try {
        const userDoc = await db.collection('users').doc(friendId).get();
        if (!userDoc.exists) {
            inviteStatusMessage.textContent = 'User not found.';
            inviteStatusMessage.className = 'text-sm mt-2 h-4 text-red-400';
            return;
        }
        
        const serverRef = db.collection('servers').doc(activeServerId);
        await serverRef.update({
            members: firebase.firestore.FieldValue.arrayUnion(friendId)
        });

        inviteStatusMessage.textContent = `Invite sent to ${userDoc.data().displayName}!`;
        inviteStatusMessage.className = 'text-sm mt-2 h-4 text-green-400';
        friendCodeInput.value = '';
        setTimeout(() => { if (inviteModal) inviteModal.style.display = 'none'; }, 2000);

    } catch (error) {
        console.error("Error sending invite:", error);
        inviteStatusMessage.textContent = 'Failed to send invite.';
        inviteStatusMessage.className = 'text-sm mt-2 h-4 text-red-400';
    }
};

// =================================================================================
// Event Listeners Setup
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements once the document is loaded
    const loginButton = document.getElementById('login-button');
    const messageForm = document.getElementById('message-form');
    const addServerForm = document.getElementById('add-server-form');
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const inviteForm = document.getElementById('invite-form');
    const leaveServerButton = document.getElementById('leave-server-button');
    const addFriendForm = document.getElementById('add-friend-form');
    const showSigninLink = document.getElementById('show-signin-link');
    const showSignupLink = document.getElementById('show-signup-link');
    const cancelAddServerButton = document.getElementById('cancel-add-server');
    const addServerModal = document.getElementById('add-server-modal');
    const serverNameInput = document.getElementById('server-name-input');
    const userInfoPanel = document.getElementById('user-info-panel');
    const userInfoPanelHome = document.getElementById('user-info-panel-home');
    const cancelProfileChangesButton = document.getElementById('cancel-profile-changes');
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    const profileUsernameInput = document.getElementById('profile-username-input');
    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const friendCodeDisplay = document.getElementById('friend-code-display');
    const serverSettingsButton = document.getElementById('server-settings-button');
    const serverSettingsDropdown = document.getElementById('server-settings-dropdown');
    const inviteButton = document.getElementById('invite-button');
    const inviteModal = document.getElementById('invite-modal');
    const inviteServerName = document.getElementById('invite-server-name');
    const cancelInviteButton = document.getElementById('cancel-invite-button');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Attach event listeners, with checks to prevent errors if an element is missing
    if (loginButton) loginButton.addEventListener('click', signInWithGoogle);
    if (messageForm) messageForm.addEventListener('submit', handleSendMessage);
    if (addServerForm) addServerForm.addEventListener('submit', handleCreateServer);
    if (signupForm) signupForm.addEventListener('submit', handleSignUp);
    if (signinForm) signinForm.addEventListener('submit', handleSignIn);
    if (inviteForm) inviteForm.addEventListener('submit', handleInviteFriend);
    if (leaveServerButton) leaveServerButton.addEventListener('click', handleLeaveServer);
    if (addFriendForm) addFriendForm.addEventListener('submit', handleAddFriend);

    if (showSigninLink) showSigninLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        signinForm.classList.remove('hidden');
        clearLoginError();
    });

    if (showSignupLink) showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        signinForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        clearLoginError();
    });

    if (cancelAddServerButton) cancelAddServerButton.addEventListener('click', () => {
        addServerModal.style.display = 'none';
        if (serverNameInput) serverNameInput.value = '';
    });

    if (addServerModal) addServerModal.addEventListener('click', (e) => {
        if (e.target === addServerModal) {
            addServerModal.style.display = 'none';
            if (serverNameInput) serverNameInput.value = '';
        }
    });

    const openProfileModal = () => {
        if (!currentUser) return;
        if (profileUsernameInput) profileUsernameInput.value = currentUser.displayName;
        if (profileAvatarInput) profileAvatarInput.value = currentUser.photoURL;
        if (friendCodeDisplay) friendCodeDisplay.textContent = currentUser.uid;
        if (profileModal) profileModal.style.display = 'flex';
    };

    if (userInfoPanel) userInfoPanel.addEventListener('click', openProfileModal);
    if (userInfoPanelHome) userInfoPanelHome.addEventListener('click', openProfileModal);

    if (cancelProfileChangesButton) cancelProfileChangesButton.addEventListener('click', () => {
        if (profileModal) profileModal.style.display = 'none';
    });

    if (profileModal) profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });
    if (profileForm) profileForm.addEventListener('submit', handleUpdateProfile);

    if (serverSettingsButton) serverSettingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (serverSettingsDropdown) serverSettingsDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        if (serverSettingsDropdown && !serverSettingsDropdown.classList.contains('hidden')) {
            serverSettingsDropdown.classList.add('hidden');
        }
    });

    if (inviteButton) inviteButton.addEventListener('click', async () => {
        const serverDoc = await db.collection('servers').doc(activeServerId).get();
        if (inviteServerName) inviteServerName.textContent = serverDoc.data().name;
        const friendCodeInput = document.getElementById('friend-code-input');
        const inviteStatusMessage = document.getElementById('invite-status-message');
        if (friendCodeInput) friendCodeInput.value = '';
        if (inviteStatusMessage) inviteStatusMessage.textContent = '';
        if (inviteModal) inviteModal.style.display = 'flex';
    });

    if (cancelInviteButton) cancelInviteButton.addEventListener('click', () => {
        if (inviteModal) inviteModal.style.display = 'none';
    });
    
    if (inviteModal) inviteModal.addEventListener('click', (e) => {
        if (e.target === inviteModal) {
            inviteModal.style.display = 'none';
        }
    });

    if (messageInput) messageInput.addEventListener('input', () => {
        if (sendButton) sendButton.disabled = !messageInput.value.trim();
    });
    if (sendButton) sendButton.disabled = true;
});