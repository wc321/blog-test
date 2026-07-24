const loadingDiv = document.getElementById('aiLoading');
const suggestionsDiv = document.getElementById('aiSuggestions');
const promptInput = document.getElementById('aiPrompt');
const getBtn = document.getElementById('getSuggestionBtn');

getBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const question = promptInput.value.trim();

    if (!question) {
        alert("도움을 받고 싶은 내용을 입력해주세요.");
        return;
    }


    loadingDiv.style.display = 'block';
    suggestionsDiv.style.display = 'none';
    getBtn.disabled = true;

    try {
        const response = await fetch('/api/ai-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                content: content,
                question: question
            })
        });
        const data = await response.json();

        showSuggestions(data.suggestions || []);

    } catch (error) {
        console.error(error);
        suggestionsDiv.innerHTML = `<p class="text-danger">요청 중 오류가 발생했습니다. 다시 시도해주세요.</p>`;
        suggestionsDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
        getBtn.disabled = false;
    }
});

function showSuggestions(suggestions) {
    loadingDiv.style.display = 'none';

    suggestionsDiv.innerHTML = '<h6 class="mb-3">AI 제안</h6>';

    suggestions.forEach((suggestion) => {
        const div = document.createElement('div');
        div.className = 'ai-suggestion';
        div.innerHTML = `
                    <p>${suggestion}</p>
                    <button class="btn btn-sm btn-outline-primary add-btn" 
                            onclick="addToContent('${suggestion.replace(/"/g, '&quot;')}')">
                        클릭하여 추가
                    </button>
                `;
        suggestionsDiv.appendChild(div);
    });

    suggestionsDiv.style.display = 'block';
}

function addToContent(text) {
    const contentArea = document.getElementById('content');
    contentArea.value += (contentArea.value ? '\n\n' : '') + text;

    alert("본문에 내용이 추가되었습니다!");
}

document.getElementById('aiAssistModal').addEventListener('hidden.bs.modal', () => {
    promptInput.value = '';
    loadingDiv.style.display = 'none';
    suggestionsDiv.style.display = 'none';
    suggestionsDiv.innerHTML = '';
});