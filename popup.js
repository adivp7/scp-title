try {
  const nonScpMsg =
    "Current page cannot be recognized as an SCP item page. You may refresh the page to check again";
  const setMsg = (msg) => {
    document.getElementById("main").innerHTML = msg;
  };
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
        setMsg(nonScpMsg);
        return;
      }
      console.log(scpTitle);
      const scpTitleHtml = scpTitle[scp];
      setMsg(scpTitleHtml);
    } else {
      setMsg(nonScpMsg);
    }
  };
  check();
} catch (error) {
  console.error(error);
}
