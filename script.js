document.addEventListener('DOMContentLoaded', () => {
    const ideaInput = document.getElementById('ideaInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultsArea = document.getElementById('resultsArea');
    const historyList = document.getElementById('historyList');
    const toneButtons = document.querySelectorAll('.tone-btn');

    let currentTone = 'professional';
    let history = JSON.parse(localStorage.getItem('ghostwriter_history') || '[]');

    // Initialize UI
    const updateHistoryUI = () => {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">Your generated stories will appear here.</p>';
            return;
        }

        historyList.innerHTML = history.slice(0, 10).map((item, index) => `
            <div class="history-item" onclick="window.loadFromHistory(${index})">
                <span class="history-platform">${item.platforms.join(', ')}</span>
                <span class="history-idea">${item.idea.substring(0, 30)}...</span>
            </div>
        `).join('');
    };

    window.loadFromHistory = (index) => {
        const item = history[index];
        ideaInput.value = item.idea;
        // Scroll to results or just show them? Let's just pop the results back in
        displayResults(item.results);
    };

    const displayResults = (results) => {
        resultsArea.innerHTML = results.map(res => `
            <div class="result-card">
                <div class="result-header">
                    <span class="result-tag">${res.platform}</span>
                    <button class="action-btn" onclick="window.copyContent(this)">Copy</button>
                </div>
                <div class="result-content">${res.content}</div>
                <div class="result-actions">
                    <button class="action-btn" onclick="window.editContent(this)">Edit</button>
                    <button class="action-btn" onclick="window.shareContent(this)">Share</button>
                </div>
            </div>
        `).join('');
    };

    window.copyContent = (btn) => {
        const content = btn.closest('.result-card').querySelector('.result-content').innerText;
        navigator.clipboard.writeText(content);
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = originalText, 2000);
    };

    window.editContent = (btn) => {
        const contentDiv = btn.closest('.result-card').querySelector('.result-content');
        const isEditing = contentDiv.contentEditable === 'true';
        contentDiv.contentEditable = !isEditing;
        btn.innerText = isEditing ? 'Edit' : 'Save';
        if (!isEditing) contentDiv.focus();
    };

    window.shareContent = (btn) => {
        // Mock share
        alert('Sharing functionality would open platform-specific share intent.');
    };

    // Tone Selection
    toneButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toneButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTone = btn.dataset.tone;
        });
    });

    // Generation Logic
    const generateContent = async () => {
        const idea = ideaInput.value.trim();
        const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(cb => cb.value);

        if (!idea) {
            alert('Please enter an idea first.');
            return;
        }
        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform.');
            return;
        }

        generateBtn.classList.add('btn-loading');
        generateBtn.disabled = true;
        resultsArea.innerHTML = '<div class="results-placeholder"><p>Manifesting your content...</p></div>';

        const results = [];
        
        try {
            // Simulation Mode for GitHub Pages (No Backend)
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking

            for (const platform of selectedPlatforms) {
                let content = "";
                if (platform === 'linkedin') {
                    content = `🚀 **Transforming the Future with ${idea}!**\n\nI'm thrilled to announce that we are pushing the boundaries of what's possible. By leveraging ${idea}, we are streamlining workflows and empowering the next generation of creators.\n\n#Innovation #TechTrends #Ayanlogix`;
                } else if (platform === 'twitter') {
                    content = `1/🧵 Just finished manifesting a new vision for ${idea}. Here's why this changes everything for the ecosystem... \n\n#AI #FutureTech #Ayanlogix`;
                } else {
                    content = `Capturing the essence of ${idea}. ✨ A new era of digital manifestation begins today. \n\n#Design #Ayanlogix #Creativity`;
                }
                
                if (currentTone === 'witty') content = `Manifesting ${idea} like a pro. 🔮 Why wait for the future when you can code it today? 😉 #Ayanlogix`;
                if (currentTone === 'inspiring') content = `Believe in the power of ${idea}. 🌟 Every great achievement started as a simple idea. Today, we make it real. #Manifest #Ayanlogix`;

                results.push({ platform, content });
            }

            displayResults(results);
            
            // Save to history
            history.unshift({ idea, platforms: selectedPlatforms, results, timestamp: new Date().getTime() });
            localStorage.setItem('ghostwriter_history', JSON.stringify(history));
            updateHistoryUI();

        } catch (error) {
            console.error('Generation failed:', error);
            resultsArea.innerHTML = '<div class="results-placeholder"><p>Connection to AI engine failed. Check your API key.</p></div>';
        } finally {
            generateBtn.classList.remove('btn-loading');
            generateBtn.disabled = false;
        }
    };

    generateBtn.addEventListener('click', generateContent);
    updateHistoryUI();
});
