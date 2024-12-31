const BASE_URL = "http://localhost:5000"; // Update this if needed based on your server configuration

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const query = searchInput.value.trim();

    if (!query) {
        resultsDiv.innerHTML = '<p class="error">Please enter a search query</p>';
        return;
    }

    try {
        resultsDiv.innerHTML = '<p>Searching...</p>';

        const response = await fetch(`${BASE_URL}/search/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                formInput: query,
                pagenum: 0, // Default to first page
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = '<p class="error">Error performing search.</p>';
    }
}

async function getDocument(docid) {
    try {
        const response = await fetch(`${BASE_URL}/doc/${docid}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const doc = await response.json();
        displayDocument(doc);

    } catch (error) {
        console.error('Document fetch error:', error);
        alert('Error fetching document.');
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!data.docs || data.docs.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    const html = data.docs
        .map(
            (doc) => `
        <div class="result-item">
            <h3>${doc.title || 'Untitled'}</h3>
            <div class="fragment">${doc.headline || ''}</div>
            <div class="source">${doc.docsource || ''}</div>
            <button onclick="getDocument('${doc.tid}')">View Document</button>
        </div>
    `
        )
        .join('');

    resultsDiv.innerHTML = html;
}

function displayDocument(doc) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const contentId = `doc-content-${Date.now()}`;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="document-header">
                <button class="download-btn" onclick="downloadAsPDF('${contentId}', '${doc.title}')">
                    Download PDF
                </button>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div id="${contentId}" class="document-content">
                ${doc.doc || 'No content available'}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Add this new function to handle modal closing
function closeModal(element) {
    // Find and remove the parent modal element
    const modal = element.closest('.modal');
    if (modal) {
        modal.remove();
    }
}


function downloadAsPDF(contentId, title) {
    // Get the content element by ID
    const content = document.getElementById(contentId);

    // PDF options
    const options = {
        margin: 1,
        filename: `${title || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    // Indicate loading state
    const downloadBtn = document.querySelector('.download-btn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = 'Generating PDF...';
    downloadBtn.disabled = true;

    // Generate and save PDF
    html2pdf().set(options).from(content).save().then(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }).catch((error) => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    });
}
