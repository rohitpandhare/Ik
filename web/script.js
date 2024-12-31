const BASE_URL = "http://localhost:5000";

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const query = searchInput.value.trim();

    if (!query) {
        resultsDiv.innerHTML = '<p class="error">Please enter a search query</p>';
        return;
    }

    try {
        resultsDiv.innerHTML = '<p class="loading">Searching...</p>';

        const response = await fetch(`${BASE_URL}/search/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                formInput: query,
                pagenum: 0
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = '<p class="error">Error performing search</p>';
    }
}

async function getDocument(docid) {
    try {
        const response = await fetch(`${BASE_URL}/doc/${docid}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayDocument(data);

    } catch (error) {
        console.error('Document fetch error:', error);
        alert('Error fetching document');
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    
    if (!data.docs || data.docs.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">No results found</p>';
        return;
    }

    const html = data.docs.map(doc => `
        <div class="result-item">
            <h3>${doc.title || 'Untitled'}</h3>
            <div class="fragment">${doc.headline || ''}</div>
            <div class="meta-info">
                <span class="source">${doc.docsource || ''}</span>
                <span class="date">${doc.posted_date || ''}</span>
            </div>
            <button onclick="getDocument('${doc.tid}')" class="view-doc-btn">View Document</button>
        </div>
    `).join('');

    resultsDiv.innerHTML = html;
}

function displayDocument(doc) {
    // Remove any existing modals
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${doc.title || 'Document'}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="document-content">
                ${doc.doc || 'No content available'}
            </div>
        </div>
    `;

    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.querySelector('.modal')) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Add event listener for Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});
