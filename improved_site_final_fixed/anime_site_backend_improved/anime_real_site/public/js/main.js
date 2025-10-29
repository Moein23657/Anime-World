/*
 * Main script for the AnimeWorld demo.
 *
 * This file contains all of the interactive logic that powers the
 * site: data fetching, rendering of components, search/filtering,
 * favourites handling, theme toggling and more.  Separating the
 * JavaScript from the HTML markup improves readability and makes it
 * easier to maintain and extend the application.
 */

// Global state
// When running this site directly from the filesystem (e.g. via
// `file://`), browsers may prohibit fetching local JSON because of
// CORS restrictions.  To ensure the app still functions offline,
// define a small fallback dataset here.  If `fetch()` succeeds the
// JSON file in `data/` will override this list.
// Updated fallback dataset containing real anime information.  If fetching the
// external JSON fails because of the file:// protocol, this array will be
// used instead.  To modify the list, edit data/anime-data.json and keep
// this fallback in sync.
const fallbackData = [
    {
        id: 1,
        title: { romaji: 'Solo Leveling', native: 'ارتقای انفرادی' },
        coverImage: { large: 'images/solo_leveling.png' },
        episodes: 25,
        status: 'FINISHED',
        format: 'TV',
        season: 'Winter',
        seasonYear: 2024,
        studios: { nodes: [ { name: 'A-1 پیکچرز' } ] },
        averageScore: 83,
        genres: ['اکشن', 'فانتزی', 'ماجراجویی'],
        description: 'سونگ جین‌-وو، ضعیف‌ترین شکارچی، پس از نجات از سیاه‌چاله‌ای مرگبار توانایی منحصر به فردی برای ارتقای قدرت خود پیدا می‌کند. او با مبارزه با هیولاهای مختلف و کشف اسرار قدرت جدیدش، از یک شکارچی بی‌اهمیت به پادشاه سایه‌ها تبدیل می‌شود.',
        trailer: { id: '', site: '' }
    },
    {
        id: 2,
        title: { romaji: "Frieren: Beyond Journey's End", native: 'فریرن: آن سوی پایان سفر' },
        coverImage: { large: 'images/frieren.png' },
        episodes: 28,
        status: 'FINISHED',
        format: 'TV',
        season: 'Fall',
        seasonYear: 2023,
        studios: { nodes: [ { name: 'مدهاوس' } ] },
        averageScore: 94,
        genres: ['فانتزی', 'ماجراجویی', 'درام'],
        description: 'فریرن، جادوگر الف که همراه گروه قهرمانان شیطان‌پادشاه را شکست داده است، پس از پایان سفر طولانی خود به معنای عمر و دوستی انسان‌ها می‌اندیشد. او همراه شاگردش فرنان و یک جنگجوی جوان در سفری تازه، در گذر زمان به ماهیت زندگی می‌پردازد.',
        trailer: { id: '', site: '' }
    },
    {
        id: 3,
        title: { romaji: 'The Apothecary Diaries', native: 'خاطرات یک داروساز' },
        coverImage: { large: 'images/apothecary.png' },
        episodes: 48,
        status: 'FINISHED',
        format: 'TV',
        season: 'Fall',
        seasonYear: 2023,
        studios: { nodes: [ { name: 'توهو انیمیشن و OLM' } ] },
        averageScore: 89,
        genres: ['رازآلود', 'تاریخی', 'درام'],
        description: 'ماوماو، دختر یک داروساز، به عنوان کنیزی در دربار امپراتوری فروخته می‌شود. او دانش پزشکی‌اش را پنهان می‌کند تا توجه کسی را جلب نکند، اما با حل راز بیماری کودکان امپراتور استعدادش آشکار و به ندیمه یکی از همسران امپراتور تبدیل می‌شود. ماوماو از این پس با مهارت‌های دارویی خود اسرار دربار را کشف می‌کند.',
        trailer: { id: '', site: '' }
    },
    {
        id: 4,
        title: { romaji: 'Kaiju No. 8', native: 'هیولای شماره ۸' },
        coverImage: { large: 'images/kaiju8.png' },
        episodes: 24,
        status: 'FINISHED',
        format: 'TV',
        season: 'Spring',
        seasonYear: 2024,
        studios: { nodes: [ { name: 'پروداکشن آی.جی' } ] },
        averageScore: 83,
        genres: ['اکشن', 'علمی تخیلی', 'هیولا'],
        description: 'کافکا هیبینو در دنیایی زندگی می‌کند که هیولاهای عظیم به نام کایجو به شهرها حمله می‌کنند. او در تیم پاک‌سازی اجساد کایجو کار می‌کند تا اینکه موجودی مرموز وارد بدنش می‌شود و به او توانایی تبدیل شدن به یک کایجو انسانی می‌دهد. کافکا با پنهان کردن هویتش به نیروی دفاعی ضدکایجو می‌پیوندد تا به وعده‌اش برای نابودی هیولاها عمل کند.',
        trailer: { id: '', site: '' }
    },
    {
        id: 5,
        title: { romaji: 'Spice and Wolf: Merchant Meets the Wise Wolf', native: 'ادویه و گرگ: تاجر و گرگ دانا' },
        coverImage: { large: 'images/spice_wolf.png' },
        episodes: 25,
        status: 'RELEASING',
        format: 'TV',
        season: 'Spring',
        seasonYear: 2024,
        studios: { nodes: [ { name: 'پاسیونه' } ] },
        averageScore: 80,
        genres: ['فانتزی', 'رومانس', 'ماجراجویی'],
        description: 'تاجر جوانی به نام کرفت لورنس در سفرهایش با هولو، الهه گرگ برداشت محصول با گوش‌های گرگ، روبه‌رو می‌شود. هولو می‌خواهد به سرزمین شمالی خود بازگردد و در عوض به لورنس در کسب‌و‌کارش کمک می‌کند. این دو همراه در مسیری پرماجرا از شهرهای قرون وسطایی عبور می‌کنند و پیوندی عمیق میان‌شان شکل می‌گیرد.',
        trailer: { id: '', site: '' }
    }
];

let allAnimeData = [];
let featuredAnime = [];
let currentPage = 1;
let totalPages = 1;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let comments = JSON.parse(localStorage.getItem('comments')) || {};
// Maintain a map of like/dislike counts for each comment.  Keys are anime IDs
// and values are objects keyed by comment index.  Each entry contains
// `{ like: <number>, dislike: <number> }`.  The data is persisted to
// localStorage so counts survive page reloads.  If nothing is stored
// previously the object defaults to an empty object.
let commentLikes = {};
try {
    commentLikes = JSON.parse(localStorage.getItem('commentLikes')) || {};
} catch (e) {
    commentLikes = {};
}
// Persisted personal ratings for each anime keyed by ID.  Each value is a number from 1–5.
let userRatings = {};
try {
    userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
} catch (e) {
    userRatings = {};
}
let currentSlide = 0;
let sliderInterval;

// User account and watchlist state
// The username is stored in localStorage under the 'username' key.  Per
// user watchlists and recently watched episodes are stored under
// `watchlist_<username>` and `recentlyWatched_<username>` respectively.
let username = null;
let watchlist = [];
let recentlyWatched = [];

// Track whether the admin form is editing an existing anime.  When null the form creates
// a new entry; otherwise it holds the ID of the anime being edited.  This variable is
// synchronised with the hidden input field #editing-id in the HTML.  Changing this
// value controls whether submitNewAnime() issues a POST (create) or PUT (update).
let editingId = null;

/**
 * Initialise user data from localStorage.  If a username is present
 * it will load their watchlist and recently watched history.  It
 * also updates navigation labels (e.g. login button) accordingly.
 */
function initUser() {
    try {
        username = localStorage.getItem('username') || null;
    } catch (e) {
        username = null;
    }
    const loginBtn = document.getElementById('login-nav-btn');
    const loginBtnMobile = document.getElementById('login-nav-btn-mobile');
    if (username) {
        try {
            watchlist = JSON.parse(localStorage.getItem('watchlist_' + username)) || [];
            recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched_' + username)) || [];
        } catch (e) {
            watchlist = [];
            recentlyWatched = [];
        }
        if (loginBtn) loginBtn.textContent = username;
        if (loginBtnMobile) loginBtnMobile.textContent = username;
    } else {
        watchlist = [];
        recentlyWatched = [];
        if (loginBtn) loginBtn.textContent = 'ورود';
        if (loginBtnMobile) loginBtnMobile.textContent = 'ورود';
    }
}

/**
 * Persist the current watchlist and recently watched history for the
 * logged‑in user to localStorage.  If no user is logged in this
 * function does nothing.
 */
function saveUserData() {
    if (!username) return;
    try {
        localStorage.setItem('watchlist_' + username, JSON.stringify(watchlist));
        localStorage.setItem('recentlyWatched_' + username, JSON.stringify(recentlyWatched));
    } catch (e) {
        console.warn('Unable to save user data', e);
    }
}

/**
 * Render the login page.  If a user is logged in, display a
 * greeting and logout button.  Otherwise show the login form.
 */
function renderLoginPage() {
    const container = document.getElementById('login-container');
    if (!container) return;
    if (username) {
        container.innerHTML = `<p class="text-gray-300">سلام ${username}!</p>` +
            `<button id="logout-btn" class="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg">خروج</button>`;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            logoutUser();
            renderLoginPage();
        });
    } else {
        container.innerHTML = `<form id="login-form" class="space-y-4">` +
            `<input id="username-input" type="text" placeholder="نام کاربری" class="bg-slate-800 text-gray-200 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none w-full" required>` +
            `<button type="submit" class="btn-gradient text-white px-6 py-2 rounded-lg font-medium">ورود / ثبت‌نام</button>` +
            `</form>`;
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('username-input');
                const name = input.value.trim();
                if (name) {
                    loginUser(name);
                    renderLoginPage();
                }
            });
        }
    }
}

/**
 * Log the user in by setting the username and persisting it to
 * localStorage.  Then reload user‑specific data and update the UI.
 *
 * @param {string} name – The username to set.
 */
function loginUser(name) {
    username = name;
    try {
        localStorage.setItem('username', username);
    } catch (e) {
        console.warn('Unable to persist username', e);
    }
    initUser();
}

/**
 * Log the user out by removing the username from localStorage and
 * clearing watchlist/history state.  Then update the UI.
 */
function logoutUser() {
    try {
        localStorage.removeItem('username');
    } catch (e) {
        console.warn('Unable to remove username', e);
    }
    username = null;
    watchlist = [];
    recentlyWatched = [];
    initUser();
}

/**
 * Toggle an anime’s presence in the watchlist.  Requires the user
 * to be logged in; otherwise they will be redirected to the login
 * page.  The click event is used to stop propagation so that
 * clicking the button doesn’t trigger card navigation.
 *
 * @param {number} id – The anime identifier.
 * @param {Event} event – The click event.
 */
function toggleWatchlist(id, event) {
    if (event) event.stopPropagation();
    if (!username) {
        alert('برای استفاده از لیست تماشا ابتدا وارد شوید.');
        showPage('login');
        return;
    }
    const idx = watchlist.indexOf(id);
    if (idx > -1) {
        watchlist.splice(idx, 1);
    } else {
        watchlist.push(id);
    }
    saveUserData();
    // Update button state in card or details view
    if (event) {
        const btn = event.target.closest('.watchlist-btn');
        if (btn) btn.classList.toggle('active');
    }
    const detailsBtn = document.getElementById('watchlist-btn');
    if (detailsBtn && document.getElementById('details-page').classList.contains('active')) {
        detailsBtn.classList.toggle('active', watchlist.includes(id));
    }
    // Re-render watchlist page if it is currently visible
    const watchlistPage = document.getElementById('watchlist-page');
    if (watchlistPage && watchlistPage.classList.contains('active')) {
        renderWatchlistGrid();
        renderRecentlyWatched();
    }
}

/**
 * Share the details of the selected anime with other apps or copy its
 * URL to the clipboard.  If the browser supports the Web Share API
 * the share sheet will be invoked with a title, text and URL.  When
 * unavailable the URL is copied to the clipboard and a message is
 * displayed.  The function gracefully handles user cancellation or
 * other errors.
 *
 * @param {number} animeId – The identifier of the anime to share.
 */
function shareAnime(animeId) {
    const anime = allAnimeData.find(a => a.id === animeId);
    if (!anime) return;
    // Construct a link to the details page using the current location
    const baseUrl = location.href.split('#')[0];
    const url = `${baseUrl}#details=${animeId}`;
    const shareData = {
        title: anime.title.romaji,
        text: anime.title.native || anime.title.romaji,
        url
    };
    if (navigator.share) {
        navigator.share(shareData).catch(err => {
            // Ignore abort errors (user cancelled) and log others
            if (err && err.name !== 'AbortError') {
                console.warn('Share failed', err);
            }
        });
    } else {
        // Fallback to copying the link to the clipboard.  If the Clipboard
        // API is unavailable prompt the user to copy manually.
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                alert('لینک در کلیپ‌بورد کپی شد!');
            }).catch(() => {
                // As a last resort use a prompt to display the URL
                prompt('لینک را کپی کنید:', url);
            });
        } else {
            prompt('لینک را کپی کنید:', url);
        }
    }
}

/**
 * Render the grid of watchlisted anime.  If the user is not logged
 * in or the watchlist is empty, display an appropriate message.
 */
function renderWatchlistGrid() {
    const grid = document.getElementById('watchlist-grid');
    if (!grid) return;
    if (!username) {
        grid.innerHTML = '<p class="text-gray-400 col-span-full">برای مشاهده لیست تماشا باید وارد شوید.</p>';
        return;
    }
    if (!watchlist || watchlist.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 col-span-full">لیست تماشای شما خالی است.</p>';
        return;
    }
    const data = allAnimeData.filter(anime => watchlist.includes(anime.id));
    if (data.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 col-span-full">اطلاعات انیمه‌های لیست شما بارگذاری نشده است.</p>';
        return;
    }
    grid.innerHTML = data.map(createAnimeCard).join('');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Display the user’s recently watched episodes as a list.  Each
 * entry shows the anime title and episode number and links back to
 * the details page.
 */
function renderRecentlyWatched() {
    const container = document.getElementById('recently-watched');
    if (!container) return;
    container.innerHTML = '';
    if (!username) {
        container.innerHTML = '<p class="text-gray-400">برای نمایش تاریخچه باید وارد شوید.</p>';
        return;
    }
    if (!recentlyWatched || recentlyWatched.length === 0) {
        container.innerHTML = '<p class="text-gray-400">هنوز هیچ قسمتی را مشاهده نکرده‌اید.</p>';
        return;
    }
    // Show most recent first
    const items = recentlyWatched.slice().reverse();
    items.forEach(item => {
        const anime = allAnimeData.find(a => a.id === item.animeId);
        if (!anime) return;
        const entry = document.createElement('div');
        entry.className = 'bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center hover:bg-slate-800';
        entry.innerHTML = `<span class="text-gray-200 cursor-pointer" onclick="showDetailsPage(${anime.id})">${anime.title.romaji} - قسمت ${item.episode}</span>` +
            `<span class="text-gray-500 text-xs">${new Date(item.timestamp).toLocaleString('fa-IR')}</span>`;
        container.appendChild(entry);
    });
}

/**
 * Record that the user has watched a specific episode of an anime.
 * Maintains a capped history (maximum 20 entries) and persists the
 * data for the current user.
 *
 * @param {number} animeId – The anime ID.
 * @param {number} episode – The episode number.
 */
function recordWatch(animeId, episode) {
    if (!username) return;
    recentlyWatched.push({ animeId, episode, timestamp: Date.now() });
    // Limit history length to 20 entries
    if (recentlyWatched.length > 20) {
        recentlyWatched = recentlyWatched.slice(recentlyWatched.length - 20);
    }
    saveUserData();
}

/**
 * Handle submission of the admin form to add a new anime.  Gathers
 * values from the form fields, constructs an object matching the
 * expected API schema and sends a POST request to the server.
 * Displays a message upon success or failure and refreshes the
 * catalogue by reloading data.
 *
 * @param {Event} e – The form submission event.
 */
async function submitNewAnime(e) {
    e.preventDefault();
    const msgEl = document.getElementById('admin-message');
    if (msgEl) msgEl.textContent = '';
    try {
        // Collect values from the form.  Trimming and parsing ensure that
        // numerical fields default to sensible values.
        const romaji = document.getElementById('new-romaji').value.trim();
        const nativeTitle = document.getElementById('new-native').value.trim();
        const cover = document.getElementById('new-cover').value.trim();
        const episodes = parseInt(document.getElementById('new-episodes').value, 10) || 12;
        const status = document.getElementById('new-status').value;
        const format = document.getElementById('new-format').value;
        const season = document.getElementById('new-season').value.trim();
        const year = parseInt(document.getElementById('new-year').value, 10);
        const studiosRaw = document.getElementById('new-studios').value.trim();
        const score = parseInt(document.getElementById('new-score').value, 10);
        const genresRaw = document.getElementById('new-genres').value.trim();
        const description = document.getElementById('new-description').value.trim();
        const studios = studiosRaw ? studiosRaw.split(',').map(s => ({ name: s.trim() })).filter(s => s.name) : [];
        const genresArr = genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : [];
        const payload = {
            title: { romaji: romaji, native: nativeTitle },
            coverImage: { large: cover },
            episodes: episodes,
            status: status,
            format: format,
            season: season || undefined,
            seasonYear: isNaN(year) ? undefined : year,
            studios: { nodes: studios },
            averageScore: isNaN(score) ? 0 : score,
            genres: genresArr,
            description: description,
            trailer: { id: '', site: '' }
        };
        // Determine whether we are creating a new entry or updating an existing one.
        const editingInput = document.getElementById('editing-id');
        const idVal = editingInput ? parseInt(editingInput.value, 10) : NaN;
        let endpoint = '/api/animes';
        let method = 'POST';
        if (!isNaN(idVal) && idVal > 0) {
            // Update existing anime via PUT
            endpoint = `/api/animes/${idVal}`;
            method = 'PUT';
        }
        const res = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('خطا در ارتباط با سرور');
        const result = await res.json();
        if (msgEl) {
            msgEl.classList.remove('text-red-500');
            msgEl.classList.add('text-green-500');
            if (method === 'POST') {
                msgEl.textContent = 'انیمه با موفقیت افزوده شد!';
            } else {
                msgEl.textContent = 'انیمه با موفقیت به‌روزرسانی شد!';
            }
        }
        // Reset editing state and button text
        if (editingInput) {
            editingInput.value = '';
        }
        editingId = null;
        const submitBtn = document.querySelector('#add-anime-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'افزودن انیمه';
        // Clear form
        document.getElementById('add-anime-form').reset();
        // Refresh the dataset and admin list
        await loadData();
        initAdmin();
    } catch (err) {
        if (msgEl) {
            msgEl.classList.remove('text-green-500');
            msgEl.classList.add('text-red-500');
            msgEl.textContent = 'خطا: ' + err.message;
        }
    }
}

/**
 * Initialise the admin dashboard.  This function renders the summary statistics
 * and the anime listing.  It should be invoked after the dataset has been
 * loaded or updated and whenever the admin page becomes active.  Icons are
 * replaced via Lucide at the end to ensure they display correctly.
 */
function initAdmin() {
    const adminStatsEl = document.getElementById('admin-stats');
    const adminListEl = document.getElementById('admin-anime-list');
    if (!adminStatsEl || !adminListEl) return;
    renderAdminStats();
    renderAdminList();
    // Replace icons in dynamically generated content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Compute and display basic statistics about the anime catalogue.  The stats
 * shown include the total number of entries, counts by status (finished vs
 * releasing), the average score of all titles, and the total number of
 * distinct genres.  Cards are styled using Tailwind classes for a cohesive
 * look.
 */
function renderAdminStats() {
    const statsEl = document.getElementById('admin-stats');
    if (!statsEl) return;
    const total = allAnimeData.length;
    const finishedCount = allAnimeData.filter(a => String(a.status).toUpperCase() === 'FINISHED').length;
    const releasingCount = allAnimeData.filter(a => String(a.status).toUpperCase() === 'RELEASING').length;
    const avgScore = total > 0 ? Math.round(allAnimeData.reduce((sum, a) => sum + (parseInt(a.averageScore, 10) || 0), 0) / total) : 0;
    const genreSet = new Set();
    allAnimeData.forEach(a => {
        (a.genres || []).forEach(g => genreSet.add(g));
    });
    const cards = [
        { label: 'تعداد کل انیمه‌ها', value: total },
        { label: 'پایان یافته', value: finishedCount },
        { label: 'در حال پخش', value: releasingCount },
        { label: 'میانگین امتیاز', value: avgScore },
        { label: 'ژانرهای منحصربه‌فرد', value: genreSet.size }
    ];
    statsEl.innerHTML = cards.map(card => {
        return `<div class="bg-slate-800/70 border border-slate-700 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-indigo-400">${card.value}</div>
            <div class="text-sm text-gray-300 mt-1">${card.label}</div>
        </div>`;
    }).join('');
}

/**
 * Build and render the table of all anime entries for the admin dashboard.  The
 * list is filtered by the current search term typed into #admin-search.  Each
 * row provides quick access to edit, delete and view comments actions.  The
 * table is constructed using minimal markup for accessibility and responsive
 * design via overflow scrolling.
 */
function renderAdminList() {
    const listEl = document.getElementById('admin-anime-list');
    if (!listEl) return;
    const searchInput = document.getElementById('admin-search');
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    // Filter anime by title (romaji or native)
    const filtered = allAnimeData.filter(item => {
        if (!term) return true;
        const romaji = String(item.title?.romaji || '').toLowerCase();
        const nativeTitle = String(item.title?.native || '').toLowerCase();
        return romaji.includes(term) || nativeTitle.includes(term);
    });
    // Sort descending by id (newest first)
    filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    // Build table HTML
    let html = '<table class="min-w-full divide-y divide-slate-700 text-sm text-right">';
    html += '<thead class="bg-slate-800"><tr>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">شناسه</th>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">عنوان رومجی</th>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">عنوان بومی</th>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">امتیاز</th>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">وضعیت</th>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">سال</th>' +
            '<th class="px-4 py-2 font-semibold text-gray-300">اقدامات</th>' +
            '</tr></thead>';
    html += '<tbody class="divide-y divide-slate-700">';
    filtered.forEach(item => {
        html += `<tr class="hover:bg-slate-800/70">` +
            `<td class="px-4 py-2 text-gray-400">${item.id}</td>` +
            `<td class="px-4 py-2 text-gray-200">${item.title?.romaji || ''}</td>` +
            `<td class="px-4 py-2 text-gray-200">${item.title?.native || ''}</td>` +
            `<td class="px-4 py-2 text-gray-200">${item.averageScore ?? ''}</td>` +
            `<td class="px-4 py-2 text-gray-200">${item.status || ''}</td>` +
            `<td class="px-4 py-2 text-gray-200">${item.seasonYear || ''}</td>` +
            `<td class="px-4 py-2"><div class="flex flex-wrap gap-2 justify-center">` +
                `<button class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs" onclick="handleEditAnime(${item.id})">ویرایش</button>` +
                `<button class="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs" onclick="handleDeleteAnime(${item.id})">حذف</button>` +
                `<button class="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs" onclick="handleShowComments(${item.id})">نظرات</button>` +
            `</div></td>` +
        `</tr>`;
    });
    html += '</tbody></table>';
    listEl.innerHTML = html;
}

/**
 * Populate the admin form with an existing anime for editing.  This function
 * retrieves the anime by id from the global dataset, fills the form fields,
 * sets the hidden editing field and updates the submit button label.  The
 * page scrolls to the top of the form to bring it into view for the user.
 *
 * @param {number} id – The ID of the anime to edit.
 */
function handleEditAnime(id) {
    const anime = allAnimeData.find(a => a.id === id);
    if (!anime) return;
    editingId = id;
    const editingInput = document.getElementById('editing-id');
    if (editingInput) editingInput.value = id;
    // Populate fields
    document.getElementById('new-romaji').value = anime.title?.romaji || '';
    document.getElementById('new-native').value = anime.title?.native || '';
    document.getElementById('new-cover').value = anime.coverImage?.large || '';
    document.getElementById('new-episodes').value = anime.episodes ?? '';
    document.getElementById('new-status').value = anime.status || 'RELEASING';
    document.getElementById('new-format').value = anime.format || 'TV';
    document.getElementById('new-season').value = anime.season || '';
    document.getElementById('new-year').value = anime.seasonYear ?? '';
    document.getElementById('new-studios').value = (anime.studios?.nodes || []).map(n => n.name).join(', ');
    document.getElementById('new-score').value = anime.averageScore ?? '';
    document.getElementById('new-genres').value = (anime.genres || []).join(', ');
    document.getElementById('new-description').value = anime.description || '';
    // Update submit button text to reflect edit mode
    const submitBtn = document.querySelector('#add-anime-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'ویرایش انیمه';
    // Scroll to form
    const formEl = document.getElementById('add-anime-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Prompt the user for confirmation and delete the specified anime.  After
 * successful deletion the dataset is reloaded and the admin view updated.
 *
 * @param {number} id – The ID of the anime to remove.
 */
async function handleDeleteAnime(id) {
    const confirmed = window.confirm('آیا از حذف این انیمه مطمئن هستید؟');
    if (!confirmed) return;
    try {
        const res = await fetch(`/api/animes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('حذف با خطا مواجه شد');
        // Refresh data and admin list
        await loadData();
        initAdmin();
    } catch (err) {
        alert('خطا: ' + err.message);
    }
}

/**
 * Fetch and display the comments associated with a specific anime.  The modal
 * title is updated to include the anime’s romaji title for context.  Each
 * comment is displayed with a delete button to allow moderation.
 *
 * @param {number} id – The anime ID whose comments are to be shown.
 */
async function handleShowComments(id) {
    const modalEl = document.getElementById('comments-modal');
    const container = document.getElementById('comments-container');
    const titleEl = document.getElementById('comments-modal-title');
    if (!modalEl || !container || !titleEl) return;
    try {
        const res = await fetch(`/api/animes/${id}/comments`);
        if (!res.ok) throw new Error('خطا در واکشی نظرات');
        const list = await res.json();
        // Find anime title for heading
        const anime = allAnimeData.find(a => a.id === id);
        const headerTitle = anime ? `نظرات «${anime.title?.romaji || anime.title?.native || ''}»` : 'نظرات';
        renderCommentsModal(id, headerTitle, list);
        modalEl.classList.remove('hidden');
    } catch (err) {
        alert('خطا: ' + err.message);
    }
}

/**
 * Render the comments modal content for a given anime.  The modal header and
 * comments list are constructed based on the provided values.  Each comment
 * row includes a delete button bound to handleDeleteComment().
 *
 * @param {number} id – Anime ID.
 * @param {string} headerTitle – The title to display at the top of the modal.
 * @param {Array<string>} commentsList – List of comment strings.
 */
function renderCommentsModal(id, headerTitle, commentsList) {
    const container = document.getElementById('comments-container');
    const titleEl = document.getElementById('comments-modal-title');
    const closeBtn = document.getElementById('close-comments-modal');
    if (!container || !titleEl || !closeBtn) return;
    titleEl.textContent = headerTitle;
    if (!Array.isArray(commentsList) || commentsList.length === 0) {
        container.innerHTML = '<p class="text-gray-300">نظری وجود ندارد.</p>';
    } else {
        container.innerHTML = commentsList.map((comment, idx) => {
            return `<div class="bg-slate-700 p-3 rounded-lg flex justify-between items-start gap-2">
                <span class="text-gray-200 break-words flex-1">${comment}</span>
                <button class="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs flex-shrink-0" onclick="handleDeleteComment(${id}, ${idx})">حذف</button>
            </div>`;
        }).join('');
    }
    // Attach close event
    closeBtn.onclick = () => closeCommentsModal();
}

/**
 * Hide the comments modal.  Called when the user presses the close button or
 * clicks outside the modal content.
 */
function closeCommentsModal() {
    const modalEl = document.getElementById('comments-modal');
    if (!modalEl) return;
    modalEl.classList.add('hidden');
}

/**
 * Delete a specific comment for an anime.  After deletion the comments list
 * is refreshed to reflect the updated state.  The server indexes comments
 * sequentially, so indices may change after removal.
 *
 * @param {number} animeId – The anime ID.
 * @param {number} index – The zero‑based index of the comment to delete.
 */
async function handleDeleteComment(animeId, index) {
    try {
        const res = await fetch(`/api/animes/${animeId}/comments/${index}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('خطا در حذف نظر');
        // Reload comments list
        await handleShowComments(animeId);
    } catch (err) {
        alert('خطا: ' + err.message);
    }
}

/**
 * Fetch the anime dataset from the local JSON file.  The returned
 * structure mirrors the original AniList API shape and can be
 * customised by editing `data/anime-data.json`.
 *
 * @returns {Promise<Array<Object>>} A promise resolving to an array of anime objects.
 */
async function fetchAnimeData() {
    try {
        // When running behind our Node server, fetch the list of anime via the API endpoint.  If this
        // request fails (e.g. if the server isn't running and the site is being served as static
        // files), fall back to loading the local JSON file from the data folder.  In a production
        // deployment the API will always be available.
        const response = await fetch('/api/animes');
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        // If fetching the external JSON fails (e.g. due to CORS on file protocol),
        // fall back to the built‑in dataset defined above.  Log the error for
        // diagnostic purposes.
        console.warn('Falling back to embedded anime data:', error);
        return fallbackData;
    }
}

/**
 * Load the dataset and initialise the UI.  This function populates
 * the global `allAnimeData` array, slices the featured items, and
 * triggers rendering of the hero slider, cards, filters and
 * pagination.  It also initialises scroll animations and the
 * favourites page if active.
 */
async function loadData() {
    allAnimeData = await fetchAnimeData();
    // Ensure there is at least one entry for rendering
    if (!Array.isArray(allAnimeData)) allAnimeData = [];
    // Build the featured list (max 5 entries)
    featuredAnime = allAnimeData.slice(0, Math.min(5, allAnimeData.length)).map(anime => ({
        id: anime.id,
        title: anime.title.native || anime.title.romaji,
        description: (anime.description || '').slice(0, 150) + ((anime.description || '').length > 150 ? '…' : ''),
        image: anime.coverImage && anime.coverImage.large ? anime.coverImage.large : ''
    }));
    renderHeroSlider();
    renderAnimeGrids();
    // Populate the top‑rated section after the other home grids
    renderTopRated();
    renderAllAnimeGrid();
    renderGenreFilters();
    renderPagination();
    initScrollAnimations();
    // Render favourites grid if currently on favourites page
    if (document.getElementById('favorites-page') && document.getElementById('favorites-page').classList.contains('active')) {
        renderFavoritesGrid();
    }
    // Initialise icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    updateScrollButton();

    // Load user state (username, watchlist, recently watched) and update UI
    initUser();

    // If the admin dashboard exists in the DOM, initialise it now.  This call
    // will populate the statistics and list based on the freshly fetched data.
    initAdmin();
}

/**
 * Render the hero slider at the top of the home page.  Each
 * featured item appears as a slide with a background image,
 * gradient overlay, title, description and a call‑to‑action button.
 */
function renderHeroSlider() {
    const sliderContainer = document.getElementById('hero-slider');
    const dotsContainer = document.getElementById('slider-dots');
    if (!sliderContainer || !dotsContainer) return;
    sliderContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    featuredAnime.forEach((anime, index) => {
        const slide = document.createElement('div');
        slide.className = `slider-item absolute inset-0 ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}" class="w-full h-full object-cover ken-burns" loading="lazy" decoding="async">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div class="hero-content absolute bottom-12 right-12 z-10 max-w-lg">
                <h2 class="hero-title text-5xl font-extrabold text-white mb-4" style="text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${anime.title}</h2>
                <p class="hero-desc text-gray-200 text-lg mb-6" style="text-shadow: 0 1px 5px rgba(0,0,0,0.5);">${anime.description}</p>
                <button onclick="showDetailsPage(${anime.id})" class="hero-btn btn-gradient text-white px-7 py-3 rounded-lg font-semibold transition-colors flex items-center text-base shadow-lg" aria-label="مشاهده و دانلود">
                    <i data-lucide="play" class="w-5 h-5 ml-2 fill-white"></i>
                    مشاهده و دانلود
                </button>
            </div>
        `;
        sliderContainer.appendChild(slide);
        const dot = document.createElement('button');
        dot.className = `slider-dot w-6 h-1.5 rounded-full transition-all duration-300 ${index === 0 ? 'bg-white w-10' : 'bg-white/40 hover:bg-white/70'}`;
        dot.onclick = () => showSlide(index);
        dotsContainer.appendChild(dot);
    });
    // Start automatic sliding
    startSlider();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Construct the HTML for a single anime card.  Cards are reused in
 * multiple sections such as “recent episodes”, “popular anime” and
 * the general catalogue.
 *
 * @param {Object} anime – The anime object from the dataset.
 * @returns {string} – HTML string representing the card.
 */
function createAnimeCard(anime) {
    const isFavorite = favorites.includes(anime.id);
    return `
        <div class="anime-card cursor-pointer" onclick="showDetailsPage(${anime.id})" tabindex="0" aria-label="${anime.title.romaji}">
            <div class="card-content relative aspect-[2/3] z-2">
                <div class="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col justify-end">
                    <h3 class="font-semibold text-lg text-white truncate">${anime.title.romaji}</h3>
                    <span class="text-xs text-gray-300 truncate">${anime.title.native || ''}</span>
                </div>
                <div class="absolute top-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
                    قسمت ${anime.episodes || '?'}
                </div>
                <div class="absolute top-3 left-3 bg-indigo-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    ${anime.format}
                </div>
                <button class="favorite-btn absolute top-12 left-3 bg-slate-800/70 p-1 rounded-full text-gray-300 hover:text-pink-500 transition-colors ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${anime.id}, event)" aria-label="علاقه‌مندی">
                    <i data-lucide="heart" class="w-4 h-4"></i>
                </button>
                <!-- Rating indicator -->
                <div class="absolute bottom-3 left-3 flex items-center gap-1 text-yellow-400 text-xs font-semibold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                    <i data-lucide="star" class="w-3 h-3 fill-yellow-400"></i>
                    ${(anime.averageScore / 10).toFixed(1)}
                </div>
            </div>
            <div class="play-icon" aria-hidden="true">
                <i data-lucide="play" class="w-8 h-8 text-indigo-600 fill-indigo-600" style="margin-left: 4px;"></i>
            </div>
            <img src="${anime.coverImage.large}" alt="${anime.title.native || anime.title.romaji}" class="absolute inset-0 w-full h-full object-cover z-1" loading="lazy" decoding="async">
        </div>
    `;
}

/**
 * Render the “recent episodes” and “popular anime” sections on the
 * home page.  Recent episodes show the first six items in the
 * dataset, while popular anime sort by score.
 */
function renderAnimeGrids() {
    const recentContainer = document.getElementById('recent-episodes');
    const popularContainer = document.getElementById('popular-anime');
    if (recentContainer) {
        recentContainer.innerHTML = allAnimeData.slice(0, 6).map(createAnimeCard).join('');
    }
    if (popularContainer) {
        const sorted = allAnimeData.slice().sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
        popularContainer.innerHTML = sorted.slice(0, 6).map(createAnimeCard).join('');
    }
    initCardSpotlight();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Render the trending section based on user ratings, if it exists.  This
    // ensures the home page reflects the most popular titles whenever the
    // grids are refreshed.  The helper will no‑op if the container
    // doesn’t exist.
    if (typeof renderTrending === 'function') {
        renderTrending();
    }
}

/**
 * Render the highest‑scoring anime on the home page.  This section
 * displays a handful of top‑rated titles sorted in descending order
 * of averageScore.  The number of items shown is capped to match
 * the grid in the template.  If no container exists (e.g. the
 * section was removed), the function exits silently.
 */
function renderTopRated() {
    const container = document.getElementById('top-rated-anime');
    if (!container) return;
    // Clone and sort the dataset by descending score
    const sorted = allAnimeData.slice().sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    // Determine how many cards to render.  The grid accommodates up to 6 items on large screens.
    const limit = 6;
    const top = sorted.slice(0, limit);
    container.innerHTML = top.map(createAnimeCard).join('');
    initCardSpotlight();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render the trending anime section on the home page.  Trending titles
 * are determined by looking at personal user ratings stored in
 * `userRatings`.  Items are sorted first by the user’s rating (5–1)
 * and then by their global average score to break ties.  If no
 * container exists in the DOM the function exits without doing
 * anything.  Only a handful of top entries are shown to fit the
 * layout (up to six).  If a user hasn’t rated any anime yet, the
 * fallback ordering will mirror the top rated section.
 */
function renderTrending() {
    const container = document.getElementById('trending-anime');
    if (!container) return;
    // Clone the data so sorting doesn’t affect the original array
    const sorted = allAnimeData.slice().sort((a, b) => {
        const ratingA = userRatings[String(a.id)] || 0;
        const ratingB = userRatings[String(b.id)] || 0;
        if (ratingA !== ratingB) {
            return ratingB - ratingA;
        }
        // Fall back to average score if user ratings are equal or absent
        return ((b.averageScore || 0) - (a.averageScore || 0));
    });
    const limit = 6;
    const top = sorted.slice(0, limit);
    container.innerHTML = top.map(createAnimeCard).join('');
    initCardSpotlight();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render all anime in a grid for the catalogue page or apply a
 * filtered list if provided.
 *
 * @param {Array<Object>} [filteredData=allAnimeData] – The subset of anime to display.
 */
function renderAllAnimeGrid(filteredData = allAnimeData) {
    const grid = document.getElementById('all-anime-grid');
    if (!grid) return;
    grid.innerHTML = filteredData.map(createAnimeCard).join('');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Build the list of unique genres from the dataset and populate
 * filter controls.  Each genre appears both as a clickable button
 * and as an option within a select input.
 */
function renderGenreFilters() {
    const genres = new Set(allAnimeData.flatMap(a => a.genres));
    const genreButtons = document.getElementById('genre-buttons');
    const genreFilter = document.getElementById('genre-filter');
    if (!genreButtons || !genreFilter) return;
    genreButtons.innerHTML = '';
    genreFilter.innerHTML = '<option value="">همه ژانرها</option>';
    genres.forEach(genre => {
        genreButtons.innerHTML += `
            <a href="#" onclick="filterByGenre('${genre}')" class="bg-slate-800/70 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-600 text-gray-200 font-medium py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 backdrop-blur-sm" aria-label="ژانر ${genre}">
                ${genre}
            </a>
        `;
        genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
    });
}

/**
 * Render pagination controls.  In this simplified demo the full
 * dataset is loaded client‑side, so pagination simply updates the
 * current page indicator and scrolls to the top.  You can extend
 * this function to perform client‑side slicing.
 */
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) {
        pagination.innerHTML += `
            <button onclick="changePage(${i})" class="px-4 py-2 rounded-lg ${i === currentPage ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white'} transition-colors" aria-label="صفحه ${i}">
                ${i}
            </button>
        `;
    }
}

/**
 * Render the grid of favourite anime based on IDs stored in
 * `favorites`.  If there are no favourites, a placeholder message
 * appears.
 */
function renderFavoritesGrid() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;
    if (!favorites || favorites.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 col-span-full">لیست علاقه‌مندی شما خالی است.</p>';
        return;
    }
    const favData = allAnimeData.filter(anime => favorites.includes(anime.id));
    if (favData.length === 0) {
        grid.innerHTML = '<p class="text-gray-400 col-span-full">اطلاعات انیمه‌های مورد علاقه شما بارگذاری نشده است. لطفاً یکبار دیگر صفحه‌ها را مرور کنید.</p>';
        return;
    }
    grid.innerHTML = favData.map(createAnimeCard).join('');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Change the current catalogue page.  In this demo pagination is
 * cosmetic; all anime are always loaded.  You can extend this to
 * slice `allAnimeData` for real client‑side paging.
 *
 * @param {number} page – The page to navigate to.
 */
function changePage(page) {
    currentPage = page;
    renderAllAnimeGrid();
    renderAnimeGrids();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render the details page for a single anime.  This function
 * populates poster, titles, synopsis, meta information, episodes
 * listing, favourites button state and comments.
 *
 * @param {Object} anime – The anime to show.
 */
function renderDetailsPage(anime) {
    const poster = document.getElementById('details-poster');
    const titleEl = document.getElementById('details-title');
    const synopsisEl = document.getElementById('details-synopsis');
    const statusEl = document.getElementById('details-status');
    const typeEl = document.getElementById('details-type');
    const seasonEl = document.getElementById('details-season');
    const studioEl = document.getElementById('details-studio');
    const scoreEl = document.getElementById('details-score');
    const genresContainer = document.getElementById('details-genres');
    const trailerContainer = document.getElementById('details-trailer');
    const episodesContainer = document.getElementById('details-episodes');
    const favBtn = document.getElementById('favorite-btn');
    if (!poster || !titleEl) return;
    poster.src = anime.coverImage.large;
    // Use Romaji as main title and display native below
    const subtitleLines = [];
    if (anime.title.native) {
        subtitleLines.push(`<span class="block text-lg font-normal text-gray-400">${anime.title.native}</span>`);
    }
    titleEl.innerHTML = `${anime.title.romaji}${subtitleLines.join('')}`;
    synopsisEl.textContent = anime.description.replace(/<br>/g, '');
    statusEl.textContent = anime.status === 'FINISHED' ? 'پایان یافته' : 'در حال پخش';
    typeEl.textContent = anime.format;
    seasonEl.textContent = `${anime.season || 'نامشخص'} ${anime.seasonYear || ''}`;
    studioEl.textContent = anime.studios.nodes[0]?.name || 'نامشخص';
    // Display the average score as a horizontal bar instead of a single star.
    // Use the raw score (0–100) and constrain it between 0 and 100.
    const rawScore = anime.averageScore ?? 0;
    const barPercent = Math.min(Math.max(rawScore, 0), 100);
    scoreEl.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="relative w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div class="absolute left-0 top-0 h-2 bg-yellow-500" style="width:${barPercent}%;"></div>
            </div>
            <span class="text-gray-300 text-sm">${rawScore}/100</span>
        </div>
    `;
    genresContainer.innerHTML = anime.genres.map(genre => `<span class="bg-slate-700/50 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full border border-slate-700">${genre}</span>`).join('');
    // Trailer handling: show message if no trailer
    if (anime.trailer && anime.trailer.site === 'youtube' && anime.trailer.id) {
        trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${anime.trailer.id}" frameborder="0" allowfullscreen></iframe>`;
    } else {
        trailerContainer.innerHTML = '<p class="text-gray-400">تریلر موجود نیست.</p>';
    }
    // Episodes listing
    episodesContainer.innerHTML = '';
    const episodeCount = anime.episodes || 12;
    // Determine which episodes have been watched by building a set
    const watchedSet = new Set();
    if (Array.isArray(recentlyWatched)) {
        recentlyWatched.forEach(item => {
            if (item.animeId === anime.id) {
                watchedSet.add(item.episode);
            }
        });
    }
    for (let i = 1; i <= episodeCount; i++) {
        // Flag whether this episode has been viewed
        const watched = watchedSet.has(i);
        // Conditionally render a check icon to indicate progress
        const watchedIcon = watched ? `<i data-lucide="check-circle" class="w-4 h-4 text-green-500 ml-1"></i>` : '';
        episodesContainer.innerHTML += `
            <div class="bg-slate-800/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 border border-slate-700/50 shadow-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800">
                <span class="font-semibold text-lg text-white">${watchedIcon} قسمت ${i}</span>
                <div class="flex gap-3 flex-wrap">
                    <a href="#" class="btn-gradient text-white text-sm px-5 py-2.5 rounded-lg font-medium flex items-center shadow-lg" aria-label="دانلود قسمت ${i} 1080p">
                        <i data-lucide="download" class="w-4 h-4 ml-2"></i>
                        دانلود (1080p)
                    </a>
                    <a href="#" class="flex items-center bg-slate-600/50 hover:bg-slate-600 border border-slate-500 text-gray-200 text-sm px-5 py-2.5 rounded-lg font-medium transition-colors" aria-label="دانلود قسمت ${i} 720p">
                        <i data-lucide="download" class="w-4 h-4 ml-2"></i>
                        (720p)
                    </a>
                    <button onclick="playEpisode(${i}, ${anime.id})" class="flex items-center bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-500 text-white text-sm px-5 py-2.5 rounded-lg font-medium transition-colors" aria-label="پخش آنلاین قسمت ${i}">
                        <i data-lucide="play" class="w-4 h-4 ml-2"></i>
                        پخش آنلاین
                    </button>
                </div>
            </div>
        `;
    }
    // Favourites button state
    favBtn.classList.toggle('active', favorites.includes(anime.id));
    favBtn.onclick = (e) => { toggleFavorite(anime.id, e); };
    // Watchlist button
    const watchBtn = document.getElementById('watchlist-btn');
    if (watchBtn) {
        watchBtn.classList.toggle('active', watchlist.includes(anime.id));
        watchBtn.onclick = (e) => { toggleWatchlist(anime.id, e); };
    }
    // Share button handler: bind the click to invoke the share function
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.onclick = () => {
            shareAnime(anime.id);
        };
    }
    // Render comments
    renderComments(anime.id);
    // Show recommendations and user rating for the current anime
    renderRecommendations(anime);
    renderUserRating(anime.id);
    // After rendering user rating, display the watch progress bar.  This
    // uses the recently watched history to compute how many episodes
    // have been viewed.
    renderWatchProgress(anime);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Handle search operations.  Text entered into the search input
 * filters anime by their Romaji or native titles.  Matching
 * results replace the contents of the home or list grids.
 */
function searchAnime() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const query = input.value.toLowerCase();
    const filtered = allAnimeData.filter(anime => (
        anime.title.romaji.toLowerCase().includes(query) ||
        (anime.title.native && anime.title.native.toLowerCase().includes(query))
    ));
    if (document.getElementById('home-page') && document.getElementById('home-page').classList.contains('active')) {
        const recent = document.getElementById('recent-episodes');
        const popular = document.getElementById('popular-anime');
        if (recent) recent.innerHTML = filtered.slice(0, 6).map(createAnimeCard).join('');
        if (popular) popular.innerHTML = filtered.slice(0, 6).map(createAnimeCard).join('');
    } else if (document.getElementById('anime-list-page') && document.getElementById('anime-list-page').classList.contains('active')) {
        renderAllAnimeGrid(filtered);
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Filter anime based on selected genre, status and sort order.  The
 * filter controls are located on the list page.
 */
function filterAnime() {
    const genre = document.getElementById('genre-filter').value;
    const status = document.getElementById('status-filter').value;
    const sort = document.getElementById('sort-filter').value;
    // Minimum score filter: allow users to specify a lower bound for the average score.  When the
    // field is empty or invalid, no score filtering occurs.  Because the input type is
    // number, empty strings evaluate to NaN which we coerce to 0.
    let minScore = 0;
    const ratingInput = document.getElementById('rating-min-filter');
    if (ratingInput) {
        const val = parseInt(ratingInput.value);
        if (!isNaN(val) && val >= 0) {
            minScore = val;
        }
    }
    let filtered = allAnimeData.filter(anime => {
        const matchesGenre = (!genre || anime.genres.includes(genre));
        const matchesStatus = (!status || anime.status === status);
        const matchesScore = (!minScore || (anime.averageScore || 0) >= minScore);
        return matchesGenre && matchesStatus && matchesScore;
    });
    if (sort === 'score-desc') {
        filtered.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    } else if (sort === 'score-asc') {
        filtered.sort((a, b) => (a.averageScore || 0) - (b.averageScore || 0));
    } else if (sort === 'title-asc') {
        filtered.sort((a, b) => a.title.romaji.localeCompare(b.title.romaji));
    } else if (sort === 'year-desc') {
        // Sort from newest to oldest based on seasonYear
        filtered.sort((a, b) => (b.seasonYear || 0) - (a.seasonYear || 0));
    } else if (sort === 'year-asc') {
        // Sort from oldest to newest based on seasonYear
        filtered.sort((a, b) => (a.seasonYear || 0) - (b.seasonYear || 0));
    }
    renderAllAnimeGrid(filtered);
}

/**
 * Apply a single genre filter and navigate to the list page.
 *
 * @param {string} genre – The genre to filter by.
 */
function filterByGenre(genre) {
    const genreFilter = document.getElementById('genre-filter');
    if (genreFilter) {
        genreFilter.value = genre;
    }
    filterAnime();
    showPage('anime-list');
}

/**
 * Toggle an anime’s presence in the favourites list.  The list
 * persists to localStorage under the `favorites` key.
 *
 * @param {number} id – The anime identifier.
 * @param {Event} event – The click event (used to stop propagation).
 */
function toggleFavorite(id, event) {
    event.stopPropagation();
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Update favourite icon state on the clicked button
    const btn = event.target.closest('.favorite-btn');
    if (btn) {
        btn.classList.toggle('active');
    }
    // Update details page favourite button if visible
    const detailsBtn = document.getElementById('favorite-btn');
    if (detailsBtn && document.getElementById('details-page').classList.contains('active')) {
        detailsBtn.classList.toggle('active');
    }
    // Re-render relevant sections
    renderAnimeGrids();
    renderAllAnimeGrid();
    if (document.getElementById('favorites-page') && document.getElementById('favorites-page').classList.contains('active')) {
        renderFavoritesGrid();
    }
}

/**
 * Render the comments associated with a specific anime.  Comments are
 * stored in an object keyed by anime ID and persisted to
 * localStorage.
 *
 * @param {number} animeId – The ID of the anime whose comments to show.
 */
/**
 * Render the comment list for a given anime.  Comments are loaded
 * from the API endpoint `/api/animes/:id/comments`.  If the API
 * request fails (e.g. because the server is not running or returns
 * an error), the function falls back to comments stored in
 * localStorage under the global `comments` object.  Each comment is
 * wrapped in a styled container for display.
 *
 * @param {number} animeId – The ID of the anime for which to load comments.
 */
async function renderComments(animeId) {
    const section = document.getElementById('comments-section');
    if (!section) return;
    section.innerHTML = '';
    let list = [];
    // Attempt to fetch comments from the server API
    try {
        const res = await fetch(`/api/animes/${animeId}/comments`);
        if (res.ok) {
            list = await res.json();
        }
    } catch (err) {
        console.warn('Unable to load comments from API:', err);
    }
    // If the server returned an empty list, fall back to comments stored locally
    if (!Array.isArray(list) || list.length === 0) {
        list = comments[animeId] || [];
    }
    displayComments(list, animeId);
}

/**
 * Escape HTML entities in a string to prevent injection attacks when
 * inserting user‑generated content into the DOM.  Replaces the
 * characters & < > " and ' with their corresponding HTML entities.
 *
 * @param {string} str – The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[c]);
}

/**
 * Render a list of comments for a specific anime along with like and
 * dislike buttons.  Like/dislike counts are persisted via the
 * `commentLikes` object.  Clicking the buttons updates the count
 * and re‑renders the entire comment list so that counts update
 * immediately.  Icons are regenerated after each render.
 *
 * @param {Array<string>} list – The list of comment texts to display.
 * @param {number} animeId – The anime ID these comments belong to.
 */
function displayComments(list, animeId) {
    const section = document.getElementById('comments-section');
    if (!section) return;
    section.innerHTML = '';
    list.forEach((comment, idx) => {
        // Initialise like/dislike counts for this comment if not present
        if (!commentLikes[animeId]) commentLikes[animeId] = {};
        const key = String(idx);
        if (!commentLikes[animeId][key]) {
            commentLikes[animeId][key] = { like: 0, dislike: 0 };
        }
        const counts = commentLikes[animeId][key];
        section.innerHTML += `
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-2">
                <p class="text-gray-300">${escapeHTML(comment)}</p>
                <div class="flex gap-4 text-sm">
                    <button class="like-btn flex items-center gap-1 text-gray-400 hover:text-yellow-400 transition-colors" data-anime="${animeId}" data-index="${key}" data-action="like" aria-label="پسندیدن نظر">
                        <i data-lucide="thumbs-up" class="w-4 h-4"></i><span>${counts.like}</span>
                    </button>
                    <button class="dislike-btn flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors" data-anime="${animeId}" data-index="${key}" data-action="dislike" aria-label="نپسندیدن نظر">
                        <i data-lucide="thumbs-down" class="w-4 h-4"></i><span>${counts.dislike}</span>
                    </button>
                </div>
            </div>
        `;
    });
    // Attach click handlers to like/dislike buttons
    const buttons = section.querySelectorAll('button.like-btn, button.dislike-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const aId = btn.getAttribute('data-anime');
            const idx = btn.getAttribute('data-index');
            const action = btn.getAttribute('data-action');
            if (!commentLikes[aId]) commentLikes[aId] = {};
            if (!commentLikes[aId][idx]) commentLikes[aId][idx] = { like: 0, dislike: 0 };
            commentLikes[aId][idx][action] += 1;
            try {
                localStorage.setItem('commentLikes', JSON.stringify(commentLikes));
            } catch (err) {
                console.warn('Unable to persist comment likes', err);
            }
            // Re-render to update counts
            displayComments(list, animeId);
            // Regenerate icons to apply lucide rendering to newly inserted SVGs
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
    // After injecting new markup ensure lucide icons are rendered
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Add a new comment to the currently viewed anime.  The form
 * submission is intercepted to prevent a page reload.
 *
 * @param {Event} event – The submit event.
 */
/**
 * Submit a new comment for the currently viewed anime.  The default
 * form submission is prevented to avoid a full page reload.  The
 * comment text is sent to the server via a POST request to
 * `/api/animes/:id/comments`.  If the server request fails, the
 * comment is stored locally in the `comments` object and persisted
 * to localStorage as a fallback.  After submission the comments
 * list is refreshed and the input is cleared.
 *
 * @param {Event} event – The submit event from the comment form.
 */
async function addComment(event) {
    event.preventDefault();
    const textInput = document.getElementById('comment-text');
    if (!textInput) return;
    const text = textInput.value.trim();
    if (!text) return;
    const animeId = parseInt(location.hash.split('=')[1]) || 1;
    let sentToServer = false;
    try {
        const res = await fetch(`/api/animes/${animeId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        sentToServer = res.ok;
    } catch (err) {
        console.warn('Failed to post comment to API:', err);
    }
    // If the server didn't accept the comment, store locally as a fallback
    if (!sentToServer) {
        if (!comments[animeId]) comments[animeId] = [];
        comments[animeId].push(text);
        localStorage.setItem('comments', JSON.stringify(comments));
    }
    // Refresh the comment list to include the new entry
    renderComments(animeId);
    textInput.value = '';
}

/**
 * Play an episode in the modal.  For demonstration purposes all
 * episodes load the same placeholder YouTube video.  Replace
 * `videoUrl` with your own links to enable actual streaming.
 *
 * @param {number} episode – The episode number.
 * @param {number} animeId – The anime identifier (unused in this stub).
 */
function playEpisode(episode, animeId) {
    // Record the viewing in the user’s history before playback
    recordWatch(animeId, episode);
    // Immediately update the watch progress display on the details page.  This
    // ensures the progress bar reflects the newly watched episode without
    // requiring a page reload.  Look up the anime object by ID and
    // recompute the progress bar; if it’s not found, silently skip.
    const animeForProgress = allAnimeData.find(a => a.id === animeId);
    if (animeForProgress) {
        renderWatchProgress(animeForProgress);
    }
    const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
    const iframe = document.getElementById('video-iframe');
    const modal = document.getElementById('video-modal');
    if (!iframe || !modal) return;
    iframe.src = videoUrl;
    modal.classList.add('active');
}

/**
 * Close the video modal and stop playback.  Removes the `src` to
 * ensure the video stops streaming.
 */
function closeModal() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');
    if (!modal || !iframe) return;
    modal.classList.remove('active');
    iframe.src = '';
}

/**
 * Toggle between dark and light themes.  The chosen mode is stored
 * in localStorage under the `theme` key.
 */
function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('#theme-toggle i');
    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
        if (icon) icon.setAttribute('data-lucide', 'sun');
        localStorage.setItem('theme', 'light');
    } else {
        if (icon) icon.setAttribute('data-lucide', 'moon');
        localStorage.setItem('theme', 'dark');
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Add a spotlight effect to anime cards using the mouse position.
 */
function initCardSpotlight() {
    document.querySelectorAll('.anime-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/**
 * Reveal elements as they scroll into view.  Uses the Intersection
 * Observer API for better performance than manual scroll events.
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

/**
 * Show one of the main pages by ID.  All pages have the class
 * `page` and an ID ending with `-page`.  Additional string
 * shortcuts allow using 'anime-list' and 'favorites' as keys.
 *
 * @param {string} pageId – The canonical page identifier.
 */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    let targetId;
    if (pageId === 'anime-list') {
        targetId = 'anime-list-page';
    } else if (pageId === 'favorites') {
        targetId = 'favorites-page';
    } else {
        targetId = `${pageId}-page`;
    }
    const pageEl = document.getElementById(targetId);
    if (pageEl) {
        pageEl.classList.add('active');
    }
    if (pageId === 'favorites') {
        renderFavoritesGrid();
    } else if (pageId === 'watchlist') {
        renderWatchlistGrid();
        renderRecentlyWatched();
    } else if (pageId === 'login') {
        renderLoginPage();
    } else if (pageId === 'admin') {
        // When navigating to the admin dashboard always rebuild the list and
        // statistics.  Without this call the admin panel may display stale
        // data if the user added, edited or deleted entries on a different
        // page.  Calling initAdmin() here ensures the UI stays in sync with
        // the underlying dataset whenever the admin page becomes active.
        initAdmin();
    }
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initScrollAnimations();
}

/**
 * Navigate to a specific anime’s detail page.  Updates the URL
 * fragment to include the ID and displays the details view.
 *
 * @param {number} animeId – The ID of the anime to display.
 */
function showDetailsPage(animeId) {
    const anime = allAnimeData.find(a => a.id === animeId);
    if (anime) {
        renderDetailsPage(anime);
        location.hash = `details=${animeId}`;
        showPage('details');
    } else {
        alert('انیمه یافت نشد. لطفاً صبر کنید...');
    }
}

/**
 * Begin cycling through the hero slides.  Clears any existing
 * interval before starting a new one.
 */
function startSlider() {
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 6000);
}

/**
 * Show a specific slide in the hero slider.  Handles wraparound
 * index values gracefully.
 *
 * @param {number} index – The index of the slide to show.
 */
function showSlide(index) {
    const slides = document.querySelectorAll('.slider-item');
    const dots = document.querySelectorAll('.slider-dot');
    if (slides.length === 0) return;
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => {
        dot.classList.replace('bg-white', 'bg-white/40');
        dot.classList.replace('w-10', 'w-6');
    });
    slides[index].classList.add('active');
    dots[index].classList.replace('bg-white/40', 'bg-white');
    dots[index].classList.replace('w-6', 'w-10');
    currentSlide = index;
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Update visibility of the scroll‑to‑top button based on scroll
 * position.
 */
function updateScrollButton() {
    // Show or hide the scroll to top button based on page scroll position.  The
    // button starts out with the `hidden` utility class applied via Tailwind.
    // When the user scrolls down a reasonable distance we remove this class
    // so the button becomes visible.  Removing the bespoke `.show` toggle
    // simplifies the behaviour and avoids relying on undefined CSS selectors.
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;
    if (window.scrollY > 400) {
        btn.classList.remove('hidden');
    } else {
        // Hide the button when near the top of the page
        if (!btn.classList.contains('hidden')) btn.classList.add('hidden');
    }
}

/**
 * Initialise event listeners and restore persisted settings when the
 * DOM is ready.  This ensures that the theme preference is applied
 * before rendering and that handlers are bound exactly once.
 */
// ---------------------------------------------------------------------------
// Additional features: live search suggestions, recommendations and user ratings
// ---------------------------------------------------------------------------
/**
 * Update search suggestions based on the user's input.  When a query of at
 * least two characters is entered in the search box, a dropdown of up to
 * five matching titles appears.  Selecting a suggestion will open the
 * details page for the corresponding anime and hide the list.
 */
function updateSearchSuggestions() {
    const inputEl = document.getElementById('search-input');
    const listEl = document.getElementById('search-suggestions');
    if (!inputEl || !listEl) return;
    const query = inputEl.value.trim().toLowerCase();
    if (query.length < 2) {
        listEl.innerHTML = '';
        listEl.classList.add('hidden');
        return;
    }
    // Find up to five matching anime by comparing both romaji and native titles.
    const matches = allAnimeData.filter(anime => {
        const romaji = (anime.title.romaji || '').toLowerCase();
        const nativeTitle = (anime.title.native || '').toLowerCase();
        return romaji.includes(query) || nativeTitle.includes(query);
    }).slice(0, 5);
    if (matches.length === 0) {
        listEl.innerHTML = '';
        listEl.classList.add('hidden');
        return;
    }
    // Escape special regex characters in the query to avoid syntax errors when creating the RegExp
    const escQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escQuery, 'gi');
    // Build suggestion list items with a cover thumbnail and highlighted query in the title.  We
    // include the native title as a subtle secondary line to help users differentiate similar
    // series.  Tailwind classes provide spacing and hover feedback.
    listEl.innerHTML = matches.map(anime => {
        const romajiTitle = anime.title.romaji || '';
        const nativeTitle = anime.title.native || '';
        const highlighted = romajiTitle.replace(regex, match => `<span class="text-indigo-400 font-semibold">${match}</span>`);
        return `
            <li data-id="${anime.id}" class="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-700 rounded">
                <img src="${anime.coverImage.large}" alt="" class="w-8 h-12 object-cover rounded-sm shrink-0" loading="lazy" decoding="async">
                <div class="overflow-hidden">
                    <span class="block truncate">${highlighted}</span>
                    ${nativeTitle ? `<span class="block text-xs text-gray-400 truncate">${nativeTitle}</span>` : ''}
                </div>
            </li>
        `;
    }).join('');
    // Attach click handlers to each suggestion.  When a suggestion is selected the
    // search input is cleared and the suggestions list is hidden.
    listEl.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const id = parseInt(li.getAttribute('data-id'), 10);
            showDetailsPage(id);
            inputEl.value = '';
            listEl.innerHTML = '';
            listEl.classList.add('hidden');
        });
    });
    listEl.classList.remove('hidden');
}

/**
 * Generate a list of recommended anime for a given entry based on shared
 * genres and average score.  The resulting cards appear on the details
 * page below the episode list.  If no suitable recommendations are found
 * a short message is displayed instead.
 *
 * @param {Object} currentAnime – The anime currently being viewed.
 */
function renderRecommendations(currentAnime) {
    const container = document.getElementById('recommended-anime');
    if (!container) return;
    const recommendations = allAnimeData
        .filter(item => item.id !== currentAnime.id)
        .map(item => {
            const shared = (item.genres || []).filter(g => (currentAnime.genres || []).includes(g)).length;
            const score = shared * 100 + (item.averageScore || 0);
            return { item, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(entry => entry.item);
    if (recommendations.length === 0) {
        container.innerHTML = '<p class="text-gray-400 col-span-full">مورد مشابهی یافت نشد.</p>';
        return;
    }
    container.innerHTML = recommendations.map(createAnimeCard).join('');
    initCardSpotlight();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render and manage the user rating component on the details page.  Users can
 * assign a rating between 1 and 5 stars.  Ratings are stored in
 * localStorage per anime ID and persist across sessions on the same device.
 *
 * @param {number} animeId – The ID of the anime being rated.
 */
function renderUserRating(animeId) {
    const container = document.getElementById('user-rating');
    if (!container) return;
    const currentRating = parseInt(userRatings[String(animeId)], 10) || 0;
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= currentRating;
        const starChar = filled ? '★' : '☆';
        const color = filled ? '#facc15' : '#64748b';
        html += `<span class="user-rating-star" data-value="${i}" style="color:${color};">${starChar}</span>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.user-rating-star').forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'), 10);
            userRatings[String(animeId)] = val;
            try {
                localStorage.setItem('userRatings', JSON.stringify(userRatings));
            } catch (err) {
                console.warn('Unable to persist user ratings', err);
            }
            renderUserRating(animeId);
                // Update the trending section when the user rating changes
                // so that newly rated titles bubble up accordingly.  If
                // the trending container does not exist this call will
                // silently do nothing.
                renderTrending();
        });
    });
}

/**
 * Display the viewing progress for the selected anime.  Progress is
 * calculated from the user’s recently watched history, counting unique
 * episodes that have been played.  The component shows a small bar
 * indicating the percentage of episodes viewed along with a ratio
 * text (watched/total).  If no progress element exists in the DOM,
 * the function returns early.
 *
 * @param {Object} anime – The anime for which to render progress.
 */
function renderWatchProgress(anime) {
    const progressEl = document.getElementById('watch-progress');
    if (!progressEl) return;
    const total = anime.episodes || 12;
    // Build a set of watched episodes for this anime from the
    // `recentlyWatched` history to avoid counting duplicates
    const watchedSet = new Set();
    if (Array.isArray(recentlyWatched)) {
        recentlyWatched.forEach(item => {
            if (item.animeId === anime.id) {
                watchedSet.add(item.episode);
            }
        });
    }
    const watched = watchedSet.size;
    const percent = total ? Math.round((watched / total) * 100) : 0;
    progressEl.innerHTML = `<div class="flex items-center gap-2">
        <div class="relative w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div class="absolute left-0 top-0 h-2 bg-green-500" style="width:${percent}%;"></div>
        </div>
        <span class="text-gray-300 text-sm">${watched}/${total}</span>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Apply persisted theme prior to rendering
    try {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light') {
            document.body.classList.add('light-mode');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) {
                icon.setAttribute('data-lucide', 'sun');
            }
        }
    } catch (e) {
        console.warn('Unable to access localStorage for theme preference', e);
    }
    // Load data and render UI
    loadData();
    // Event bindings
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    const commentForm = document.getElementById('comment-form');
    if (commentForm) commentForm.addEventListener('submit', addComment);
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            // Target the mobile navigation instead of the desktop nav. A unique ID prevents clashes.
            const nav = document.getElementById('nav-links-mobile');
            if (nav) {
                const isHidden = nav.classList.toggle('hidden');
                // Reflect the expanded state on the toggle button for screen readers
                mobileMenuToggle.setAttribute('aria-expanded', (!isHidden).toString());
            }
        });
    }
    window.addEventListener('scroll', updateScrollButton);
    // Search input listener with live suggestions.  Typing triggers both filtering and suggestions.
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchAnime();
            updateSearchSuggestions();
        });
        // Hide suggestions shortly after losing focus to allow click events to fire
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                const listEl = document.getElementById('search-suggestions');
                if (listEl) listEl.classList.add('hidden');
            }, 200);
        });
    }
    // Hide suggestions when clicking outside the search component
    document.addEventListener('click', (e) => {
        const listEl = document.getElementById('search-suggestions');
        const searchEl = document.getElementById('search-input');
        if (!listEl || !searchEl) return;
        if (searchEl.contains(e.target) || listEl.contains(e.target)) return;
        listEl.classList.add('hidden');
    });

    // Bind admin form submission handler
    const adminForm = document.getElementById('add-anime-form');
    if (adminForm) {
        adminForm.addEventListener('submit', submitNewAnime);
    }

    // Bind search input in the admin dashboard
    const adminSearch = document.getElementById('admin-search');
    if (adminSearch) {
        adminSearch.addEventListener('input', () => {
            renderAdminList();
        });
    }
    // Close comments modal when clicking outside the modal content
    const commentsModal = document.getElementById('comments-modal');
    if (commentsModal) {
        commentsModal.addEventListener('click', (e) => {
            if (e.target === commentsModal) {
                closeCommentsModal();
            }
        });
    }
});