// ===== 이미지 미리보기 & 제거 =====
const imageInput = document.getElementById('imageInput');
const previewArea = document.getElementById('previewArea');
const previewImg = document.getElementById('previewImg');
const uploadPrompt = document.getElementById('uploadPrompt');
const removeImgBtn = document.getElementById('removeImgBtn');

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