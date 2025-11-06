// FIX: Declare firebase as a global variable to resolve "Cannot find name 'firebase'" errors.
declare var firebase: any;

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
const serverNameText = document.getElementById('server-name-text');
const channelList = document.getElementById('channel-list');
const userInfoPanel = document.getElementById('user-info-panel') as HTMLButtonElement;
const chatPanel = document.getElementById('chat-panel');
const placeholderView = document.getElementById('placeholder-view');
const chatView = document.getElementById('chat-view');
const chatHeader = document.getElementById('chat-header');
const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const userListAside = document.getElementById('user-list-aside');
const addServerModal = document.getElementById('add-server-modal');
const addServerForm = document.getElementById('add-server-form');
const cancelAddServerButton = document.getElementById('cancel-add-server');
const serverNameInput = document.getElementById('server-name-input') as HTMLInputElement;
const appErrorOverlay = document.getElementById('app-error-overlay');
const appErrorMessage = document.getElementById('app-error-message');
const appErrorTitle = document.getElementById('app-error-title');

// Email Auth Elements
const signupForm = document.getElementById('signup-form') as HTMLFormElement;
const signinForm = document.getElementById('signin-form') as HTMLFormElement;
const signupEmailInput = document.getElementById('signup-email') as HTMLInputElement;
const signupPasswordInput = document.getElementById('signup-password') as HTMLInputElement;
const signinEmailInput = document.getElementById('signin-email') as HTMLInputElement;
const signinPasswordInput = document.getElementById('signin-password') as HTMLInputElement;
const showSigninLink = document.getElementById('show-signin-link');
const showSignupLink = document.getElementById('show-signup-link');

// Profile Modal Elements
const profileModal = document.getElementById('profile-modal');
const profileForm = document.getElementById('profile-form') as HTMLFormElement;
const profileUsernameInput = document.getElementById('profile-username-input') as HTMLInputElement;
const profileAvatarInput = document.getElementById('profile-avatar-input') as HTMLInputElement;
const friendCodeDisplay = document.getElementById('friend-code-display');
const cancelProfileChangesButton = document.getElementById('cancel-profile-changes');

// Server Dropdown Elements
const serverSettingsButton = document.getElementById('server-settings-button');
const serverSettingsDropdown = document.getElementById('server-settings-dropdown');
const inviteButton = document.getElementById('invite-button');
const leaveServerButton = document.getElementById('leave-server-button');

// Invite Modal Elements
const inviteModal = document.getElementById('invite-modal');
const inviteForm = document.getElementById('invite-form') as HTMLFormElement;
const inviteServerName = document.getElementById('invite-server-name');
const friendCodeInput = document.getElementById('friend-code-input') as HTMLInputElement;
const inviteStatusMessage = document.getElementById('invite-status-message');
const cancelInviteButton = document.getElementById('cancel-invite-button');


// =================================================================================
// App State
// =================================================================================
let currentUser: any = null;
let activeServerId: string | null = null;
let activeChannelId: string | null = null;
let messageUnsubscribe = () => {};
let channelUnsubscribe = () => {};
let usersUnsubscribe = () => {};
let serversUnsubscribe = () => {};

// =================================================================================
// Authentication
// =================================================================================
auth.onAuthStateChanged(async (user: any) => {
  if (user) {
    try {
        appErrorOverlay.classList.add('hidden');
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // First-time sign-in, create user profile
            const displayName = user.displayName || user.email.split('@')[0];
            const photoURL = user.photoURL || `https://picsum.photos/seed/${user.uid}/64/64`;

            if (!user.displayName || !user.photoURL) {
                await user.updateProfile({ displayName, photoURL });
            }
            
            await userDocRef.set({ displayName, photoURL, status: 'online' });
            currentUser = { uid: user.uid, displayName, photoURL };
        } else {
            // Existing user
            await userDocRef.update({ status: 'online' });
            const userData = userDoc.data();
            currentUser = { uid: user.uid, displayName: userData.displayName, photoURL: userData.photoURL };
        }
        
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        renderUserInfo();
        loadServers();
        setupPresence();

    } catch (error: any) {
        console.error("Firestore Error:", error);
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        if (error.code === 'permission-denied') {
            appErrorTitle.textContent = "Permission Denied";
            appErrorMessage.textContent = "Your database security rules are preventing access. Please update your Firestore rules to allow authenticated users to read and write data.";
        } else {
            appErrorTitle.textContent = "Connection Error";
            appErrorMessage.textContent = 'Failed to connect to the database. Please ensure Cloud Firestore has been created and configured in your Firebase project.';
        }
        appErrorOverlay.classList.remove('hidden');
    }
  } else {
    // User is signed out.
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ status: 'offline' }).catch((e: any) => console.error("Failed to update status on logout", e));
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
  }
});

const setupPresence = () => {
    const userStatusRef = db.collection('users').doc(currentUser.uid);
    window.addEventListener('beforeunload', () => {
        userStatusRef.update({ status: 'offline' });
    });
}

const showLoginError = (message: string) => {
    if (loginErrorContainer) {
        loginErrorContainer.textContent = message;
        loginErrorContainer.classList.remove('hidden');
    }
};

const clearLoginError = () => {
    if (loginErrorContainer) {
        loginErrorContainer.textContent = '';
        loginErrorContainer.classList.add('hidden');
    }
};

const signInWithGoogle = () => {
    clearLoginError();
    auth.signInWithPopup(provider).catch((error: any) => {
        let message = "An unknown error occurred during Google sign-in.";
        switch (error.code) {
            case 'auth/popup-closed-by-user': message = 'Sign-in cancelled.'; break;
            case 'auth/cancelled-popup-request': message = 'Sign-in cancelled.'; break;
        }
        showLoginError(message);
    });
};

const handleSignUp = async (e: Event) => {
    e.preventDefault();
    clearLoginError();
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error: any) {
        let message = "An unknown error occurred.";
        switch (error.code) {
            case 'auth/email-already-in-use': message = 'An account with this email already exists.'; break;
            case 'auth/invalid-email': message = 'Please enter a valid email.'; break;
            case 'auth/weak-password': message = 'Password must be at least 6 characters.'; break;
        }
        showLoginError(message);
    }
};

const handleSignIn = async (e: Event) => {
    e.preventDefault();
    clearLoginError();
    const email = signinEmailInput.value;
    const password = signinPasswordInput.value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error: any) {
        let message = "An unknown error occurred.";
        switch(error.code) {
            case 'auth/user-not-found': message = 'No account found with this email.'; break;
            case 'auth/wrong-password': message = 'Incorrect password.'; break;
            case 'auth/invalid-email': message = 'Please enter a valid email.'; break;
        }
        showLoginError(message);
    }
};

const signOut = () => auth.signOut().catch((error: any) => console.error("Sign out error", error));

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

const renderServers = (servers: any[]) => {
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

const renderChannels = (server: any, channels: any[]) => {
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

const renderMessages = (messages: any[]) => {
    messageList.innerHTML = '';
    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = 'flex p-4 hover:bg-gray-800/50';
        const timestamp = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'sending...';
        messageEl.innerHTML = `
            <img src="${msg.user.photoURL}" alt="${msg.user.displayName}" class="w-10 h-10 rounded-full mr-4 mt-1" />
            <div>
                <div class="flex items-baseline">
                    <span class="font-semibold text-white mr-2">${msg.user.displayName}</span>
                    <span class="text-xs text-gray-500">${timestamp}</span>
                </div>
                <p class="text-gray-200 whitespace-pre-wrap">${msg.text}</p>
            </div>
        `;
        messageList.appendChild(messageEl);
    });
    messageList.scrollTop = messageList.scrollHeight;
};

const renderUsers = (users: any[]) => {
    userListAside.innerHTML = `<h3 class="text-xs font-bold uppercase text-gray-400 px-2 pt-2 pb-1">Members — ${users.length}</h3>`;
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
    if (serversUnsubscribe) serversUnsubscribe();
    if (!currentUser) return;

    serversUnsubscribe = db.collection('servers')
        .where('members', 'array-contains', currentUser.uid)
        .orderBy('createdAt')
        .onSnapshot((snapshot: any) => {
            const userServers = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            renderServers(userServers);

            if (!activeServerId && userServers.length > 0) {
                selectServer(userServers[0].id);
            } else if (userServers.length === 0) {
                activeServerId = null;
                activeChannelId = null;
                channelListPanel.style.display = 'none';
                placeholderView.style.display = 'flex';
                chatView.style.display = 'none';
            } else if (activeServerId && !userServers.some(s => s.id === activeServerId)) {
                // If the active server was deleted or left, reset view
                activeServerId = null;
                activeChannelId = null;
                channelListPanel.style.display = 'none';
                placeholderView.style.display = 'flex';
                chatView.style.display = 'none';
                if (userServers.length > 0) {
                    selectServer(userServers[0].id);
                }
            }
        });
};


const selectServer = async (serverId: string) => {
  if (activeServerId === serverId && channelListPanel.style.display !== 'none') return;

  activeServerId = serverId;
  activeChannelId = null; 

  if(channelUnsubscribe) channelUnsubscribe();
  if(usersUnsubscribe) usersUnsubscribe();
  
  // Re-render servers to update active state
  db.collection('servers').where('members', 'array-contains', currentUser.uid).orderBy('createdAt').get().then((snapshot: any) => {
      const allUserServers = snapshot.docs.map((doc: any) => ({id: doc.id, ...doc.data()}));
      renderServers(allUserServers);
  });
  
  channelListPanel.style.display = 'flex';
  placeholderView.style.display = 'flex';
  chatView.style.display = 'none';
  placeholderView.innerHTML = `
    <div class="text-center text-gray-400">
        <h2 class="text-2xl font-bold">Select a channel</h2>
        <p class="mt-2">Pick a channel to see the conversation.</p>
    </div>
  `;

  const serverRef = db.collection('servers').doc(serverId);

  // Listener for server details (name) and members
  usersUnsubscribe = serverRef.onSnapshot(async (doc: any) => {
      if (doc.exists) {
          const serverData = doc.data();
          const memberUIDs = serverData.members || [];
          if (memberUIDs.length > 0) {
              const userDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', memberUIDs).get();
              const users = userDocs.docs.map((d: any) => ({ id: d.id, ...d.data() }));
              renderUsers(users);
          } else {
              renderUsers([]);
          }
      }
  });

  // Listener for channels in the server
  channelUnsubscribe = serverRef.collection('channels').orderBy('name').onSnapshot((snapshot: any) => {
      serverRef.get().then((serverDoc: any) => {
          if (!serverDoc.exists) return;
          const channels = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
          renderChannels(serverDoc.data(), channels);
          if (!activeChannelId && channels.length > 0) {
              selectChannel(channels[0].id);
          }
      });
  });
};

const selectChannel = (channelId: string) => {
  activeChannelId = channelId;
  if(messageUnsubscribe) messageUnsubscribe();

  placeholderView.style.display = 'none';
  chatView.style.display = 'flex';
  
  const channelRef = db.collection('servers').doc(activeServerId).collection('channels').doc(channelId);
  
  channelRef.get().then((doc: any) => {
      if (doc.exists) {
        const channelData = doc.data();
        chatHeader.innerHTML = `
            <svg class="w-6 h-6 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10 9h4V7h-4v2zm-2 4h4v-2H8v2zm10-4v2h-4V9h4zm2-2h-4V5h4v2zm-4 8h4v-2h-4v2zm-2-4h-4v2h4v-2zm-2 4h2v2h-2v-2zm-6-4H4v2h2v-2zM6 7H4v2h2V7zm10 10v-2h-4v2h4zm-6 0v-2H8v2h2z"></path></svg>
            <h2 class="font-semibold text-lg text-white">${channelData.name}</h2>
        `;
        messageInput.placeholder = `Message #${channelData.name}`;
      }
  });

  messageUnsubscribe = channelRef.collection('messages').orderBy('timestamp', 'asc').onSnapshot((snapshot: any) => {
      const messages = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      renderMessages(messages);
    });

  // Re-render channels to show active state
  db.collection('servers').doc(activeServerId).get().then((serverDoc: any) => {
      db.collection('servers').doc(activeServerId).collection('channels').orderBy('name').get().then((channelDocs: any) => {
          renderChannels(serverDoc.data(), channelDocs.docs.map((d: any) => ({id: d.id, ...d.data()})));
      });
  });
};

const handleSendMessage = (e: Event) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text && activeServerId && activeChannelId && currentUser) {
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

const handleCreateServer = async (e: Event) => {
    e.preventDefault();
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
        addServerModal.style.display = 'none';
        selectServer(newServerRef.id);
    }
};

const handleUpdateProfile = async (e: Event) => {
    e.preventDefault();
    const newUsername = profileUsernameInput.value.trim();
    const newAvatarUrl = profileAvatarInput.value.trim();
    if (!newUsername) return;

    try {
        const user = auth.currentUser;
        await user.updateProfile({
            displayName: newUsername,
            photoURL: newAvatarUrl || currentUser.photoURL 
        });

        await db.collection('users').doc(user.uid).update({
            displayName: newUsername,
            photoURL: newAvatarUrl || currentUser.photoURL
        });
        
        currentUser.displayName = newUsername;
        currentUser.photoURL = newAvatarUrl || currentUser.photoURL;
        renderUserInfo();
        
        profileModal.style.display = 'none';

    } catch(error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
    }
};

const handleLeaveServer = async () => {
    if (!activeServerId || !currentUser) return;
    
    const serverDoc = await db.collection('servers').doc(activeServerId).get();
    const serverName = serverDoc.data().name;

    if (confirm(`Are you sure you want to leave ${serverName}?`)) {
        try {
            const serverRef = db.collection('servers').doc(activeServerId);
            await serverRef.update({
                members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            });
        } catch (error) {
            console.error("Error leaving server:", error);
            alert("Failed to leave server.");
        }
    }
};

const handleInviteFriend = async (e: Event) => {
    e.preventDefault();
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
        setTimeout(() => { inviteModal.style.display = 'none'; }, 2000);

    } catch (error) {
        console.error("Error sending invite:", error);
        inviteStatusMessage.textContent = 'Failed to send invite.';
        inviteStatusMessage.className = 'text-sm mt-2 h-4 text-red-400';
    }
};

// =================================================================================
// Event Listeners
// =================================================================================
loginButton.addEventListener('click', signInWithGoogle);
logoutButton.addEventListener('click', signOut);
messageForm.addEventListener('submit', handleSendMessage);
addServerForm.addEventListener('submit', handleCreateServer);
signupForm.addEventListener('submit', handleSignUp);
signinForm.addEventListener('submit', handleSignIn);
inviteForm.addEventListener('submit', handleInviteFriend);
leaveServerButton.addEventListener('click', handleLeaveServer);

showSigninLink.addEventListener('click', (e: Event) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    signinForm.classList.remove('hidden');
    clearLoginError();
});

showSignupLink.addEventListener('click', (e: Event) => {
    e.preventDefault();
    signinForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    clearLoginError();
});

cancelAddServerButton.addEventListener('click', () => {
    addServerModal.style.display = 'none';
    serverNameInput.value = '';
});
addServerModal.addEventListener('click', (e: MouseEvent) => {
    if (e.target === addServerModal) {
        addServerModal.style.display = 'none';
        serverNameInput.value = '';
    }
});

// Profile Modal Listeners
userInfoPanel.addEventListener('click', () => {
    profileUsernameInput.value = currentUser.displayName;
    profileAvatarInput.value = currentUser.photoURL;
    friendCodeDisplay.textContent = currentUser.uid;
    profileModal.style.display = 'flex';
});

cancelProfileChangesButton.addEventListener('click', () => {
    profileModal.style.display = 'none';
});

profileModal.addEventListener('click', (e: MouseEvent) => {
    if (e.target === profileModal) {
        profileModal.style.display = 'none';
    }
});
profileForm.addEventListener('submit', handleUpdateProfile);

// Server Settings Dropdown
serverSettingsButton.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    serverSettingsDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => {
    if (!serverSettingsDropdown.classList.contains('hidden')) {
        serverSettingsDropdown.classList.add('hidden');
    }
});

// Invite Modal
inviteButton.addEventListener('click', async () => {
    const serverDoc = await db.collection('servers').doc(activeServerId).get();
    inviteServerName.textContent = serverDoc.data().name;
    friendCodeInput.value = '';
    inviteStatusMessage.textContent = '';
    inviteModal.style.display = 'flex';
});
cancelInviteButton.addEventListener('click', () => {
    inviteModal.style.display = 'none';
});
inviteModal.addEventListener('click', (e: MouseEvent) => {
    if (e.target === inviteModal) {
        inviteModal.style.display = 'none';
    }
});

messageInput.addEventListener('input', () => {
    sendButton.disabled = !messageInput.value.trim();
});
sendButton.disabled = true; // Initially disable

// FIX: This file is treated as a script when it has no imports or exports,
// causing its declarations to be in the global scope. This conflicts with
// declarations in other files (e.g., index.js). By adding an empty export,
// we convert this file into a module, scoping its declarations locally.
export {};