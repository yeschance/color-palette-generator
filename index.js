document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const colorPalette = document.getElementById('colorPalette');
    const harmonyButtons = document.querySelectorAll('.harmony-options button');
    const alert = document.getElementById('alert');

    let currentHarmony = 'analogous';

    generatePalette();

    colorPicker.addEventListener('input', debounce(generatePalette, 300));

    harmonyButtons.forEach(button => {
        button.addEventListener('click', function() {
            harmonyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentHarmony = this.dataset.harmony;
            generatePalette();
        });
    });

    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function generatePalette() {
        const baseColour = colorPicker.value;
        const rgb = hexToRgb(baseColour);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        let colors = [];
        switch(currentHarmony) {
            case 'analogous': colors = generateAnalogous(hsl); break;
            case 'monochromatic': colors = generateMonochromatic(hsl); break;
            case 'triadic': colors = generateTriadic(hsl); break;
            case 'complementary': colors = generateComplementary(hsl); break;
            case 'split-complementary': colors = generateSplitComplementary(hsl); break;
            default: colors = generateAnalogous(hsl);
        }
        renderPalette(colors);
    }

    function generateAnalogous(hsl) {
        const colors = [];
        const hue = hsl.h;
        for (let i = -2; i <= 2; i++) {
            const newHue = (hue + i * 30 + 360) % 360;
            const newSat = Math.max(Math.min(hsl.s + i * 5, 100), 20);
            colors.push({ h: newHue, s: newSat, l: hsl.l });
        }
        return colors;
    }

    function generateMonochromatic(hsl) {
        const colors = [];
        const hue = hsl.h;
        colors.push({ h: hue, s: Math.min(hsl.s + 20, 100), l: Math.max(hsl.l - 30, 15) });
        colors.push({ h: hue, s: Math.min(hsl.s + 10, 100), l: Math.max(hsl.l - 15, 20) });
        colors.push({ h: hue, s: hsl.s, l: hsl.l });
        colors.push({ h: hue, s: Math.max(hsl.s - 10, 20), l: Math.min(hsl.l + 15, 85) });
        colors.push({ h: hue, s: Math.max(hsl.s - 20, 10), l: Math.min(hsl.l + 30, 90) });
        return colors;
    }

    function generateTriadic(hsl) {
        const colors = [];
        const hue = hsl.h;
        colors.push({ h: hue, s: hsl.s, l: Math.max(hsl.l - 10, 15) });
        colors.push({ h: hue, s: hsl.s, l: hsl.l });
        const hue2 = (hue + 120) % 360;
        colors.push({ h: hue2, s: hsl.s, l: hsl.l });
        const hue3 = (hue + 240) % 360;
        colors.push({ h: hue3, s: hsl.s, l: hsl.l });
        colors.push({ h: hue3, s: hsl.s, l: Math.min(hsl.l + 10, 90) });
        return colors;
    }

    function generateComplementary(hsl) {
        const colors = [];
        const hue = hsl.h;
        const complementHue = (hue + 180) % 360;
        colors.push({ h: hue, s: Math.min(hsl.s + 5, 100), l: Math.max(hsl.l - 10, 20) });
        colors.push({ h: hue, s: hsl.s, l: hsl.l });
        colors.push({ h: hue, s: Math.max(hsl.s - 5, 20), l: Math.min(hsl.l + 10, 85) });
        colors.push({ h: complementHue, s: hsl.s, l: hsl.l });
        colors.push({ h: complementHue, s: Math.max(hsl.s - 5, 20), l: Math.min(hsl.l + 10, 85) });
        return colors;
    }

    function generateSplitComplementary(hsl) {
        const colors = [];
        const hue = hsl.h;
        const complement = (hue + 180) % 360;
        const split1 = (complement - 30 + 360) % 360;
        const split2 = (complement + 30) % 360;
        colors.push({ h: hue, s: Math.min(hsl.s + 5, 100), l: Math.max(hsl.l - 5, 20) });
        colors.push({ h: hue, s: hsl.s, l: hsl.l });
        colors.push({ h: split1, s: hsl.s, l: hsl.l });
        colors.push({ h: split2, s: hsl.s, l: hsl.l });
        colors.push({ h: split2, s: Math.min(hsl.s + 5, 100), l: Math.max(hsl.l - 5, 20) });
        return colors;
    }

    function renderPalette(colors) {
        colorPalette.innerHTML = '';
        colors.forEach(color => {
            const rgb = hslToRgb(color.h, color.s, color.l);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const card = document.createElement('div');
            card.className = 'color-card';
            const preview = document.createElement('div');
            preview.className = 'color-preview';
            preview.style.backgroundColor = hex;
            const info = document.createElement('div');
            info.className = 'color-info';
            const hexInfo = document.createElement('div');
            hexInfo.className = 'color-hex';
            hexInfo.innerHTML = `
                ${hex}
                <button class="copy-btn" data-color="${hex}" title="Copy HEX">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            `;
            const rgbInfo = document.createElement('div');
            rgbInfo.className = 'color-rgb';
            rgbInfo.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
            const hslInfo = document.createElement('div');
            hslInfo.className = 'color-hsl';
            hslInfo.textContent = `HSL: ${color.h}°, ${color.s}%, ${color.l}%`;
            info.appendChild(hexInfo);
            info.appendChild(rgbInfo);
            info.appendChild(hslInfo);
            card.appendChild(preview);
            card.appendChild(info);
            colorPalette.appendChild(card);
        });
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function() {
                const color = this.dataset.color;
                navigator.clipboard.writeText(color)
                    .then(() => showAlert())
                    .catch(err => console.error('Could not copy text: ', err));
            });
        });
    }

    function showAlert() {
        alert.classList.add('show');
        setTimeout(() => alert.classList.remove('show'), 2000);
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});