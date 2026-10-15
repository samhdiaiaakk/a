// GitHubPages/a/StartPage-samhdi/app.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("link-container");
    if (!container) return;

    // 再帰的にリスト（ul/li）を生成する関数（何階層でもネスト可能）
    function createMenu(items) {
        const ul = document.createElement("ul");
        
        items.forEach(item => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.textContent = item.name;
            a.href = item.url || "#";
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            li.appendChild(a);

            // 子要素（subItems）が存在する場合は、再帰的にリストを生成して追加
            if (item.subItems && item.subItems.length > 0) {
                const subUl = createMenu(item.subItems);
                li.appendChild(subUl);
            }

            ul.appendChild(li);
        });

        return ul;
    }

    // linkData から行グループとカテゴリを組み立てて描画
    linkData.forEach(row => {
        const rowGroup = document.createElement("div");
        rowGroup.className = "row-group";

        row.forEach(cat => {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "category";

            // タイトル (h2)
            const h2 = document.createElement("h2");
            h2.textContent = cat.category;
            categoryDiv.appendChild(h2);

            // メインのリストを生成して追加
            const menuUl = createMenu(cat.items);
            categoryDiv.appendChild(menuUl);

            rowGroup.appendChild(categoryDiv);
        });

        container.appendChild(rowGroup);
    });
});