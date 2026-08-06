// ===== 이미지 미리보기 & 제거 =====
const imageInput = document.getElementById('imageInput');
const previewArea = document.getElementById('previewArea');
const previewImg = document.getElementById('previewImg');
const uploadPrompt = document.getElementById('uploadPrompt');
const removeImgBtn = document.getElementById('removeImgBtn');
const aiThumbnailBtn = document.getElementById("ai-thumbnail-btn");
const aiThumbnailLoading = document.getElementById('aiThumbnailLoading');

imageInput.addEventListener('change', function () {
    const file = this.files[0];

    if(!file) return;

    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        this.value = '';
        return;
    }

    const maxSize = 1024 * 1024;
    if (file.size >= maxSize) {
        alert('파일 크기는 1MB 미만이어야 합니다.');
        this.value = '';
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewArea.classList.remove('d-none');
            uploadPrompt.classList.add('d-none');
            imageRemoved.value = "false";
        };
        reader.readAsDataURL(file);
    }
});

removeImgBtn.addEventListener('click', function () {
    imageInput.value = '';
    previewImg.src = '';
    previewArea.classList.add('d-none');
    uploadPrompt.classList.remove('d-none');
    imageRemoved.value = "true";
});

aiThumbnailBtn.addEventListener('click', async ()=>{
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (!title.trim() && !content.trim()) {
        alert('제목이나 내용을 먼저 입력해주세요.');
        return;
    }
    uploadPrompt.classList.add('d-none');
    previewArea.classList.add('d-none');
    aiThumbnailLoading.style.display = 'block';
    aiThumbnailBtn.disabled = true;

    const progressBar = document.getElementById('aiProgressBar');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 100 / 40;          // 40초에 100%
        if (progress >= 100) progress = 100;
        progressBar.style.width = progress + '%';
    }, 1000);

    try {
        const res = await fetch('/api/ai-thumbnails', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                title,
                content
            })
        });
        if (!res.ok) throw new Error('썸네일 생성 실패');

        const data = await res.json();

        previewImg.src = `data:image/png;base64,${data.base64Image}`;
        imageRemoved.value = "false";
        window.aiGeneratedBase64 = data.base64Image;
        imageInput.value = '';

    } catch (error){
        console.error(error);
        alert("썸네일 생성 중 오류가 발생했습니다.");
    } finally {
        clearInterval(interval);
        progressBar.style.width = '0%';
        aiThumbnailLoading.style.display = 'none';
        aiThumbnailBtn.disabled = false;
        previewArea.classList.remove('d-none');
        uploadPrompt.classList.add('d-none');
    }
})

