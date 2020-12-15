const startBtn = document.querySelector(".load-menu__title-img");
const loadMenu = document.querySelector(".load-menu");
const wrapper = document.querySelector(".wrapper");
const total = document.querySelector(".total");
const totalScore = document.querySelector(".total__score");
const totalHigh = document.querySelector(".total__high");
const replay = document.querySelector(".total__replay");
const borderBottom = wrapper.getBoundingClientRect().height;
const borderRight = wrapper.getBoundingClientRect().width;
const borderTop = wrapper.getBoundingClientRect().y;
const borderLeft = wrapper.getBoundingClientRect().x;
const colors = ["#C200FB", "#EC0868", "#FC2F00", "#EC7D10", "#FFBC0A"];
const duration = 450;
let step = 50;
let directionStatus = null;
let boxDone = [];
let boxCount = 0;
let boxMoveID = null;
let tenBottomBoxes = [];
let score = 0;
let gameRuned = false;

function createBox(wrapper) {
    const box = document.createElement("div");
    box.className = "box";
    box.id = boxCount;
    boxMoveID = boxCount;
    const colorNumber = Math.floor(Math.random() * colors.length);
    box.style.backgroundColor = colors[colorNumber];
    wrapper.appendChild(box);

    let boxLeftCount = box.offsetLeft;
    const boxWidth = box.getBoundingClientRect().width;

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "ArrowRight" &&
            box.getBoundingClientRect().x - borderLeft + boxWidth * 2 <
                borderRight &&
            +box.id === boxMoveID
        ) {
            boxLeftCount += step;
            box.style.left = boxLeftCount + "px";
        } else if (
            event.key === "ArrowLeft" &&
            box.offsetLeft >= 50 &&
            +box.id === boxMoveID
        ) {
            boxLeftCount -= step;
            box.style.left = boxLeftCount + "px";
        }
    });

    boxCount++;

    return box;
}

function createStar(wrapper) {
    const star = document.createElement("div");
    star.className = "star";

    const { width, height } = wrapper.getBoundingClientRect();
    const randomHeigthRange = () => {
        const random = Math.random();
        return random > 0.25 && random < 0.75 ? random : randomHeigthRange();
    };
    const top = Math.floor(randomHeigthRange() * height);
    const widthRange = width - 40;
    const left = Math.floor(Math.random() * widthRange);
    star.style.top = top + "px";
    star.style.left = left + "px";

    wrapper.appendChild(star);

    return star;
}

function takeAStar(star, box) {
    if (!star) {
        return;
    }

    if (
        box.offsetLeft + box.getBoundingClientRect().width >= star.offsetLeft &&
        box.offsetLeft <=
            star.offsetLeft + star.getBoundingClientRect().width &&
        box.offsetTop + box.getBoundingClientRect().height >= star.offsetTop &&
        box.offsetTop <= star.offsetTop + star.getBoundingClientRect().height
    ) {
        return true;
    } else {
        return false;
    }
}

function updateScore(score) {
    document.querySelector(".score__now").textContent = `Score ${score}`;
}

function animate(timing, duration, start, box, star) {
    let boxHeight = box.getBoundingClientRect().height;
    let boxY = box.offsetTop - 1;

    function draw(progress) {
        boxY = Math.floor(progress * 100);
        box.style.top = boxY + "px";
    }

    let rAF = requestAnimationFrame(function animate(time) {
        let timeFruction = (time - start) / duration;

        let progress = timing(timeFruction);

        let hasBox = boxDone.some((element) => {
            return (
                element.left === box.offsetLeft &&
                element.top <= box.offsetTop + boxHeight
            );
        });

        if (takeAStar(star, box)) {
            wrapper.removeChild(star);
            score += 10;
            updateScore(score);
            star = null;
        }

        // Столкновение блока с нижней границей или с другим блоком
        if (boxY + boxHeight > borderBottom || hasBox) {
            //Столкновение с другим блоком
            if (hasBox) {
                let bottomBox = boxDone.filter((el) => {
                    return (
                        el.left === box.offsetLeft &&
                        el.top <= box.offsetTop + boxHeight
                    );
                });

                //Переполнение блоков в окне (GAME OVER)
                if (bottomBox[0].top - boxHeight - 2 < 0) {
                    cancelAnimationFrame(rAF);

                    let highScore = localStorage.getItem("HighScore")
                        ? localStorage.getItem("HighScore")
                        : 0;

                    totalScore.textContent = `Total Score ${score}`;
                    totalHigh.textContent = `High Score: ${highScore}`;

                    total.classList.add("show-total");

                    if (
                        !localStorage.getItem("HighScore") ||
                        +localStorage.getItem("HighScore") < score
                    ) {
                        localStorage.setItem("HighScore", score);
                    }

                    replay.addEventListener("click", () => location.reload());

                    return;
                }

                box.style.top = bottomBox[0].top - boxHeight + "px";
            } else {
                //Столкновение с нижней границей
                box.style.top = borderBottom - boxHeight - 2 + "px";
            }

            //Блоки которые остановились
            boxDone.push({
                left: box.offsetLeft,
                top: box.offsetTop,
                element: box
            });

            //Массив блоков заполнивших нижний ряд
            tenBottomBoxes = boxDone
                .filter((b) => b.top === 550)
                .map((el) => el.element.id);

            //Удаляем полный нижний ряд
            if (tenBottomBoxes.length === 10) {
                tenBottomBoxes.forEach((id) => {
                    document.getElementById(`${+id}`).classList.add("destroy");
                });
                boxDone = [];

                score += 10;

                updateScore(score);

                Array.from(document.querySelectorAll(".box")).forEach((el) => {
                    el.style.top = el.offsetTop + step + "px";
                    boxY = box.offsetTop;

                    if (el.offsetTop <= 550) {
                        boxDone.push({
                            left: el.offsetLeft,
                            top: el.offsetTop,
                            element: el
                        });
                    }
                });
            }

            cancelAnimationFrame(rAF);

            document.removeEventListener("keydown", (event) => {
                if (
                    event.key === "ArrowRight" &&
                    box.getBoundingClientRect().x - borderLeft + boxWidth * 2 <
                        borderRight &&
                    box.id === boxMoveID
                ) {
                    boxLeftCount += step;
                    box.style.left = boxLeftCount + "px";
                } else if (
                    event.key === "ArrowLeft" &&
                    box.offsetLeft >= 50 &&
                    box.id === boxMoveID
                ) {
                    boxLeftCount -= step;
                    box.style.left = boxLeftCount + "px";
                }
            });

            box = createBox(wrapper);

            star = star ? star : createStar(wrapper);

            start = performance.now();

            boxY =
                box.getBoundingClientRect().y -
                wrapper.getBoundingClientRect().y -
                1;
            boxHeight = box.getBoundingClientRect().height;
            boxLeftCount = box.offsetLeft;
            boxWidth = box.getBoundingClientRect().width;

            return animate(timing, duration, start, box);
        }

        draw(progress);

        requestAnimationFrame(animate);
    });
}

function timing(timeFraction) {
    return timeFraction;
}

function runGame() {
    loadMenu.style.display = "none";

    let box = createBox(wrapper);

    let star = createStar(wrapper);

    let start = performance.now();

    animate(timing, duration, start, box, star);

    gameRuned = true;
}

document.addEventListener("DOMContentLoaded", () => {
    let highScore = localStorage.getItem("HighScore")
        ? localStorage.getItem("HighScore")
        : 0;

    document.querySelector(
        ".score__high"
    ).textContent = `High score: ${highScore}`;
});
startBtn.addEventListener("click", runGame);
document.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && gameRuned === false) {
        runGame();
    }
});
