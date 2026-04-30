(function () {
const VERSION = "v1.1";
console.log("年次チェック:", VERSION);
'use strict';

/********** 共通 **********/
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

/********** DBRecord：再利用ボタン **********/
if (location.href.includes("page=DBRecord")) {

    const btn = document.createElement("button");
    btn.textContent = "年次：カスタム再利用_累計コピー";

    btn.style = `
        position:fixed;
        top:360px;
        right:20px;
        z-index:999999;
        padding:10px 14px;
        background:#2196F3;
        color:#fff;
        border:none;
    `;

    btn.onclick = () => {

        const url = new URL(location.href);
        const did = url.searchParams.get("did");
        const rid = url.searchParams.get("rid");

        if (!did || !rid) {
            alert("URL取得失敗");
            return;
        }

        const formUrl =
              `${location.origin}/o/ag.cgi?page=DBForm&did=${did}&rid=${rid}` +
              `&mode=reuse&autoYear=1`;  // ←ここを追加

        location.href = formUrl;
    };
    document.body.appendChild(btn);
}

/********** DBForm：自動実行 **********/
if (location.href.includes("page=DBForm") &&
    location.href.includes("mode=reuse")) {

    const url = new URL(location.href);

    if (url.searchParams.get("autoYear") === "1") {
        setTimeout(runYearCopy, 500);
    }
}

/********** メイン処理 **********/
async function runYearCopy() {

    try {

        const url = new URL(location.href);
        const did = url.searchParams.get("did");
        const rid = url.searchParams.get("rid");

        if (!did || !rid) return;

        const recordUrl =
            `${location.origin}/o/ag.cgi?page=DBRecord&did=${did}&rid=${rid}`;

        const html = await fetch(recordUrl, { credentials: "include" })
            .then(r => r.text());

        const doc = new DOMParser().parseFromString(html, "text/html");

        const daysRaw  = getText(doc, "td.record-value-719");
        const hoursRaw = getText(doc, "td.record-value-723");

        const days  = normalize(daysRaw);
        const hours = normalize(hoursRaw);

        const fldDays  = document.querySelector("#dz_fld504");
        const fldHours = document.querySelector("#dz_fld505");

        if (!fldDays || !fldHours) {
            alert("貼付先が見つかりません");
            return;
        }

        fldDays.value = days;
        fldHours.value = hours;

        alert(`年次コピー完了\n日数:${days}\n時間:${hours}`);

    } catch (e) {
        console.error(e);
        alert("年次処理エラー");
    }
}

/********** util **********/
function getText(doc, selector) {
    const el = doc.querySelector(selector);
    return el ? el.innerText.trim() : "";
}

function normalize(v) {
    return (v || "").replace("日", "").replace("時間", "").trim();
}

})();
