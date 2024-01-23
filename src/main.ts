import { positionAdjust, redrawSprites } from "./header/header.ts";
import "./style.css";
import { html } from "./template";
import "./data";
import { drawDaytimeYard } from "./header/daytime.ts";
import { drawEveningYard } from "./header/evening.ts";
import { drawNightYard } from "./header/night.ts";

type Styles = "daytime" | "evening" | "night";
const styles: Styles[] = ["daytime", "evening", "night"];
let styleIndex = 0;

window.addEventListener("load", () => {
    // Add the different time of day options to the page
    const select = document.getElementById("time-select")!;
    for (let it of styles) {
        select.insertAdjacentHTML(
            "beforeend",
            html`<input
                    type="radio"
                    id="time-${it}"
                    name="times"
                    value="${it}"
                />
                <label for="time-${it}">${it}</label>`,
        );
        let input = document.getElementById(`time-${it}`) as HTMLInputElement;

        input.addEventListener("change", (ev) => {
            let val = (ev.target as HTMLInputElement).value;
            draw(val as any);
        });
    }
    document.getElementById("header")?.addEventListener("click", () => {
        draw(styles[styleIndex++ % styles.length]);
    });

    // Draw the art based on Central Standard Time
    const hour = (new Date().getUTCHours() + 18) % 24;
    if (hour > 9 && hour < 18) {
        draw("daytime");
    } else if (hour >= 18 && hour < 9) {
        draw("evening");
    } else {
        draw("night");
    }
});

/**
 * Keyboard shortcuts to adjust the positioning of the kitty.
 */
const adjustments: {
    key: string;
    attr: keyof typeof positionAdjust;
    value: number;
    shiftValue?: number;
    op?: "+" | "*";
}[] = [
    {
        key: "ArrowLeft",
        attr: "x",
        value: -1,
        shiftValue: -10,
    },
    {
        key: "ArrowRight",
        attr: "x",
        value: 1,
        shiftValue: 10,
    },
    {
        key: "ArrowUp",
        attr: "y",
        value: -1,
        shiftValue: -10,
    },
    {
        key: "ArrowDown",
        attr: "y",
        value: 1,
        shiftValue: 10,
    },
    {
        key: "[",
        attr: "rotation",
        value: 0.02,
    },
    {
        key: "]",
        attr: "rotation",
        value: -0.02,
    },
    {
        key: "{",
        attr: "rotation",
        value: 0.1,
    },
    {
        key: "}",
        attr: "rotation",
        value: -0.1,
    },
    {
        key: "+",
        attr: "scale",
        value: 1.02,
        shiftValue: 1.1,
        op: "*",
    },
    {
        key: "-",
        attr: "scale",
        value: 0.98,
        shiftValue: 0.9,
        op: "*",
    },
];

window.addEventListener("keydown", (ev) => {
    let adj = adjustments.find((it) => it.key === ev.key);

    if (adj) {
        const shift = ev.getModifierState("Shift");
        let value = shift ? adj.shiftValue || adj.value : adj.value;
        if (adj.op === "*") {
            positionAdjust[adj.attr] *= value;
        } else {
            positionAdjust[adj.attr] += value;
        }
        redrawSprites();
    }

    if (ev.key === "d") {
        draw("daytime");
    } else if (ev.key === "e") {
        draw("evening");
    } else if (ev.key === "n") {
        draw("night");
    }
});

function draw(time?: Styles) {
    const header = document.getElementById(
        "header-canvas",
    ) as HTMLCanvasElement;
    const ground = document.getElementById(
        "ground-canvas",
    ) as HTMLCanvasElement;

    document.body.classList.value = time || "";
    switch (time) {
        case "evening":
            drawEveningYard(header, ground);
            break;
        case "night":
            drawNightYard(header, ground);
            break;
        default:
            drawDaytimeYard(header, ground);
    }

    (document.getElementById(`time-${time}`) as HTMLInputElement).checked =
        true;
}
