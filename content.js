(async () => {
  let scp = "";
  let scpTitleHtml = "";
  try {
    const regexMatch = document.URL.matchAll(/scp-[-\w]+/gu);
    scp = [...regexMatch].at(-1)[0];
    // console.log(scp);

    const id = Number(scp.split("-")[1]);
    // console.log(id);
    if (isNaN(id)) throw new Error("Couldn't get scp-id to determine series");

    const series = Math.floor(id / 1000) + 1;
    // console.log(series);

    let page = "scp-series";
    if (series !== 1) page += "-" + series;
    // console.log(page);

    const url = "https://scp-wiki.wikidot.com/" + page;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Response status: ${res.status}`);
    // console.log(res);
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
    // console.log(scpEntry);
    scpTitleHtml = scpEntry.match(/(?<=- ).*/u)[0];
    // console.log(scpTitleHtml);
    // saving this to localStorage for popup.html to show
    await chrome.storage.local.set({ [scp]: scpTitleHtml });
  } catch (error) {
    // console.error(error);
    chrome.storage.local.set({ [scp]: null });
  } finally {
    // set title alongside the text of first visible entry of scp-id found in main-content (which is hopefully the title)
    function isVisible(el) {
      // check if element has dimensions and isn't explicitly hidden
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    // Using the TreeWalker method (most efficient for this)
    function findVisibleElementByText(text) {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.toLowerCase().includes(text)) {
          const parent = node.parentElement;
          // Check if the parent (or the text itself) is actually visible
          if (parent && isVisible(parent)) {
            return parent;
          }
        }
      }
      return null;
    }

    const firstElement = findVisibleElementByText(scp.toLowerCase());
    // console.log(firstElement);
    if (scpTitleHtml&&firstElement) {
      const startIndex = firstElement.innerHTML
        .toLowerCase()
        .indexOf(scp.toLowerCase());
      const endIndex = startIndex + scp.length + 1;
      const newInnerHTML =
        firstElement.innerHTML.slice(0, endIndex) +
        " - " +
        scpTitleHtml +
        firstElement.innerHTML.slice((start = endIndex));
      // console.log(newInnerHTML);
      firstElement.innerHTML = newInnerHTML;
    }
  }
})();
