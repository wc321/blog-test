//삭제 기능
const deleteButton = document.getElementById('delete-btn');

if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
        if (!confirm("정말로 이 글을 삭제 하시겠습니까?")) return;

        const id = document.getElementById("article-id").value;
        try {
            await httpRequest(`/api/articles/${id}`, { method: "DELETE" });
            alert("삭제가 완료되었습니다.");
            location.replace("/articles");
        } catch (e) {
            console.error(e);
            alert("삭제에 실패했습니다.");
        }
    });
}

//수정 기능
const modifyButton = document.getElementById('modify-btn');
const originalImageUrl = document.getElementById('originalImageUrl');
const imageRemoved = document.getElementById('imageRemoved');

if (modifyButton) {
    modifyButton.addEventListener('click',async ()=> {
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const file = imageInput.files[0];

        if (title.length > 200) {
            alert("제목은 200자까지 입력 가능합니다.");
            return;
        }

        modifyButton.disabled = true;
        modifyButton.textContent = "수정 중..."

        let params = new URLSearchParams(location.search);
        let id = params.get('id');

        try {
            let imageUrl = originalImageUrl.value || null;

            if (imageRemoved.value === "true") {
                imageUrl = null;
            }
            else if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await httpRequest("/api/upload", {
                    method: "POST",
                    body: formData,
                    isFile: true,
                });

                if (!res.ok) {
                    throw new Error("이미지 업로드에 실패했습니다.");
                }
                const uploadData = await res.json();
                imageUrl = uploadData.imageUrl;
            }else if (window.aiGeneratedBase64) {
                const aiFile = await compressAndConvertToFile(window.aiGeneratedBase64);
                const formData = new FormData();
                formData.append("file", aiFile);

                const uploadRes = await httpRequest("/api/upload", {
                    method: "POST",
                    body: formData,
                    isFile: true,
                });
                if (!uploadRes.ok) {
                    throw new Error("이미지 업로드에 실패했습니다.");
                }
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.imageUrl;
            }

            const saveRes = await httpRequest(`/api/articles/${id}`, {
                method: "PUT",
                body: JSON.stringify({ title, content, imageUrl }),
            });

            if (!saveRes.ok) {
                throw new Error("글 수정에 실패했습니다.")
            }
            alert("수정 완료되었습니다.");
            location.replace(`/articles/${id}`);
        }catch (error){
            console.error(error);
            alert(error.message || "수정 중 오류가 발생했습니다.");
        }finally {
            modifyButton.disabled = false;
            modifyButton.textContent = "수정";
        }
    });
}

//등록 기능
const createButton = document.getElementById("create-btn");
if (createButton) {
    createButton.addEventListener('click', async ()=>{
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const file = imageInput.files[0];

        if (title.length > 200) {
            alert("제목은 200자까지 입력 가능합니다.");
            return;
        }
        createButton.disabled = true;
        createButton.textContent = "등록 중..."

        try {
            let imageUrl = null;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await httpRequest("/api/upload", {
                    method: "POST",
                    body: formData,
                    isFile: true,
                });
                if (!uploadRes.ok) {
                    throw new Error("이미지 업로드에 실패했습니다.");
                }
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.imageUrl;
            }else if (window.aiGeneratedBase64) {
                const aiFile = await compressAndConvertToFile(window.aiGeneratedBase64);
                const formData = new FormData();
                formData.append("file", aiFile);

                const uploadRes = await httpRequest("/api/upload", {
                    method: "POST",
                    body: formData,
                    isFile: true,
                });
                if (!uploadRes.ok) {
                    throw new Error("이미지 업로드에 실패했습니다.");
                }
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.imageUrl;
            }
            const saveRes = await httpRequest("/api/articles", {
                method: "POST",
                body: JSON.stringify({ title, content, imageUrl }),
            });
            if (!saveRes.ok) {
                throw new Error("글 등록에 실패했습니다.")
            }
            alert("등록 완료되었습니다.");
            location.replace("/articles");
        }catch (error){
            console.error(error);
            alert(error.message || "등록 중 오류가 발생했습니다.");
        }finally {
            createButton.disabled = false;
            createButton.textContent = "등록";
        }
    });
}

async function compressAndConvertToFile(base64, filename = 'thumbnail.jpg', maxSizeKB = 960) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `data:image/png;base64,${base64}`;

        img.onload = () => {
            const widthSteps = [1280, 1024, 800, 640];
            let dataUrl = null;

            const getSizeKB = (url) => (url.length * 0.75) / 1024;

            const tryCompress = (maxWidth) => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.95;
                let currentDataUrl = canvas.toDataURL('image/jpeg', quality);

                while (getSizeKB(currentDataUrl) > maxSizeKB && quality > 0.2) {
                    quality -= 0.05;
                    currentDataUrl = canvas.toDataURL('image/jpeg', quality);
                }

                return currentDataUrl;
            };

            for (const maxWidth of widthSteps) {
                dataUrl = tryCompress(maxWidth);

                if (getSizeKB(dataUrl) <= maxSizeKB) {
                    break;
                }
            }

            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], filename, { type: 'image/jpeg' });
                    resolve(file);
                })
                .catch(reject);
        };

        img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
    });
}

