async function sleep(t) {
    return await new Promise(resolve => setTimeout(resolve, t));
}

function theFrame() {
    if (window._theFrameInstance == null) {
      window._theFrameInstance = document.getElementById('oneStopFrame').contentWindow;
    }
  
    return window._theFrameInstance;
}

function getConcertId() {
    return document.getElementById("prodId").value;
}

function openEverySection() {
    let frame = theFrame();
    let section = frame.document.getElementsByClassName("seat_name");
    for (let i = 0; i < section.length; i++) {
        section[i].parentElement.click();
    }
}

function clickOnArea(area) {
    let frame = theFrame();
    let section = frame.document.getElementsByClassName("area_tit");
    for (let i = 0; i < section.length; i++) {
        let reg = new RegExp(area + "\$","g");
        if (section[i].innerHTML.match(reg)) {
            section[i].parentElement.click();
            return;
        }
    }
}

async function findSeat() {
    let frame = theFrame();
    let canvas = frame.document.getElementById("ez_canvas");
    let seat = canvas.getElementsByTagName("rect");
    
    await sleep(135);
    for (let i = 0; i < seat.length; i++) {
        let fillColor = seat[i].getAttribute("fill");
    
        if (fillColor !== "#DDDDDD" && fillColor !== "none") {
            console.log("Rect with different fill color found:", seat[i]);
            var clickEvent = new Event('click', { bubbles: true });

            seat[i].dispatchEvent(clickEvent);
            frame.document.getElementById("nextTicketSelection").click();
            
            // 保留浏览器通知功能
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    let notification = new Notification("提示", {
                        body: "发现合适的座位，点击切换窗口",
                        icon: "icon.png"
                    });
                    
                    notification.onclick = () => {
                        window.focus();
                    };
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            let notification = new Notification("提示", {
                                body: "发现合适的座位，点击切换窗口",
                                icon: "icon.png"
                            });

                            notification.onclick = () => {
                                window.focus();
                            };
                        }
                    });
                }
            }

            return true;
        }
    }
    return false;
}

async function reload() {
    let frame = theFrame();
    frame.document.getElementById("btnReloadSchedule").click();
    await sleep(450);
}

async function searchSeat(data) {
    for (sec of data.section) {
        openEverySection();
        clickOnArea(sec);
        if (await findSeat()) {
            // 直接进行下一步操作
            let frame = theFrame();
            await sleep(450);
            frame.document.getElementById("nextTicketSelection").click();
            return;
        }
    }
    reload();
    await searchSeat(data);
}

async function waitFirstLoad() {
    let concertId = getConcertId();
    let data = await get_stored_value(concertId);
    await sleep(700);
    searchSeat(data);
}

waitFirstLoad();
