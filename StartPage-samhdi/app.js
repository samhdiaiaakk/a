// GitHubPages/a/StartPage-samhdi/app.js

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("link-container");
    if (!container) return;

    // 簡易CSVパーサー（# または // で始まる行、および空行をコメントとしてスキップ）
    function parseCSV(text) {
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",");
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 空行や、'#' または '//' で始まる行はコメントとしてスキップ
            if (!line || line.startsWith("#") || line.startsWith("//")) {
                continue;
            }

            const currentLine = line.split(",");
            if (currentLine.length < headers.length) continue;

            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim()] = currentLine[j] ? currentLine[j].trim() : "";
            }
            result.push(obj);
        }
        return result;
    }

    try {
        const response = await fetch("links_rc.csv");
        const csvText = await response.text();
        const rawData = parseCSV(csvText);

        // row と column を使って元の構造を復元する
        const rowsMap = {};

        rawData.forEach(row => {
            const r = parseInt(row.row, 10);
            const c = parseInt(row.column, 10);
            const name = row.name;
            const url = row.url;

            if (!rowsMap[r]) rowsMap[r] = {};
            if (!rowsMap[r][c]) {
                rowsMap[r][c] = { category: "", items: [] };
            }

            // [カテゴリ名] の形式の行はカテゴリタイトルとして処理
            if (name.startsWith("[") && name.endsWith("]")) {
                rowsMap[r][c].category = name.slice(1, -1);
            } else if (name.startsWith("  ↳ ")) {
                // サブアイテム（直前のアイテムの子要素にする）
                const subName = name.replace("  ↳ ", "").trim();
                const items = rowsMap[r][c].items;
                if (items.length > 0) {
                    const parentItem = items[items.length - 1];
                    if (!parentItem.subItems) parentItem.subItems = [];
                    parentItem.subItems.push({ name: subName, url: url });
                }
            } else {
                // 通常のアイテム
                rowsMap[r][c].items.push({ name: name, url: url });
            }
        });

        // 配列形式に変換
        const linkData = [];
        Object.keys(rowsMap).sort((a, b) => a - b).forEach(r => {
            const rowCategories = [];
            Object.keys(rowsMap[r]).sort((a, b) => a - b).forEach(c => {
                rowCategories.push(rowsMap[r][c]);
            });
            linkData.push(rowCategories);
        });

        // 再帰的にリスト（ul/li）を生成する関数
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

                if (item.subItems && item.subItems.length > 0) {
                    const subUl = createMenu(item.subItems);
                    li.appendChild(subUl);
                }

                ul.appendChild(li);
            });

            return ul;
        }

        // 描画処理
        linkData.forEach(row => {
            const rowGroup = document.createElement("div");
            rowGroup.className = "row-group";

            row.forEach(cat => {
                const categoryDiv = document.createElement("div");
                categoryDiv.className = "category";

                const h2 = document.createElement("h2");
                h2.textContent = cat.category;
                categoryDiv.appendChild(h2);

                const menuUl = createMenu(cat.items);
                categoryDiv.appendChild(menuUl);

                rowGroup.appendChild(categoryDiv);
            });

            container.appendChild(rowGroup);
        });

    } catch (error) {
        console.error("リンクデータの読み込みに失敗しました:", error);
    }
});