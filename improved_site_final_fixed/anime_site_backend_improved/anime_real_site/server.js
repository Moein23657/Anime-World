const http = require('http');
const fs = require('fs');
const path = require('path');

// Load the anime data once on startup.  This JSON mirrors the structure used in
// the front‑end and will be served through API endpoints.  If you add new
// titles to public/data/anime-data.json the server will need to be restarted
// to pick up the changes or you can re‑read the file on each request.
const dataPath = path.join(__dirname, 'public', 'data', 'anime-data.json');
let animeData;
try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  animeData = JSON.parse(raw);
} catch (err) {
  console.error('Failed to load anime data:', err);
  animeData = [];
}

// Path to persist comments.  We store comments in a JSON file under a
// dedicated `data` directory at the project root.  This allows comments
// to survive server restarts without requiring a separate database.  If the
// file does not exist it will be created on first write.
const commentsDir = path.join(__dirname, 'data');
const commentsPath = path.join(commentsDir, 'comments.json');

// Ensure the data directory exists.  The recursive option will silently
// succeed if the directory is already present.
try {
  fs.mkdirSync(commentsDir, { recursive: true });
} catch (err) {
  console.error('Error creating data directory:', err);
}

// Load persisted comments from disk.  If the file does not exist or
// contains invalid JSON, fall back to an empty object.  Each key in this
// object corresponds to an anime ID and maps to an array of comment
// strings.
let comments = {};
try {
  if (fs.existsSync(commentsPath)) {
    const rawComments = fs.readFileSync(commentsPath, 'utf8');
    comments = JSON.parse(rawComments);
  }
} catch (err) {
  console.warn('Failed to load comments from disk:', err);
  comments = {};
}

// Helper function to persist the current comments object to disk.  The
// resulting file is formatted with two‑space indentation for readability.
function saveComments() {
  try {
    fs.writeFile(commentsPath, JSON.stringify(comments, null, 2), err => {
      if (err) {
        console.error('Error writing comments file:', err);
      }
    });
  } catch (err) {
    console.error('Unexpected error writing comments:', err);
  }
}

// Simple MIME type map for static file serving.
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Helper to serve static files from the public directory.  Falls back to
// index.html for unknown paths to support client‑side routing (e.g. hash
// navigation).
function serveStatic(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  });
}

// Create a basic HTTP server.  In production you'd likely use Express or
// Fastify, but this keeps the example self‑contained and free of external
// dependencies.
const server = http.createServer((req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API: GET /api/animes => list all anime with filtering, sorting and pagination
  if (method === 'GET' && pathname === '/api/animes') {
    // Clone the array to avoid mutating the global state during filtering/sorting
    let results = Array.isArray(animeData) ? animeData.slice() : [];
    const params = parsedUrl.searchParams;

    // Simple search by title or description using 'search' or 'title' query param (case‑insensitive)
    const search = params.get('search') || params.get('title');
    if (search) {
      const term = String(search).toLowerCase();
      results = results.filter(item => {
        const romaji = String(item.title?.romaji || '').toLowerCase();
        const nativeTitle = String(item.title?.native || '').toLowerCase();
        const description = String(item.description || '').toLowerCase();
        return romaji.includes(term) || nativeTitle.includes(term) || description.includes(term);
      });
    }

    // Filter by genre(s). Accept repeated genre params or comma separated list.
    const genreParams = [];
    params.forEach((value, key) => {
      if (key === 'genre' || key === 'genres') {
        value.split(',').forEach(g => genreParams.push(g.trim().toLowerCase()));
      }
    });
    if (genreParams.length > 0) {
      results = results.filter(item => {
        const itemGenres = (item.genres || []).map(g => String(g).toLowerCase());
        return genreParams.every(g => itemGenres.includes(g));
      });
    }

    // Filter by status, format, season, seasonYear/year
    const status = params.get('status');
    if (status) {
      const st = String(status).toLowerCase();
      results = results.filter(item => String(item.status || '').toLowerCase() === st);
    }
    const format = params.get('format');
    if (format) {
      const fm = String(format).toLowerCase();
      results = results.filter(item => String(item.format || '').toLowerCase() === fm);
    }
    const season = params.get('season');
    if (season) {
      const ss = String(season).toLowerCase();
      results = results.filter(item => String(item.season || '').toLowerCase() === ss);
    }
    const year = params.get('seasonYear') || params.get('year');
    if (year) {
      const yNum = parseInt(year, 10);
      if (!isNaN(yNum)) {
        results = results.filter(item => parseInt(item.seasonYear, 10) === yNum);
      }
    }

    // Numeric range filters: minScore, maxScore, minEpisodes, maxEpisodes
    const minScore = parseInt(params.get('minScore'), 10);
    if (!isNaN(minScore)) {
      results = results.filter(item => (item.averageScore ?? 0) >= minScore);
    }
    const maxScore = parseInt(params.get('maxScore'), 10);
    if (!isNaN(maxScore)) {
      results = results.filter(item => (item.averageScore ?? 0) <= maxScore);
    }
    const minEpisodes = parseInt(params.get('minEpisodes'), 10);
    if (!isNaN(minEpisodes)) {
      results = results.filter(item => (item.episodes ?? 0) >= minEpisodes);
    }
    const maxEpisodes = parseInt(params.get('maxEpisodes'), 10);
    if (!isNaN(maxEpisodes)) {
      results = results.filter(item => (item.episodes ?? 0) <= maxEpisodes);
    }

    // Sorting: sortBy and order=asc|desc
    const sortBy = params.get('sortBy');
    if (sortBy) {
      const orderDir = (params.get('order') || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        // Support nested fields like 'title.romaji'
        function getValue(obj, path) {
          return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
        }
        const va = getValue(a, sortBy);
        const vb = getValue(b, sortBy);
        if (va == null && vb == null) return 0;
        if (va == null) return -1 * orderDir;
        if (vb == null) return 1 * orderDir;
        if (va < vb) return -1 * orderDir;
        if (va > vb) return 1 * orderDir;
        return 0;
      });
    }

    // Pagination: limit and offset
    const limit = parseInt(params.get('limit'), 10);
    const offset = parseInt(params.get('offset'), 10) || 0;
    let paginated = results;
    if (!isNaN(limit) && limit >= 0) {
      paginated = results.slice(offset, offset + limit);
    } else if (offset) {
      paginated = results.slice(offset);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(paginated));
    return;
  }

  // API: POST /api/animes => create a new anime entry
  // The request body should be a JSON object with the same shape as other
  // anime items except for the `id`, which will be assigned by the
  // server.  On success the newly created anime object is returned.
  if (method === 'POST' && pathname === '/api/animes') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Limit payload size to ~1MB to prevent abuse
      if (body.length > 1e6) req.connection.destroy();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload || typeof payload !== 'object') {
          throw new Error('Invalid payload');
        }
        // Assign a new ID based on the highest existing ID
        const maxId = animeData.reduce((max, item) => Math.max(max, item.id || 0), 0);
        const newId = maxId + 1;
        const newAnime = { ...payload, id: newId };
        animeData.push(newAnime);
        // Persist the updated anime data to disk.  We preserve
        // indentation for readability.  Note that if this write fails
        // the in‑memory state will still contain the new entry.
        fs.writeFile(dataPath, JSON.stringify(animeData, null, 2), err => {
          if (err) {
            console.error('Error writing anime data file:', err);
          }
        });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newAnime));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // API: PUT /api/animes/:id => update an existing anime entry
  // We allow clients to modify any field except for the id itself.  If the anime
  // does not exist we return 404.  The request body must be valid JSON.
  if (method === 'PUT' && pathname.startsWith('/api/animes/') && !pathname.includes('/comments')) {
    const idStr = pathname.split('/')[3];
    const id = parseInt(idStr, 10);
    const index = animeData.findIndex(a => a.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.connection.destroy();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
        // Merge existing anime with new fields but preserve id
        const updated = { ...animeData[index], ...payload, id };
        animeData[index] = updated;
        fs.writeFile(dataPath, JSON.stringify(animeData, null, 2), err => {
          if (err) {
            console.error('Error writing anime data file:', err);
          }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // API: DELETE /api/animes/:id => delete an anime entry.  This operation
  // removes the anime from the in‑memory list and persists the change to disk.
  // If the anime has associated comments those are deleted as well.
  if (method === 'DELETE' && pathname.startsWith('/api/animes/') && !pathname.includes('/comments')) {
    const idStr = pathname.split('/')[3];
    const id = parseInt(idStr, 10);
    const index = animeData.findIndex(a => a.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    // Remove anime from array
    animeData.splice(index, 1);
    fs.writeFile(dataPath, JSON.stringify(animeData, null, 2), err => {
      if (err) {
        console.error('Error writing anime data file:', err);
      }
    });
    // Remove associated comments if present
    if (comments[id]) {
      delete comments[id];
      saveComments();
    }
    res.writeHead(204);
    res.end();
    return;
  }

  // API: GET /api/animes/:id/comments => get comments for an anime
  // Comments routes are matched before the more general single‑anime route
  if (method === 'GET' && pathname.startsWith('/api/animes/') && pathname.endsWith('/comments')) {
    const idStr = pathname.split('/')[3];
    const id = parseInt(idStr, 10);
    const list = comments[id] || [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  // API: POST /api/animes/:id/comments => add a comment
  if (method === 'POST' && pathname.startsWith('/api/animes/') && pathname.endsWith('/comments')) {
    const idStr = pathname.split('/')[3];
    const id = parseInt(idStr, 10);
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protect against large payloads
      if (body.length > 1e6) req.connection.destroy();
    });
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        if (!comments[id]) comments[id] = [];
        comments[id].push(String(text || '').trim());
        // Persist the updated comments to disk.  This operation is
        // asynchronous but we do not await it here to keep response
        // latency low.  Errors will be logged to the console.
        saveComments();
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // API: PUT /api/animes/:id/comments/:index => update a specific comment.  The
  // index refers to the zero‑based position within the comment array for the
  // given anime.  Returns 404 if the anime or comment index does not exist.
  if (method === 'PUT' && pathname.startsWith('/api/animes/') && pathname.includes('/comments/')) {
    const parts = pathname.split('/');
    // Expected format: ['', 'api', 'animes', idStr, 'comments', indexStr]
    if (parts.length >= 6) {
      const id = parseInt(parts[3], 10);
      const idx = parseInt(parts[5], 10);
      const list = comments[id] || [];
      if (isNaN(id) || isNaN(idx) || idx < 0 || idx >= list.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 1e6) req.connection.destroy();
      });
      req.on('end', () => {
        try {
          const { text } = JSON.parse(body);
          list[idx] = String(text || '').trim();
          comments[id] = list;
          saveComments();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
  }

  // API: DELETE /api/animes/:id/comments/:index => delete a specific comment.
  // Removes the comment at the given index.  If the last comment is removed
  // the anime's entry in the comments object is deleted.
  if (method === 'DELETE' && pathname.startsWith('/api/animes/') && pathname.includes('/comments/')) {
    const parts = pathname.split('/');
    if (parts.length >= 6) {
      const id = parseInt(parts[3], 10);
      const idx = parseInt(parts[5], 10);
      const list = comments[id] || [];
      if (isNaN(id) || isNaN(idx) || idx < 0 || idx >= list.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }
      list.splice(idx, 1);
      if (list.length === 0) {
        delete comments[id];
      } else {
        comments[id] = list;
      }
      saveComments();
      res.writeHead(204);
      res.end();
      return;
    }
  }

  // API: GET /api/animes/:id => return a single anime.  This route must
  // be evaluated after the comments routes so that paths ending
  // with /comments are not incorrectly matched here.
  if (method === 'GET' && pathname.startsWith('/api/animes/')) {
    const idStr = pathname.split('/')[3];
    const id = parseInt(idStr, 10);
    const anime = animeData.find(a => a.id === id);
    if (anime) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(anime));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // Serve static files.  Normalize the path to prevent directory traversal.
  let safePath = pathname;
  if (safePath === '/' || safePath === '/index.html') {
    safePath = '/index.html';
  }
  const filePath = path.join(__dirname, 'public', safePath);
  // If the file exists, serve it; otherwise serve index.html (SPA fallback)
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveStatic(filePath, res);
    } else {
      // Fallback to index.html for unknown routes (client‑side routing)
      serveStatic(path.join(__dirname, 'public', 'index.html'), res);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});