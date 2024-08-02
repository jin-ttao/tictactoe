const arrTom = [];
const arrJerry = [];
let num = 0;

const button1 = document.querySelector(".oneOne");
const button2 = document.querySelector(".oneTwo");
const button3 = document.querySelector(".oneThree");
const button4 = document.querySelector(".twoOne");
const button5 = document.querySelector(".twoTwo");
const button6 = document.querySelector(".twoThree");
const button7 = document.querySelector(".threeOne");
const button8 = document.querySelector(".threeTwo");
const button9 = document.querySelector(".threeThree");
const modal = document.querySelector(".modal");
let result = document.querySelector(".modal_result");
const restartBtn = document.querySelector(".restart_btn");

button1.addEventListener("click", function() {  // 클릭하면 좌표값 가져오기
    action(button1.innerHTML);
    render(button1);
}, { once: true });
button2.addEventListener("click", function() {
    action(button2.innerHTML);
    render(button2);
}, { once: true });
button3.addEventListener("click", function() {
    action(button3.innerHTML);
    render(button3);
}, { once: true });
button4.addEventListener("click", function() {
    action(button4.innerHTML);
    render(button4);
}, { once: true });
button5.addEventListener("click", function() {
    action(button5.innerHTML);
    render(button5);
}, { once: true });
button6.addEventListener("click", function() {
    action(button6.innerHTML);
    render(button6);
}, { once: true });
button7.addEventListener("click", function() {
    action(button7.innerHTML);
    render(button7);
}, { once: true });
button8.addEventListener("click", function() {
    action(button8.innerHTML);
    render(button8);
}, { once: true });
button9.addEventListener("click", function() {
    action(button9.innerHTML);
    render(button9);
}, { once: true });
restartBtn.addEventListener("click", restart)   // 게임 다시 시작(새로고침)

// 기능1. 클릭액션
function action(k) {
    let arrK = k.split(',').map(Number);
    
    if (num % 2 === 0) {
        arrTom.push(arrK);
    } else {
        arrJerry.push(arrK);
    }
    
    if (num >= 4) {
        winner(num);
    };
    
    num = num + 1;
};

// 화면 그리기
function render(k) {
    if (num % 2 !== 0) {
        k.textContent = '😾';
        k.classList.add("clickedTom");
    } else {
        k.textContent = '🐭';
        k.classList.add("clickedJerry");
    }
}


// 기능2. 승리 판별
function winner(num) {
    if (num === 9) {
        end();
    }
    // 톰 검사
    if (num % 2 === 0) {
        // 승리조건1. 가로세로3개로 이기는 경우
        let arrTomFront = [];
        let arrTomBack = [];
        
        for (i = 0; i < arrTom.length; i++) {
            arrTomFront.push(arrTom[i][0]);
            arrTomBack.push(arrTom[i][1]);
        }
        
        let cntFrontOne = 0;
        let cntFrontTwo = 0;
        let cntFrontThree = 0;
        let cntBackOne = 0;
        let cntBackTwo = 0;
        let cntBackThree = 0;

        for (k = 0; k < arrTomFront.length; k++) {
            if (arrTomFront[k] === 1) {
                cntFrontOne++;
            } 
            if (arrTomFront[k] === 2) {
                cntFrontTwo++;
            }
            if (arrTomFront[k] === 3) {
                cntFrontThree++;
            }
            if (arrTomBack[k] === 1) {
                cntBackOne++;
            } 
            if (arrTomBack[k] === 2) {
                cntBackTwo++;
            }
            if (arrTomBack[k] === 3) {
                cntBackThree++;
            }
        }
        console.log(cntFrontOne);
        if (cntFrontOne >= 3 || cntFrontTwo >= 3 || cntFrontThree >= 3 || cntBackOne >= 3 || cntBackTwo >= 3 || cntBackThree >= 3) {
            end();
        }    
        // 승리조건2. 대각선으로 이기는 경우
        for (i = 0; i < arrTom.length; i++) {
            if (arrTom[i][0] === 2 && arrTom[i][1] === 2) {
                for (i = 0; i < arrTom.length; i++) {
                    // 2-1. 우하향 대각선
                    if (arrTom[i][0] === 1 && arrTom[i][1] === 1) {
                        for (i = 0; i < arrTom.length; i++) {
                            if (arrTom[i][0] === 3 && arrTom[i][1] === 3) {
                                end();
                            }
                        }        
                    // 2-2. 우상향 대각선
                    } else if (arrTom[i][0] === 3 && arrTom[i][1] === 1) {
                        for (i = 0; i < arrTom.length; i++) {
                            if (arrTom[i][0] === 1 && arrTom[i][1] === 3) {
                                end();
                            }
                        }        
                    }
                } 
            } 
        } 
    }  else { // 제리 검사 (톰 코드와 동일)
        // 승리조건1.
        let arrJerryFront = [];
        let arrJerryBack = [];

        for (i = 0; i < arrJerry.length; i++) {
            arrJerryFront.push(arrJerry[i][0]); 
            arrJerryBack.push(arrJerry[i][1]); 
        }

        let cntFrontOne = 0;
        let cntFrontTwo = 0;
        let cntFrontThree = 0;
        let cntBackOne = 0;
        let cntBackTwo = 0;
        let cntBackThree = 0;

        for (k = 0; k < arrJerryFront.length; k++) { 
            if (arrJerryFront[k] === 1) {
                cntFrontOne++;
            } 
            if (arrJerryFront[k] === 2) {
                cntFrontTwo++;
            }
            if (arrJerryFront[k] === 3) {
                cntFrontThree++;
            }
            if (arrJerryBack[k] === 1) {
                cntBackOne++;
            } 
            if (arrJerryBack[k] === 2) {
                cntBackTwo++;
            }
            if (arrJerryBack[k] === 3) {
                cntBackThree++;
            }
        }
        console.log(cntFrontOne); 
        if (cntFrontOne >= 3 || cntFrontTwo >= 3 || cntFrontThree >= 3 || cntBackOne >= 3 || cntBackTwo >= 3 || cntBackThree >= 3) {
            end();
        }    
        // 승리조건2. 
        for (i = 0; i < arrJerry.length; i++) {  
            if (arrJerry[i][0] === 2 && arrJerry[i][1] === 2) { 
                for (i = 0; i < arrJerry.length; i++) {
                    // 2-1. 우하향 대각선
                    if (arrJerry[i][0] === 1 && arrJerry[i][1] === 1) {
                        for (i = 0; i < arrJerry.length; i++) {
                            if (arrJerry[i][0] === 3 && arrJerry[i][1] === 3) {
                                end();
                            }
                        }        
                    // 2-2. 우상향 대각선
                    } else if (arrJerry[i][0] === 3 && arrJerry[i][1] === 1) {
                        for (i = 0; i < arrJerry.length; i++) {
                            if (arrJerry[i][0] === 1 && arrJerry[i][1] === 3) {
                                end();
                            }
                        }        
                    }
                } 
            } 
        }  
    }
}

// 기능3. 게임종료(모달 팝업)
function end() {
    if (num % 2 === 0 && num !== 8) {
        result.textContent = 'Tom이 이겼어요!'
    } else if (num % 2 !== 0) {
        result.textContent = 'Jerry가 이겼어요!'
    } else if (num === 8) {
        result.textContent = '무승부에요!'
    }
    modal.classList.add("show");
}

// 기능4. 게임 다시시작(새로고침)
function restart() {
    location.reload();
}