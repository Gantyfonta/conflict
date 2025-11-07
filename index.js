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
const FAKE_ADS = [
    { title: 'Conflict Nitro', body: 'Supercharge your chat experience with custom emojis and more!', link: 'nitro.html' },
    { title: 'Gamer GeaR', body: 'Get the latest hardware to dominate the competition.', link: 'gamer.html' },
    { title: 'Server Boosts', body: 'Level up your server with powerful perks.', link: 'boosts.html' },
    { title: 'Learn to Code', body: 'Join our bootcamp and become a master developer in weeks!', link: 'learncode.html' },
    { title: 'Buy Crypto!', body: 'To the moon! Invest in the future of finance today.', link: 'crypto.html' },
    { title: 'Singles In Your Area', body: 'Tired of being alone? Meet other gamers near you now!', link: 'singles.html' },
];
const COMMANDS = [
    { command: '/ad', params: 'yes|no', description: 'Toggle advertisement visibility.' },
    { command: '/tetris', params: '', description: 'Play a game of Tetris.' },
    { command: '/coinflip', params: '', description: 'Flip a coin.' },
    { command: '/dice', params: '', description: 'Roll a 6-sided die.' },
    { command: '/shrug', params: '', description: 'Insert the shrug emoticon.' },
    { command: '/italic', params: '<message>', description: 'Send your message in italics.' },
    { command: '/bold', params: '<message>', description: 'Send your message in bold.' },
    { command: '/font', params: '<font> <message>', description: 'Send message in a specific font.' },
    { command: '/size', params: '<num> <message>', description: 'Change text size (authorized users only).', restricted: true },
];
const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚',
  '🙂', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
  '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟',
  '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '😳', '🤪', '😵', '😡', '😠', '🤬',
  '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹',
  '👺', '💀', '👻', '👽', '🤖', '💩', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🙏', '👏', '🙌', '🤝', '💪', '🤘', '✌️', '🤞', '👌', '👈', '👉', '👆', '👇', '✋', '🤚', '🖐️', '🖖',
'👋', '🤙', '💅', '🤳', '💃', '🕺', '👯‍♀️', '👯‍♂️', '🧍', '🧎', '👫', '👭', '👬', '💏', '💑',
'👪', '🧑‍🤝‍🧑', '👩‍❤️‍👩', '👨‍❤️‍👨', '👩‍❤️‍👨', '💋', '💘', '💝', '💖', '💗', '💓', '💞',
'💕', '💌', '💟', '❣️', '💔', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '💭', '🗯️', '💤',
'👀', '👁️', '👅', '👄', '🧠', '🫀', '🫁', '👣', '🖐', '✍️', '🙏🏻', '🙏🏼', '🙏🏽', '🙏🏾', '🙏🏿',
'👕', '👖', '🧥', '👔', '👗', '👙', '👚', '👘', '🥻', '🩱', '🩲', '🩳', '👠', '👡', '👢', '🥿',
'👞', '👟', '🩴', '🧦', '🧤', '🧣', '🎩', '🧢', '👒', '🎓', '⛑️', '🪖', '👑', '💍', '💎', '🔔',
'📿', '💄', '💼', '👜', '👝', '👛', '🛍️', '🎒', '🩸', '🩹', '🩺', '🩻', '🪣', '🧴', '🧷', '🧹',
'🧺', '🧻', '🚽', '🚿', '🛁', '🪥', '🪒', '🪞', '🪟', '🪑', '🛋️', '🛏️', '🛌', '🪟', '🚪', '🪜',
'🖼️', '🧸', '🪆', '🪅', '🎁', '🎈', '🎉', '🎊', '🎂', '🍰', '🧁', '🥧', '🍩', '🍪', '🍫', '🍬',
'🍭', '🍮', '🍯', '☕', '🍵', '🥛', '🧃', '🧉', '🍺', '🍻', '🍷', '🥂', '🥃', '🍸', '🍹', '🍾',
'🍽️', '🍴', '🥄', '🔪', '🏺', '🌍', '🌎', '🌏', '🌕', '🌙', '⭐', '🌟', '⚡', '🔥', '💧', '🌈',
'☁️', '🌤️', '⛈️', '🌧️', '❄️', '☃️', '🌬️', '🌪️', '🌊', '🌋', '🌻', '🌹', '🌷', '🌼', '🌸', '💐',
'🍀', '🌴', '🌲', '🌳', '🌵', '🍁', '🍂', '🍃', '🪴', '🍄', '🐚', '🪸', '🐾', '🦋', '🐝', '🐞',
'🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓',
'🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑',
'🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🦚', '🕊️', '🐇', '🐁', '🐀', '🐿️', '🦔', '🐉', '🐲',
'🌵', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐',
'🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜',
'🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕',
'🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍢',
'🍡', '🍧', '🍨', '🍦', '🍰', '🎂', '🍮', '🍯', '🍶', '🍵', '🥤', '🧋', '🧊', '🍾', '🍷', '🍺',
'⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🥍', '🏹',
'🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛷️', '🏂', '🏋️', '🤸', '⛹️', '🏌️', '🏇', '🏄',
'🚣', '🏊', '🤽', '🚴', '🚵', '🧗', '🪂', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️', '🏵️', '🎫',
'🎟️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🪕', '🎮', '🕹️',
'🎰', '🎲', '🧩', '♟️', '🎯', '🎳', '🪀', '🪁', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
'🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍',
'🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚝', '🚄', '🚅', '🚈', '🚞', '🚆', '🚇', '🚊', '🚉',
'🛫', '🛬', '🛩️', '🛰️', '🚀', '🛸', '🚁', '⚓', '🛳️', '⛴️', '🚢', '🛶', '⛵', '🚤', '🪝', '🪵',
'🏠', '🏡', '🏘️', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏬', '🏛️', '⛪', '🕌', '🛕',
'🕍', '⛩️', '🕋', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛺', '🌁', '🌉', '🌆', '🌇',
'🌃', '🌌', '🌠', '🎇', '🎆', '🌅', '🌄', '🏞️', '🌲', '🌳', '🏜️', '🏝️', '🏖️', '🏕️', '🪨', '🪵'

];

const tetrisHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Tetris</title>
    <style>
        body { background: #202028; color: #fff; font-family: sans-serif; font-size: 1.5em; text-align: center; margin: 0; padding-top: 1em;}
        #game-container { display: flex; justify-content: center; align-items: flex-start; gap: 20px;}
        canvas { border: solid .2em #fff; }
        #score-container { display: flex; flex-direction: column; align-items: center; }
        #score-title { font-size: 0.8em; color: #aaa; margin-bottom: 0.5em;}
    </style>
</head>
<body>
    <div id="game-container">
        <canvas id="tetris" width="240" height="400"></canvas>
        <div id="score-container">
            <div id="score-title">SCORE</div>
            <div id="score">0</div>
        </div>
    </div>
    <script>
        const canvas = document.getElementById('tetris');
        const context = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        context.scale(20, 20);

        function arenaSweep() {
            let rowCount = 1;
            outer: for (let y = arena.length - 1; y > 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) {
                        continue outer;
                    }
                }
                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++y;
                player.score += rowCount * 10;
                rowCount *= 2;
            }
            scoreElement.innerText = player.score;
        }

        function collide(arena, player) {
            const [m, o] = [player.matrix, player.pos];
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 &&
                       (arena[y + o.y] &&
                        arena[y + o.y][x + o.x]) !== 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        function createMatrix(w, h) {
            const matrix = [];
            while (h--) {
                matrix.push(new Array(w).fill(0));
            }
            return matrix;
        }

        function createPiece(type) {
            if (type === 'T') return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
            if (type === 'O') return [[2, 2], [2, 2]];
            if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
            if (type === 'J') return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
            if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
            if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
            if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
        }

        function draw() {
            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);
            drawMatrix(arena, {x: 0, y: 0});
            drawMatrix(player.matrix, player.pos);
        }

        function drawMatrix(matrix, offset) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        context.fillStyle = colors[value];
                        context.fillRect(x + offset.x, y + offset.y, 1, 1);
                    }
                });
            });
        }

        function merge(arena, player) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        arena[y + player.pos.y][x + player.pos.x] = value;
                    }
                });
            });
        }

        function playerDrop() {
            player.pos.y++;
            if (collide(arena, player)) {
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
            }
            dropCounter = 0;
        }

        function playerMove(dir) {
            player.pos.x += dir;
            if (collide(arena, player)) {
                player.pos.x -= dir;
            }
        }

        function playerReset() {
            const pieces = 'ILJOTSZ';
            player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
            player.pos.y = 0;
            player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
            if (collide(arena, player)) {
                arena.forEach(row => row.fill(0));
                player.score = 0;
                scoreElement.innerText = player.score;
            }
        }

        function playerRotate(dir) {
            const pos = player.pos.x;
            let offset = 1;
            rotate(player.matrix, dir);
            while(collide(arena, player)) {
                player.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > player.matrix[0].length) {
                    rotate(player.matrix, -dir);
                    player.pos.x = pos;
                    return;
                }
            }
        }

        function rotate(matrix, dir) {
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
            if (dir > 0) {
                matrix.forEach(row => row.reverse());
            } else {
                matrix.reverse();
            }
        }

        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;
        function update(time = 0) {
            const deltaTime = time - lastTime;
            lastTime = time;
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                playerDrop();
            }
            draw();
            requestAnimationFrame(update);
        }

        const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
        const arena = createMatrix(12, 20);
        const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };

        document.addEventListener('keydown', event => {
            if (event.keyCode === 37) playerMove(-1); // left
            else if (event.keyCode === 39) playerMove(1); // right
            else if (event.keyCode === 40) playerDrop(); // down
            else if (event.keyCode === 81) playerRotate(-1); // q
            else if (event.keyCode === 87 || event.keyCode === 38) playerRotate(1); // w or up
        });

        playerReset();
        update();
    <\/script>
</body>
</html>
`;

const adminPanelHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #36393f; color: #dcddde; padding: 20px; margin: 0;}
        .container { max-width: 500px; margin: auto; background-color: #2f3136; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px 0 rgba(0,0,0,0.2); }
        h1 { text-align: center; color: #fff; margin-top: 0; }
        label { display: block; margin: 15px 0 5px; font-weight: 500; font-size: 12px; text-transform: uppercase; color: #b9bbbe; }
        input { width: 100%; padding: 10px; box-sizing: border-box; background-color: #202225; border: 1px solid #000; border-radius: 3px; color: #dcddde; font-size: 16px; }
        input:focus { border-color: #00b0f4; outline: none; }
        button { width: 100%; padding: 10px 16px; margin-top: 20px; background-color: #5865f2; color: white; border: none; border-radius: 3px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background-color .17s ease; }
        button:hover { background-color: #4752c4; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Admin Control Panel</h1>
        <div>
            <label for="user-id">User Friend Code</label>
            <input type="text" id="user-id" placeholder="Enter user's friend code...">
        </div>
        <div>
            <label for="link-url">Link to Open</label>
            <input type="url" id="link-url" placeholder="https://example.com">
        </div>
        <button id="run-button">Run</button>
    </div>
    <script>
        document.getElementById('run-button').addEventListener('click', () => {
            const url = document.getElementById('link-url').value;
            if (url) {
                try {
                    new URL(url); // Basic validation
                    window.open(url, '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes,toolbar=yes');
                } catch (_) {
                    alert('Please enter a valid URL (e.g., https://example.com)');
                }
            } else {
                alert('Please enter a link to open.');
            }
        });
    <\/script>
</body>
</html>
`;

const MIC_ON_SVG = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>`;
const MIC_OFF_SVG = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.08V5c0-1.657 1.343-3 3-3s3 1.343 3 3v.08m-6 0c0 1.657-1.343 3-3 3s-3-1.343-3-3v0m-1 8.917c1.333.604 2.89.917 4.5.917 1.61 0 3.167-.313 4.5-.917m-9 0v-1c0-2.21 1.79-4 4-4s4 1.79 4 4v1m-6 .08h.08a4.992 4.992 0 01-4.16 0H6"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"></path></svg>`;
const CAM_ON_SVG = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
const CAM_OFF_SVG = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"></path></svg>`;
const HANGUP_SVG = `<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.218,2.282a1.042,1.042,0,0,0-1.474,0l-1.7,1.7-2.31-2.31a3.03,3.03,0,0,0-4.286,0L2.282,6.839a3.03,3.03,0,0,0,0,4.286l3.3,3.3-2.24,2.24a1.042,1.042,0,0,0,0,1.474l3.78,3.78a1.042,1.042,0,0,0,1.474,0l2.24-2.24,3.3,3.3a3.03,3.03,0,0,0,4.286,0l4.834-4.834a3.03,3.03,0,0,0,0-4.286L17.218,2.282Z"></path></svg>`;


// =================================================================================
// App State
// =================================================================================
let currentUser = null;
let activeView = 'servers'; // 'servers' or 'home'
let activeServerId = null;
let activeServerData = null; // Cache for current server data
let activeChannelId = null; // Can be a server channel ID or a DM channel ID
let activeServerRoles = {};
let activeServerRoleOrder = [];
let activeServerMembers = {}; // { userId: { roles: [...] } }
let allServerUsers = []; // { id, displayName, photoURL, status }
let stagedFile = null;
let draggedRoleId = null;

// Unsubscribe listeners
let messageUnsubscribe = () => {};
let channelUnsubscribe = () => {};
let usersUnsubscribe = () => {};
let serversUnsubscribe = () => {};
let friendsUnsubscribe = () => {};
let callListenerUnsubscribe = () => {};
let currentCallUnsubscribe = () => {};
let invitationsUnsubscribe = () => {};


// WebRTC State
let peerConnection;
let localStream;
let remoteStream = new MediaStream();
let activeCallData = null;
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};


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
        
        await userDocRef.set({ displayName, photoURL, status: 'online', friends: [], blockedUsers: [] });
        currentUser = { uid: user.uid, displayName, photoURL, email: user.email, blockedUsers: [] };
      } else {
        await userDocRef.update({ status: 'online' });
        const userData = userDoc.data();
        currentUser = { uid: user.uid, displayName: userData.displayName, photoURL: userData.photoURL, email: user.email, blockedUsers: userData.blockedUsers || [] };
      }
      
      loginView.classList.add('hidden');
      appView.classList.remove('hidden');
      renderUserInfo();
      loadServers();
      loadFriends();
      setupPresence();
      setupCallListener();
      setupInvitationsListener();
      selectHome(); // Default to home view on login

      if (localStorage.getItem('adsEnabled') === 'true') {
          const homeAd = document.getElementById('home-ad-container');
          const channelAd = document.getElementById('channel-ad-container');
          displayRandomAd();
          homeAd?.classList.remove('hidden');
          channelAd?.classList.remove('hidden');
      }

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
    if(callListenerUnsubscribe) callListenerUnsubscribe();
    if(currentCallUnsubscribe) currentCallUnsubscribe();
    if(invitationsUnsubscribe) invitationsUnsubscribe();
    await hangUp();
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

/**
 * Validates if a string is a valid HTTP/HTTPS URL.
 * @param {string} string The string to validate.
 * @returns {boolean} True if the string is a valid URL, false otherwise.
 */
const isValidHttpUrl = (string) => {
    if (!string) return false;
    try {
        const newUrl = new URL(string);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (_) {
        return false;
    }
};

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}

function formatMessageText(text) {
    if (!text) return '';
    let escapedText = escapeHTML(text);
    const codeBlockRegex = /```txt\n([\s\S]*?)\n```/g;
    return escapedText.replace(codeBlockRegex, (match, codeContent) => {
        return `<pre class="bg-gray-900 p-2 rounded-md text-sm text-gray-300 whitespace-pre-wrap break-all mt-2"><code>${codeContent}</code></pre>`;
    });
}

const displayRandomAd = () => {
    const ad = FAKE_ADS[Math.floor(Math.random() * FAKE_ADS.length)];
    
    const adLinkIds = ['home-ad-link', 'channel-ad-link'];

    adLinkIds.forEach(id => {
        const linkEl = document.getElementById(id);
        if (linkEl) {
            linkEl.href = ad.link;
            const titleEl = linkEl.querySelector('[data-ad-title]');
            const bodyEl = linkEl.querySelector('[data-ad-body]');
            if (titleEl) titleEl.textContent = ad.title;
            if (bodyEl) bodyEl.textContent = ad.body;
        }
    });
};

const renderUserInfo = () => {
  if (!currentUser) return;
  const userInfoPanels = document.querySelectorAll('.user-info-panel');
  const avatarUrl = isValidHttpUrl(currentUser.photoURL) ? currentUser.photoURL : DEFAULT_AVATAR_SVG;

  const userInfoHTML = `
    <div class="relative mr-2">
        <img src="${avatarUrl}" alt="${currentUser.displayName}" class="w-10 h-10 rounded-full object-cover"/>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
    </div>
    <div class="truncate">
        <p class="text-sm font-semibold text-white truncate">${currentUser.displayName}</p>
        <p class="text-xs text-gray-400">Online</p>
    </div>
  `;
  userInfoPanels.forEach(panel => panel.innerHTML = userInfoHTML);
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
        const iconUrl = isValidHttpUrl(server.iconUrl) ? server.iconUrl : DEFAULT_AVATAR_SVG;
        serverIcon.innerHTML = `
            <div class="absolute left-0 h-0 w-1 bg-white rounded-r-full transition-all duration-200 ${isActive ? 'h-10' : 'group-hover:h-5'}"></div>
            <button class="flex items-center justify-center w-12 h-12 rounded-3xl transition-all duration-200 group-hover:rounded-2xl ${isActive ? 'bg-blue-500 rounded-2xl' : 'bg-gray-700 hover:bg-blue-500'} focus:outline-none">
                <img src="${iconUrl}" alt="${server.name}" class="w-full h-full object-cover rounded-3xl group-hover:rounded-2xl transition-all duration-200" />
            </button>
            <span class="absolute left-16 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">${escapeHTML(server.name)}</span>
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

    const hasModPerms = currentUserHasModPermissions();

    serverNameText.textContent = server.name;
    channelList.innerHTML = `
        <div class="flex items-center justify-between px-2 pt-2 pb-1">
            <h2 class="text-xs font-bold tracking-wider text-gray-400 uppercase">Text Channels</h2>
            ${hasModPerms ? `
            <button id="add-channel-button" class="text-gray-400 hover:text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </button>` : ''}
        </div>
    `;
    
    if (hasModPerms) {
        document.getElementById('add-channel-button').onclick = () => {
            const createChannelModal = document.getElementById('create-channel-modal');
            if(createChannelModal) createChannelModal.style.display = 'flex';
        };
    }
    
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
        const friendAvatarUrl = isValidHttpUrl(friend.photoURL) ? friend.photoURL : DEFAULT_AVATAR_SVG;
        friendEl.className = `flex items-center w-full px-2 py-1.5 text-left rounded-md transition-colors duration-150 ${isActive ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`;
        friendEl.innerHTML = `
            <div class="relative mr-2">
                <img src="${friendAvatarUrl}" alt="${friend.displayName}" class="w-8 h-8 rounded-full object-cover" data-userid="${friend.id}" />
                <div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-800 rounded-full"></div>
            </div>
            <span class="font-medium truncate" data-userid="${friend.id}">${friend.displayName}</span>
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

    const renderMessageContent = (msg) => {
        if (msg.html) {
            return msg.html; // Already safe HTML from a command
        }
        if (msg.text) {
            return formatMessageText(msg.text);
        }
        return '';
    };

    messages.forEach(msg => {
        if (currentUser.blockedUsers?.includes(msg.user.uid)) {
            const blockedMessageEl = document.createElement('div');
            blockedMessageEl.className = 'px-4 py-1 text-xs text-gray-500 italic hover:bg-gray-800/50 pl-14';
            blockedMessageEl.textContent = 'Blocked Message';
            messageList.appendChild(blockedMessageEl);
            lastMessageUid = null; // Break message grouping
            return;
        }

        const messageEl = document.createElement('div');
        const currentTimestamp = msg.timestamp ? msg.timestamp.toDate() : new Date();

        const highestRole = getHighestRole(msg.user.uid);
        const roleColor = highestRole ? highestRole.color : 'inherit';

        // Check if this message should be grouped with the previous one
        const shouldGroup = 
            msg.user.uid === lastMessageUid &&
            lastMessageTimestamp &&
            (currentTimestamp - lastMessageTimestamp < FIVE_MINUTES);

        if (shouldGroup) {
            // Render a compact message
            messageEl.className = 'flex items-center pl-14 pr-4 py-0.5 hover:bg-gray-800/50 group';
            messageEl.innerHTML = `
                <div class="text-gray-200 whitespace-pre-wrap break-all flex-1 min-w-0">${renderMessageContent(msg)}</div>
                <span class="text-xs text-gray-500 ml-auto pl-4 opacity-0 group-hover:opacity-100 transition-opacity">${msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            `;
        } else {
            // Render a full message with the user header
            messageEl.className = 'flex p-4 hover:bg-gray-800/50 pt-6';
            const timestamp = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'sending...';
            const messageUserAvatar = isValidHttpUrl(msg.user.photoURL) ? msg.user.photoURL : DEFAULT_AVATAR_SVG;
            
            messageEl.innerHTML = `
                <img src="${messageUserAvatar}" alt="${msg.user.displayName}" class="w-10 h-10 rounded-full mr-4 cursor-pointer object-cover flex-shrink-0" data-userid="${msg.user.uid}" />
                <div class="min-w-0 flex-1">
                    <div class="flex items-baseline">
                        <span class="font-semibold mr-2 cursor-pointer" style="color: ${roleColor};" data-userid="${msg.user.uid}">${msg.user.displayName}</span>
                        <span class="text-xs text-gray-500">${timestamp}</span>
                    </div>
                    ${msg.text || msg.html ? `<div class="text-gray-200 whitespace-pre-wrap break-all">${renderMessageContent(msg)}</div>` : ''}
                </div>
            `;
        }
        
        messageList.appendChild(messageEl);

        // Update last message details for the next iteration
        lastMessageUid = msg.user.uid;
        lastMessageTimestamp = currentTimestamp;
    });

    setTimeout(() => {
        if (messageList) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    }, 0);
};

const renderUsers = (users) => {
    const userListAside = document.getElementById('user-list-aside');
    if (!userListAside) return;

    userListAside.innerHTML = `<h3 class="text-xs font-bold uppercase text-gray-400 px-2 pt-2 pb-1">Members — ${users.length}</h3>`;
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = "flex items-center p-2 rounded-md hover:bg-gray-700/50 cursor-pointer";
        userEl.dataset.userid = user.id;

        const highestRole = getHighestRole(user.id);
        const roleColor = highestRole ? highestRole.color : 'inherit';
        const userAvatarUrl = isValidHttpUrl(user.photoURL) ? user.photoURL : DEFAULT_AVATAR_SVG;

        userEl.innerHTML = `
            <div class="flex items-center pointer-events-none">
                <div class="relative mr-3">
                    <img src="${userAvatarUrl}" alt="${user.displayName}" class="w-8 h-8 rounded-full object-cover" />
                    <div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border-2 border-gray-800 rounded-full"></div>
                </div>
                <span class="text-sm font-medium" style="color: ${roleColor};">${user.displayName}</span>
            </div>
        `;
        userListAside.appendChild(userEl);
    });
}

const renderRoles = () => {
    const rolesList = document.getElementById('roles-list');
    if (!rolesList) return;

    rolesList.innerHTML = '';
    activeServerRoleOrder.forEach(roleId => {
        const role = activeServerRoles[roleId];
        if (!role) return;

        const roleEl = document.createElement('div');
        roleEl.className = 'flex items-center justify-between bg-gray-700 p-2 rounded-md';
        roleEl.dataset.roleId = roleId;
        
        const isOwnerRole = roleId === 'owner';
        roleEl.draggable = !isOwnerRole;

        roleEl.innerHTML = `
            <div class="flex items-center pointer-events-none">
                 <svg class="w-5 h-5 mr-3 ${isOwnerRole ? 'text-gray-600' : 'text-gray-400 cursor-grab'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${role.color};"></div>
                <span class="font-semibold text-white">${role.name}</span>
            </div>
        `;
        rolesList.appendChild(roleEl);
    });
};

const renderEditableChannels = async () => {
    if (!activeServerId) return;
    const listEl = document.getElementById('editable-channels-list');
    if (!listEl) return;
    listEl.innerHTML = '<p class="text-gray-400">Loading channels...</p>';

    const channelsSnapshot = await db.collection('servers').doc(activeServerId).collection('channels').orderBy('name').get();
    const channels = channelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    listEl.innerHTML = '';
    channels.forEach(channel => {
        const channelEl = document.createElement('div');
        channelEl.className = 'flex items-center justify-between p-2 rounded-md bg-gray-800';
        channelEl.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M10 9h4V7h-4v2zm-2 4h4v-2H8v2zm10-4v2h-4V9h4zm2-2h-4V5h4v2zm-4 8h4v-2h-4v2zm-2-4h-4v2h4v-2zm-2 4h2v2h-2v-2zm-6-4H4v2h2v-2zM6 7H4v2h2V7zm10 10v-2h-4v2h4zm-6 0v-2H8v2h2z"></path></svg>
                <input type="text" value="${channel.name}" data-channel-id="${channel.id}" class="channel-rename-input flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none rounded-md p-1 focus:bg-gray-900" />
            </div>
            <span class="text-xs text-green-400 opacity-0 transition-opacity" id="status-${channel.id}">Saved!</span>
        `;
        listEl.appendChild(channelEl);
    });
};


const renderServerMembers = () => {
    const membersList = document.getElementById('server-members-list');
    if (!membersList) return;

    membersList.innerHTML = '';
    allServerUsers.forEach(user => {
        const memberData = activeServerMembers[user.id] || { roles: [] };
        const userAvatarUrl = isValidHttpUrl(user.photoURL) ? user.photoURL : DEFAULT_AVATAR_SVG;
        const memberEl = document.createElement('div');
        memberEl.className = 'p-2 rounded-md hover:bg-gray-700/50';
        
        const isOwner = activeServerData && activeServerData.owner === user.id;

        let rolesCheckboxesHTML = activeServerRoleOrder.map(roleId => {
            const role = activeServerRoles[roleId];
            if (!role || roleId === 'owner') return ''; // Don't allow assigning owner
            
            const isChecked = memberData.roles.includes(roleId);
            return `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" data-userid="${user.id}" data-roleid="${roleId}" ${isChecked ? 'checked' : ''} ${isOwner ? 'disabled' : ''} class="form-checkbox h-4 w-4 text-blue-500 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${role.color};"></div>
                    <span>${role.name}</span>
                </label>
            `;
        }).join('');

        memberEl.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <img src="${userAvatarUrl}" alt="${user.displayName}" class="w-8 h-8 rounded-full object-cover mr-3">
                    <span class="font-medium text-white">${user.displayName}</span>
                    ${isOwner ? '<svg class="w-4 h-4 text-yellow-400 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>' : ''}
                </div>
            </div>
            <div class="pl-11 pt-2 space-y-1">
                ${rolesCheckboxesHTML}
            </div>
        `;
        membersList.appendChild(memberEl);
    });
};

const renderInvitations = (invites) => {
    const container = document.getElementById('pending-tab-panel');
    const badge = document.getElementById('pending-invites-badge');
    if (!container || !badge) return;

    if (invites.length > 0) {
        badge.textContent = invites.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    const friendInvites = invites.filter(i => i.type === 'friend');
    const serverInvites = invites.filter(i => i.type === 'server');

    let html = `<h2 class="text-xs font-bold tracking-wider text-gray-400 uppercase px-2 pt-2 pb-1">Pending Invites — ${invites.length}</h2>`;
    
    if (friendInvites.length > 0) {
        html += `<h3 class="text-sm font-semibold text-gray-300 px-2 pt-2">Friend Requests</h3>`;
        friendInvites.forEach(invite => {
            html += `
                <div class="flex items-center justify-between p-2 rounded-md hover:bg-gray-700/50">
                    <span class="font-medium text-white">${escapeHTML(invite.fromName)}</span>
                    <div>
                        <button class="accept-invite-btn w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center mr-1" data-invite-id="${invite.id}" aria-label="Accept">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button class="decline-invite-btn w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center" data-invite-id="${invite.id}" aria-label="Decline">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>`;
        });
    }

    if (serverInvites.length > 0) {
        html += `<h3 class="text-sm font-semibold text-gray-300 px-2 pt-2">Server Invites</h3>`;
        serverInvites.forEach(invite => {
             const iconUrl = isValidHttpUrl(invite.serverIcon) ? invite.serverIcon : DEFAULT_AVATAR_SVG;
            html += `
                <div class="flex items-center justify-between p-2 rounded-md hover:bg-gray-700/50">
                    <div class="flex items-center truncate">
                       <img src="${iconUrl}" class="w-8 h-8 rounded-full mr-2 object-cover">
                       <div class="truncate">
                           <p class="font-medium text-white truncate">${escapeHTML(invite.serverName)}</p>
                           <p class="text-xs text-gray-400 truncate">from ${escapeHTML(invite.fromName)}</p>
                       </div>
                    </div>
                    <div>
                        <button class="accept-invite-btn w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center mr-1" data-invite-id="${invite.id}" aria-label="Accept">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button class="decline-invite-btn w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center" data-invite-id="${invite.id}" aria-label="Decline">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>`;
        });
    }
    
    if (invites.length === 0) {
        html += `<p class="text-sm text-gray-400 px-2 pt-2">You have no pending invites.</p>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('.accept-invite-btn').forEach(btn => {
        btn.onclick = () => {
            const invite = invites.find(i => i.id === btn.dataset.inviteId);
            handleAcceptInvite(invite.id, invite);
        };
    });
    container.querySelectorAll('.decline-invite-btn').forEach(btn => {
        btn.onclick = () => handleDeclineInvite(btn.dataset.inviteId);
    });
};

// =================================================================================
// Data Handling & State Management
// =================================================================================
const getDmChannelId = (friendId) => {
    return [currentUser.uid, friendId].sort().join('_');
};

const getHighestRole = (userId) => {
    if (activeView !== 'servers' || !activeServerMembers[userId]) {
        return null;
    }
    const userRoleIds = activeServerMembers[userId].roles || [];
    for (const roleId of activeServerRoleOrder) {
        if (userRoleIds.includes(roleId)) {
            return activeServerRoles[roleId];
        }
    }
    return activeServerRoles['default']; // Fallback to default role
};

const currentUserHasModPermissions = () => {
    if (!activeServerId || !currentUser || !activeServerData) return false;

    // Check if the current user is the owner
    if (activeServerData.owner === currentUser.uid) {
        return true;
    }

    // Check if the user has a role with moderator permissions
    const memberData = activeServerMembers[currentUser.uid];
    if (!memberData || !memberData.roles) return false;

    return memberData.roles.some(roleId => {
        const role = activeServerRoles[roleId];
        return role && role.permissions && role.permissions.isModerator;
    });
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

const setupInvitationsListener = () => {
    if (invitationsUnsubscribe) invitationsUnsubscribe();
    if (!currentUser) return;
    invitationsUnsubscribe = db.collection('invitations')
        .where('toId', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            const invites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderInvitations(invites);
        }, (error) => console.error("Error fetching invitations:", error));
};


const selectHome = async () => {
    await hangUp();
    activeView = 'home';
    activeServerId = null;
    activeChannelId = null;
    activeServerData = null;
    activeServerRoles = {};
    activeServerRoleOrder = [];
    activeServerMembers = {};
    allServerUsers = [];

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
    await hangUp();
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
    const settingsButton = document.getElementById('open-server-settings-button');

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

    // Listener for server details (name, members, roles)
    usersUnsubscribe = serverRef.onSnapshot(async (doc) => {
        if (doc.exists) {
            const serverData = doc.data();
            activeServerData = serverData; // Cache server data
            activeServerRoles = serverData.roles || {};
            activeServerRoleOrder = serverData.roleOrder || Object.keys(activeServerRoles);
            document.getElementById('server-settings-name-input').value = serverData.name;
            renderRoles();
            
            // Toggle server settings button based on permissions
            if(settingsButton) settingsButton.classList.toggle('hidden', !currentUserHasModPermissions());
            
            const membersSnapshot = await serverRef.collection('members').get();
            activeServerMembers = {};
            membersSnapshot.forEach(mdoc => {
                activeServerMembers[mdoc.id] = mdoc.data();
            });

            const memberUIDs = serverData.members || [];
            if (memberUIDs.length > 0) {
                const userDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', memberUIDs).get();
                allServerUsers = userDocs.docs.map(d => ({ id: d.id, ...d.data() }));
                renderUsers(allServerUsers);
                renderServerMembers();
            } else {
                allServerUsers = [];
                renderUsers([]);
                renderServerMembers();
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

const selectDmChannel = async (friend) => {
    await hangUp();
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
    
    const dmAvatarUrl = isValidHttpUrl(friend.photoURL) ? friend.photoURL : DEFAULT_AVATAR_SVG;
    if(chatHeader) {
        chatHeader.innerHTML = `
            <div class="flex items-center">
                <div class="relative mr-2">
                    <img src="${dmAvatarUrl}" alt="${friend.displayName}" class="w-7 h-7 rounded-full object-cover" />
                    <div class="absolute bottom-0 right-0 w-2 h-2 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} border border-gray-800 rounded-full"></div>
                </div>
                <h2 class="font-semibold text-lg text-white">${friend.displayName}</h2>
            </div>
            <button id="start-call-button" class="ml-auto text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 5.106A1 1 0 0116 6v8a1 1 0 01-1.447.894L12 12.828V7.172l2.553-1.932z"></path></svg>
            </button>
        `;
        document.getElementById('start-call-button').onclick = () => startCall(friend);
    }

    if(messageInput) messageInput.placeholder = `Message @${friend.displayName}`;

    const dmRef = db.collection('dms').doc(activeChannelId);
    messageUnsubscribe = dmRef.collection('messages').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderMessages(messages);
    });

    // Re-render friends list to show active state
    loadFriends();
};

const sendMessage = async (messageData) => {
    if (activeView === 'servers' && activeServerId && activeChannelId) {
        await db.collection('servers').doc(activeServerId).collection('channels').doc(activeChannelId).collection('messages').add(messageData);
    } else if (activeView === 'home' && activeChannelId) {
        await db.collection('dms').doc(activeChannelId).collection('messages').add(messageData);
    }
}

const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

const sendChatMessageWithSpamCheck = async (messageData) => {
    // Only apply spam check to messages with text content
    if (messageData.text) {
        let messagesRef;
        if (activeView === 'servers' && activeServerId && activeChannelId) {
            messagesRef = db.collection('servers').doc(activeServerId).collection('channels').doc(activeChannelId).collection('messages');
        } else if (activeView === 'home' && activeChannelId) {
            messagesRef = db.collection('dms').doc(activeChannelId).collection('messages');
        }

        if (messagesRef) {
            try {
                // Fetch recent messages and filter client-side to avoid composite index
                const recentMessagesQuery = await messagesRef
                    .orderBy('timestamp', 'desc')
                    .limit(20) // Fetch more messages to find user's last 5
                    .get();
                
                const userMessages = recentMessagesQuery.docs
                    .map(doc => doc.data())
                    .filter(msg => msg.user.uid === currentUser.uid)
                    .slice(0, 5);

                // If the user has sent at least 5 messages recently...
                if (userMessages.length === 5) {
                    // ...and they are all identical to the new message...
                    const isSpam = userMessages.every(msg => msg.text === messageData.text);
                    if (isSpam) {
                        // ...block the message.
                        console.log("Spam detected, message blocked.");
                        return false; // Indicate message was blocked
                    }
                }
            } catch (error) {
                console.error("Error checking for spam:", error);
                // In case of error, let the message through to not block users.
            }
        }
    }
    
    await sendMessage(messageData);
    return true; // Indicate message was sent
};

const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const text = messageInput.value.trim();

    if ((!text && !stagedFile) || !currentUser || messageInput.value.length > 500) return;
    
    document.getElementById('command-suggestions').classList.add('hidden');

    // Handle commands that don't create a message
    if (text.startsWith('/ad ')) {
        const arg = text.substring(4).toLowerCase();
        const homeAd = document.getElementById('home-ad-container');
        const channelAd = document.getElementById('channel-ad-container');
        if (arg === 'yes') {
            displayRandomAd();
            homeAd?.classList.remove('hidden');
            channelAd?.classList.remove('hidden');
            localStorage.setItem('adsEnabled', 'true');
        } else if (arg === 'no') {
            homeAd?.classList.add('hidden');
            channelAd?.classList.add('hidden');
            localStorage.setItem('adsEnabled', 'false');
        }
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }
    if (text === '/tetris') {
        const tetrisWindow = window.open('', 'tetris', 'width=450,height=500,resizable=yes');
        if (tetrisWindow) {
            tetrisWindow.document.write(tetrisHTML);
            tetrisWindow.document.close();
        }
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }
    if (text === '/admin') {
        if (auth.currentUser && auth.currentUser.email === 'nineteenp2@gmail.com') {
            const adminWindow = window.open('', 'adminPanel', 'width=550,height=350,resizable=yes');
            if (adminWindow) {
                adminWindow.document.write(adminPanelHTML);
                adminWindow.document.close();
            }
        }
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }
    
    let messageObject;

    // If a file is staged, ignore all commands and treat input as plain text.
    if (stagedFile) {
        const fileContent = await readFileAsText(stagedFile);
        const fileBlock = `\n\n\`\`\`txt\n${fileContent}\n\`\`\``;
        messageObject = { text: text + fileBlock };
    } else if (text.startsWith('/')) {
        const [command, ...args] = text.split(' ');
        const msgContent = args.join(' ');
        let handled = false;

        if (command === '/italic' && msgContent) {
            messageObject = { html: `<em>${escapeHTML(msgContent)}</em>` };
            handled = true;
        } else if (command === '/bold' && msgContent) {
            messageObject = { html: `<strong>${escapeHTML(msgContent)}</strong>` };
            handled = true;
        } else if (command === '/font' && args.length >= 2) {
            const font = args[0];
            const msg = args.slice(1).join(' ');
            const safeFont = /^[a-zA-Z0-9\s,-]+$/.test(font) ? font : 'sans-serif';
            messageObject = { html: `<span style="font-family: ${escapeHTML(safeFont)};">${escapeHTML(msg)}</span>` };
            handled = true;
        } else if (command === '/size' && args.length >= 2) {
            const allowedEmails = ['28gkarfonta@catholiccentral.net', 'ninteenp2@gmail.com'];
            if (currentUser && allowedEmails.includes(currentUser.email)) {
                const size = parseInt(args[0], 10);
                const msg = args.slice(1).join(' ');
                if (!isNaN(size) && size >= 8 && size <= 48) {
                    messageObject = { html: `<span style="font-size: ${size}px;">${escapeHTML(msg)}</span>` };
                    handled = true;
                }
            }
        } else if (command === '/coinflip') {
            messageObject = { text: Math.random() < 0.5 ? 'Heads' : 'Tails' };
            handled = true;
        } else if (command === '/dice') {
            messageObject = { text: `${Math.floor(Math.random() * 6) + 1}` };
            handled = true;
        } else if (command === '/shrug') {
            messageObject = { text: '¯\\_(ツ)_/¯' };
            handled = true;
        }

        if (!handled) {
            messageObject = { text: text }; // Unrecognized command
        }
    } else {
        messageObject = { text: text }; // Not a command
    }
    
    if (!messageObject || (!messageObject.text && !messageObject.html)) {
        return; // Nothing to send
    }

    sendButton.disabled = true;
    
    try {
        messageObject.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        messageObject.user = { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL };
        
        if (messageObject.text) {
            await sendChatMessageWithSpamCheck(messageObject);
        } else {
            await sendMessage(messageObject);
        }
        
        messageInput.value = '';
        cancelFilePreview();
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message.");
    } finally {
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
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
            members: [currentUser.uid],
            roles: {
                'owner': { 
                    name: 'Owner', 
                    color: '#ffc107',
                    permissions: { isModerator: true }
                },
                'default': { 
                    name: '@everyone', 
                    color: '#99aab5',
                    permissions: { isModerator: false }
                }
            },
            roleOrder: ['owner', 'default']
        });
        await newServerRef.collection('channels').doc('general').set({
            name: 'general'
        });
        await newServerRef.collection('members').doc(currentUser.uid).set({
            roles: ['owner', 'default']
        });
        
        serverNameInput.value = '';
        if (addServerModal) addServerModal.style.display = 'none';
        selectServer(newServerRef.id);
    }
};

const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!currentUserHasModPermissions()) return;
    const channelNameInput = document.getElementById('channel-name-input');
    const modal = document.getElementById('create-channel-modal');
    const channelName = channelNameInput.value.trim();
    if(channelName && activeServerId) {
        const formattedName = channelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (formattedName) {
            await db.collection('servers').doc(activeServerId).collection('channels').add({
                name: formattedName
            });
            channelNameInput.value = '';
            if(modal) modal.style.display = 'none';
        }
    }
}

const handleRenameChannel = async (channelId, newName) => {
    if (!currentUserHasModPermissions() || !activeServerId || !channelId || !newName) return;

    const formattedName = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!formattedName) {
        // Maybe show an error on the input
        console.error("Invalid channel name format");
        return;
    }

    try {
        const channelRef = db.collection('servers').doc(activeServerId).collection('channels').doc(channelId);
        await channelRef.update({ name: formattedName });
        
        // Visual feedback
        const statusEl = document.getElementById(`status-${channelId}`);
        if(statusEl) {
            statusEl.style.opacity = '1';
            setTimeout(() => { statusEl.style.opacity = '0'; }, 2000);
        }
    } catch (error) {
        console.error("Error renaming channel:", error);
    }
};


const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!currentUserHasModPermissions()) return;
    const roleNameInput = document.getElementById('role-name-input');
    const roleColorInput = document.getElementById('role-color-input');
    const roleModeratorToggle = document.getElementById('role-moderator-toggle');
    const roleName = roleNameInput.value.trim();
    const roleColor = roleColorInput.value;
    const isModerator = roleModeratorToggle.checked;

    if (roleName && activeServerId) {
        const serverRef = db.collection('servers').doc(activeServerId);
        const roleId = `role_${Date.now()}`;
        
        await serverRef.update({
            [`roles.${roleId}`]: { 
                name: roleName, 
                color: roleColor,
                permissions: { isModerator }
            },
            roleOrder: firebase.firestore.FieldValue.arrayUnion(roleId)
        });
        
        roleNameInput.value = '';
        roleColorInput.value = '#99aab5';
        roleModeratorToggle.checked = false;
    }
}


const handleAddFriend = async (e) => {
    e.preventDefault();
    const addFriendInput = document.getElementById('add-friend-input');
    const addFriendStatus = document.getElementById('add-friend-status');
    const friendId = addFriendInput.value.trim();
    
    addFriendStatus.textContent = '...';
    addFriendStatus.className = 'text-xs mt-1 h-3 text-gray-400';

    if (!friendId || friendId === currentUser.uid) {
        addFriendStatus.textContent = 'Invalid Friend Code.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-red-400';
        return;
    }
    if (currentUser.blockedUsers?.includes(friendId)) {
        addFriendStatus.textContent = 'You cannot add a blocked user.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-red-400';
        return;
    }

    const friendRef = db.collection('users').doc(friendId);
    const friendDoc = await friendRef.get();

    if (!friendDoc.exists) {
        addFriendStatus.textContent = 'User not found.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-red-400';
        return;
    }
    if (friendDoc.data().blockedUsers?.includes(currentUser.uid)) {
         addFriendStatus.textContent = 'You cannot add this user.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-red-400';
        return;
    }

    const currentUserDoc = await db.collection('users').doc(currentUser.uid).get();
    if (currentUserDoc.data().friends?.includes(friendId)) {
         addFriendStatus.textContent = 'You are already friends.';
         addFriendStatus.className = 'text-xs mt-1 h-3 text-yellow-400';
         return;
    }

    // Check for existing pending invites (either way)
    const inviteQuery1 = await db.collection('invitations').where('fromId', '==', currentUser.uid).where('toId', '==', friendId).where('type', '==', 'friend').get();
    const inviteQuery2 = await db.collection('invitations').where('fromId', '==', friendId).where('toId', '==', currentUser.uid).where('type', '==', 'friend').get();

    if (!inviteQuery1.empty || !inviteQuery2.empty) {
        addFriendStatus.textContent = 'Invite already pending.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-yellow-400';
        return;
    }

    try {
        await db.collection('invitations').add({
            fromId: currentUser.uid,
            fromName: currentUser.displayName,
            toId: friendId,
            type: 'friend',
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        addFriendStatus.textContent = 'Friend request sent!';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-green-400';
        addFriendInput.value = '';
    } catch (error) {
        console.error("Error sending friend request:", error);
        addFriendStatus.textContent = 'Failed to send request.';
        addFriendStatus.className = 'text-xs mt-1 h-3 text-red-400';
    } finally {
        setTimeout(() => { addFriendStatus.textContent = ''; }, 3000);
    }
};

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const profileUsernameInput = document.getElementById('profile-username-input');
    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const myProfileModal = document.getElementById('my-profile-modal');

    const newUsername = profileUsernameInput.value.trim();
    const newAvatarUrl = profileAvatarInput.value.trim();
    if (!newUsername) return;

    if (newAvatarUrl && !isValidHttpUrl(newAvatarUrl)) {
        alert("The provided Avatar URL is not valid. Please enter a full, valid URL (e.g., https://example.com/image.png) or leave it blank.");
        return;
    }

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
        
        if (myProfileModal) myProfileModal.style.display = 'none';

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
    messagesSnapshot.forEach(msgDoc => batch.delete(msgDoc.ref));
    await batch.commit();
    await channelDoc.ref.delete();
  }
  const membersSnapshot = await serverRef.collection('members').get();
  for (const memberDoc of membersSnapshot.docs) {
      await memberDoc.ref.delete();
  }
  await serverRef.delete();
  console.log(`Server ${serverRef.id} and all its content have been deleted.`);
}

const handleLeaveServer = async () => {
    if (!activeServerId || !currentUser) return;
    const serverRef = db.collection('servers').doc(activeServerId);
    const serverDoc = await serverRef.get();
    if (!serverDoc.exists) return;

    const serverData = serverDoc.data();
    const serverName = serverData.name;
    
    // Prevent owner from leaving
    if (serverData.owner === currentUser.uid) {
        alert(`You are the owner of ${serverName}. To leave, you must first transfer ownership or delete the server.`);
        return;
    }

    if (confirm(`Are you sure you want to leave ${serverName}?`)) {
        try {
            await serverRef.update({
                members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            });
            await serverRef.collection('members').doc(currentUser.uid).delete();
            
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
        const serverDoc = await serverRef.get();
        const serverData = serverDoc.data();
        if (serverData.members?.includes(friendId)) {
            inviteStatusMessage.textContent = 'User is already a member.';
            inviteStatusMessage.className = 'text-sm mt-2 h-4 text-yellow-400';
            return;
        }
        
        // Check for existing invites
        const inviteQuery = await db.collection('invitations').where('toId', '==', friendId).where('serverId', '==', activeServerId).get();
        if (!inviteQuery.empty) {
            inviteStatusMessage.textContent = 'Invite already pending.';
            inviteStatusMessage.className = 'text-sm mt-2 h-4 text-yellow-400';
            return;
        }

        await db.collection('invitations').add({
            fromId: currentUser.uid,
            fromName: currentUser.displayName,
            toId: friendId,
            type: 'server',
            serverId: activeServerId,
            serverName: serverData.name,
            serverIcon: serverData.iconUrl || null,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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

const showUserProfile = async (userId) => {
    if (!userId || userId === currentUser.uid) return;
    const modal = document.getElementById('user-profile-modal');
    const avatarEl = document.getElementById('user-profile-avatar');
    const nameEl = document.getElementById('user-profile-name');
    const friendCodeEl = document.getElementById('user-profile-friend-code');
    const actionsContainer = document.getElementById('user-profile-actions');

    if (!modal || !avatarEl || !nameEl || !friendCodeEl || !actionsContainer) return;

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            avatarEl.src = isValidHttpUrl(userData.photoURL) ? userData.photoURL : DEFAULT_AVATAR_SVG;
            nameEl.textContent = `${userData.displayName}'s Profile`;
            friendCodeEl.textContent = userId;

            actionsContainer.innerHTML = '';
            const isBlocked = currentUser.blockedUsers?.includes(userId);
            const blockButton = document.createElement('button');
            blockButton.className = 'w-full px-4 py-2 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300';
            
            if(isBlocked) {
                blockButton.textContent = 'Unblock User';
                blockButton.className += ' bg-green-500 hover:bg-green-600 focus:ring-green-500';
                blockButton.onclick = () => handleUnblockUser(userId);
            } else {
                blockButton.textContent = 'Block User';
                blockButton.className += ' bg-red-500 hover:bg-red-600 focus:ring-red-500';
                blockButton.onclick = () => handleBlockUser(userId);
            }
            actionsContainer.appendChild(blockButton);

            modal.style.display = 'flex';
        } else {
            console.warn("User not found:", userId);
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};

const handleBlockUser = async (userId) => {
    if (!userId) return;
    const userRef = db.collection('users').doc(currentUser.uid);
    await userRef.update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId)
    });
    currentUser.blockedUsers.push(userId);
    showUserProfile(userId); // Re-render profile to show "Unblock"
};

const handleUnblockUser = async (userId) => {
    if (!userId) return;
    const userRef = db.collection('users').doc(currentUser.uid);
    await userRef.update({
        blockedUsers: firebase.firestore.FieldValue.arrayRemove(userId)
    });
    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== userId);
    showUserProfile(userId); // Re-render profile to show "Block"
};

const handleAcceptInvite = async (inviteId, inviteData) => {
    if (inviteData.type === 'friend') {
        const currentUserRef = db.collection('users').doc(currentUser.uid);
        const friendRef = db.collection('users').doc(inviteData.fromId);
        
        await currentUserRef.update({ friends: firebase.firestore.FieldValue.arrayUnion(inviteData.fromId) });
        await friendRef.update({ friends: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    } else if (inviteData.type === 'server') {
        const serverRef = db.collection('servers').doc(inviteData.serverId);
        await serverRef.update({ members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
        await serverRef.collection('members').doc(currentUser.uid).set({ roles: ['default'] });
    }
    await db.collection('invitations').doc(inviteId).delete();
};

const handleDeclineInvite = async (inviteId) => {
    await db.collection('invitations').doc(inviteId).delete();
};


// =================================================================================
// File Handling
// =================================================================================

const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    // Check by file extension, as MIME type can be unreliable.
    if (!file.name.toLowerCase().endsWith('.txt')) {
        alert('Only .txt files are allowed.');
        e.target.value = ''; // Clear the file input
        return;
    }
    
    stagedFile = file;
    const filePreviewContainer = document.getElementById('file-preview-container');
    const filePreviewName = document.getElementById('file-preview-name');
    const sendButton = document.getElementById('send-button');

    filePreviewName.textContent = file.name;
    filePreviewContainer.classList.remove('hidden');
    filePreviewContainer.style.display = 'flex';
    if (sendButton) sendButton.disabled = false;
};

const cancelFilePreview = () => {
    const fileUploadInput = document.getElementById('file-upload-input');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const filePreviewName = document.getElementById('file-preview-name');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    stagedFile = null;
    if (fileUploadInput) fileUploadInput.value = '';
    if (filePreviewName) filePreviewName.textContent = '';
    if (filePreviewContainer) filePreviewContainer.classList.add('hidden');

    if (sendButton && messageInput && !messageInput.value.trim()) {
        sendButton.disabled = true;
    }
};

// =================================================================================
// WebRTC Video Call Functions
// =================================================================================

const toggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    const micButton = document.getElementById('toggle-mic-button');
    if (audioTrack && micButton) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;
        micButton.dataset.muted = isMuted;
        micButton.setAttribute('aria-label', isMuted ? 'Unmute microphone' : 'Mute microphone');
        micButton.classList.toggle('bg-red-500', isMuted);
        micButton.classList.toggle('hover:bg-red-600', isMuted);
        micButton.classList.toggle('bg-gray-600/80', !isMuted);
        micButton.innerHTML = isMuted ? MIC_OFF_SVG : MIC_ON_SVG;
    }
};

const toggleCamera = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    const camButton = document.getElementById('toggle-camera-button');
    if (videoTrack && camButton) {
        videoTrack.enabled = !videoTrack.enabled;
        const isEnabled = videoTrack.enabled;
        camButton.dataset.enabled = isEnabled;
        camButton.setAttribute('aria-label', isEnabled ? 'Turn off camera' : 'Turn on camera');
        camButton.classList.toggle('bg-red-500', !isEnabled);
        camButton.classList.toggle('hover:bg-red-600', !isEnabled);
        camButton.classList.toggle('bg-gray-600/80', isEnabled);
        camButton.innerHTML = isEnabled ? CAM_ON_SVG : CAM_OFF_SVG;
    }
};

const setupCallListener = () => {
    if (callListenerUnsubscribe) callListenerUnsubscribe();
    callListenerUnsubscribe = db.collection('calls')
        .where('calleeId', '==', currentUser.uid)
        .where('status', '==', 'ringing')
        .onSnapshot(snapshot => {
            if (!snapshot.empty) {
                const callDoc = snapshot.docs[0];
                handleIncomingCall({ id: callDoc.id, ...callDoc.data() });
            }
        });
};

const handleIncomingCall = async (callData) => {
    if (activeCallData) {
        // If already in a call, automatically decline.
        const callRef = db.collection('calls').doc(callData.id);
        await callRef.update({ status: 'declined' });
        return;
    }
    activeCallData = callData;
    const callerDoc = await db.collection('users').doc(callData.callerId).get();
    const caller = callerDoc.data();
    showCallUI('incoming', caller);

    // Set up a listener to hang up if the caller cancels
    currentCallUnsubscribe = db.collection('calls').doc(callData.id).onSnapshot((snapshot) => {
        if (!snapshot.exists || snapshot.data().status === 'ended') {
            console.log("Call was cancelled by caller or ended.");
            hangUp();
        }
    });
};


const startCall = async (friend) => {
    if (activeCallData) return alert("You are already in a call.");
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        document.getElementById('local-video').srcObject = localStream;
    } catch (error) {
        console.error("Could not get media devices:", error);
        alert("Camera and microphone access are required for video calls.");
        return;
    }

    const callRef = db.collection('calls').doc();
    activeCallData = { 
        id: callRef.id,
        callerId: currentUser.uid,
        calleeId: friend.id,
        status: 'ringing'
    };
    
    showCallUI('outgoing', friend);

    peerConnection = new RTCPeerConnection(iceServers);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            callRef.collection('callerCandidates').add(event.candidate.toJSON());
        }
    };
    
    peerConnection.ontrack = event => {
        const remoteVideo = document.getElementById('remote-video');
        remoteStream.addTrack(event.track);
        if (remoteVideo.srcObject !== remoteStream) {
            remoteVideo.srcObject = remoteStream;
        }
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    
    await callRef.set({
        ...activeCallData,
        offer,
    });
    
    // Listen for answer
    currentCallUnsubscribe = callRef.onSnapshot(async snapshot => {
        const data = snapshot.data();
        if (!data) return;
        if (data.answer && !peerConnection.currentRemoteDescription) {
            const answerDescription = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(answerDescription);
        }
        if (data.status === 'connected' && activeCallData.status !== 'connected') {
            activeCallData.status = 'connected';
            const calleeDoc = await db.collection('users').doc(data.calleeId).get();
            showCallUI('connected', calleeDoc.data());
        }
        if (data.status === 'declined' || data.status === 'ended') {
            await hangUp();
        }
    });

    callRef.collection('calleeCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
            }
        });
    });
};

const answerCall = async () => {
    if (!activeCallData) return;
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        document.getElementById('local-video').srcObject = localStream;
    } catch (error) {
        console.error("Could not get media devices:", error);
        alert("Camera and microphone access are required for video calls.");
        return;
    }
    
    const callRef = db.collection('calls').doc(activeCallData.id);
    const callerDoc = await db.collection('users').doc(activeCallData.callerId).get();
    
    showCallUI('connected', callerDoc.data());

    peerConnection = new RTCPeerConnection(iceServers);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            callRef.collection('calleeCandidates').add(event.candidate.toJSON());
        }
    };
    
    peerConnection.ontrack = event => {
        const remoteVideo = document.getElementById('remote-video');
        remoteStream.addTrack(event.track);
        if (remoteVideo.srcObject !== remoteStream) {
            remoteVideo.srcObject = remoteStream;
        }
    };

    const callDoc = await callRef.get();
    const offerDescription = new RTCSessionDescription(callDoc.data().offer);
    await peerConnection.setRemoteDescription(offerDescription);
    
    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);
    
    const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
    await callRef.update({ answer, status: 'connected' });
    
    if (currentCallUnsubscribe) currentCallUnsubscribe();
    currentCallUnsubscribe = callRef.onSnapshot(snapshot => {
        const data = snapshot.data();
        if (data?.status === 'ended') {
            hangUp();
        }
    });

    callRef.collection('callerCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
            }
        });
    });
};

const declineCall = async () => {
    if (!activeCallData) return;
    const callRef = db.collection('calls').doc(activeCallData.id);
    await callRef.update({ status: 'declined' });
    await hangUp();
};

const showCallUI = (type, peer) => {
    const videoCallView = document.getElementById('video-call-view');
    const status = document.getElementById('video-call-status');
    const controls = document.getElementById('video-call-controls');
    const localVideoContainer = document.getElementById('local-video-container');

    videoCallView.classList.remove('hidden');
    const peerAvatar = isValidHttpUrl(peer.photoURL) ? peer.photoURL : DEFAULT_AVATAR_SVG;

    if (type === 'outgoing') {
        status.innerHTML = `
            <img src="${peerAvatar}" alt="${peer.displayName}" class="w-24 h-24 rounded-full mb-4 border-4 border-gray-700 object-cover animate-pulse">
            <h3 class="text-2xl font-semibold">Calling ${peer.displayName}...</h3>
            <p class="text-gray-300">Waiting for them to pick up.</p>
        `;
        controls.style.display = 'flex';
        controls.innerHTML = `<button id="hang-up-button" class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" aria-label="Hang up">${HANGUP_SVG}</button>`;
        document.getElementById('hang-up-button').onclick = hangUp;
        localVideoContainer.style.display = 'block';
        status.style.display = 'flex';

    } else if (type === 'incoming') {
        status.innerHTML = `
            <img src="${peerAvatar}" alt="${peer.displayName}" class="w-24 h-24 rounded-full mb-4 border-4 border-gray-700 object-cover">
            <h3 class="text-2xl font-semibold">${peer.displayName} is calling...</h3>
        `;
        controls.style.display = 'flex';
        controls.innerHTML = `
            <button id="decline-call-button" class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" aria-label="Decline">${HANGUP_SVG}</button>
            <button id="answer-call-button" class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600" aria-label="Answer">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
            </button>
        `;
        document.getElementById('decline-call-button').onclick = declineCall;
        document.getElementById('answer-call-button').onclick = answerCall;
        localVideoContainer.style.display = 'none';
        status.style.display = 'flex';

    } else if (type === 'connected') {
        status.style.display = 'none';
        localVideoContainer.style.display = 'block';
        controls.style.display = 'flex';
        controls.innerHTML = `
            <button id="toggle-mic-button" class="w-14 h-14 bg-gray-600/80 rounded-full flex items-center justify-center hover:bg-gray-500/80" aria-label="Mute microphone" data-muted="false">${MIC_ON_SVG}</button>
            <button id="toggle-camera-button" class="w-14 h-14 bg-gray-600/80 rounded-full flex items-center justify-center hover:bg-gray-500/80" aria-label="Turn off camera" data-enabled="true">${CAM_ON_SVG}</button>
            <button id="hang-up-button" class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" aria-label="Hang up">${HANGUP_SVG}</button>
        `;
        document.getElementById('toggle-mic-button').onclick = toggleMute;
        document.getElementById('toggle-camera-button').onclick = toggleCamera;
        document.getElementById('hang-up-button').onclick = hangUp;
    }
};

const hangUp = async () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    remoteStream = new MediaStream();
    
    // Cleanup UI
    const videoCallView = document.getElementById('video-call-view');
    const remoteVideo = document.getElementById('remote-video');
    const localVideo = document.getElementById('local-video');
    if (videoCallView) videoCallView.classList.add('hidden');
    if (remoteVideo) remoteVideo.srcObject = null;
    if (localVideo) localVideo.srcObject = null;
    
    // Reset local video position
    const localVideoContainer = document.getElementById('local-video-container');
    if(localVideoContainer) {
        localVideoContainer.style.top = '1rem';
        localVideoContainer.style.right = '1rem';
        localVideoContainer.style.left = 'auto';
        localVideoContainer.style.bottom = 'auto';
    }


    if (currentCallUnsubscribe) {
        currentCallUnsubscribe();
        currentCallUnsubscribe = null;
    }
    
    if (activeCallData) {
        const callRef = db.collection('calls').doc(activeCallData.id);
        const callDoc = await callRef.get();
        if (callDoc.exists && callDoc.data().status !== 'ended') {
            await callRef.update({ status: 'ended' });
        }
        activeCallData = null;
    }
};

const renderCommandSuggestions = (commands) => {
    const container = document.getElementById('command-suggestions');
    const messageInput = document.getElementById('message-input');
    container.innerHTML = '';
    if (commands.length === 0) {
        container.classList.add('hidden');
        return;
    }

    commands.forEach(cmd => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left p-2 hover:bg-gray-700 rounded-md flex items-baseline';
        btn.innerHTML = `
            <span class="font-semibold text-white">${cmd.command}</span>
            <span class="text-gray-400 ml-2 truncate">${cmd.params}</span>
            <span class="text-gray-500 ml-auto pl-4 text-xs truncate">${cmd.description}</span>
        `;
        btn.onclick = () => {
            messageInput.value = cmd.command + ' ';
            messageInput.focus();
            container.classList.add('hidden');
        };
        container.appendChild(btn);
    });

    container.classList.remove('hidden');
};

// =================================================================================
// Event Listeners
// =================================================================================

// Login/Auth
document.getElementById('login-button').addEventListener('click', signInWithGoogle);
document.getElementById('signup-form').addEventListener('submit', handleSignUp);
document.getElementById('signin-form').addEventListener('submit', handleSignIn);
document.getElementById('show-signin-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('signin-form').classList.remove('hidden');
    clearLoginError();
});
document.getElementById('show-signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signin-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    clearLoginError();
});
document.querySelectorAll('.signout-button').forEach(btn => btn.addEventListener('click', signOut));

// Main App
document.querySelectorAll('.user-info-panel').forEach(panel => panel.addEventListener('click', () => {
    const modal = document.getElementById('my-profile-modal');
    const usernameInput = document.getElementById('profile-username-input');
    const avatarInput = document.getElementById('profile-avatar-input');
    const friendCodeDisplay = document.getElementById('friend-code-display');
    if (modal && usernameInput && avatarInput && friendCodeDisplay) {
        usernameInput.value = currentUser.displayName;
        avatarInput.value = currentUser.photoURL;
        friendCodeDisplay.textContent = currentUser.uid;
        modal.style.display = 'flex';
    }
}));
document.getElementById('close-my-profile-modal').addEventListener('click', () => {
    document.getElementById('my-profile-modal').style.display = 'none';
});
document.getElementById('profile-form').addEventListener('submit', handleUpdateProfile);

// Chat
document.getElementById('message-form').addEventListener('submit', handleSendMessage);
document.getElementById('add-friend-form').addEventListener('submit', handleAddFriend);
document.getElementById('message-input').addEventListener('input', (e) => {
    const sendButton = document.getElementById('send-button');
    const charCounter = document.getElementById('char-counter');
    const count = e.target.value.length;
    
    charCounter.textContent = `${count} / 500`;
    charCounter.classList.toggle('text-red-400', count > 500);

    sendButton.disabled = (!e.target.value.trim() && !stagedFile) || count > 500;
    
    const text = e.target.value;
    const suggestionsContainer = document.getElementById('command-suggestions');

    if (stagedFile) {
        suggestionsContainer.classList.add('hidden');
        return;
    }

    if (text.startsWith('/')) {
        const searchTerm = text.substring(1).toLowerCase().split(' ')[0];
        const allowedEmails = ['28gkarfonta@catholiccentral.net', 'ninteenp2@gmail.com'];
        const isAuthorized = currentUser && allowedEmails.includes(currentUser.email);

        let filteredCommands = COMMANDS.filter(cmd => {
            if (cmd.restricted && !isAuthorized) {
                return false;
            }
            return cmd.command.substring(1).startsWith(searchTerm);
        });
        
        renderCommandSuggestions(filteredCommands);
    } else {
        suggestionsContainer.classList.add('hidden');
    }
});

// Home View Tabs
document.getElementById('home-nav').addEventListener('click', (e) => {
    if (e.target.matches('.home-nav-button')) {
        const tab = e.target.dataset.tab;
        
        document.getElementById('friends-tab-panel').classList.toggle('hidden', tab !== 'friends');
        document.getElementById('pending-tab-panel').classList.toggle('hidden', tab !== 'pending');

        document.querySelectorAll('.home-nav-button').forEach(btn => {
            const isSelected = btn.dataset.tab === tab;
            btn.classList.toggle('bg-gray-600', isSelected);
            btn.classList.toggle('text-white', isSelected);
            btn.classList.toggle('text-gray-400', !isSelected);
            btn.classList.toggle('hover:bg-gray-700/50', !isSelected);
        });
    }
});

// File Upload
document.getElementById('attach-file-button').addEventListener('click', () => document.getElementById('file-upload-input').click());
document.getElementById('file-upload-input').addEventListener('change', handleFileSelect);
document.getElementById('cancel-file-preview').addEventListener('click', cancelFilePreview);

// Modals
document.getElementById('cancel-add-server').addEventListener('click', () => document.getElementById('add-server-modal').style.display = 'none');
document.getElementById('add-server-form').addEventListener('submit', handleCreateServer);

document.getElementById('cancel-create-channel').addEventListener('click', () => document.getElementById('create-channel-modal').style.display = 'none');
document.getElementById('create-channel-form').addEventListener('submit', handleCreateChannel);

document.getElementById('server-options-button').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('server-options-dropdown').classList.toggle('hidden');
});
document.getElementById('invite-button').addEventListener('click', () => {
    const modal = document.getElementById('invite-modal');
    document.getElementById('invite-server-name').textContent = document.getElementById('server-name-text').textContent;
    document.getElementById('friend-code-input').value = '';
    document.getElementById('invite-status-message').textContent = '';
    if(modal) modal.style.display = 'flex';
});
document.getElementById('cancel-invite-button').addEventListener('click', () => document.getElementById('invite-modal').style.display = 'none');
document.getElementById('invite-form').addEventListener('submit', handleInviteFriend);
document.getElementById('leave-server-button').addEventListener('click', handleLeaveServer);

// Server/User profile clicks
document.getElementById('chat-panel').addEventListener('click', (e) => {
    const userId = e.target.dataset.userid;
    if (userId) {
        showUserProfile(userId);
    }
});
document.getElementById('home-view').addEventListener('click', (e) => {
    const userId = e.target.dataset.userid;
    if (userId) {
        showUserProfile(userId);
    }
});
document.getElementById('close-user-profile-modal').addEventListener('click', () => {
    document.getElementById('user-profile-modal').style.display = 'none';
});

// Settings Modal
document.querySelectorAll('.settings-button').forEach(btn => btn.addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'flex';
}));
document.getElementById('close-settings-modal').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
});
document.getElementById('open-server-settings-button').addEventListener('click', async () => {
    if (!activeServerId || !currentUserHasModPermissions()) return;

    try {
        const serverDoc = await db.collection('servers').doc(activeServerId).get();
        if (serverDoc.exists) {
            const serverData = serverDoc.data();
            const nameInput = document.getElementById('server-settings-name-input');
            const iconUrlInput = document.getElementById('server-settings-icon-url');
            const iconPreview = document.getElementById('server-settings-icon-preview');
            
            if (nameInput) nameInput.value = serverData.name || '';
            if (iconUrlInput) iconUrlInput.value = serverData.iconUrl || '';
            if (iconPreview) iconPreview.src = isValidHttpUrl(serverData.iconUrl) ? serverData.iconUrl : DEFAULT_AVATAR_SVG;
            
            const statusEl = document.getElementById('server-settings-status');
            if(statusEl) statusEl.textContent = '';
            
            // Pre-render the active tab
            const defaultSection = document.querySelector('.server-settings-nav-button').dataset.section;
            document.querySelectorAll('.server-settings-section').forEach(section => {
               section.classList.toggle('hidden', section.id !== defaultSection);
            });
            if (defaultSection === 'channels-section') {
                renderEditableChannels();
            }
        }
    } catch (error) {
        console.error("Error fetching server settings:", error);
        alert("Could not load server settings.");
        return;
    }

    document.getElementById('server-settings-modal').style.display = 'flex';
});
document.getElementById('close-server-settings-modal').addEventListener('click', () => {
    document.getElementById('server-settings-modal').style.display = 'none';
});

// Server Settings Navigation
document.querySelectorAll('.server-settings-nav-button').forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        document.querySelectorAll('.server-settings-section').forEach(section => {
            section.classList.toggle('hidden', section.id !== sectionId);
        });
        document.querySelectorAll('.server-settings-nav-button').forEach(btn => {
            btn.classList.toggle('bg-gray-700', btn === button);
            btn.classList.toggle('text-white', btn === button);
        });
        // Load content for channels tab when clicked
        if (sectionId === 'channels-section') {
            renderEditableChannels();
        }
    });
});
document.getElementById('server-overview-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserHasModPermissions()) return;
    const newName = document.getElementById('server-settings-name-input').value.trim();
    const newIconUrl = document.getElementById('server-settings-icon-url').value.trim();
    const statusEl = document.getElementById('server-settings-status');

    if (!newName) {
        alert("Server name cannot be empty.");
        return;
    }
    if (!activeServerId) return;

    const updates = { name: newName };

    if (newIconUrl && !isValidHttpUrl(newIconUrl)) {
        alert("The provided Server Icon URL is not valid. Please enter a full, valid URL or leave it blank.");
        return;
    }
    
    updates.iconUrl = newIconUrl;

    try {
        await db.collection('servers').doc(activeServerId).update(updates);
        statusEl.textContent = 'Saved!';
        statusEl.className = 'ml-4 text-sm text-green-400';
        setTimeout(() => { statusEl.textContent = ''; }, 2000);
    } catch (error) {
        console.error("Error updating server settings:", error);
        statusEl.textContent = 'Error saving.';
        statusEl.className = 'ml-4 text-sm text-red-400';
        setTimeout(() => { 
            statusEl.textContent = ''; 
            statusEl.className = 'ml-4 text-sm text-green-400';
        }, 3000);
    }
});
document.getElementById('server-settings-icon-url').addEventListener('input', (e) => {
    const url = e.target.value;
    const previewImg = document.getElementById('server-settings-icon-preview');
    if (isValidHttpUrl(url)) {
        previewImg.src = url;
    } else if (!url) {
        previewImg.src = DEFAULT_AVATAR_SVG;
    }
});
document.getElementById('server-settings-icon-preview').addEventListener('error', (e) => {
    e.target.src = DEFAULT_AVATAR_SVG;
});
document.getElementById('create-role-form').addEventListener('submit', handleCreateRole);
document.getElementById('editable-channels-list').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.matches('.channel-rename-input')) {
        e.preventDefault();
        const channelId = e.target.dataset.channelId;
        const newName = e.target.value.trim();
        handleRenameChannel(channelId, newName);
    }
});

// Global click listener to close dropdowns
document.addEventListener('click', (e) => {
    if (!document.getElementById('server-options-button').contains(e.target)) {
        document.getElementById('server-options-dropdown').classList.add('hidden');
    }
    if (!document.getElementById('emoji-button').contains(e.target)) {
        document.getElementById('emoji-picker').classList.add('hidden');
    }
});

// Draggable local video
const localVideoContainer = document.getElementById('local-video-container');
let isDragging = false;
let offsetX, offsetY;

localVideoContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - localVideoContainer.offsetLeft;
    offsetY = e.clientY - localVideoContainer.offsetTop;
    localVideoContainer.style.transition = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        const parentRect = localVideoContainer.parentElement.getBoundingClientRect();
        const elRect = localVideoContainer.getBoundingClientRect();
        
        x = Math.max(0, Math.min(x, parentRect.width - elRect.width));
        y = Math.max(0, Math.min(y, parentRect.height - elRect.height));

        localVideoContainer.style.left = `${x}px`;
        localVideoContainer.style.top = `${y}px`;
        localVideoContainer.style.right = 'auto';
        localVideoContainer.style.bottom = 'auto';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    localVideoContainer.style.transition = 'all 0.3s ease';
});

// Roles Drag and Drop
const rolesList = document.getElementById('roles-list');
rolesList.addEventListener('dragstart', (e) => {
    const roleId = e.target.dataset.roleId;
    if (roleId === 'owner') {
        e.preventDefault();
        return;
    }
    draggedRoleId = roleId;
    e.target.classList.add('role-dragging');
});
rolesList.addEventListener('dragend', (e) => {
    e.target.classList.remove('role-dragging');
    draggedRoleId = null;
});
rolesList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('[data-role-id]');
    if (target && target.dataset.roleId !== draggedRoleId && target.dataset.roleId !== 'owner') {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) / rect.height > 0.5;
        const draggedEl = rolesList.querySelector(`[data-role-id="${draggedRoleId}"]`);
        if (next) {
            target.parentNode.insertBefore(draggedEl, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedEl, target);
        }
    }
});
rolesList.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (!currentUserHasModPermissions()) return;
    const newRoleOrder = Array.from(rolesList.children).map(child => child.dataset.roleId);
    activeServerRoleOrder = newRoleOrder;
    await db.collection('servers').doc(activeServerId).update({ roleOrder: newRoleOrder });
});

// Member role checkbox handler
document.getElementById('server-members-list').addEventListener('change', async (e) => {
    if (e.target.type === 'checkbox') {
        if (!currentUserHasModPermissions()) return;
        const userId = e.target.dataset.userid;
        const roleId = e.target.dataset.roleid;
        const isChecked = e.target.checked;
        
        const memberRef = db.collection('servers').doc(activeServerId).collection('members').doc(userId);
        if (isChecked) {
            await memberRef.update({ roles: firebase.firestore.FieldValue.arrayUnion(roleId) });
        } else {
            await memberRef.update({ roles: firebase.firestore.FieldValue.arrayRemove(roleId) });
        }
    }
});

// Emoji picker
const emojiPicker = document.getElementById('emoji-picker');
const emojiButton = document.getElementById('emoji-button');
const messageInput = document.getElementById('message-input');
EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'text-2xl rounded-md hover:bg-gray-700';
    btn.textContent = emoji;
    btn.onclick = () => {
        messageInput.value += emoji;
        messageInput.focus();
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
    };
    emojiPicker.appendChild(btn);
});
emojiButton.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('hidden');
});