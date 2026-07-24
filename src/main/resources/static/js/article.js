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

if (modifyButton) {
    modifyButton.addEventListener('click', ev => {
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        if (title.length > 200) {
            alert("제목은 200자까지 입력 가능합니다.");
            return;
        }

        let params = new URLSearchParams(location.search);
        let id = params.get('id');

        fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                content
            })
        })
            .then(()=>{
                alert('수정이 완료되었습니다.')
                location.replace(`/articles/${id}`);
            });
    });
}

//등록 기능
const createButton = document.getElementById("create-btn");
if (createButton) {
    createButton.addEventListener('click',ev => {
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        if (title.length > 200) {
            alert("제목은 200자까지 입력 가능합니다.");
            return;
        }
        fetch("/api/articles", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                content
            }),
        }).then(()=>{
            alert("등록 완료되었습니다.");
            location.replace("/articles");
        });
    });
}