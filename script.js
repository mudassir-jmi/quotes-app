let currentPage = 1;
let allQuotes = [];
let currentRandomQuote = null;

const API_BASE = "https://api.freeapi.app/api/v1/public/quotes";

async function fetchQuotes(page = 1) {
  try {
    const res = await fetch(`${API_BASE}?page=${page}&limit=12`);
    const data = await res.json();
    
    if (data.success) {
      allQuotes = data.data.data;
      currentPage = data.data.currentPage || page;
      document.getElementById('currentPage').textContent = currentPage;
      renderQuotes(allQuotes);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to fetch quotes. Please try again.");
  }
}

function renderQuotes(quotes) {
  const grid = document.getElementById('quotesGrid');
  grid.innerHTML = '';

  quotes.forEach(quote => {
    const card = document.createElement('div');
    card.className = `quote-card bg-zinc-900 border border-zinc-800 rounded-3xl p-8 group`;
    
    card.innerHTML = `
      <div class="quote-text text-2xl leading-relaxed mb-8 text-zinc-100">
        “${quote.content}”
      </div>
      <div class="flex justify-between items-end">
        <div>
          <div class="font-semibold text-violet-400">${quote.author}</div>
          ${quote.tags && quote.tags.length ? 
            `<div class="flex gap-2 mt-3 flex-wrap">` + 
            quote.tags.map(tag => `<span class="text-[10px] px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full">${tag}</span>`).join('') + 
            `</div>` : ''}
        </div>
        <button onclick="copyQuote('${quote.content.replace(/'/g, "\\'")}', '${quote.author.replace(/'/g, "\\'")}')" 
                class="opacity-0 group-hover:opacity-100 transition p-3 hover:bg-zinc-800 rounded-2xl">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterQuotes() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allQuotes.filter(q => 
    q.content.toLowerCase().includes(term) || 
    q.author.toLowerCase().includes(term)
  );
  renderQuotes(filtered);
}

async function fetchRandomQuote() {
  try {
    const res = await fetch("https://api.freeapi.app/api/v1/public/quotes/random");
    const data = await res.json();
    if (data.success) {
      currentRandomQuote = data.data;
      document.getElementById('randomQuote').textContent = `“${data.data.content}”`;
      document.getElementById('randomAuthor').textContent = `— ${data.data.author}`;
      document.getElementById('randomModal').classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
  }
}

function closeModal() {
  document.getElementById('randomModal').classList.add('hidden');
}

function copyQuote(content, author) {
  navigator.clipboard.writeText(`“${content}” — ${author}`);
  showToast("Quote copied to clipboard!");
}

function copyRandomQuote() {
  if (currentRandomQuote) {
    copyQuote(currentRandomQuote.content, currentRandomQuote.author);
  }
  closeModal();
}

function copyAllQuotes() {
  const text = allQuotes.map(q => `“${q.content}” — ${q.author}`).join('\n\n');
  navigator.clipboard.writeText(text);
  showToast("All quotes copied!");
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = "fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl z-50";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function nextPage() {
  currentPage++;
  fetchQuotes(currentPage);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchQuotes(currentPage);
  }
}

// Initial load
fetchQuotes(1);

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.getElementById('searchInput') !== document.activeElement) {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
});