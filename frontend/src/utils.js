const directions = [
    "north",
    "north-northeast",
    "northeast",
    "east-northeast",
    "east",
    "east-southeast",
    "southeast",
    "south-southeast",
    "south",
    "south-southwest",
    "southwest",
    "west-southwest",
    "west",
    "west-northwest",
    "northwest",
    "north-northwest",
    "north",
];

function plural(n, singular, plural) {
    return n == 1 ? singular : plural;
}

function compare(a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
}

function randomInt(r, f) {
    f = f || 0;
    return Math.floor(Math.random() * r) + f
}

function randomChoice(arr) {
    return arr[randomInt(arr.length)];
}

function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name);
}

function isTouchOnly() {
    return window.matchMedia("(any-hover: none)").matches;
}

function isLightMode() {
    return window.matchMedia("(prefers-color-scheme: light)").matches;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function removeDiacritics(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getData(key, def) {
    let value = localStorage.getItem(key);
    try {
        value = JSON.parse(value);
    } catch {
    }
    if (value === null) {
        value = def;
    }
    return value;
}

function inClass(element, className) {
    if (element.classList.contains(className)) {
        return true;
    }
    if (element.parentElement) {
        return inClass(element.parentElement, className);
    }
    return false;
}

function drawArrow(ctx, s) {
    ctx.lineWidth = 2;
    const y = (s / 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(0, -(y - 2));
    ctx.lineTo(-y / 2, 0);
    ctx.moveTo(0, -(y - 2));
    ctx.lineTo(y / 2, 0);
    ctx.closePath();
    ctx.stroke();
}

export {
    directions,
    drawArrow,
    plural,
    compare,
    randomInt,
    randomChoice,
    cssVar,
    isTouchOnly,
    isLightMode,
    escapeRegExp,
    removeDiacritics,
    setData,
    getData,
    inClass
}