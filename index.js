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
// DOM Element References
// =================================================================================
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginButton = document.getElementById('login-button');
const loginErrorContainer = document.getElementById('login-error-container');
const logoutButton = document.getElementById('logout-button');
const serverList = document.getElementById('server-list');
const channelListPanel = document.getElementById('channel-list-panel');
const serverNameHeader = document.getElementById('server-name-header');
const channelList = document.getElementById('channel-list');
const userInfoPanel = document.getElementById('user-info-panel');
const chatPanel = document.getElementById('chat-panel');
const placeholderView = document.getElementById('placeholder-view');
const chatView = document.getElementById('chat-view');
const chatHeader = document.getElementById('chat-header');
const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const userListAside = document.getElementById('user-list-aside');
const addServerModal = document.getElementById('add-server-modal');
const addServerForm = document.getElementById('add-server-form');
const cancelAddServerButton = document.getElementById('cancel-add-server');
const serverNameInput = document.getElementById('server-name-input');
const appErrorOverlay = document.getElementById('app-error-overlay');
const appErrorMessage = document.getElementById('app-error-message');


// =================================================================================
// App State
// =================================================================================
let currentUser = null;
let activeServerId = null;
let activeChannelId = null;
let messageUnsubscribe = () => {};
let channelUnsubscribe = () => {};
let usersUnsubscribe = () => {};

// =================================================================================
// Authentication
// =================================================================================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      // Hide any previous errors on a new sign-in attempt
      appErrorOverlay.classList.add('hidden');

      // User is signed in.
      currentUser = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      // This is the first interaction with Firestore. If it fails, the user likely hasn't created the database.
      await db.collection('users').doc(user.uid).set({
        displayName: user.displayName,
        photoURL: user.photoURL,
        status: 'online',
      }, { merge: true });

      loginView.classList.add('hidden');
      appView.classList.remove('hidden');
      renderUserInfo();
      loadServers();
    } catch (error) {
        console.error("Firestore connection error:", error);
        // Show the main app view but cover it with an error overlay
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        appErrorMessage.textContent = 'Failed to connect to the database. Please ensure Cloud Firestore has been created in your Firebase project console and the security rules are correctly configured.';
        appErrorOverlay.classList.remove('hidden');
    }
  } else {
    // User is signed out.
    currentUser = null;
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
     // Ensure error overlay is hidden on logout
    appErrorOverlay.classList.add('hidden');
  }
});

const signIn = () => {
    // Hide previous errors
    if (loginErrorContainer) {
        loginErrorContainer.classList.add('hidden');
        loginErrorContainer.textContent = '';
    }

    auth.signInWithPopup(provider).catch((error) => {
        console.error("Sign in error", error);
        if (loginErrorContainer) {
            let message = "An unknown error occurred. Please try again.";
            switch (error.code) {
                case 'auth/operation-not-supported-in-this-environment':
                    message = 'Sign-in is not supported here. Ensure you are running from a web server (not a local file) and that popups are enabled.';
                    break;
                case 'auth/popup-closed-by-user':
                    message = 'Sign-in cancelled. The popup was closed before completion.';
                    break;
                case 'auth/cancelled-popup-request':
                    message = 'Sign-in cancelled because another popup was opened.';
                    break;
            }
            loginErrorContainer.textContent = message;
            loginErrorContainer.classList.remove('hidden');
        }
    });
};
const signOut = () => auth.signOut().catch((error) => console.error("Sign out error", error));

// =================================================================================
// UI Rendering Functions
// =================================================================================
const renderUserInfo = () => {
  if (!currentUser) return;
  userInfoPanel.innerHTML = `
    <div class="relative mr-2">
        <img src="${currentUser.photoURL}" alt="${currentUser.displayName}" class="w-10 h-10 rounded-full"/>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
    </div>
    <div class="truncate">
        <p class="text-sm font-semibold text-white truncate">${currentUser.displayName}</p>
        <p class="text-xs text-gray-400">Online</p>
    </div>
  `;
};

const renderServers = (servers) => {
    serverList.innerHTML = ''; // Clear existing servers
    servers.forEach(server => {
        const isActive = server.id === activeServerId;
        const serverIcon = document.createElement('div');
        serverIcon.className = "relative group mb-2";
        serverIcon.innerHTML = `
            <div class="absolute left-0 h-0 w-1 bg-white rounded-r-full transition-all duration-200 ${isActive ? 'h-10' : 'group-hover:h-5'}"></div>
            <button class="flex items-center justify-center w-12 h-12 rounded-3xl transition-all duration-200 group-hover:rounded-2xl ${isActive ? 'bg-blue-500 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500'} focus:outline-none">
                <img src="${server.iconUrl}" alt="${server.name}" class="w-full h-full object-cover rounded-3xl group-hover:rounded-2xl transition-all duration-200" />
            </button>
            <span class="absolute left-16 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">${server.name}</span>
        `;
        serverIcon.querySelector('button').onclick = () => selectServer(server.id);
        serverList.appendChild(serverIcon);
    });
    
    // Add "Add Server" button
    const addServerButton = document.createElement('div');
    addServerButton.innerHTML = `
      <div class="w-full border-t border-gray-700 my-2"></div>
      <button class="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-3xl hover:bg-green-500 hover:rounded-2xl transition-all duration-200 group focus:outline-none">
        <svg class="w-6 h-6 text-green-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </button>
    `;
    addServerButton.querySelector('button').onclick = () => addServerModal.style.display = 'flex';
    serverList.appendChild(addServerButton);
};

const renderChannels = (server, channels) => {
    serverNameHeader.textContent = server.name;
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

const renderMessages = (messages) => {
    messageList.innerHTML = '';
    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = 'flex p-4 hover:bg-gray-800/50';
        messageEl.innerHTML = `
            <img src="${msg.user.photoURL}" alt="${msg.user.displayName}" class="w-10 h-10 rounded-full mr-4 mt-1" />
            <div>
                <div class="flex items-baseline">
                    <span class="font-semibold text-white mr-2">${msg.user.displayName}</span>
                    <span class="text-xs text-gray-500">${new Date(msg.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p class="text-gray-200 whitespace-pre-wrap">${msg.text}</p>
            </div>
        `;
        messageList.appendChild(messageEl);
    });
    messageList.scrollTop = messageList.scrollHeight;
};

const renderUsers = (users) => {
    userListAside.innerHTML = `<h3 class="text-xs font-bold uppercase text-gray-400 px-2 pt-2 pb-1">Users — ${users.length}</h3>`;
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = "flex items-center justify-between p-2 rounded-md";
        userEl.innerHTML = `
            <div class="flex items-center">
                <div class="relative mr-3">
                    <img src="${user.photoURL}" alt="${user.displayName}" class="w-8 h-8 rounded-full" />
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

const loadServers = () => {
  db.collection('servers').orderBy('createdAt').onSnapshot(async (snapshot) => {
    if (snapshot.empty) {
        // Create a default server if none exist for a better first-time experience
        const defaultServerRef = db.collection('servers').doc('general');
        await defaultServerRef.set({ name: 'General Discussion', iconUrl: `https://picsum.photos/seed/general/64/64`, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        await defaultServerRef.collection('channels').doc('general').set({ name: 'general' });
        return;
    }
    const servers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderServers(servers);
    if (!activeServerId && servers.length > 0) {
      selectServer(servers[0].id);
    } else if (activeServerId) {
      // Re-render to update active state
      selectServer(activeServerId);
    }
  });
};

const selectServer = (serverId) => {
  if (activeServerId === serverId) return;

  activeServerId = serverId;
  activeChannelId = null; // Reset channel on server switch

  // Stop listening to old channels and users
  channelUnsubscribe();
  usersUnsubscribe();
  
  // Visually update servers
  const serverDocs = [];
  db.collection('servers').get().then((snapshot) => {
      snapshot.forEach((doc) => serverDocs.push({id: doc.id, ...doc.data()}));
      renderServers(serverDocs);
  });
  
  channelListPanel.style.display = 'flex';
  placeholderView.innerHTML = `
    <h2 class="text-2xl font-bold">Select a channel</h2>
    <p class="mt-2">Pick a channel to see the conversation.</p>
  `;
  placeholderView.style.display = 'flex';
  chatView.style.display = 'none';

  db.collection('servers').doc(serverId).get().then((doc) => {
    if (doc.exists) {
      const serverData = doc.data();
      channelUnsubscribe = db.collection('servers').doc(serverId).collection('channels').onSnapshot((snapshot) => {
        const channels = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        renderChannels(serverData, channels);
        if (!activeChannelId && channels.length > 0) {
          selectChannel(channels[0].id);
        }
      });
    }
  });

  usersUnsubscribe = db.collection('users').onSnapshot((snapshot) => {
      const users = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      renderUsers(users);
  });

};

const selectChannel = (channelId) => {
  activeChannelId = channelId;
  
  // Unsubscribe from previous channel's messages
  messageUnsubscribe();

  placeholderView.style.display = 'none';
  chatView.style.display = 'flex';
  
  db.collection('servers').doc(activeServerId).collection('channels').doc(channelId).get().then((doc) => {
      if (doc.exists) {
        const channelData = doc.data();
        chatHeader.innerHTML = `
            <svg class="w-6 h-6 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10 9h4V7h-4v2zm-2 4h4v-2H8v2zm10-4v2h-4V9h4zm2-2h-4V5h4v2zm-4 8h4v-2h-4v2zm-2-4h-4v2h4v-2zm-2 4h2v2h-2v-2zm-6-4H4v2h2v-2zM6 7H4v2h2V7zm10 10v-2h-4v2h4zm-6 0v-2H8v2h2z"></path></svg>
            <h2 class="font-semibold text-lg text-white">${channelData.name}</h2>
        `;
        messageInput.placeholder = `Message #${channelData.name}`;
      }
  });

  messageUnsubscribe = db.collection('servers').doc(activeServerId).collection('channels').doc(channelId)
    .collection('messages').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
      const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderMessages(messages);
    });

  // Re-render channels to show active state
  db.collection('servers').doc(activeServerId).get().then((serverDoc) => {
      db.collection('servers').doc(activeServerId).collection('channels').get().then((channelDocs) => {
          renderChannels(serverDoc.data(), channelDocs.docs.map((d) => ({id: d.id, ...d.data()})));
      });
  });
};

const handleSendMessage = (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text && activeChannelId && currentUser) {
    db.collection('servers').doc(activeServerId).collection('channels').doc(activeChannelId).collection('messages').add({
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      user: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      }
    });
    messageInput.value = '';
  }
};

const handleCreateServer = async (e) => {
    e.preventDefault();
    const serverName = serverNameInput.value.trim();
    if(serverName && currentUser) {
        const newServer = await db.collection('servers').add({
            name: serverName,
            iconUrl: `https://picsum.photos/seed/${Date.now()}/64/64`,
            owner: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await db.collection('servers').doc(newServer.id).collection('channels').doc('general').set({
            name: 'general'
        });
        
        serverNameInput.value = '';
        addServerModal.style.display = 'none';
        selectServer(newServer.id);
    }
};


// =================================================================================
// Event Listeners
// =================================================================================
loginButton.addEventListener('click', signIn);
logoutButton.addEventListener('click', signOut);
messageForm.addEventListener('submit', handleSendMessage);
addServerForm.addEventListener('submit', handleCreateServer);
cancelAddServerButton.addEventListener('click', () => {
    addServerModal.style.display = 'none';
    serverNameInput.value = '';
});
// Close modal on outside click
addServerModal.addEventListener('click', (e) => {
    if (e.target === addServerModal) {
        addServerModal.style.display = 'none';
        serverNameInput.value = '';
    }
});

messageInput.addEventListener('input', () => {
    sendButton.disabled = !messageInput.value.trim();
});
sendButton.disabled = true; // Initially disable