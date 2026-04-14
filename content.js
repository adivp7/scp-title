(async () => {
  let scp;
  try {
    const regexMatch = document.URL.matchAll(/scp-[-\w]+/gu);
    scp = [...regexMatch].at(-1)[0];
    console.log(scp);

    const id = Number(scp.split("-")[1]);
    console.log(id);
    if (isNaN(id)) throw new Error("Couldn't get id for series");

    const series = Math.floor(id / 1000) + 1;
    console.log(series);

    let page = "scp-series";
    if (series !== 1) page += "-" + series;
    console.log(page);

    const url = "https://scp-wiki.wikidot.com/" + page;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Response status: ${res.status}`);
    console.log(res);
    const html = await res.text();
    // console.log(html.slice(0, 100));
    // tried to regex instead of using DOMParser because it would be faster but it just freezes for some reason
    // const scpLink = html.match(new RegExp(`<a(.|\s)*${scp}(.|\s)*<\/a>`));
    // console.log(scpLink);
    const parser = new DOMParser();
    const scpList = parser.parseFromString(html, "text/html");
    const scpEntry = scpList.querySelector(
      `li:has(a[href*='${scp}'])`
    ).innerHTML;
    console.log(scpEntry);
    const scpTitleHtml = scpEntry.match(/(?<=- ).*/u)[0];
    console.log(scpTitleHtml);
    // saving this to localStorage for popup.html to show
    await chrome.storage.local.set({ [scp]: scpTitleHtml });
  } catch (error) {
    console.error(error);
    chrome.storage.local.set({ [scp]: null });
  }
})();
