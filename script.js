const wrapper = document.querySelector(".wrapper");
const borderBottom = wrapper.getBoundingClientRect().height;
const borderRight = wrapper.getBoundingClientRect().width;
const borderTop = wrapper.getBoundingClientRect().y;
const borderLeft = wrapper.getBoundingClientRect().x;
const duration = 300;
let step = 50;
let directionStatus = null;
let boxDone = [];
let boxCount = 0;
let boxMoveID = null;
let tenBottomBoxes = [];
let score = 0;

function createBox(wrapper) {
    const box = document.createElement("div");
    box.className = "box";
    box.id = boxCount;
    boxMoveID = boxCount;
    const colors = ["#C200FB", "#EC0868", "#FC2F00", "#EC7D10", "#FFBC0A"];
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

function animate(timing, duration, start, box) {
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

                    let total = document.querySelector(".total");
                    total.textContent = `Total SCORE ${score}`;
                    total.classList.add("show-total");

                    console.log(total);

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

                document.getElementById("score").textContent = `SCORE ${score}`;

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

window.addEventListener("load", () => {
    let box = createBox(wrapper);

    let start = performance.now();

    animate(timing, duration, start, box);
});
