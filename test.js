console.log("@welcome-toast");

const s = document.createElement("script");
s.type = "text/javascript";
s.defer = true;
s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
document.head.appendChild(s);

const TARGET_ORIGIN = "http://localhost:5173";
const SUPABASE_URL = "https://mepmumyanfvgmvjfjpld.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcG11bXlhbmZ2Z212amZqcGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1Nzg2MDUsImV4cCI6MjA0OTE1NDYwNX0.HojnVr-YfuBy25jf9qy5DKYkqvdowZ0Pz2FScfIN-04";
let client;

const WHITE_SPACE = 5;
const FIRST_TOAST_INDEX = 0;
let indexToast = FIRST_TOAST_INDEX;
const totalToastList = [];
let currentToastList = [];
let prevFirstToast;
let lastToast;
let overlay = null;
let targetElement = null;
let messageFromPreview = "";

window.welcometoast = {
  getProject: async function (apiKey) {
    try {
      client = supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY, {
        global: {
          headers: { api_key: apiKey },
        },
      });

      if (apiKey && apiKey !== "") {
        setToastStyle();
        handleLoadDoneMessageParent(apiKey);

        const { data: resultProject, error } = await client
          .from("project")
          .select("*")
          .eq("api_key", apiKey);
        console.log("resultProject", resultProject);
        if (resultProject === undefined) {
          throw new Error(error);
        }

        getToastList(resultProject[0].id);
      }
    } catch (e) {
      console.log(
        "프로젝트를 불러오는 데 실패했습니다. @welcome-toast 관리자 페이지에서 프로젝트 설정을 확인해주세요.",
      );
      console.error(e);
    }
    return;
  },
};

const ancestorOrigins = window.location.ancestorOrigins;
const observer = new MutationObserver(mutationCallback);
function mutationCallback() {
  if (ancestorOrigins.contains(TARGET_ORIGIN)) {
    return;
  }

  const currentToastIdList = getCurrentToastList().map((toast) => toast.id);

  if (
    lastToast === undefined ||
    lastToast.id === currentToastIdList[currentToastIdList.length - 1]
  ) {
    return;
  }

  if (currentToastList.length > 0) {
    if (currentToastList[FIRST_TOAST_INDEX].id !== prevFirstToast.id) {
      indexToast = FIRST_TOAST_INDEX;
    }
  }

  if (currentToastIdList.length > 0) {
    applyToast(indexToast);
  }

  return;
}
const config = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "style"],
  characterData: true,
};

function applyToast() {
  if (ancestorOrigins.contains(TARGET_ORIGIN)) {
    return;
  }
  getFirstToast();

  const {
    id: toastId,
    target_element_id,
    message_title,
    message_body,
    image_url,
    background_opacity,
  } = currentToastList[indexToast];

  const isViewedToast = new Set(getToastHistory()).has(toastId);
  if (isViewedToast) {
    return;
  }

  if (indexToast === FIRST_TOAST_INDEX) {
    setToastHistory(currentToastList[FIRST_TOAST_INDEX].id);
  }

  targetElement = document.getElementById(`${target_element_id}`);

  if (!target_element_id || !targetElement) {
    console.log(
      !target_element_id
        ? "타겟 id가 없습니다."
        : "타겟 id을 가진 요소가 존재하지 않습니다.",
    );
    return;
  }

  const { window: w, target: t } =
    getWindowAndTargetSizePosition(targetElement);
  const yTargetInLayout = Math.ceil(t.yTarget) - WHITE_SPACE;

  createOverlay();
  setOverlay(
    w.widthViewport,
    w.heightViewport,
    t.widthTarget,
    t.heightTarget,
    t.xTarget,
    yTargetInLayout,
    background_opacity,
  );

  createPopover();
  setPopover(targetElement, message_title, message_body, image_url);

  lastToast = currentToastList[indexToast];

  observer.disconnect(document.body, config);

  window.addEventListener("resize", handleOverlayWindowResizeScroll);
  window.addEventListener("resize", handlePopoverWindowResizeScroll);
  window.addEventListener("scroll", handleOverlayWindowResizeScroll);
  window.addEventListener("scroll", handlePopoverWindowResizeScroll);
  window.addEventListener("click", handleRemoveToast);
  window.addEventListener("touchend", handleRemoveToast);
}

function applyToastAdminPreview() {
  const {
    target_element_id,
    message_title,
    message_body,
    image_url,
    background_opacity,
  } = messageFromPreview;
  targetElement = document.getElementById(`${target_element_id}`);

  if (!target_element_id || !targetElement) {
    console.log(
      !target_element_id
        ? "타겟 id가 없습니다."
        : "타겟 id을 가진 요소가 존재하지 않습니다.",
    );
    return;
  }

  const { window: w, target: t } =
    getWindowAndTargetSizePosition(targetElement);
  const yTargetInLayout = Math.ceil(t.yTarget) - WHITE_SPACE;
  const overlay = document.getElementById("welcomeToastOverlay");
  const popover = document.getElementById("welcomeToastPopover");

  if (!overlay) {
    createOverlay();
  }

  setOverlay(
    w.widthViewport,
    w.heightViewport,
    t.widthTarget,
    t.heightTarget,
    t.xTarget,
    yTargetInLayout,
    background_opacity,
  );

  if (!popover) {
    createPopover();
  }

  setPopover(targetElement, message_title, message_body, image_url);

  window.addEventListener("resize", handleOverlayWindowResizeScroll);
  window.addEventListener("resize", handlePopoverWindowResizeScroll);
  window.addEventListener("scroll", handleOverlayWindowResizeScroll);
  window.addEventListener("scroll", handlePopoverWindowResizeScroll);
  window.addEventListener("click", handleRemoveToast);
}

async function getToastList(projectId) {
  try {
    if (projectId) {
      const { data: resultToastList, error } = await client
        .from("toast")
        .select("*")
        .eq("project_id", projectId)
        .order("id", { ascending: true });

      if (resultToastList.length === 0) {
        throw new Error(error);
      }

      totalToastList.push(...resultToastList);

      if (getCurrentToastList().length > 0) {
        applyToast(FIRST_TOAST_INDEX);
      }
    }
  } catch (e) {
    console.log(
      "등록된 토스트가 없습니다. @welcome-toast 관리자 페이지에서 토스트 설정을 확인해주세요.",
    );
    console.error(e);
  }
  return;
}

function getCurrentToastList() {
  function getToastCurrentDocument(toast) {
    const target = document.getElementById(`${toast.target_element_id}`);

    if (target) {
      if (lastToast !== undefined) {
        if (toast.id !== lastToast.id) {
          return toast;
        }
      } else {
        return toast;
      }
    }
  }

  currentToastList = totalToastList.filter(getToastCurrentDocument);

  return currentToastList;
}

function getFirstToast() {
  prevFirstToast = currentToastList[FIRST_TOAST_INDEX];
  return;
}

function getWindowAndTargetSizePosition(targetElement) {
  const { width: widthViewport, height: heightViewport } =
    window.visualViewport;
  const {
    width: widthTarget,
    height: heightTarget,
    x: xTarget,
    y: yTarget,
    right,
    bottom,
  } = targetElement.getBoundingClientRect();

  return {
    window: { widthViewport, heightViewport },
    target: { widthTarget, heightTarget, xTarget, yTarget, right, bottom },
  };
}

function createOverlay() {
  overlay = window.document.createElement("div");
  overlay.id = "welcomeToastOverlay";
  document.body.appendChild(overlay);
  return;
}

function setOverlay(
  widthViewport,
  heightViewport,
  widthTarget,
  heightTarget,
  xTarget,
  yTarget,
  background_opacity,
) {
  const overlay = document.getElementById("welcomeToastOverlay");
  overlay.innerHTML = `
      <svg
        viewBox="0 0 ${widthViewport} ${heightViewport}"
        xmlSpace="preserve"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        preserveAspectRatio="xMinYMin slice"
        style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2; z-index: 10000; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;"
      >
        <path
          d="M${widthViewport},0L0,0L0,${heightViewport}L${widthViewport},${heightViewport}L${widthViewport},0Z M${xTarget},${yTarget} h${widthTarget} a5,5 0 0 1 5,5 v${heightTarget} a5,5 0 0 1 -5,5 h-${widthTarget} a5,5 0 0 1 -5,-5 v-${heightTarget} a5,5 0 0 1 5,-5 z"
          style="fill: rgb(0, 0, 0); opacity: ${Number(background_opacity) / 100}; pointer-events: auto; cursor: auto;"
        >
        </path>
      </svg>
  `;
  return;
}

function createPopover() {
  const overlay = document.getElementById("welcomeToastOverlay");

  const popover = window.document.createElement("div");
  const popoverImage = window.document.createElement("div");
  const popoverHeader = window.document.createElement("div");
  const popoverDescription = window.document.createElement("div");
  const popoverFooter = window.document.createElement("div");

  popover.id = "welcomeToastPopover";
  popoverImage.id = "welcomeToastPopoverImage";
  popoverHeader.id = "welcomeToastPopoverHeader";
  popoverDescription.id = "welcomeToastPopoverDescription";
  popoverFooter.id = "welcomeToastPopoverFooter";

  overlay.insertAdjacentElement("afterend", popover);
  popover.appendChild(popoverImage);
  popover.appendChild(popoverHeader);
  popover.appendChild(popoverDescription);
  popover.appendChild(popoverFooter);
  return;
}

function setPopover(targetElement, message_title, message_body, image_url) {
  const popover = document.getElementById("welcomeToastPopover");
  const popoverImage = document.getElementById("welcomeToastPopoverImage");
  const popoverHeader = document.getElementById("welcomeToastPopoverHeader");
  const popoverDescription = document.getElementById(
    "welcomeToastPopoverDescription",
  );
  const popoverFooter = document.getElementById("welcomeToastPopoverFooter");

  const { window: w, target: t } =
    getWindowAndTargetSizePosition(targetElement);
  const gapRight = w.widthViewport - (t.right + t.widthTarget);
  const xTargetInLayout = t.xTarget + t.widthTarget + WHITE_SPACE;

  const FULL_WIDTH = "width: 100%";
  const FOOTER_WIDTH = "width: 60%";
  const MARGIN_BOTTOM = "margin-bottom: 0.625rem";
  const HEADER_FONT_SIZE = "font-size: 1.3rem !important";
  const DESCRIPTION_FONT_SIZE = "font-size: 1rem !important";
  const FONT_NORMAL = "font-weight: normal !important";
  const FONT_BOLD = "font-weight: bold !important";
  const BACKGROUND_MAIN_COLOR = "background: #242424 !important";
  const SHADOW_STYLE =
    "box-shadow: 0 0.06rem 0.625rem !important; color: #363636 !important";
  const DISPLAY_FLEX_BETWEEN = "display: flex; justify-content: space-between";
  const BUTTON_BASIC_STYLE =
    "padding: 0.6em 1.2em !important; background-color: white !important; cursor: pointer !important; transition: border-color 0.25s !important; border-radius: 0.5rem !important";
  const BORDER_WIDTH = "border: 0.06rem solid transparent";
  const POPOVER_STYLE =
    "max-height: 15.625rem !important; min-width: 15.625rem !important; max-width: 15.625rem !important; padding: 0.95rem; border: 0.06rem; margin: 0.3rem; font-family: Arial !important";
  const OVER_FLOW_CLIP =
    "overflow: clip !important; overflow-wrap: break-word !important; word-break: break-all !important";

  popoverImage.innerHTML = null;
  popoverHeader.innerHTML = `<span style=${FONT_BOLD}; ${HEADER_FONT_SIZE};">${message_title}</span>`;
  popoverDescription.innerHTML = `<span style=${FONT_NORMAL}; ${DESCRIPTION_FONT_SIZE};">${message_body}</span>`;
  popoverFooter.innerHTML = `<div style=${FOOTER_WIDTH};></div><button id="welcomeToastPopoverButton" type="button" style=${FONT_BOLD}>확인</button>`;

  if (image_url !== "") {
    popoverImage.innerHTML = `<img src=${image_url} alt="popoverFooter" style=${FULL_WIDTH}; ${MARGIN_BOTTOM}; />`;
  }

  const welcomeToastPopoverButton = document.getElementById(
    "welcomeToastPopoverButton",
  );
  welcomeToastPopoverButton.addEventListener("click", handleToastButtonClick);

  if (gapRight < 300) {
    popover.style = `position: absolute; top: ${t.yTarget + t.heightTarget + WHITE_SPACE + window.scrollY}px; right: ${w.widthViewport - t.xTarget - t.widthTarget - WHITE_SPACE}px; flex: auto; flex-direction: column; ${POPOVER_STYLE}; border-radius: 5%; ${BACKGROUND_MAIN_COLOR}; color: white !important; ${SHADOW_STYLE}; z-index: 1000000; ${OVER_FLOW_CLIP};`;
    popoverHeader.style = `${MARGIN_BOTTOM};`;
    popoverDescription.style = `${MARGIN_BOTTOM};`;
    popoverFooter.style = `align-items: center !important; ${DISPLAY_FLEX_BETWEEN};`;
    welcomeToastPopoverButton.style = `${BUTTON_BASIC_STYLE}; ${BORDER_WIDTH}; ${BACKGROUND_MAIN_COLOR}; ${DESCRIPTION_FONT_SIZE}; ${FONT_BOLD};`;
    return;
  }

  popover.style = `position: absolute; top: ${t.yTarget}px; left: ${xTargetInLayout}px; flex: auto; flex-direction: column; border-radius: 5% !important; color: white !important; z-index: 1000000; ${POPOVER_STYLE}; ${BACKGROUND_MAIN_COLOR}; ${SHADOW_STYLE}; ${OVER_FLOW_CLIP};`;
  popoverHeader.style = `${MARGIN_BOTTOM};`;
  popoverDescription.style = `${MARGIN_BOTTOM};`;
  popoverFooter.style = `align-items: end !important; ${DISPLAY_FLEX_BETWEEN};`;
  welcomeToastPopoverButton.style = `${BUTTON_BASIC_STYLE}; ${BORDER_WIDTH}; ${BACKGROUND_MAIN_COLOR}; ${DESCRIPTION_FONT_SIZE}; ${FONT_BOLD};`;
  return;
}

function setToastStyle() {
  const BORDER_COLOR = "border-color: #242424 !important";
  const stylesheet = document.createElement("style");
  const style = `#welcomeToastPopoverButton:hover { ${BORDER_COLOR}; } #welcomeToastPopoverButton:focus, #welcomeToastPopoverButton:focus-visible { outline: 0.25rem auto -webkit-focus-ring-color !important; }`;

  stylesheet.appendChild(document.createTextNode(style));
  stylesheet.type = "text/css";

  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(stylesheet);

  return;
}

function getToastHistory() {
  const toastIdListViewed = JSON.parse(
    localStorage.getItem("welcome-toast-viewed"),
  );
  return toastIdListViewed;
}

function setToastHistory(firstToastId) {
  const toastHistoryUpdate =
    getToastHistory() === null
      ? [firstToastId]
      : [...getToastHistory(), firstToastId];
  localStorage.setItem(
    "welcome-toast-viewed",
    JSON.stringify(toastHistoryUpdate),
  );
  return;
}

function handleToastButtonClick() {
  const overlay = document.getElementById("welcomeToastOverlay");
  const popover = document.getElementById("welcomeToastPopover");

  overlay.remove();
  popover.remove();

  if (ancestorOrigins.contains(TARGET_ORIGIN)) {
    return;
  }

  indexToast += 1;
  if (indexToast === currentToastList.length) {
    observer.observe(document.body, config);
    return;
  }

  applyToast(indexToast);
  return;
}

function handleOverlayWindowResizeScroll() {
  const { target_element_id, background_opacity } = ancestorOrigins.contains(
    TARGET_ORIGIN,
  )
    ? messageFromPreview
    : currentToastList[indexToast];
  const targetElement = document.getElementById(`${target_element_id}`);
  const { window: w, target: t } =
    getWindowAndTargetSizePosition(targetElement);
  const yTargetInLayout = Math.ceil(t.yTarget) - WHITE_SPACE;

  setOverlay(
    w.widthViewport,
    w.heightViewport,
    t.widthTarget,
    t.heightTarget,
    t.xTarget,
    yTargetInLayout,
    background_opacity,
  );
  return;
}

function handlePopoverWindowResizeScroll() {
  const { target_element_id } = ancestorOrigins.contains(TARGET_ORIGIN)
    ? messageFromPreview
    : currentToastList[indexToast];
  const targetElement = document.getElementById(`${target_element_id}`);
  const popover = document.getElementById("welcomeToastPopover");
  const { window: w, target: t } =
    getWindowAndTargetSizePosition(targetElement);
  const gapRight = w.widthViewport - (t.right + t.widthTarget);

  if (!popover) {
    return;
  }

  if (gapRight < 400) {
    if (!window.scrollY) {
      popover.style.top = `${t.bottom + WHITE_SPACE}px`;
    }
    popover.style.left = `${t.xTarget - WHITE_SPACE}px`;
    return;
  }

  popover.style.top = `${t.yTarget}px`;
  popover.style.left = `${t.right + WHITE_SPACE}px`;
  return;
}

function handleRemoveToast(event) {
  const overlay = document.getElementById("welcomeToastOverlay");
  const popover = document.getElementById("welcomeToastPopover");

  if (event.target.tagName === "path") {
    overlay.remove();
    popover.remove();

    if (ancestorOrigins.contains(TARGET_ORIGIN)) {
      return;
    }
    observer.observe(document.body, config);
  }
  return;
}

function handleMessageParent(event) {
  const target = event.target.id;
  window.parent.postMessage({ target }, TARGET_ORIGIN);
  return;
}

function handleLoadDoneMessageParent(apiKey) {
  const previewInfo = { previewApiKey: apiKey, isPreviewLoadSuccedd: true };
  window.parent.postMessage({ previewInfo }, TARGET_ORIGIN);
  return;
}

function welcometoastInit() {
  if (
    window.welcometoastConfig &&
    typeof window.welcometoastConfig.init === "function"
  ) {
    window.welcometoastConfig.init();
  }
}

window.addEventListener("load", welcometoastInit);
window.addEventListener("message", (event) => {
  if (
    event.origin === TARGET_ORIGIN &&
    ancestorOrigins.contains(TARGET_ORIGIN)
  ) {
    messageFromPreview = event.data;
    applyToastAdminPreview();
  }
  return;
});
window.addEventListener("click", handleMessageParent);
