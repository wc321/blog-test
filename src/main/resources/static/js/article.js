//삭제 기능
const deleteButton = document.getElementById('delete-btn');

if (deleteButton) {
    deleteButton.addEventListener('click', ev => {
        if (confirm("정말로 이 글을 삭제 하시겠습니까?")) {
            let id = document.getElementById('article-id').value;
            fetch(`/api/articles/${id}`, {
                method: 'DELETE'
            })
                .then(() => {
                    alert('삭제가 완료되었습니다.');
                    location.replace('/articles');
                });
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

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) {
                    throw new Error("이미지 업로드에 실패했습니다.");
                }
                const uploadData = await res.json();
                imageUrl = uploadData.imageUrl;
            }

            const saveRes = await fetch(`/api/articles/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    content,
                    imageUrl
                })
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

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                });
                if (!uploadRes.ok) {
                    throw new Error("이미지 업로드에 실패했습니다.");
                }
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.imageUrl;
            }
            const saveRes = await fetch("/api/articles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    content,
                    imageUrl
                })
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

