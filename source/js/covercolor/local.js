const coverColor = () => {
    const path = document.getElementById("post-cover")?.src;
    if (path) {
        localColor(path);
    }
}

const localColor = (path) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height).data;
        const {r, g, b} = calculateRGB(data);
        let value = rgbToHex(r, g, b);
        if (getContrastYIQ(value) === "light") {
            value = LightenDarkenColor(value, -50);
        }
        setThemeColors(value, r, g, b);
    };
    img.onerror = function() {
        console.error('图片加载失败');
    };
    img.src = path;
}

function calculateRGB(data) {
    let r = 0, g = 0, b = 0;
    const step = 5;
    for (let i = 0; i < data.length; i += 4 * step) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    r = Math.floor(r / (data.length / 4 / step));
    g = Math.floor(g / (data.length / 4 / step));
    b = Math.floor(b / (data.length / 4 / step));
    return {r, g, b};
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function LightenDarkenColor(col, amt) {
    let usePound = false;

    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }

    const num = parseInt(col, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const b = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
    const g = Math.min(255, Math.max(0, (num & 0xff) + amt));

    return `${usePound ? "#" : ""}${(g | (b << 8) | (r << 16)).toString(16).padStart(6, "0")}`;
}

function getContrastYIQ(hexcolor) {
    var colorrgb = colorRgb(hexcolor);
    var colors = colorrgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    var red = colors[1];
    var green = colors[2];
    var blue = colors[3];
    var brightness = (red * 299) + (green * 587) + (blue * 114);
    brightness = brightness / 255000;
    return brightness >= 0.5 ? "light" : "dark";
}

function colorRgb(str) {
    const HEX_SHORT_REGEX = /^#([0-9a-fA-f]{3})$/;
    const HEX_LONG_REGEX = /^#([0-9a-fA-f]{6})$/;
    const HEX_SHORT_LENGTH = 4;

    if (!str || typeof str !== 'string') {
        return str;
    }

    const sColor = str.toLowerCase();
    let hexValue = "";

    if (sColor && (HEX_SHORT_REGEX.test(sColor) || HEX_LONG_REGEX.test(sColor))) {
        hexValue = sColor.length === HEX_SHORT_LENGTH ?
            sColor.replace(/^#(.)/g, "#$1$1") :
            sColor;

        const rgbValue = hexValue.slice(1)
            .match(/.{2}/g)
            .map(val => parseInt(val, 16));

        return `rgb(${rgbValue[0]}, ${rgbValue[1]}, ${rgbValue[2]})`;
    } else {
        return sColor;
    }
}

function setThemeColors(value, r = null, g = null, b = null) {
    const cardContents = document.getElementsByClassName('card-content');
    const authorInfo = document.getElementsByClassName('author-info__sayhi');

    if (value) {
        document.documentElement.style.setProperty('--sco-main', value);
        document.documentElement.style.setProperty('--sco-main-op', value + '23');
        document.documentElement.style.setProperty('--sco-main-op-deep', value + 'dd');
        document.documentElement.style.setProperty('--sco-main-none', value + '00');

        if (r && g && b) {
            var brightness = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
            for (let i = 0; i < cardContents.length; i++) {
                cardContents[i].style.setProperty('--sco-card-bg', 'var(--sco-white)');
            }

            for (let i = 0; i < authorInfo.length; i++) {
                authorInfo[i].style.setProperty('background', 'var(--sco-white-op)');
                authorInfo[i].style.setProperty('color', 'var(--sco-white)');
            }
        }

        document.getElementById("coverdiv").classList.add("loaded");
        initThemeColor();
    } else {
        document.documentElement.style.setProperty('--sco-main', 'var(--sco-theme)');
        document.documentElement.style.setProperty('--sco-main-op', 'var(--sco-theme-op)');
        document.documentElement.style.setProperty('--sco-main-op-deep', 'var(--sco-theme-op-deep)');
        document.documentElement.style.setProperty('--sco-main-none', 'var(--sco-theme-none)');
        initThemeColor();
    }
}

function initThemeColor() {
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    let themeColor;
    if (currentTop > 0) {
        themeColor = getComputedStyle(document.documentElement).getPropertyValue('--sco-card-bg');
    } else if (PAGE_CONFIG.is_post) {
        themeColor = getComputedStyle(document.documentElement).getPropertyValue('--sco-main');
    } else {
        themeColor = getComputedStyle(document.documentElement).getPropertyValue('--sco-background');
    }
    changeThemeColor(themeColor);
}

function changeThemeColor(color) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.setAttribute('content', color);
    }
}