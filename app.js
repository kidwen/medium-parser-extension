/** @format */
// console.log("Medium parser loaded");

const ignoreURLs = [
  "/me/lists",
  "/me/lists/saved",
  "/me/list/highlights",
  "/me/lists/reading-history",
  "/me/stories/public",
  "/me/stories/responses",
  "/me/stories/drafts",
  "/me/stats",
  "/me/settings",
  "/me/following",
  "/me/settings",
  "/me/settings/publishing",
  "/me/settings/notifications",
  "/me/settings/membership",
  "/me/settings/security",
  "/me/notifications",
  "/plans",
  "/mastodon",
  "/verified-authors",
  "/partner-program",
  "/gift-plans",
  "/new-story",
  "/m/signin",
];

function init() {
  if (checkIfGoogleWebCache()) {
    return formatGoogleWebCache();
  }

  checkIfItIsMediumBlog();
}

init();

// checks if the page is google web cache and referred by this extension
function checkIfGoogleWebCache() {
  // console.log(
  //   "Checking if this site is google webcache and referred by medium-parser extension"
  // );
  const url = new URL(document.URL);

  if (
    url.hostname == "webcache.googleusercontent.com" &&
    url.searchParams.has("referer", "medium-parser") &&
    url.searchParams.has("vwsrc", "1")
  ) {
    // console.log("Hooray !!! It is referred by medium-parser extension");
    return true;
  }
  // console.log("Nah !!! It is not referred by medium-parser extension");
  return false;
}

// if it is a medium blog then run the script
function checkIfItIsMediumBlog() {
  const e = /https?:\/\/cdn-(?:static|client)(?:-\d)?\.medium\.com\//;

  if (
    [...document.querySelectorAll("script")].filter((r) => e.test(r.src))
      .length > 0 ||
    e.test(window.location.hostname)
  ) {
    // console.log("Is a medium blog !", handleURLChange());
    handleURLChange();
  } else {
    // console.log("Not a medium blog :( ");
  }
}

// handle URL change
function handleURLChange() {
  let previousUrl = "";
  let observer = new MutationObserver(function (mutations) {
    if (window.location.href !== previousUrl) {
      previousUrl = window.location.href;
      // console.log(`URL data changed to ${window.location.href}`);
      runMedium(location.href);
    }
  });

  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(document, config);
}

function runMedium(url) {
  //   check the url
  const u = new URL(url);

  // check if it is a page
  const root = document.getElementById("root");
  root.style.position = "relative";

  if (
    ignoreURLs.indexOf(u.pathname) == -1 &&
    u.pathname.split("/").filter((e) => e).length >= 1
  ) {
    // get the title

    var leftDiv = document.createElement("div"); //Create left div
    leftDiv.id = "medium-parser"; //Assign div id
    leftDiv.setAttribute(
      "style",
      "position:absolute;z-index:1;top:150px;right:150px;"
    ); //Set div attributes
    a = document.createElement("a");
    a.href = `http://webcache.googleusercontent.com/search?q=cache:${url}&strip=0&vwsrc=1&referer=medium-parser`; // Instead of calling setAttribute
    a.innerHTML = "Read from Google Cache";
    a.setAttribute(
      "style",
      "padding:14px 25px; color:white; background: #242424; display:block;text-align:center;"
    ); //Set div attributes
    a.setAttribute("target", "_blank"); //Set div attributes

    archive = document.createElement("a");
    archive.href = `https://archive.is?url=${url}&run=1&referer=medium-parser`; // Instead of calling setAttribute
    archive.innerHTML = "Read from Archive.is";
    archive.setAttribute(
      "style",
      "padding:14px 25px; color:white; background: #242424; display:block; margin-top:10px;text-align:center;"
    ); //Set div attributes
    archive.setAttribute("target", "_blank"); //Set div attributes

    // old API
    oldAPI = document.createElement("a");
    oldAPI.href = `https://medium-parser.vercel.app/?url=${url}`; // Instead of calling setAttribute
    oldAPI.innerHTML = "Open in Proxy API";
    oldAPI.setAttribute(
      "style",
      "padding:14px 25px; color:white; background: #242424; display:block; margin-top:10px;text-align:center;"
    ); //Set div attributes
    oldAPI.setAttribute("target", "_blank"); //Set div attributes

    messageEl = createMessageElement();

    leftDiv.appendChild(a); // Append the link to the div
    leftDiv.appendChild(archive);
    leftDiv.appendChild(oldAPI);
    if (messageEl != null) {
      leftDiv.appendChild(messageEl);
    }
    root.appendChild(leftDiv); // A
  } else {
    // remove the element
    const el = document.getElementById("medium-parser");

    if (el != undefined || el != null) {
      el.remove();
    }
  }
}

// format google web-cache
function formatGoogleWebCache() {
  const contents = htmlDecode(
    document.querySelector("body > div > pre").innerHTML
  );
  const title = getTitle(contents);

  document.body.innerHTML = contents;
  document.title = "Medium parser - " + title;
}

function htmlDecode(rawContent) {
  var entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };

  for (var prop in entities) {
    if (entities.hasOwnProperty(prop)) {
      rawContent = rawContent.replace(new RegExp(prop, "g"), entities[prop]);
    }
  }
  return rawContent;
}

function getTitle(rawContent) {
  start = '<title data-rh="true">';
  end = "</title>";
  var startPos = rawContent.indexOf(start) + start.length;
  var endPos = rawContent.indexOf(end);
  return rawContent.substring(startPos, endPos).trim();
}

function createMessageElement() {
  if (
    localStorage.getItem("removeMessage") != null &&
    localStorage.getItem("removeMessage") == "true"
  ) {
    return null;
  }
  // old API
  messageEl = document.createElement("div");
  messageEl.innerHTML =
    "Iframes/gists/embeds are not loaded in the Google Cache proxy. For those, use the Archive.is proxy instead.";
  messageEl.setAttribute(
    "style",
    "padding:2px 4px; color:#242424; display:block; text-align:left;max-width: 212px;font-size: 0.83em;border: 1px solid black; margin-top:10px; position:relative;"
  );

  // cross el
  // crossEl = document.createElement("div");
  // crossEl.innerHTML = "&#10005;";
  // crossEl.setAttribute(
  //   "style",
  //   "position: absolute;right: -1px;top: -1px;background: #242424;padding: 0px 4px;margin: 0; color: white;cursor: pointer;"
  // );
  // crossEl.addEventListener("click", removeMessageEl);

  // messageEl.appendChild(crossEl);
  return messageEl;
}

function removeMessageEl(e) {
  e.target.parentNode.remove();
  localStorage.setItem("removeMessage", "true");
}
