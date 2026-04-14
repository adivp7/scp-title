try {
  const nonScpMsg = "Current page cannot be recognized as SCP item page";
  const check = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log(tab.url);
    if (tab.url.match("scp-wiki.wikidot.com/scp-")) {
      const regexMatch = tab.url.matchAll(/scp-[-\w]+/gu);
      const [scp] = [...regexMatch].at(-1);
      console.log(scp);
      const scpTitle = await chrome.storage.local.get([scp]);
      if (scpTitle[scp] === undefined) {
        setTimeout(check, 1000);
        return;
      }
      if (scpTitle[scp] === null) {
        document.getElementById("main").innerHTML = nonScpMsg;
        return;
      }
      console.log(scpTitle);
      const scpTitleHtml = scpTitle[scp];
      document.getElementById("main").innerHTML = scpTitleHtml;
    } else {
      document.getElementById("main").innerHTML = nonScpMsg;
    }
  };
  check();
} catch (error) {
  console.error(error);
}
