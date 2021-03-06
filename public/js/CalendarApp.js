class CalendarApp {
    constructor() {
        this.canvas = document.querySelector("#date_canvas");
        this.ctx = this.canvas.getContext('2d');
        this.list = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.nowMonth = new Date().getMonth();
        this.dateArr = [];
        this.init();

    }

    init() {
        this.addEvent();
        document.querySelectorAll("#bottom > .bottom_icon")[1].classList.add("bottom_active");
        this.drawMonth();
    }

    newDate(month, date = 1) {
        let n = new Date();
        n.setDate(date);
        n.setMonth(month);
        return n;
    }

    addEvent() {
        $(".calendar_top > i").on("click", this.moveDateBtnClickHandler);
    }

    moveDateBtnClickHandler = e => {
        let num = $(e.currentTarget).data('num') * 1;
        this.nowMonth += num;
        this.drawMonth();
    }

    drawMonth() {
        let date = this.newDate(this.nowMonth);
        $(".calendar_table > tbody").remove();
        let txt = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        $("#calendar_year_month").html(txt);

        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDay();
        let lastDate = this.list[month];
        let trtd = document.createElement("tbody");
        let dNum = 1;

        this.dateArr = [];

        if (year % 4 && year % 100 != 0 || year % 400 == 0) {
            lastDate = 29;
            this.list[1] = 29;
        }



        for (let i = 1; i <= 6; i++) {

            //trtd.push("<tr>");
            let tr = document.createElement("tr");

            for (let j = 1; j <= 7; j++) {

                let td = document.createElement("td");
                let data = new Date(`${year}-${month + 1}-${dNum}`).toDateString();
                let dayObject = new DateTD(new Date(data), td, data == new Date().toDateString());

                if ((i == 1 && j <= day) || dNum > lastDate) {

                    //trtd.push(`<td><span></span></td>`);
                    dayObject.dom.innerHTML = `<span></span>`;
                    dayObject.date = null;

                } else {

                    //let data = `${year}-${month+1}-${dNum}`;
                    //trtd.push(`<td data-date="${data}"><span>${dNum}</span></td>`);

                    dayObject.dom.innerHTML = `<span>${dNum}</span>`;
                    dNum++;
                    this.dateArr.push(dayObject);

                }
                tr.appendChild(dayObject.dom);

            }

            //trtd.push("</tr>");
            trtd.appendChild(tr);
        }

        let activeFind = this.dateArr.find(x => { return x.active });
        if (activeFind === undefined) {
            let first = this.dateArr.find(x => x.date != null);
            this.changeActive(first.date);
        } else {
            this.changeActive(activeFind.date);
        }

        $(".calendar_table").append(trtd);

    }

    async changeActive(date) {
        let preObj = this.dateArr.find(x => { return x.active });
        let clickObj = this.dateArr.find(x => { return x.date == date });

        if (preObj !== undefined) {
            preObj.active = false;
            preObj.domActiveAction();
        }

        clickObj.active = true;
        clickObj.domActiveAction();

        // 아래쪽 시각화

        date = new Date(date);

        const RESULT = await this.getRecord(window.USER_IDX, date.toDBString());
        let dayString = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        let userStr = RESULT.comment;
        let width = this.canvas.width;
        let height = this.canvas.height;
        let user_score = RESULT.score;


        $(".day_info_text").html(userStr);
        $(".day_info_today").html(dayString);

        this.ctx.fillStyle = "#dfdfdf"; // 제일 기본적으로 그려주는 회색 원
        this.ctx.beginPath();
        this.ctx.moveTo(width/2,height/2);
        this.ctx.arc(width / 2, height / 2, 35, -Math.PI / 2, 3 / 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = "#5685ff";
        this.ctx.beginPath();
        this.ctx.moveTo(width/2,height/2);
        this.ctx.arc(width / 2, height / 2, 35, -Math.PI / 2, -Math.PI / 2 + (user_score / 100) * (2 * Math.PI));
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = "#fff"; // 다 그리고 나서 안에 하얀색 채워주기
        this.ctx.beginPath();
        this.ctx.moveTo(width/2,height/2);
        this.ctx.arc(width / 2, height / 2, 30, -Math.PI / 2, 3 / 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "bold 20px noto";
        this.ctx.fillStyle = "#5685ff";
        this.ctx.fillText(user_score, width / 2, height / 2);


    }

    getRecord(idx, date) {
        const FORM_DATA = new FormData();
        FORM_DATA.append("idx", idx);
        FORM_DATA.append("date", date);
        return new Promise((res, rej) => {
            const XHR = new XMLHttpRequest();
            XHR.open("POST", "/request-record");
            XHR.addEventListener("load", () => {
                const RESULT = JSON.parse(XHR.responseText);
                if (!RESULT) res({ comment: "작성한 한줄평이 존재하지 않습니다.", score: 0 });
                else res(RESULT);
            });
            XHR.send(FORM_DATA);
        });
    }

}

window.addEventListener("load", () => {
    window.calendarApp = new CalendarApp();
});

class DateTD {
    constructor(date, dom, active = false) {

        this.active = active;
        this.date = date;
        this.dom = dom;

        this.dom.dataset.date = this.date.toDateString();

        this.dom.addEventListener("click", (e) => {
            if (this.date === null) return;
            window.calendarApp.changeActive(this.date);
        });

    }

    domActiveAction() {
        if (this.active) this.dom.classList.add("calendar_active");
        else this.dom.classList.remove("calendar_active");
    }


}
