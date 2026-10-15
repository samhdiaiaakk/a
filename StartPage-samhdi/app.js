// GitHubPages/a/StartPage-samhdi/app.js

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("link-container");
    if (!container) return;

    // 簡易CSVパーサー（# または // で始まる行、および空行をコメントとしてスキップ）
    function parseCSV(text) {
        const lines = text.trim().split("\n");
        if (lines.length === 0) return [];
        
        // ヘッダー行を取得
        const headers = lines[0].split(",").map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 空行や、'#' または '//' で始まる行はコメントとしてスキップ
            if (!line || line.startsWith("#") || line.startsWith("//")) {
                continue;
            }

            // カンマで分割（最大4つ: row, column, name, url）
            const parts = line.split(",");
            if (parts.length < 2) continue;

            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = parts[j] ? parts[j].trim() : "";
            }
            result.push(obj);
        }
        return result;
    }

    try {
        // ※ 実際に配置しているCSVファイル名に合わせる（ここでは "links.csv"）
        const response = await fetch("links.csv");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const rawData = parseCSV(csvText);

        // row と column を使って元の構造を復元する
        const rowsMap = {};

        rawData.forEach(row => {
            const r = parseInt(row.row, 10);
            const c = parseInt(row.column, 10);
            const name = row.name;
            const url = row.url || "";

            if (isNaN(r) || isNaN(c)) return;

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

        // 再帰的にリスト（ul/li）を生成する関数
        function createMenu(items) {
            const ul = document.createElement("ul");
            
            items.forEach(item => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.textContent = item.name;
                a.href = item.url && item.url !== "#" ? item.url : "#";
                if (item.url && item.url !== "#") {
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                }
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
        Object.keys(rowsMap).sort((a, b) => a - b).forEach(r => {
            const rowGroup = document.createElement("div");
            rowGroup.className = "row-group";

            Object.keys(rowsMap[r]).sort((a, b) => a - b).forEach(c => {
                const cat = rowsMap[r][c];
                const categoryDiv = document.createElement("div");
                categoryDiv.className = "category";

                const h2 = document.createElement("h2");
                h2.textContent = cat.category || "";
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