import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER_START = '/* === JH_BLACK_THEME_START === */';
const MARKER_END = '/* === JH_BLACK_THEME_END === */';

function stripGeneratedBlock(css) {
  const idx = css.indexOf(MARKER_START);
  return idx >= 0 ? css.slice(0, idx).trimEnd() + '\n' : css.trimEnd() + '\n';
}

function parseColorToken(token) {
  const clean = token.trim().toLowerCase();
  if (clean === 'white' || clean === '#fff') return { r: 255, g: 255, b: 255, a: 1 };
  if (clean === 'black' || clean === '#000') return { r: 0, g: 0, b: 0, a: 1 };
  if (/^#[0-9a-f]{3,8}$/.test(clean)) {
    const hex = clean.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }
  const fnMatch = clean.match(/^rgba?\(([^)]+)\)$/);
  if (fnMatch) {
    const inner = fnMatch[1].trim();
    let rgbPart = inner;
    let alphaPart;
    if (inner.includes('/')) {
      const [left, right] = inner.split('/');
      rgbPart = left.trim();
      alphaPart = right.trim();
    }
    const nums = rgbPart.split(/[\s,]+/).filter(Boolean);
    if (nums.length >= 3) {
      const r = Number(nums[0]);
      const g = Number(nums[1]);
      const b = Number(nums[2]);
      let a = 1;
      if (alphaPart !== undefined) {
        a = alphaPart.endsWith('%') ? parseFloat(alphaPart) / 100 : Number(alphaPart);
      } else if (nums.length >= 4) {
        a = nums[3].endsWith('%') ? parseFloat(nums[3]) / 100 : Number(nums[3]);
      }
      if ([r, g, b, a].every(n => Number.isFinite(n))) return { r, g, b, a };
    }
  }
  return null;
}

const isNeutral = ({ r, g, b }) => Math.max(r, g, b) - Math.min(r, g, b) <= 18;
const fmtAlpha = a => (a >= 0.995 ? null : Number(a.toFixed(3)).toString().replace(/^0\./, '.'));
const toCssColor = (lum, a = 1) => {
  const c = Math.max(0, Math.min(255, Math.round(lum)));
  const alpha = fmtAlpha(a);
  return alpha ? `rgb(${c} ${c} ${c} / ${alpha})` : `rgb(${c} ${c} ${c})`;
};

function splitTopLevelCommas(str) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      parts.push(str.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(str.slice(start));
  return parts;
}

function replaceColorsInValue(value, mapper) {
  const pattern = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|\bwhite\b|\bblack\b)/g;
  let changed = false;
  const out = value.replace(pattern, match => {
    const parsed = parseColorToken(match);
    if (!parsed || !isNeutral(parsed)) return match;
    const mapped = mapper(parsed);
    if (mapped && mapped !== match) {
      changed = true;
      return mapped;
    }
    return match;
  });
  return changed ? out : null;
}

const CONTROL_FACE_RE = /(__face|__thumb|__knob|__top|__handle|__cap|__key-face|__tile|__symbol|__toast__icon|button|badge|key\b|pill|tab\b|switch__thumb|accordion__trigger|context-menu__trigger|option\[aria-checked|aria-selected="?true"?|menu\b|dialog\b|popover\b|tooltip\b|toast\b)/i;
const WELL_SURFACE_RE = /(__track|__rail|__well|__bed|__seat|__tray|__slot|__channel|__trough|__bars|__arc-bed|__chassis|input|textarea|select(?!-trigger)|search-input|segmented\b|tabs__list|scroll-area|hex-row|tactile-key(?!__face|pad)|audio-meter__segments|slider(?!__thumb))/i;
const INPUT_WELL_RE = /(?:__fields\s+(?:input|select)|\.jh-input\b|\.jh-textarea\b|\.jh-search-input\b|\.jh-market-picker__search\b|\.jh-currency-picker__search\b|\.jh-finance-nav__search\b|__search\s+\.jh-input|__search\s+input|__type-trigger\b|currency-picker__trigger\b|ephemeris-picker__trigger\b|market-picker__trigger\b|date-picker__trigger\b|date-time-picker__trigger\b|combobox__trigger\b|spectrum-trigger\b|oklch-trigger\b|command-trigger\b)/i;
const SPECULAR_RE = /(?:(?<!__face)::before|(?<!__face)::after|__glow|ripple|__glass\b|shine|glare)/i;
const LIGHT_EMITTER_RE = /(\.jh-slider__range\b|\.jh-tactile-lever__range\b|\.jh-bar-slider__bars\s+span\[data-active|\.jh-audio-meter__segments\s+span\[data-active|\.jh-audio-meter__bars\s+rect\[data-active|\.jh-dial(?!.*detent).*__tick\.is-active|\.jh-dial__arc-fill\b|\.jh-dial__mark\b|\.jh-tactile-key.*__face::after|\.jh-tactile-keypad__led\b|\.jh-tactile-console__led\b|\.jh-instrument__bar\.is-active|\.jh-progress__fill\b|\.jh-lunar-ephemeris__tick\.is-active|\.jh-lunar-ephemeris__light-source|\.jh-lunar-ephemeris__age-pip)/i;
const DETENT_NOTCH_RE = /\.jh-detent-dial\s+\.jh-dial__tick/i;
const DYNAMIC_ACCENT_VAL_RE = /(--jh-slider-|--jh-bar-cell-|--jh-audio-cell-|--jh-instrument-accent|color-mix\()/i;

function classifySurface(selector) {
  const lastPart = selector.split(/\s+/).pop() || '';
  const lastComma = selector.split(',').pop() || '';
  if (INPUT_WELL_RE.test(lastPart) || (INPUT_WELL_RE.test(selector) && !/button|__thumb|__face|__symbol/i.test(lastComma))) {
    return 'input-well';
  }
  if (CONTROL_FACE_RE.test(selector) && !WELL_SURFACE_RE.test(lastPart)) return 'face';
  if (/__thumb|__face|__knob|__top|__handle|__symbol|__toast__icon|button\b|\[aria-checked="?true"?\]|\[aria-selected="?true"?\]/i.test(lastComma)) return 'face';
  if (WELL_SURFACE_RE.test(selector)) return 'well';
  return 'surface';
}

function mapBackgroundColor(lum, a, selector, rawValue = '') {
  const isBackdrop = /(?:__backdrop|-overlay\b|__scrim)/i.test(selector) && !/picker-overlay/i.test(selector);
  if (isBackdrop) {
    if (lum >= 140) {
      return toCssColor(255, Math.min(0.032, a * 0.04));
    }
    return toCssColor(0, Math.min(0.76, Math.max(0.68, a * 1.15)));
  }

  const isTooltip = /(?:tooltip\b|aria-label.*::after)/i.test(selector);
  if (isTooltip && lum <= 95 && a > 0.14) {
    return toCssColor(15, Math.min(0.95, Math.max(0.92, a)));
  }

  if (!LIGHT_EMITTER_RE.test(selector) && (SPECULAR_RE.test(selector) || (/rgb\([^)]*\/\s*0?\.\d+\s*\)/i.test(rawValue) && /transparent|#ffffff00|#00000000/i.test(rawValue)))) {
    if (lum >= 180) {
      return toCssColor(255, Math.min(0.032, Math.max(0.005, a * 0.032)));
    }
  }

  const kind = classifySurface(selector);
  const t = Math.max(0, Math.min(1, (lum - 140) / 115));

  if (lum >= 140) {
    if (/__dots\s+span\b/i.test(selector) && !/aria-current/i.test(selector)) {
      return toCssColor(58, a);
    }
    // Faint white/light hover washes stay whisper-soft instead of turning into heavy slabs
    if (a <= 0.22) {
      return toCssColor(255, Math.min(0.038, Math.max(0.012, a * 0.22)));
    }
    if (kind === 'input-well') {
      // Interactive inputs & selector wells: flat solid, darker than #0a0a0a cards, ZERO gradient
      const nextAlpha = a < 0.9 ? Math.max(a, 0.92) : a;
      return toCssColor(7, nextAlpha);
    }
    if (kind === 'well') {
      // Recessed channels/beds (baixo-relevo): flat #060606 darker than #0a0a0a cards, ZERO gradient
      const nextAlpha = a < 0.9 ? Math.max(a, 0.92) : a;
      return toCssColor(6, nextAlpha);
    }
    if (kind === 'face') {
      // Control faces, keys & raised thumbs: true obsidian mono (#0b0b0b -> #101010)
      const lumDark = Math.round(11 + Math.pow(t, 1.2) * 5);
      const nextAlpha = a < 0.92 ? Math.min(0.95, Math.max(0.88, a)) : a;
      return toCssColor(lumDark, nextAlpha);
    }
    // Cards, modals, dialogs, popovers & pickers: standardized to #0a0a0a matching ScrollFrame
    const nextAlpha = a < 0.92 ? Math.min(0.95, Math.max(0.9, a)) : a;
    return toCssColor(10, nextAlpha);
  }

  if (lum >= 92) {
    // Mid-tone muted geometry (inactive ticks/slots/bars) stays deeply subdued (#10 -> #1a)
    return toCssColor(Math.round(16 + ((lum - 92) / 47) * 10), a);
  }
  if (a <= 0.14) {
    return toCssColor(255, Math.min(0.05, Math.max(0.02, a * 0.55)));
  }
  if (a <= 0.25 && WELL_SURFACE_RE.test(selector)) {
    return toCssColor(24, 0.92);
  }
  return toCssColor(Math.round(238 - lum * 0.42), a);
}

function mapLiquidBackground(valBody, selector) {
  // Preserve multi-layer liquid glass: top highlight sheen layer stays subtle white shimmer, body layer becomes smoked obsidian glass
  const layers = splitTopLevelCommas(valBody);
  let changed = false;
  const mappedLayers = layers.map((layer, index) => {
    const hasWhiteSheen =
      layers.length > 1 &&
      index === 0 &&
      (/125deg|130deg/i.test(layer) || /transparent|#ffffff00/i.test(layer));
    const out = replaceColorsInValue(layer, ({ r, g, b, a }) => {
      const lum = (r + g + b) / 3;
      if (hasWhiteSheen && lum >= 180) {
        return toCssColor(255, Math.min(0.045, Math.max(0.012, a * 0.06)));
      }
      return mapBackgroundColor(lum, a, selector, layer);
    });
    if (out) {
      changed = true;
      return out;
    }
    return layer;
  });
  return changed ? mappedLayers.join(', ') : null;
}

function mapTextColor(lum, a, selector) {
  const isMuted = /caption|hint|eyebrow|meta|muted|small|tick|label|secondary|tertiary|step|version|footnote|description|status/i.test(selector);
  const hasInvertedBg = /(__marker|__confirm|__apply)/i.test(selector) && !/::after/i.test(selector);
  if (lum <= 90) {
    const mapped = isMuted ? Math.round(170 + lum * 0.25) : Math.round(242 - lum * 0.42);
    return toCssColor(mapped, a);
  }
  if (lum <= 165) {
    return toCssColor(Math.round(182 - (lum - 90) * 0.34), a);
  }
  if (hasInvertedBg) {
    return toCssColor(10, a);
  }
  if (a < 0.9) return toCssColor(245, a);
  return toCssColor(224, a);
}

function mapBorderColor(lum, a, selector = '') {
  const kind = classifySurface(selector);
  const isSvgOrMark = /(brand__mark|brand__symbol|intro__chip|knob|dial|instrument|compass|wheel|path|rect|circle|line|svg)/i.test(selector);
  if (lum >= 190) {
    if (isSvgOrMark) {
      return toCssColor(Math.max(18, Math.min(30, Math.round(lum * 0.11))), a);
    }
    if (kind === 'well' || kind === 'input-well') {
      return toCssColor(0, Math.min(0.55, Math.max(0.32, a * 0.55)));
    }
    return toCssColor(255, Math.min(0.011, Math.max(0.005, a * 0.01)));
  }
  if (lum <= 80 && a <= 0.25) {
    if (kind === 'well' || kind === 'input-well') {
      return toCssColor(0, Math.min(0.55, Math.max(0.32, a * 3.5)));
    }
    return toCssColor(255, Math.min(0.012, Math.max(0.005, a * 0.12)));
  }
  if (isSvgOrMark) {
    return toCssColor(Math.max(20, Math.min(38, Math.round(lum * 0.17))), a);
  }
  return toCssColor(Math.max(18, Math.min(32, Math.round(lum * 0.15))), a);
}

function parseShadowGeometry(item) {
  const clean = item
    .replace(/\binset\b/gi, ' ')
    .replace(/drop-shadow\s*\(/gi, ' ')
    .replace(/(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|\bwhite\b|\bblack\b)/gi, ' ')
    .replace(/\)/g, ' ');
  const nums = [...clean.matchAll(/(-?(?:\d+|\.\d+|\d+\.\d+))(?:px)?/g)].map(m => parseFloat(m[1]));
  return {
    x: nums[0] ?? 0,
    y: nums[1] ?? 0,
    blur: nums[2] ?? 0,
    spread: nums[3] ?? 0,
  };
}

function transformShadowList(value, selector = '') {
  const important = /\s*!important\s*$/i.test(value);
  const raw = value.replace(/\s*!important\s*$/i, '').trim();
  if (raw === 'none') return null;
  const kind = classifySurface(selector);
  const items = splitTopLevelCommas(raw);
  let changed = false;
  const mappedItems = items.map(item => {
    if (DYNAMIC_ACCENT_VAL_RE.test(item)) return item;
    const isInset = /\binset\b/i.test(item);
    const { x, y, blur, spread } = parseShadowGeometry(item);
    const out = replaceColorsInValue(item, ({ r, g, b, a }) => {
      const lum = (r + g + b) / 3;

      // 1. Solid 3D thickness / extrusion (e.g., 0 5px 0 #c6c6c6, drop-shadow(0 3px 0 #cfcfcf))
      if (!isInset && blur === 0 && y >= 1.5 && spread === 0 && a >= 0.72 && lum >= 140) {
        const wallLum = Math.max(3, Math.min(8, Math.round(3 + ((lum - 140) / 115) * 5)));
        return toCssColor(wallLum, a);
      }

      // 2. Inset 1px ring contour — avoid glowing wireframes; rely on relief & shadows
      if (isInset && x === 0 && y === 0 && blur === 0 && spread !== 0) {
        if (lum >= 185) {
          return kind === 'well' || kind === 'input-well'
            ? toCssColor(0, 0.45)
            : toCssColor(255, Math.min(0.01, Math.max(0.004, a * 0.009)));
        }
        if (lum <= 80 && a <= 0.22) {
          return kind === 'well' || kind === 'input-well'
            ? toCssColor(0, Math.min(0.55, Math.max(0.32, a * 4)))
            : toCssColor(255, 0.008);
        }
      }

      // 3. Top / bottom edge lip or divider (blur === 0, 1px hairline)
      if (!isInset && blur === 0 && Math.abs(x) <= 0.5 && y > 0 && y <= 1.2) {
        if (lum >= 185) return toCssColor(255, Math.min(0.011, Math.max(0.005, a * 0.01)));
        if (lum <= 80 && a <= 0.14) return toCssColor(255, 0.009);
      }

      // 4. Inset directional relief (whisper-subtle rim catchlight vs under-shadow)
      if (isInset && lum >= 185) {
        if (y < 0 && kind !== 'well' && kind !== 'input-well') {
          return toCssColor(0, Math.min(0.65, Math.max(0.38, a * 0.55)));
        }
        if (y < 0 && (kind === 'well' || kind === 'input-well')) {
          return toCssColor(255, Math.min(0.014, Math.max(0.008, a * 0.012)));
        }
        const hiAlpha = kind === 'face'
          ? Math.min(0.022, Math.max(0.012, a * 0.02))
          : Math.min(0.015, Math.max(0.008, a * 0.014));
        return toCssColor(255, hiAlpha);
      }

      // 5. Recessed inner shadows and cast drop shadows
      if (lum <= 80) {
        if (isInset && (kind === 'well' || kind === 'input-well')) {
          return toCssColor(0, Math.min(0.5, Math.max(0.28, a * 4)));
        }
        const nextAlpha = Math.min(0.95, Math.max(0.6, a * 6.5));
        return toCssColor(0, nextAlpha);
      }
      return toCssColor(0, Math.min(0.9, Math.max(0.5, a * 3)));
    });
    if (out) {
      changed = true;
      return out;
    }
    return item;
  });
  return changed ? mappedItems.join(', ') + (important ? ' !important' : '') : null;
}

const SKIP_SELECTOR_RE = /spectrum__(pad|hue|saturation|lightness|swatch|dot|reticle|sample)|spectrum-trigger__swatch|oklch-palette__swatch|oklch-trigger__swatch|oklch-palette__preview|\[data-positive|tactile-lever__glow|bar-slider__glow|slider__glow|astrology-wheel__face|astrology-wheel__rim/i;

function scopeSelector(selector) {
  return splitTopLevelCommas(selector)
    .map(part => {
      const sel = part.trim();
      if (!sel) return '';
      if (sel === ':root' || sel === 'html' || sel === 'body' || sel === 'html, body') {
        return sel === 'body' ? ':is([data-jh-theme="dark"], .dark) body' : ':is([data-jh-theme="dark"], .dark)';
      }
      if (sel.startsWith('::selection')) return `:is([data-jh-theme="dark"], .dark) ${sel}`;
      if (/^\[data-jh-material=/.test(sel)) return `:is([data-jh-theme="dark"], .dark) ${sel}`;
      if (sel.startsWith('.library') && !sel.startsWith('.library ')) return `:is([data-jh-theme="dark"], .dark)${sel}, :is([data-jh-theme="dark"], .dark) ${sel}`;
      return `:is([data-jh-theme="dark"], .dark) ${sel}`;
    })
    .filter(Boolean)
    .join(', ');
}

const COMPONENT_RESET_SELECTOR_RE = /(\.jh-|\.library|\[data-jh-|\.solar-|\bbutton\b|\binput\b|\btextarea\b|\bselect\b)/i;

function isStructuralReset(cleanProp, valBody) {
  if (cleanProp === 'box-shadow' && /^none$/i.test(valBody)) return true;
  if ((cleanProp === 'background' || cleanProp === 'background-color') && /^(?:transparent|none)$/i.test(valBody)) return true;
  if (cleanProp === 'background-image' && /^none$/i.test(valBody)) return true;
  if ((cleanProp === 'outline' || cleanProp === 'outline-offset') && /^(?:none|0(?:px)?)$/i.test(valBody)) return true;
  if ((cleanProp === 'backdrop-filter' || cleanProp === '-webkit-backdrop-filter') && /^none$/i.test(valBody)) return true;
  if ((cleanProp === 'border' || cleanProp === 'border-color' || cleanProp === 'border-width') && /^(?:0|none|transparent)$/i.test(valBody)) return true;
  return false;
}

function transformDeclaration(prop, val, selector, inFallbackSupports = false) {
  const cleanProp = prop.trim().toLowerCase();
  const hasImp = /\s*!important\s*$/i.test(val);
  const valBody = val.replace(/\s*!important\s*$/i, '').trim();
  const suffix = hasImp ? ' !important' : '';

  // Never darken or override accent-colored / glow-emitting rules!
  if (DYNAMIC_ACCENT_VAL_RE.test(valBody)) {
    return null;
  }
  if (LIGHT_EMITTER_RE.test(selector) && !DETENT_NOTCH_RE.test(selector)) {
    if (cleanProp === 'background' || cleanProp === 'background-color' || cleanProp === 'background-image' || cleanProp === 'fill' || cleanProp === 'stroke' || cleanProp === 'box-shadow' || cleanProp === 'filter') {
      return null;
    }
  }

  // Keep Light Mode's later resets (transparent inner cards/calendars/scroll-frames, outline:none, backdrop-filter:none)
  if (isStructuralReset(cleanProp, valBody) && COMPONENT_RESET_SELECTOR_RE.test(selector)) {
    return valBody + suffix;
  }

  if (cleanProp === 'box-shadow' || cleanProp === 'text-shadow' || cleanProp === 'filter') {
    return transformShadowList(val, selector);
  }
  if (cleanProp === 'color' || cleanProp === 'caret-color') {
    const out = replaceColorsInValue(valBody, ({ r, g, b, a }) => mapTextColor((r + g + b) / 3, a, selector));
    return out ? out + suffix : null;
  }
  if (cleanProp === 'background' || cleanProp === 'background-color' || cleanProp === 'background-image') {
    const out = valBody.includes('gradient(')
      ? mapLiquidBackground(valBody, selector)
      : replaceColorsInValue(valBody, ({ r, g, b, a }) => mapBackgroundColor((r + g + b) / 3, a, selector, valBody));
    return out ? out + suffix : null;
  }
  if (cleanProp.startsWith('border') || cleanProp === 'outline' || cleanProp === 'outline-color') {
    const out = replaceColorsInValue(valBody, ({ r, g, b, a }) => mapBorderColor((r + g + b) / 3, a, selector));
    return out ? out + suffix : null;
  }
  if (cleanProp === 'fill' || cleanProp === 'stroke') {
    const isCasingStroke =
      cleanProp === 'stroke' &&
      /(__bezel|__bezel-edge|__rim|__well|__seat|__inner-well|__outer|__sign-ring|__house-ring|__ring\b|__glass|__planet(?!.*halo)|__sun-halo|__point-halo)/i.test(selector);
    const isSubtleGuideStroke =
      cleanProp === 'stroke' &&
      /(__gridline|__crosshair|__horizon|__datum|__arc-bed|__baseline)/i.test(selector);
    const isDenseDialTick =
      cleanProp === 'stroke' &&
      /\.jh-dial__tick/i.test(selector);
    const isForegroundFill =
      cleanProp === 'fill' &&
      /(text|sign|icon|glyph|label|house|center|tick|arrow|chevron|caret|dot|pip|marker|needle|pointer|aircraft|point(?!er)|tail|hub-card|head)/i.test(selector);
    const out = replaceColorsInValue(valBody, ({ r, g, b, a }) => {
      const lum = (r + g + b) / 3;
      if (cleanProp === 'stroke') {
        if (isCasingStroke) return mapBorderColor(lum, a, selector);
        if (isDenseDialTick) return toCssColor(40, a);
        if (isSubtleGuideStroke) return toCssColor(54, a);
        return mapTextColor(lum, a, selector);
      }
      return isForegroundFill
        ? mapTextColor(lum, a, selector)
        : mapBackgroundColor(lum, a, selector, valBody);
    });
    return out ? out + suffix : null;
  }
  if (cleanProp === 'scrollbar-color') {
    if (!inFallbackSupports) {
      return null;
    }
    const out = replaceColorsInValue(valBody, ({ r, g, b, a }) => toCssColor(Math.max(26, Math.min(44, Math.round((255 - (r + g + b) / 3) * 0.3))), a));
    return out ? out + suffix : null;
  }
  return null;
}

function extractDarkRules(cssText) {
  const cleaned = stripGeneratedBlock(cssText).replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0;

  function processBlock(endIdx, wrapPrefix = '', inFallbackSupports = false) {
    while (i < endIdx) {
      while (i < endIdx && /\s/.test(cleaned[i])) i++;
      if (i >= endIdx) break;
      const braceIdx = cleaned.indexOf('{', i);
      if (braceIdx < 0 || braceIdx >= endIdx) break;
      const header = cleaned.slice(i, braceIdx).trim();

      // Find matching closing brace
      let depth = 1;
      let j = braceIdx + 1;
      while (j < cleaned.length && depth > 0) {
        if (cleaned[j] === '{') depth++;
        else if (cleaned[j] === '}') depth--;
        j++;
      }
      const bodyEnd = j - 1;

      if (header.startsWith('@media') || header.startsWith('@supports')) {
        if (!/forced-colors:\s*active/i.test(header)) {
          const nextFallback = inFallbackSupports || /@supports\s+not\s+selector\s*\(\s*::-webkit-scrollbar\s*\)/i.test(header);
          const innerStart = out.length;
          i = braceIdx + 1;
          processBlock(bodyEnd, '  ', nextFallback);
          if (out.length > innerStart) {
            const innerLines = out.splice(innerStart);
            out.push(`${header} {\n${innerLines.join('\n')}\n}`);
          }
        }
      } else if (!header.startsWith('@') && !SKIP_SELECTOR_RE.test(header) && !header.includes(':root') && !/^--/.test(header)) {
        const body = cleaned.slice(braceIdx + 1, bodyEnd);
        const decls = body.split(';');
        const nextDecls = [];
        for (const decl of decls) {
          const colonIdx = decl.indexOf(':');
          if (colonIdx < 0) continue;
          const prop = decl.slice(0, colonIdx).trim();
          const val = decl.slice(colonIdx + 1).trim();
          if (!prop || !val || prop.startsWith('--')) continue;
          const mapped = transformDeclaration(prop, val, header, inFallbackSupports);
          if (mapped) nextDecls.push(`${prop}: ${mapped}`);
        }
        if (nextDecls.length > 0) {
          const scoped = scopeSelector(header);
          if (scoped) {
            out.push(`${wrapPrefix}${scoped} {\n${wrapPrefix}  ${nextDecls.join(`;\n${wrapPrefix}  `)};\n${wrapPrefix}}`);
          }
        }
      }
      i = j;
    }
  }

  processBlock(cleaned.length);
  return out.join('\n');
}

const DARK_TOKENS = `
:is([data-jh-theme="dark"], .dark) {
  color-scheme: dark;
  --jh-instrument-accent: oklch(100% 0 0);
  --background: #060606;
  --foreground: #ededed;
  --card: #0a0a0a;
  --card-foreground: #ededed;
  --popover: #0a0a0a;
  --popover-foreground: #ededed;
  --primary: #4c4c4c;
  --primary-foreground: #f2f2f2;
  --secondary: #0e0e0e;
  --secondary-foreground: #ededed;
  --muted: #090909;
  --muted-foreground: #8f8f8f;
  --accent: #121212;
  --accent-foreground: #ededed;
  --destructive: #9c9c9c;
  --border: rgb(255 255 255 / .014);
  --input: #070707;
  --ring: #383838;
  --jh-popover: #0a0a0a;
  --jh-ring: #383838;
  --jh-divider: rgb(255 255 255 / .018);
  --jh-depth-well: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012);
  --jh-depth-face: inset 0 1px 0 rgb(255 255 255 / .02), inset 0 -1px 1px rgb(0 0 0 / .68), 0 3px 8px -2px rgb(0 0 0 / .92);
  --jh-depth-contact: inset 0 1px 2px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .012);
  --jh-depth-panel: inset 0 1px 0 rgb(255 255 255 / .016), 0 14px 32px -12px rgb(0 0 0 / .95);
  --jh-surface-well: #060606;
  --jh-surface-face: linear-gradient(175deg, #0f0f0f 0%, #0b0b0b 100%);
  --jh-surface-panel: #0a0a0a;
  --jh-shadow-control: 0 3px 8px -2px rgb(0 0 0 / .88);
  --jh-shadow-surface: 0 8px 24px -8px rgb(0 0 0 / .92), 0 18px 40px -14px rgb(0 0 0 / .86);
  --jh-shadow-overlay: 0 14px 36px -10px rgb(0 0 0 / .94), 0 26px 56px -14px rgb(0 0 0 / .9);
  --jh-shadow-pressed: 0 1px 3px -1px rgb(0 0 0 / .9);
  --jh-text-secondary: #989898;
  --jh-text-tertiary: #6e6e6e;
  --jh-text-disabled: rgb(237 237 237 / .28);
  --jh-glass-fill: rgb(10 10 10 / .84);
  --jh-glass-hover: rgb(15 15 15 / .92);
  --jh-glass-elevated: rgb(13 13 13 / .92);
  --jh-action-hover: #2c2c2c;
  --jh-action-pressed: #222222;
  --jh-wheel-face-1: #101010;
  --jh-wheel-face-2: #0a0a0a;
  --jh-wheel-well-1: #060606;
  --jh-wheel-well-2: #060606;
  --jh-lunar-bezel-1: #121212;
  --jh-lunar-bezel-2: #0a0a0a;
  --jh-lunar-bezel-3: #0e0e0e;
  --jh-lunar-night-1: #0e0e0e;
  --jh-lunar-night-2: #090909;
  --jh-lunar-night-3: #050505;
  --jh-lunar-lit-1: #d4d4d4;
  --jh-lunar-lit-2: #a6a6a6;
  --jh-lunar-lit-3: #6f6f6f;
  --jh-lunar-dome-hi: #ffffff;
  --solar-glass-1: #0e0e0e;
  --solar-glass-2: #080808;
  --solar-glass-3: #0b0b0b;
  --solar-edge-1: #161616;
  --solar-edge-2: #1c1c1c;
  --solar-edge-3: #242424;
  --solar-edge-4: #161616;
  --solar-wing-fade: #000000;
  --solar-wing-fade-end: #060606;
  --solar-housing: #0a0a0a;
  --solar-edge-spec: rgb(255 255 255 / .03);
  --solar-curve: #b8b8b8;
  --solar-now: #5e5e5e;
  --solar-marker: #ececec;
}
:is([data-jh-theme="dark"], .dark) body {
  background: var(--background);
  color: var(--foreground);
}
:is([data-jh-theme="dark"], .dark) ::selection {
  background: #242424;
  color: #f4f4f4;
}
.jh-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 11px;
  border: 0;
  border-radius: 10px;
  background: #f1f1f1;
  color: #555;
  font-family: var(--jh-font);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .04), 0 1px #fff;
  transition: color 160ms var(--jh-ease), background-color 160ms var(--jh-ease), opacity 160ms var(--jh-ease);
}
.jh-theme-toggle:hover {
  color: #222;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-toggle {
  background: linear-gradient(175deg, #0e0e0e, #0a0a0a);
  color: #a8a8a8;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), inset 0 -1px 1px rgb(0 0 0 / .68), 0 3px 8px -2px rgb(0 0 0 / .92);
}
:is([data-jh-theme="dark"], .dark) .jh-theme-toggle:hover {
  color: #f0f0f0;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover {
  color: #ededed !important;
  background: #0a0a0a !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .06),
    0 20px 48px -18px rgb(0 0 0 / .96) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__eyebrow,
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__section-label,
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__label-row {
  color: #8c8c8c !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__head strong,
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__label-row output {
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__reset {
  background: linear-gradient(175deg, #121212, #0b0b0b) !important;
  color: #c8c8c8 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .03), inset 0 0 0 1px rgb(255 255 255 / .055), 0 2px 6px -2px rgb(0 0 0 / .85) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__reset:hover {
  color: #ffffff !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__modes {
  background: #060606 !important;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / .9), inset 0 0 0 1px rgb(255 255 255 / .045), inset 0 -1px rgb(255 255 255 / .02) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__modes button {
  color: #888888 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-theme-picker-popover__modes button[aria-pressed="true"] {
  background: linear-gradient(175deg, #151515, #0e0e0e) !important;
  color: #f4f4f4 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .05), inset 0 0 0 1px rgb(255 255 255 / .07), 0 2px 8px -2px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-github-star {
  background: linear-gradient(175deg, #121212, #0b0b0b) !important;
  color: #dcdcdc !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .035),
    inset 0 0 0 1px rgb(255 255 255 / .05),
    0 3px 8px -2px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-github-star svg {
  color: #a8a8a8 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-github-star:hover {
  color: #ffffff !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .055),
    inset 0 0 0 1px rgb(255 255 255 / .085),
    0 4px 10px -2px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-github-star:hover svg {
  color: #ffffff !important;
}
:is([data-jh-theme="dark"], .dark) .jh-github-star:active {
  background: #0a0a0a !important;
  box-shadow:
    inset 0 1px 2px rgb(0 0 0 / .75),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    0 1px 2px rgb(0 0 0 / .88) !important;
}
`;

const DARK_LIBRARY_POLISH = `
:is([data-jh-theme="dark"], .dark) .library {
  --library-muted: #8c8c8c;
  background: #060606;
  color: #e8e8e8;
}
:is([data-jh-theme="dark"], .dark) .library-header {
  background: rgb(6 6 6 / .88);
  box-shadow: 0 1px 0 rgb(255 255 255 / .014), 0 12px 30px -16px rgb(0 0 0 / .94);
}
:is([data-jh-theme="dark"], .dark) .library-card-preview,
:is([data-jh-theme="dark"], .dark) .library-preview-stage {
  background: #080808;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 14px 32px -14px rgb(0 0 0 / .94);
}
:is([data-jh-theme="dark"], .dark) .library-customizer,
:is([data-jh-theme="dark"], .dark) .library-select-menu {
  background: #0a0a0a;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 14px 32px -12px rgb(0 0 0 / .95);
}
:is([data-jh-theme="dark"], .dark) .library-text-field input,
:is([data-jh-theme="dark"], .dark) .library-text-field select,
:is([data-jh-theme="dark"], .dark) .library-text-field textarea,
:is([data-jh-theme="dark"], .dark) .library-search {
  background: #070707;
  background-image: none;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .5), inset 0 -1px 0 rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) .library-text-field input:focus,
:is([data-jh-theme="dark"], .dark) .library-text-field input:focus-visible,
:is([data-jh-theme="dark"], .dark) .library-text-field select:focus-visible,
:is([data-jh-theme="dark"], .dark) .library-text-field textarea:focus,
:is([data-jh-theme="dark"], .dark) .library-text-field textarea:focus-visible,
:is([data-jh-theme="dark"], .dark) .library-search:focus-within {
  background: #090909;
  background-image: none;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .46), inset 0 0 0 1px rgb(255 255 255 / .02);
}
:is([data-jh-theme="dark"], .dark) .library-card-preview.is-liquid-stage,
:is([data-jh-theme="dark"], .dark) .library-preview-stage.is-liquid-stage {
  background: radial-gradient(ellipse at 50% -20%, #0d0d0d, #070707 58%, #090909);
}
:is([data-jh-theme="dark"], .dark) .library-card-preview.is-glass-stage,
:is([data-jh-theme="dark"], .dark) .library-preview-stage.is-glass-stage {
  background:
    radial-gradient(ellipse at 20% 15%, rgb(255 255 255 / .02), transparent 44%),
    radial-gradient(ellipse at 80% 85%, rgb(255 255 255 / .012), transparent 48%),
    #080808;
}
:is([data-jh-theme="dark"], .dark) .library-preview-stage.is-glass-stage .library-preview-caption,
:is([data-jh-theme="dark"], .dark) .library-preview-stage.is-glass-stage .library-preview-hint {
  color: #8c8c8c !important;
  text-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .library-dial-version-card[data-jh-surface-custom="true"] {
  background: rgb(10 10 10 / var(--jh-surface-alpha, 1)) !important;
  background-image: none !important;
  backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
  -webkit-backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
}
:is([data-jh-theme="dark"], .dark) .library-dial-version-card.is-selected[data-jh-surface-custom="true"] {
  background: rgb(14 14 14 / var(--jh-surface-alpha, 1)) !important;
  background-image: none !important;
}
:is([data-jh-theme="dark"], .dark) .library-solar-art-sun {
  fill: #0e0e0e;
  stroke: #cccccc;
}
:is([data-jh-theme="dark"], .dark) .library-solar-art-core {
  color: #efefef;
}
:is([data-jh-theme="dark"], .dark) .library-solar-art-ticks {
  stroke: #4c4c4c;
}
:is([data-jh-theme="dark"], .dark) .library-demo-glass {
  background: rgb(10 10 10 / var(--jh-glass-alpha, .8));
  color: #ededed;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 14px 30px -14px rgb(0 0 0 / .94);
}
:is([data-jh-theme="dark"], .dark) .library-demo-glass span {
  color: #969696;
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape {
  filter: drop-shadow(0 2px 5px rgb(0 0 0 / .85)) drop-shadow(0 12px 26px rgb(0 0 0 / .94));
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .library-demo-shape {
  filter: drop-shadow(0 2px 5px rgb(0 0 0 / .85)) drop-shadow(0 10px 22px rgb(0 0 0 / .92));
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape__outer {
  stroke: rgb(0 0 0 / .72);
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape__specular {
  stroke: rgb(255 255 255 / .018);
  stroke-width: 1;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .library-demo-shape__specular,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .library-demo-shape__specular {
  stroke: rgb(255 255 255 / .038);
  stroke-width: 1;
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape__inner {
  stroke: rgb(255 255 255 / .045);
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape__axis {
  stroke: rgb(255 255 255 / .035);
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape__readout {
  color: #8f8f8f;
}
:is([data-jh-theme="dark"], .dark) .library-demo-switch {
  background: #0a0a0a;
  background-image: none;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 14px 32px -12px rgb(0 0 0 / .94);
}
:is([data-jh-theme="dark"], .dark) .library .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .library .jh-input:focus-visible,
:is([data-jh-theme="dark"], .dark) .library .jh-search-input input:focus,
:is([data-jh-theme="dark"], .dark) .library .jh-search-input input:focus-visible {
  outline: none !important;
}
`;

const DARK_COMPONENT_POLISH = `
:is([data-jh-theme="dark"], .dark) .jh-button__face {
  background: linear-gradient(175deg, #0e0e0e, #0a0a0a);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .018), inset 0 -1px 1px rgb(0 0 0 / .68);
}
:is([data-jh-theme="dark"], .dark) .jh-button__face::before {
  background: radial-gradient(ellipse at 38% -65%, rgb(255 255 255 / .028) 30%, transparent 72%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .016), inset 0 -1px 1px rgb(0 0 0 / .45);
}
@supports (backdrop-filter: blur(12px)) {
  :is([data-jh-theme="dark"], .dark) .jh-button--glass .jh-button__face {
    background: linear-gradient(175deg, rgb(16 16 16 / .86), rgb(10 10 10 / .78));
  }
}
:is([data-jh-theme="dark"], .dark) .jh-button--ghost,
:is([data-jh-theme="dark"], .dark) .jh-button--ghost .jh-button__face {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-switch::before {
  background: #060606;
  background-image: none;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) .jh-switch__thumb {
  background: linear-gradient(175deg, #101010, #0b0b0b);
  box-shadow: inset 0 1px rgb(255 255 255 / .02), inset 0 -1px 1px rgb(0 0 0 / .68), 0 3px 7px -1px rgb(0 0 0 / .92);
}

/* Segmented Control, Tabs & Financial Order side: flat obsidian baixo-relevo (no gradient) + subtle obsidian thumb */
:is([data-jh-theme="dark"], .dark) .jh-segmented,
:is([data-jh-theme="dark"], .dark) .jh-tabs__list,
:is([data-jh-theme="dark"], .dark) .jh-financial-order .jh-segmented,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-segmented,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-tabs__list {
  background: #060606 !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-segmented__thumb,
:is([data-jh-theme="dark"], .dark) .jh-tabs__thumb,
:is([data-jh-theme="dark"], .dark) .jh-financial-order .jh-segmented__thumb,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] :where(.jh-segmented__thumb, .jh-tabs__thumb) {
  background: linear-gradient(175deg, #101010, #0c0c0c) !important;
  background-image: linear-gradient(175deg, #101010, #0c0c0c) !important;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), inset 0 -1px 1px rgb(0 0 0 / .72), 0 2px 6px -1px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-segmented__thumb, .jh-tabs__thumb) {
  background: rgb(16 16 16 / .88) !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), 0 2px 6px -1px rgb(0 0 0 / .88) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-segmented__thumb, .jh-tabs__thumb) {
  background: linear-gradient(175deg, rgb(18 18 18 / .84), rgb(11 11 11 / .76)) !important;
  background-image: linear-gradient(175deg, rgb(18 18 18 / .84), rgb(11 11 11 / .76)) !important;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .022), 0 2px 6px -1px rgb(0 0 0 / .88) !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-segmented button, .jh-tabs__tab) {
  color: #7c7c7c;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-segmented button:hover, .jh-tabs__tab:hover) {
  color: #c2c2c2;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-segmented button[aria-pressed="true"], .jh-segmented button[aria-checked="true"], .jh-tabs__tab[aria-selected="true"]) {
  color: #ededed !important;
}

/* Tracks stay flat deep obsidian slots without harsh outlines or vertical gradients */
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum .jh-slider) .jh-slider__track,
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__track,
:is([data-jh-theme="dark"], .dark) .jh-progress__track {
  border: 0 !important;
  background: #060606 !important;
  background-image: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-spectrum .jh-spectrum__hue .jh-slider__track,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-spectrum .jh-spectrum__hue .jh-slider__track {
  background: linear-gradient(90deg,
    oklch(72% .19 0),
    oklch(75% .19 60),
    oklch(74% .19 120),
    oklch(72% .19 180),
    oklch(68% .19 240),
    oklch(70% .19 300),
    oklch(72% .19 360)
  ) !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .55), inset 0 0 0 1px rgb(255 255 255 / .08) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-spectrum .jh-spectrum__saturation .jh-slider__track,
:is([data-jh-theme="dark"], .dark) .jh-spectrum .jh-spectrum__lightness .jh-slider__track,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-spectrum .jh-spectrum__saturation .jh-slider__track,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-spectrum .jh-spectrum__lightness .jh-slider__track {
  background: var(--jh-spectrum-track, linear-gradient(90deg, #1b1b1e, #f4f4f6)) !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .55), inset 0 0 0 1px rgb(255 255 255 / .08) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-spectrum .jh-spectrum__hue .jh-slider__range,
:is([data-jh-theme="dark"], .dark) .jh-spectrum .jh-spectrum__saturation .jh-slider__range,
:is([data-jh-theme="dark"], .dark) .jh-spectrum .jh-spectrum__lightness .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-spectrum :is(.jh-spectrum__hue, .jh-spectrum__saturation, .jh-spectrum__lightness) .jh-slider__range {
  border: 0 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  opacity: 0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum .jh-slider) .jh-slider__track,
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__track {
  position: relative;
  z-index: 0 !important;
  overflow: visible !important;
  box-shadow: inset 0 1.5px 3px rgb(0 0 0 / .84), inset 0 -1px rgb(255 255 255 / .045);
}
:is([data-jh-theme="dark"], .dark) :where(.jh-slider > span:not(.jh-slider__track), .jh-tactile-lever__slider > span:not(.jh-tactile-lever__track), .jh-bar-slider > span:not(.jh-bar-slider__track)) {
  z-index: 4 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-slider__thumb,
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__thumb,
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__thumb {
  z-index: 4 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__track {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  overflow: visible !important;
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars {
  overflow: visible !important;
  padding: 0;
  background: transparent !important;
  border-radius: inherit;
  box-shadow: none !important;
}

/* Thumbs: pure achromatic obsidian relief + frosted obsidian capsule for Bar Slider */
:is([data-jh-theme="dark"], .dark) :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb),
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb) {
  border: 0 !important;
  background: linear-gradient(175deg, #252527, #171719) !important;
  background-image: linear-gradient(175deg, #252527, #171719) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .12), inset 0 0 0 1px rgb(255 255 255 / .08), 0 3px 8px -2px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb) {
  border: 0 !important;
  background: rgb(26 26 28 / .92) !important;
  background-image: none !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .14), inset 0 0 0 1px rgb(255 255 255 / .09), 0 3px 8px -2px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb) {
  border: 0 !important;
  background: linear-gradient(175deg, rgb(20 20 22 / .84), rgb(12 12 14 / .78)) !important;
  background-image: linear-gradient(175deg, rgb(20 20 22 / .84), rgb(12 12 14 / .78)) !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .03), 0 3px 8px -2px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb)::after {
  border: 0 !important;
  background: linear-gradient(180deg, rgb(255 255 255 / .03), transparent) !important;
  opacity: .3 !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb):active {
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .85), 0 1px 3px rgb(0 0 0 / .92) !important;
}

/* Active accent light emitters: clean semi-opaque illumination (zero white top gel stripe) + customizer halo at rest & drag */
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider) .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider) .jh-slider__range),
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider) .jh-slider__range) {
  opacity: .92;
  border-radius: 999px !important;
  background: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 88%, #161616);
  backdrop-filter: none;
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .5) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 24%), transparent) !important;
  transition: opacity 160ms var(--jh-ease), background-color 160ms var(--jh-ease), box-shadow 160ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider):is([data-dragging="true"], :active) .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider):is([data-dragging="true"], :active) .jh-slider__range),
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider):is([data-dragging="true"], :active) .jh-slider__range) {
  opacity: 1;
  background: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 96%, white 4%);
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .7) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.45) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum .jh-slider)[data-accent-gradient="true"] .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-slider:not(.jh-spectrum .jh-slider)[data-accent-gradient="true"] .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-slider:not(.jh-spectrum .jh-slider)[data-accent-gradient="true"] .jh-slider__range {
  opacity: .92;
  background: linear-gradient(90deg, color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 84%, #141414), color-mix(in oklch, var(--jh-slider-accent-color-end, oklch(88% 0 0)) 92%, #141414));
}
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum .jh-slider)[data-accent-gradient="true"]:is([data-dragging="true"], :active) .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-slider:not(.jh-spectrum .jh-slider)[data-accent-gradient="true"]:is([data-dragging="true"], :active) .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-slider:not(.jh-spectrum .jh-slider)[data-accent-gradient="true"]:is([data-dragging="true"], :active) .jh-slider__range {
  opacity: 1;
  background: linear-gradient(90deg, color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 94%, #141414), color-mix(in oklch, var(--jh-slider-accent-color-end, oklch(88% 0 0)) 98%, white 4%));
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-lever__range {
  opacity: .92;
  border-radius: 999px !important;
  background: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 88%, #161616);
  backdrop-filter: none;
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .5) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 24%), transparent) !important;
  transition: opacity 160ms var(--jh-ease), background-color 160ms var(--jh-ease), box-shadow 160ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) :is(.jh-tactile-lever[data-dragging="true"], .jh-tactile-lever__slider[data-dragging="true"], .jh-tactile-lever__slider:active) .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :is(.jh-tactile-lever[data-dragging="true"], .jh-tactile-lever__slider[data-dragging="true"], .jh-tactile-lever__slider:active) .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :is(.jh-tactile-lever[data-dragging="true"], .jh-tactile-lever__slider[data-dragging="true"], .jh-tactile-lever__slider:active) .jh-tactile-lever__range {
  opacity: 1;
  background: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 96%, white 4%);
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .7) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.45) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range {
  opacity: .92;
  background: linear-gradient(180deg, color-mix(in oklch, var(--jh-slider-accent-color-end, oklch(88% 0 0)) 92%, #141414), color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 84%, #141414));
}
:is([data-jh-theme="dark"], .dark) :is(.jh-tactile-lever[data-dragging="true"], .jh-tactile-lever__slider[data-dragging="true"], .jh-tactile-lever__slider:active)[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever[data-dragging="true"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-lever[data-dragging="true"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-lever[data-dragging="true"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range {
  opacity: 1;
  background: linear-gradient(180deg, color-mix(in oklch, var(--jh-slider-accent-color-end, oklch(88% 0 0)) 98%, white 4%), color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 94%, #141414));
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars span {
  background: #242424;
  box-shadow: none;
  transition: opacity 150ms var(--jh-ease), background-color 150ms var(--jh-ease), box-shadow 150ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-bar-slider__bars span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-bar-slider__bars span[data-active="true"] {
  opacity: .9;
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 88%, #1a1a1a);
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .45) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 24%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars span[data-active="true"][data-lead="true"] {
  opacity: .96;
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 94%, #202020);
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .6) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.15) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) :is(.jh-bar-slider[data-dragging="true"], .jh-bar-slider__slider[data-dragging="true"], .jh-bar-slider:active) .jh-bar-slider__bars span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :is(.jh-bar-slider[data-dragging="true"], .jh-bar-slider__slider[data-dragging="true"], .jh-bar-slider:active) .jh-bar-slider__bars span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :is(.jh-bar-slider[data-dragging="true"], .jh-bar-slider__slider[data-dragging="true"], .jh-bar-slider:active) .jh-bar-slider__bars span[data-active="true"] {
  opacity: 1;
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 96%, white 4%);
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .68) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.35) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) :is(.jh-bar-slider[data-dragging="true"], .jh-bar-slider__slider[data-dragging="true"], .jh-bar-slider:active) .jh-bar-slider__bars span[data-active="true"][data-lead="true"] {
  opacity: 1;
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 100%, white 6%);
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .88) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.6) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent) !important;
}

/* Dial relief & opaque accent tick/mark emitters (shallow bed, open scale, zero gel stripe or dark smudge) */
:is([data-jh-theme="dark"], .dark) .jh-dial__bed {
  background: #080808;
  background-image: none;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / .56), inset 0 -1px 0 rgb(255 255 255 / .02);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__knob {
  background: linear-gradient(125deg, #101010, #0a0a0a 48%, #0e0e0e 75%);
  box-shadow: 0 5px 0 #030303, 2px 10px 14px -3px rgb(0 0 0 / .95), inset 0 1px rgb(255 255 255 / .022);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__top {
  background: radial-gradient(ellipse at 30% 15%, #111111, #0b0b0b 55%, #080808);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .02), 0 1px 3px rgb(0 0 0 / .75);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__bed {
  background: rgb(8 8 8 / .86);
  background-image: none;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / .54), inset 0 -1px rgb(255 255 255 / .02);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__knob {
  background: rgb(14 14 14 / .9);
  box-shadow: 0 5px 0 #030303, inset 0 1px rgb(255 255 255 / .022), 0 8px 16px rgb(0 0 0 / .9);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__top {
  background: rgb(16 16 16 / .92);
  box-shadow: inset 0 1px rgb(255 255 255 / .022);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__tick {
  stroke: #2a2a2a;
  filter: none !important;
  transition: opacity 130ms var(--jh-ease), stroke 130ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-dial:not(.jh-detent-dial) .jh-dial__tick.is-active {
  opacity: .92;
  stroke: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 90%, #242424);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .52) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-dial:not(.jh-detent-dial) .jh-dial__tick.is-active[data-lead="true"] {
  opacity: .97;
  animation: none;
  stroke: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 96%, white 4%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .75) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-dial:not(.jh-detent-dial):is([data-dragging="true"], :active) .jh-dial__tick.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial:not(.jh-detent-dial):is([data-dragging="true"], :active) .jh-dial__tick.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-dial:not(.jh-detent-dial):is([data-dragging="true"], :active) .jh-dial__tick.is-active {
  opacity: 1;
  stroke: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 96%, white 4%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .85) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
  transition-duration: 35ms;
}
:is([data-jh-theme="dark"], .dark) .jh-dial:not(.jh-detent-dial):is([data-dragging="true"], :active) .jh-dial__tick.is-active[data-lead="true"] {
  opacity: 1;
  stroke: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 100%, white 8%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.1) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-dial__arc-bed {
  stroke: #1b1b1b;
}
:is([data-jh-theme="dark"], .dark) .jh-dial__arc-fill {
  opacity: .92;
  stroke: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 92%, #242424);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .55) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent)) !important;
  transition: opacity 140ms var(--jh-ease), stroke 140ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-dial:is([data-dragging="true"], :active) .jh-dial__arc-fill {
  opacity: 1;
  stroke: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 98%, white 4%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .9) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
  transition-duration: 35ms;
}
:is([data-jh-theme="dark"], .dark) .jh-dial[data-variant="vernier"] .jh-dial__knob::after {
  background: repeating-conic-gradient(from 0deg, rgb(255 255 255 / .085) 0deg 2deg, transparent 2deg 5deg);
}
:is([data-jh-theme="dark"], .dark) .jh-dial[data-variant="monolith"] .jh-dial__bed {
  background: #080808;
  box-shadow: inset 0 1.5px 3.5px rgb(0 0 0 / .62), inset 0 -1px 1px rgb(255 255 255 / .02);
}
:is([data-jh-theme="dark"], .dark) .jh-dial[data-variant="monolith"] .jh-dial__knob {
  background: radial-gradient(circle at 38% 32%, #222222 0%, #151515 62%, #0e0e0e 100%) !important;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .1),
    inset 0 -2px 4px rgb(0 0 0 / .85),
    0 2px 6px rgb(0 0 0 / .72) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-dial__datum-marks path {
  stroke: rgb(255 255 255 / .24);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__datum-pip {
  fill: rgb(255 255 255 / .46);
  opacity: .72;
  transition: opacity 150ms var(--jh-ease), fill 150ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-dial:is([data-dragging="true"], :active) .jh-dial__datum-pip {
  opacity: 1;
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 96%, white 6%);
}
/* Flush cap indicator light — clean emissive pill without recessed pit or white top gel line */
:is([data-jh-theme="dark"], .dark) .jh-dial__mark,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__mark,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-dial__mark {
  opacity: .92;
  border: 0 !important;
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 90%, #202020) !important;
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .5) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 24%), transparent) !important;
  filter: none !important;
  overflow: visible;
  transition: opacity 150ms var(--jh-ease), background-color 150ms var(--jh-ease), box-shadow 150ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-dial:is([data-dragging="true"], :active) .jh-dial__mark,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial:is([data-dragging="true"], :active) .jh-dial__mark,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-dial:is([data-dragging="true"], :active) .jh-dial__mark {
  opacity: 1;
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 98%, white 4%) !important;
  box-shadow:
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .8) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.45) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-dial__mark::after {
  content: none !important;
  display: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-detent-dial .jh-dial__tick {
  stroke: #2a2a2a;
  filter: none !important;
  transition: opacity 150ms var(--jh-ease), stroke 150ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-detent-dial .jh-dial__tick.is-active {
  opacity: .92;
  stroke: color-mix(in oklch, var(--jh-slider-glow-color, #d8d8dc) 90%, #2a2a2a);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .5) color-mix(in oklch, var(--jh-slider-glow-color, oklch(100% 0 0)) var(--jh-slider-glow-strength-mid, 48%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-detent-dial:is([data-dragging="true"], :active) .jh-dial__tick.is-active {
  opacity: 1;
  stroke: color-mix(in oklch, var(--jh-slider-glow-color, #ffffff) 98%, white 4%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .85) color-mix(in oklch, var(--jh-slider-glow-color, oklch(100% 0 0)) var(--jh-slider-glow-strength, 68%), transparent)) !important;
}

/* Instrument arcs, AudioMeter & TactileKey in pure obsidian (open scale, zero filter transition, zero white gel stripe) */
:is([data-jh-theme="dark"], .dark) .jh-instrument__bar {
  fill: #242424;
  stroke: none;
  filter: none !important;
  transition: opacity 130ms var(--jh-ease), fill 130ms var(--jh-ease);
}
:is([data-jh-theme="dark"], .dark) .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-instrument__bar.is-active {
  opacity: .92;
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 90%, #202020);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .5) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 48%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-instrument__bar.is-active[data-lead="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-instrument__bar.is-active[data-lead="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-instrument__bar.is-active[data-lead="true"] {
  opacity: .97;
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 96%, white 4%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .72) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) :is(.jh-instrument[data-dragging="true"], .jh-instrument__svg[data-dragging="true"], .jh-instrument__svg:active, .library-instrument-control[data-dragging="true"], .library-instrument-control:active) .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :is(.jh-instrument[data-dragging="true"], .jh-instrument__svg[data-dragging="true"], .jh-instrument__svg:active, .library-instrument-control[data-dragging="true"], .library-instrument-control:active) .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :is(.jh-instrument[data-dragging="true"], .jh-instrument__svg[data-dragging="true"], .jh-instrument__svg:active, .library-instrument-control[data-dragging="true"], .library-instrument-control:active) .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) .deck:has(.jh-dial[data-dragging="true"], .jh-slider[data-dragging="true"]) .jh-instrument__bar.is-active {
  opacity: 1;
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 96%, white 4%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * .82) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
  transition-duration: 35ms;
}
:is([data-jh-theme="dark"], .dark) :is(.jh-instrument[data-dragging="true"], .jh-instrument__svg[data-dragging="true"], .jh-instrument__svg:active, .library-instrument-control[data-dragging="true"], .library-instrument-control:active) .jh-instrument__bar.is-active[data-lead="true"],
:is([data-jh-theme="dark"], .dark) .deck:has(.jh-dial[data-dragging="true"], .jh-slider[data-dragging="true"]) .jh-instrument__bar.is-active[data-lead="true"] {
  opacity: 1;
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 100%, white 8%);
  filter: drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.1) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__segments {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  overflow: visible !important;
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__actions .jh-button {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__actions .jh-button.is-active .jh-button__face,
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__actions .jh-button[aria-pressed="true"] .jh-button__face,
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__actions .jh-button:active:not(:disabled) .jh-button__face {
  background: #070707 !important;
  background-image: none !important;
  box-shadow:
    inset 0 1.5px 3.5px rgb(0 0 0 / .9),
    inset 0 -0.5px 0 rgb(255 255 255 / .025),
    inset 0 0 0 1px rgb(255 255 255 / .05) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__actions .jh-button.is-active .jh-button__content,
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__actions .jh-button[aria-pressed="true"] .jh-button__content {
  color: #f4f4f4 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__segments span {
  background: #141414;
  box-shadow: inset 0 1.5px 2px rgb(0 0 0 / .72), inset 0 -1px rgb(255 255 255 / .018);
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__segments span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-audio-meter__segments span[data-active="true"] {
  opacity: 1 !important;
  background: var(--jh-audio-cell-color, oklch(100% 0 0)) !important;
  box-shadow:
    0 0 2px color-mix(in oklch, var(--jh-audio-cell-color, oklch(100% 0 0)) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .75) color-mix(in oklch, var(--jh-audio-cell-color, oklch(100% 0 0)) var(--jh-slider-glow-strength-mid, 42%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-audio-cell-color, oklch(100% 0 0)) var(--jh-slider-glow-strength-edge, 20%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris {
  --jh-lunar-sky: #070709;
  --jh-lunar-sphere-dark: #111216;
  --jh-lunar-sphere-lit: #e8eaef;
  --jh-lunar-sphere-lim: #b2b7c2;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__trough {
  stroke: #09090b;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__tick {
  opacity: .64;
  stroke: #26262a;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__tick.is-active {
  opacity: .68;
  stroke: color-mix(in oklch, var(--jh-instrument-accent, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0)))) 76%, #181818);
  filter: none;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris[data-dragging="true"] .jh-lunar-ephemeris__tick.is-active {
  opacity: 1;
  stroke: color-mix(in oklch, var(--jh-instrument-accent, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0)))) 98%, white 6%);
  filter: drop-shadow(0 0 1.4px color-mix(in oklch, var(--jh-instrument-accent, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0)))) 62%, transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__lit,
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__lit-penumbra {
  opacity: .88;
  transition: opacity .22s ease;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris[data-dragging="true"] .jh-lunar-ephemeris__lit,
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris[data-dragging="true"] .jh-lunar-ephemeris__lit-penumbra {
  opacity: 1;
}
:is([data-jh-theme="dark"], .dark) .jh-progress__fill {
  background: linear-gradient(180deg, rgb(228 228 228 / .58), rgb(168 168 168 / .42));
  box-shadow: inset 0 1px rgb(255 255 255 / .28), 0 0 4px rgb(255 255 255 / .16);
}

/* Inputs & Search wells: sculpted dark baixo-relevo well (#040404 trough + top shadow + subtle bottom rim catch-light) */
:is([data-jh-theme="dark"], .dark) .jh-input,
:is([data-jh-theme="dark"], .dark) .jh-search-input,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__search:not(.jh-picker-overlay__search),
:is([data-jh-theme="dark"], .dark) .jh-command-dialog__search .jh-input {
  background: #040404 !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  outline: none !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .96),
    inset 0 1px 1px rgb(0 0 0 / .95),
    inset 0 0 0 1px rgb(0 0 0 / .72),
    inset 0 -1px 0 rgb(255 255 255 / .055),
    0 1px 0 rgb(255 255 255 / .04) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-search-input input,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search .jh-input,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search input {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border: 0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-input:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-search-input:focus-within,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search:focus-within,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__search:not(.jh-picker-overlay__search):focus-within,
:is([data-jh-theme="dark"], .dark) .jh-command-dialog__search .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-command-dialog__search .jh-input:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  background: #060606 !important;
  background-image: none !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .95),
    inset 0 0 0 1px rgb(255 255 255 / .11),
    inset 0 -1px 0 rgb(255 255 255 / .075),
    0 1px 0 rgb(255 255 255 / .045) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-search-input input:focus,
:is([data-jh-theme="dark"], .dark) .jh-search-input input:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search input:focus,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__search input:focus-visible {
  outline: none !important;
  background: transparent !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__trigger,
:is([data-jh-theme="dark"], .dark) .jh-financial-order .jh-currency-picker__trigger,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-trigger,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__fields .jh-input {
  background: #040404 !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  outline: none !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .96),
    inset 0 1px 1px rgb(0 0 0 / .95),
    inset 0 0 0 1px rgb(0 0 0 / .72),
    inset 0 -1px 0 rgb(255 255 255 / .055),
    0 1px 0 rgb(255 255 255 / .04) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__trigger:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-trigger:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__fields .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__fields .jh-input:focus-visible {
  background: #060606 !important;
  background-image: none !important;
  outline: none !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .95),
    inset 0 0 0 1px rgb(255 255 255 / .11),
    inset 0 -1px 0 rgb(255 255 255 / .075),
    0 1px 0 rgb(255 255 255 / .045) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__symbol {
  background: linear-gradient(175deg, #131313, #0d0d0d) !important;
  color: #dedede !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), inset 0 -1px rgb(0 0 0 / .7), 0 1px 3px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__close,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__confirm,
:is([data-jh-theme="dark"], .dark) .jh-ephemeris-picker__panel > footer .jh-ephemeris-picker__apply {
  background: linear-gradient(175deg, #101010, #0c0c0c) !important;
  background-image: linear-gradient(175deg, #101010, #0c0c0c) !important;
  color: #ededed !important;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), inset 0 -1px 1px rgb(0 0 0 / .72), 0 3px 8px -2px rgb(0 0 0 / .94) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__confirm:hover,
:is([data-jh-theme="dark"], .dark) .jh-ephemeris-picker__panel > footer .jh-ephemeris-picker__apply:hover {
  background: linear-gradient(175deg, #141414, #0f0f0f) !important;
  background-image: linear-gradient(175deg, #141414, #0f0f0f) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__cancel {
  background: transparent !important;
  background-image: none !important;
  color: #8f8f8f !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__cancel:hover {
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__header,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__account {
  box-shadow: inset 0 -1px rgb(255 255 255 / .016);
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__footer {
  box-shadow: inset 0 1px rgb(255 255 255 / .016);
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__asset,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__summary,
:is([data-jh-theme="dark"], .dark) .jh-financial-order[data-jh-material] .jh-financial-order__asset,
:is([data-jh-theme="dark"], .dark) .jh-financial-order[data-jh-material] .jh-financial-order__summary {
  background: transparent !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .016) !important;
}

/* Solid Spectrum Color Library menu — ALWAYS opaque Solid in both Light & Dark matching vertical scroll #0a0a0a */
:is([data-jh-theme="dark"], .dark) .jh-spectrum__library-menu,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-spectrum__library-menu {
  background: #0a0a0a !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  color: #e8e8e8 !important;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 18px 46px -10px rgb(0 0 0 / .96) !important;
}

/* Cards, modals, dialogs, menus, calendars & pickers — standardized #0a0a0a tone matching vertical scroll */
:is([data-jh-theme="dark"], .dark) :is(
  .jh-spectrum-popover,
  .jh-oklch-palette,
  .jh-dialog,
  .jh-dialog__content,
  .jh-menu,
  .jh-context-menu,
  .jh-date-popover,
  .jh-date-time-popover,
  .jh-data-form,
  .jh-toast,
  .jh-weather,
  .jh-navigation-instrument,
  .jh-file-transfer,
  .jh-financial-chart,
  .jh-market-picker,
  .jh-currency-picker__popover,
  .jh-financial-order,
  .jh-astronomy,
  .jh-ephemeris-picker__panel,
  .jh-astrology-wheel,
  .jh-race-telemetry,
  .jh-metric-card,
  .jh-command-dialog,
  .jh-command-palette,
  .jh-financial-order__type-panel,
  .jh-financial-order__type-menu,
  .jh-ephemeris-date-popover,
  .jh-ephemeris-dialog,
  .jh-spectrum__picker,
  .jh-spectrum__library-menu,
  .jh-wind-instrument__hub-card,
  .jh-image-frame
) {
  background: #0a0a0a;
  background-image: none;
  color: #e8e8e8;
  border: 0;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 20px 50px -10px rgb(0 0 0 / .96);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"].jh-menu,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-menu,
:is([data-jh-theme="dark"], .dark) .jh-menu[data-jh-material="liquid-glass"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"].jh-date-popover,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"].jh-date-time-popover,
:is([data-jh-theme="dark"], .dark) .jh-spectrum-popover[data-jh-material="liquid-glass"],
:is([data-jh-theme="dark"], .dark) .jh-spectrum[data-jh-material="liquid-glass"] {
  background: rgb(10 10 10 / .95) !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 22px 54px -12px rgb(0 0 0 / .96) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"].jh-picker-overlay {
  background: #0a0a0a !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 22px 54px -12px rgb(0 0 0 / .96) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"].jh-picker-overlay {
  background: rgb(10 10 10 / .95) !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 22px 54px -12px rgb(0 0 0 / .96) !important;
  backdrop-filter: blur(22px) saturate(1.06) !important;
  -webkit-backdrop-filter: blur(22px) saturate(1.06) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"].jh-picker-overlay {
  background: linear-gradient(165deg, rgb(12 12 12 / .95), rgb(8 8 8 / .92)) !important;
  background-image: linear-gradient(165deg, rgb(12 12 12 / .95), rgb(8 8 8 / .92)) !important;
  color: #e8e8e8;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), 0 22px 54px -12px rgb(0 0 0 / .96) !important;
  backdrop-filter: blur(26px) saturate(1.1) !important;
  -webkit-backdrop-filter: blur(26px) saturate(1.1) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search .jh-input,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search input {
  background: #040404 !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  outline: none !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .96),
    inset 0 1px 1px rgb(0 0 0 / .95),
    inset 0 0 0 1px rgb(0 0 0 / .72),
    inset 0 -1px 0 rgb(255 255 255 / .055),
    0 1px 0 rgb(255 255 255 / .04) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search input:focus,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search input:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search .jh-input:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  background: #060606 !important;
  background-image: none !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .95),
    inset 0 0 0 1px rgb(255 255 255 / .11),
    inset 0 -1px 0 rgb(255 255 255 / .075),
    0 1px 0 rgb(255 255 255 / .045) !important;
}

/* Strip phantom nested boxes inside DatePopover, DateTimePopover, PickerOverlay & ScrollFrames */
:is([data-jh-theme="dark"], .dark) .jh-date-popover .jh-calendar,
:is([data-jh-theme="dark"], .dark) .jh-date-time-popover .jh-calendar,
:is([data-jh-theme="dark"], .dark) .jh-date-time-popover__body .jh-calendar {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border: 0 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar {
  background: #0a0a0a;
  background-image: none;
  color: #dcdcdc;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 14px 36px -12px rgb(0 0 0 / .95);
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__previous,
:is([data-jh-theme="dark"], .dark) .jh-calendar__next,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-calendar__previous,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-calendar__next {
  color: #9a9a9a !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__previous:hover,
:is([data-jh-theme="dark"], .dark) .jh-calendar__next:hover,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-calendar__previous:hover,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-calendar__next:hover {
  background: transparent !important;
  box-shadow: none !important;
  color: #ffffff !important;
  opacity: .78;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__day-button:hover:not(:disabled) {
  background: transparent !important;
  box-shadow: none !important;
  color: #f4f4f4 !important;
  opacity: 1 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__day-button:not([aria-selected="true"]):not(:disabled):hover::after {
  background: #ededed !important;
  opacity: .32 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__selected .jh-calendar__day-button,
:is([data-jh-theme="dark"], .dark) .jh-calendar__day-button[aria-selected="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-calendar__selected .jh-calendar__day-button,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-calendar__day-button[aria-selected="true"] {
  background: transparent !important;
  background-image: none !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__selected .jh-calendar__day-button::after,
:is([data-jh-theme="dark"], .dark) .jh-calendar__day-button[aria-selected="true"]::after {
  background: #ededed !important;
  opacity: .92 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-zone,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-date-time-zone {
  padding: 0 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  color: #8a8a8a !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots {
  border-left-color: rgb(255 255 255 / .07) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots h3 {
  color: #d0d0d0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots button,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-date-time-slots button {
  color: #969696 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots button::after {
  background: #f0f0f0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots button:hover:not([aria-pressed="true"]):not(:active) {
  background: rgb(255 255 255 / .05) !important;
  box-shadow: none !important;
  color: #efefef !important;
}
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots button[aria-pressed="true"],
:is([data-jh-theme="dark"], .dark) .jh-date-time-slots button:active,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-date-time-slots button[aria-pressed="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-date-time-slots button:active {
  color: #f4f4f4 !important;
  background: #141414 !important;
  background-image: none !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .045), inset 0 -1px 0 rgb(0 0 0 / .65) !important;
}
@media (max-width: 560px) {
  :is([data-jh-theme="dark"], .dark) .jh-date-time-slots {
    border-left-color: transparent !important;
    border-top-color: rgb(255 255 255 / .07) !important;
  }
}
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay .jh-scroll-frame,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay .jh-scroll-area,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay .jh-scroll-frame > .jh-scroll-area,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker .jh-scroll-frame,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker .jh-scroll-area,
:is([data-jh-theme="dark"], .dark) .jh-financial-order .jh-scroll-frame,
:is([data-jh-theme="dark"], .dark) .jh-financial-order .jh-scroll-area,
:is([data-jh-theme="dark"], .dark) .jh-market-picker .jh-scroll-frame,
:is([data-jh-theme="dark"], .dark) .jh-market-picker .jh-scroll-area,
:is([data-jh-theme="dark"], .dark) [data-jh-material] :where(.jh-picker-overlay, .jh-currency-picker, .jh-financial-order, .jh-market-picker) .jh-scroll-frame {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border: 0 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Custom thin arrowless scrollbars matching Obsidian design across root page, library chrome & components */
:is([data-jh-theme="dark"], .dark) .jh-scroll-frame {
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 12px 30px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-scroll-frame,
:is([data-jh-theme="dark"], .dark) .jh-scroll-frame[data-jh-material="liquid-glass"] {
  background: rgb(10 10 10 / .86) !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 12px 30px -12px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-scroll-frame,
:is([data-jh-theme="dark"], .dark) .jh-scroll-frame[data-jh-material="liquid"] {
  background: linear-gradient(165deg, rgb(14 14 14 / .86), rgb(9 9 9 / .82)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .022), 0 12px 30px -12px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark),
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results)) {
  scrollbar-width: auto !important;
  scrollbar-color: auto !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results):not(.jh-data-table__scroll):not(.jh-scroll-area))::-webkit-scrollbar {
  width: 9px !important;
  height: 9px !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-track,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results):not(.jh-data-table__scroll):not(.jh-scroll-area))::-webkit-scrollbar-track {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-thumb,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results):not(.jh-data-table__scroll):not(.jh-scroll-area))::-webkit-scrollbar-thumb {
  min-height: 28px !important;
  border: 2.5px solid transparent !important;
  border-radius: 99px !important;
  background: #282828 padding-box !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-thumb:hover,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results):not(.jh-data-table__scroll):not(.jh-scroll-area))::-webkit-scrollbar-thumb:hover {
  background: #3d3d3d padding-box !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-button,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results):not(.jh-data-table__scroll):not(.jh-scroll-area))::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-corner,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results):not(.jh-data-table__scroll):not(.jh-scroll-area))::-webkit-scrollbar-corner {
  background: transparent !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-data-table__scroll, .jh-scroll-area)::-webkit-scrollbar-thumb {
  border-color: transparent !important;
  background: #2c2c2c padding-box !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-data-table__scroll, .jh-scroll-area)::-webkit-scrollbar-thumb:hover {
  background: #424242 padding-box !important;
}
@supports not selector(::-webkit-scrollbar) {
  :is([data-jh-theme="dark"], .dark),
  :is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results)) {
    scrollbar-width: thin !important;
    scrollbar-color: #2b2b2b transparent !important;
  }
}

/* Accordion: single flush obsidian card (#0a0a0a matching vertical scroll) across Solid / Liquid Glass / Liquid, subtle contour */
:is([data-jh-theme="dark"], .dark) .jh-accordion,
:is([data-jh-theme="dark"], .dark) .jh-accordion[data-jh-material="solid"] {
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion[data-jh-material="liquid-glass"] {
  background: rgb(10 10 10 / .86) !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 12px 28px -12px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion[data-jh-material="liquid"],
:is([data-jh-theme="dark"], .dark) .jh-accordion.jh-menu--liquid {
  background: linear-gradient(125deg, rgb(255 255 255 / .022), rgb(255 255 255 / .008) 45%, rgb(255 255 255 / .024)), #0a0a0a !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), 0 14px 32px -12px rgb(0 0 0 / .94) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion__item,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-accordion__item {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border: 0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion__item + .jh-accordion__item::before {
  background: rgb(255 255 255 / .02) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion__trigger,
:is([data-jh-theme="dark"], .dark) [data-jh-material] .jh-accordion__trigger {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border: 0 !important;
  color: #8c8c8c !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion__trigger:hover,
:is([data-jh-theme="dark"], .dark) .jh-accordion__item[data-state="open"] .jh-accordion__trigger,
:is([data-jh-theme="dark"], .dark) .jh-accordion[data-jh-material="solid"] .jh-accordion__item[data-state="open"] .jh-accordion__trigger,
:is([data-jh-theme="dark"], .dark) .jh-accordion[data-jh-material="liquid-glass"] .jh-accordion__item[data-state="open"] .jh-accordion__trigger,
:is([data-jh-theme="dark"], .dark) .jh-accordion[data-jh-material="liquid"] .jh-accordion__item[data-state="open"] .jh-accordion__trigger,
:is([data-jh-theme="dark"], .dark) .jh-accordion.jh-menu--liquid .jh-accordion__item[data-state="open"] .jh-accordion__trigger {
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-accordion__content {
  color: #8f8f8f;
}

/* Finance Navigation sidebar & header: obsidian #0a0a0a surface across materials + subtle contour */
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--sidebar,
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--header,
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--sidebar[data-jh-material="solid"],
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--header[data-jh-material="solid"] {
  background: #0a0a0a !important;
  background-image: none !important;
  color: #ededed !important;
  border: 0 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 14px 34px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--sidebar[data-jh-material="liquid-glass"],
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--header[data-jh-material="liquid-glass"] {
  background: rgb(10 10 10 / .86) !important;
  background-image: none !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 14px 34px -12px rgb(0 0 0 / .94) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--sidebar[data-jh-material="liquid"],
:is([data-jh-theme="dark"], .dark) .jh-finance-nav--header[data-jh-material="liquid"] {
  background: linear-gradient(125deg, rgb(255 255 255 / .022), rgb(255 255 255 / .008) 45%, rgb(255 255 255 / .024)), #0a0a0a !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), 0 16px 36px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-finance-nav__side-links button,
:is([data-jh-theme="dark"], .dark) .jh-finance-nav__header-links button {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  color: rgb(236 236 236 / .56) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-finance-nav__side-links button:hover,
:is([data-jh-theme="dark"], .dark) .jh-finance-nav__header-links button:hover,
:is([data-jh-theme="dark"], .dark) .jh-finance-nav__side-links button[aria-current="page"],
:is([data-jh-theme="dark"], .dark) .jh-finance-nav__header-links button[aria-current="page"] {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  color: #f0f0f0 !important;
  opacity: 1 !important;
}

:is([data-jh-theme="dark"], .dark) .jh-spectrum__sample span {
  color: #ffffff;
  text-shadow: 0 1px 2px rgb(0 0 0 / .6);
}
:is([data-jh-theme="dark"], .dark) .jh-combobox__option,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__asset,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__options button,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-options button,
:is([data-jh-theme="dark"], .dark) .jh-spectrum__library-item,
:is([data-jh-theme="dark"], .dark) .jh-command-dialog__item {
  background: transparent !important;
  box-shadow: none !important;
  color: #e8e8e8;
}
:is([data-jh-theme="dark"], .dark) .jh-combobox__option-meta,
:is([data-jh-theme="dark"], .dark) .jh-command-dialog__item-hint,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-options button small,
:is([data-jh-theme="dark"], .dark) .jh-spectrum__library-copy span {
  color: #828282;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-options button strong,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__options button strong {
  color: #e8e8e8;
}
:is([data-jh-theme="dark"], .dark) .jh-spectrum__swatch.is-selected {
  filter: drop-shadow(0 0 1.5px rgb(255 255 255 / .72));
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__bezel {
  fill: #0d0d0d;
  stroke: rgb(255 255 255 / .014);
  filter: drop-shadow(0 5px 0 #040404) drop-shadow(1px 8px 14px rgb(0 0 0 / .95));
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__bezel-edge {
  fill: #0a0a0a;
  stroke: rgb(255 255 255 / .01);
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__rim {
  stroke: #181818;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__face {
  stroke: rgb(255 255 255 / .014);
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__inner-well {
  fill: #070707;
  stroke: #161616;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet .jh-astrology-wheel__planet-face {
  fill: #0f0f0f !important;
  stroke: #1c1c1c !important;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / .92)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet:hover .jh-astrology-wheel__planet-face,
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet:focus-visible .jh-astrology-wheel__planet-face,
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet[data-selected="true"] .jh-astrology-wheel__planet-face {
  fill: #222222 !important;
  stroke: #ededed !important;
  filter: drop-shadow(0 0 6px rgb(255 255 255 / .2)) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet {
  color: #e4e4e4;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__hub {
  fill: #e0e0e0;
}
:is([data-jh-theme="dark"], .dark) .jh-attitude__sky {
  fill: #111111;
}
:is([data-jh-theme="dark"], .dark) .jh-attitude__ground {
  fill: #090909;
}

/* Dark modal scrims, icon hover tooltips, step markers, and calibrated icon tones */
:is([data-jh-theme="dark"], .dark) .jh-dialog-overlay {
  background: rgb(0 0 0 / .74) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-order__backdrop,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__backdrop.is-glass-stage,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__backdrop.is-liquid-stage {
  background: rgb(0 0 0 / .74) !important;
  background-image: none !important;
}
:is([data-jh-theme="dark"], .dark) :is(
  .library-customizer-head button[aria-label],
  .library-view-toggle button[aria-label],
  .library-copy[aria-label],
  .library-menu[aria-label],
  .library-search-trigger[aria-label],
  .jh-button--icon[aria-label]:not([data-loading="true"]),
  .jh-dialog__close[aria-label],
  .jh-financial-order__close[aria-label],
  .jh-command-dialog__clear[aria-label],
  .jh-calendar__nav button[aria-label],
  .jh-date-picker__clear[aria-label],
  .jh-context-menu__trigger[aria-label],
  .jh-ephemeris-picker__panel-head > button[aria-label],
  .jh-finance-nav__collapse[aria-label]
):not([disabled]):not([aria-disabled="true"])::after {
  background: rgb(16 16 16 / .96) !important;
  color: #ededed !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .022), 0 10px 24px -8px rgb(0 0 0 / .96) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-step-navigation {
  background: #0a0a0a !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .015), 0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-step-navigation__marker {
  background: transparent !important;
  background-image: none !important;
  color: #828282 !important;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .08) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-step-navigation__step[data-state="complete"] .jh-step-navigation__marker {
  background: transparent !important;
  background-image: none !important;
  color: #b8b8b8 !important;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .14) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-step-navigation__step[data-state="current"] .jh-step-navigation__marker {
  background: transparent !important;
  background-image: none !important;
  color: #f4f4f4 !important;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .34) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-icon-soft {
  color: #b4b4b4;
  opacity: .9;
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-button__content > svg,
  .jh-menu__item > svg,
  .jh-dialog__close > svg,
  .jh-calendar__previous > svg,
  .jh-calendar__next > svg,
  .jh-gallery__footer > button > svg
) {
  opacity: .9;
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-financial-order__type-trigger svg,
  .jh-currency-picker__trigger svg,
  .jh-ephemeris-picker__trigger svg,
  .jh-market-picker__search svg
) {
  stroke: #a4a4a4 !important;
  color: #a4a4a4 !important;
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-financial-order__type-trigger:hover svg,
  .jh-currency-picker__trigger:hover svg,
  .jh-ephemeris-picker__trigger:hover svg,
  .jh-combobox__trigger:hover .jh-combobox__chevron,
  .jh-spectrum-trigger:hover .jh-spectrum-trigger__chevron,
  .jh-accordion__item[data-state="open"] .jh-accordion__trigger svg,
  .jh-accordion__trigger:hover svg
) {
  stroke: #e2e2e2 !important;
  color: #e2e2e2 !important;
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-combobox__chevron,
  .jh-command-trigger__icon,
  .jh-command-dialog__search-icon,
  .jh-spectrum__library-picker > svg,
  .jh-spectrum-trigger__chevron,
  .jh-accordion__trigger svg
) {
  color: #a4a4a4 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-toast__icon {
  background: linear-gradient(175deg, #131313, #0c0c0c) !important;
  color: #dedede !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), 0 2px 6px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-toast__title {
  color: #f0f0f0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-toast__description {
  color: #969696 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-toast__close {
  color: #a0a0a0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-toast__close:hover {
  background: rgb(255 255 255 / .08) !important;
  color: #ffffff !important;
}
/* Tactile Key — Input-matched #070707 Key-Well + Lifted/Depressed Cap + Optical Pill LED */
:is([data-jh-theme="dark"], .dark) .jh-tactile-key,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .jh-tactile-key,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-jh-material="solid"] {
  background: #070707 !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px 2px rgb(0 0 0 / .62),
    inset 0 -1px 0 rgb(255 255 255 / .014) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-jh-material="solid"] .jh-tactile-key__face {
  background: #171717 !important;
  background-image: none !important;
  color: #b8b8b8 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .045),
    inset 0 0 0 1px rgb(255 255 255 / .045),
    0 3px 6px -1px rgb(0 0 0 / .88),
    0 1.5px 2px -0.5px rgb(0 0 0 / .72) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-key,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-jh-material="liquid-glass"] {
  background: rgb(6 6 6 / .82) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px 2px rgb(0 0 0 / .68),
    inset 0 0 0 1px rgb(255 255 255 / .035) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-jh-material="liquid-glass"] .jh-tactile-key__face {
  background: rgb(26 26 26 / .88) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .055),
    inset 0 0 0 1px rgb(255 255 255 / .05),
    0 3px 6px -1px rgb(0 0 0 / .86) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-key,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-jh-material="liquid"] {
  background: rgb(7 7 7 / .84) !important;
  box-shadow:
    inset 0 1px 2px rgb(0 0 0 / .68),
    inset 0 0 0 1px rgb(255 255 255 / .04) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-jh-material="liquid"] .jh-tactile-key__face {
  background: linear-gradient(175deg, rgb(30 30 30 / .9), rgb(18 18 18 / .84)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .06),
    inset 0 0 0 1px rgb(255 255 255 / .05),
    0 3px 6px -1px rgb(0 0 0 / .88) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key:hover:not([aria-pressed="true"]):not(:active) .jh-tactile-key__face {
  background: #1d1d1d !important;
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[aria-pressed="true"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .jh-tactile-key[aria-pressed="true"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-key[aria-pressed="true"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-key[aria-pressed="true"] .jh-tactile-key__face {
  transform: translateY(1.75px) scale(.972);
  background: #0d0d0d !important;
  background-image: none !important;
  color: #f4f4f4 !important;
  box-shadow:
    inset 0 2px 4px rgb(0 0 0 / .88),
    inset 0 -0.5px 0 rgb(255 255 255 / .025),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 42%, rgb(255 255 255 / .1)),
    0 .5px 0 rgb(255 255 255 / .025) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key:active .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[aria-pressed="true"]:active .jh-tactile-key__face {
  transform: translateY(2.25px) scale(.962);
  background: #0a0a0a !important;
  color: #ffffff !important;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .92),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 50%, rgb(255 255 255 / .14)),
    0 .5px 0 rgb(255 255 255 / .02) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key__face::after {
  width: 10px;
  height: 3.5px;
  background: rgb(255 255 255 / .16) !important;
  box-shadow: inset 0 .8px 1px rgb(0 0 0 / .9), 0 .5px 0 rgb(255 255 255 / .05) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-size="compact"] .jh-tactile-key__face::after {
  width: 8px;
  height: 3px;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[aria-pressed="true"]:not(:active) .jh-tactile-key__face::after {
  background: var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) !important;
  opacity: 1 !important;
  box-shadow:
    inset 0 0 1px rgb(255 255 255 / .45),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .65) color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 52%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.15) color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-glow-color, oklch(100% 0 0))) calc(var(--jh-slider-glow-strength-mid, 52%) * .65), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key:active .jh-tactile-key__face::after,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[aria-pressed="true"]:active .jh-tactile-key__face::after {
  background: color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 98%, white 2%) !important;
  opacity: 1 !important;
  box-shadow:
    inset 0 0 1px rgb(255 255 255 / .55),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .85) color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 72%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.45) color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-glow-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 52%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-shape="dish"] .jh-tactile-key__face {
  border-radius: 13px;
  background: radial-gradient(circle at 50% 56%, #1d1d1d 0%, #161616 62%, #111111 100%) !important;
  box-shadow:
    inset 0 1.5px 4px rgb(0 0 0 / .68),
    inset 0 -1px 1.5px rgb(255 255 255 / .035),
    0 3px 6px -1px rgb(0 0 0 / .88),
    0 1.5px 2px -0.5px rgb(0 0 0 / .72) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-shape="dish"][aria-pressed="true"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-shape="dish"]:active .jh-tactile-key__face {
  transform: translateY(1.75px) scale(.972);
  background: radial-gradient(circle at 50% 54%, #121212 0%, #0d0d0d 62%, #080808 100%) !important;
  color: #f4f4f4 !important;
  font-weight: 560;
  box-shadow:
    inset 0 2px 5px rgb(0 0 0 / .9),
    inset 0 -0.5px 1px rgb(255 255 255 / .02),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 42%, rgb(255 255 255 / .12)),
    0 .5px 0 rgb(255 255 255 / .02) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-tone="contrast"] .jh-tactile-key__face {
  color: #e8e8e8 !important;
  background: radial-gradient(circle at 50% 56%, #242424 0%, #1c1c1c 70%, #151515 100%) !important;
  box-shadow:
    inset 0 1px 1.5px rgb(255 255 255 / .055),
    inset 0 -1px 1.5px rgb(0 0 0 / .72),
    0 3px 6px -1px rgb(0 0 0 / .9),
    0 1.5px 2px -0.5px rgb(0 0 0 / .74) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-tone="contrast"][aria-pressed="true"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-tone="contrast"]:active .jh-tactile-key__face {
  transform: translateY(1.75px) scale(.972);
  color: #ffffff !important;
  background: radial-gradient(circle at 50% 54%, #151515 0%, #0e0e0e 72%, #080808 100%) !important;
  box-shadow:
    inset 0 2px 4px rgb(0 0 0 / .92),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 46%, rgb(255 255 255 / .14)),
    0 .5px 0 rgb(255 255 255 / .025) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-tone="accent"] .jh-tactile-key__face {
  color: #e4e4e4 !important;
  background: color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 14%, #171717) !important;
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / .05),
    inset 0 0 0 1px rgb(255 255 255 / .05),
    0 3px 6px -1px rgb(0 0 0 / .88),
    0 1.5px 2px -0.5px rgb(0 0 0 / .72) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-tone="accent"][aria-pressed="true"] .jh-tactile-key__face,
:is([data-jh-theme="dark"], .dark) .jh-tactile-key[data-tone="accent"]:active .jh-tactile-key__face {
  transform: translateY(1.75px) scale(.972);
  color: #ffffff !important;
  background: color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 22%, #0d0d0d) !important;
  box-shadow:
    inset 0 2px 4px rgb(0 0 0 / .88),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-tactile-led-color, var(--jh-slider-accent-color, oklch(100% 0 0))) 48%, rgb(255 255 255 / .14)),
    0 .5px 0 rgb(255 255 255 / .025) !important;
}

/* Tactile Keypad & Tactile Console — Monochrome Obsidian */
:is([data-jh-theme="dark"], .dark) .jh-tactile-keypad,
:is([data-jh-theme="dark"], .dark) .jh-tactile-console {
  --jh-tactile-led-color: var(--jh-slider-accent-color, var(--jh-accent, oklch(100% 0 0)));
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .015),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
  color: #b4b4b4;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-tactile-keypad, .jh-tactile-console),
:is([data-jh-theme="dark"], .dark) :where(.jh-tactile-keypad, .jh-tactile-console)[data-jh-material="liquid-glass"] {
  background: rgb(12 12 12 / .82) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .028),
    inset 0 0 0 1px rgb(255 255 255 / .035),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-tactile-keypad, .jh-tactile-console),
:is([data-jh-theme="dark"], .dark) :where(.jh-tactile-keypad, .jh-tactile-console)[data-jh-material="liquid"] {
  background:
    linear-gradient(130deg, rgb(255 255 255 / .045), rgb(255 255 255 / .018) 45%, rgb(255 255 255 / .05)),
    linear-gradient(175deg, rgb(14 14 14 / .86), rgb(9 9 9 / .84)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    0 14px 30px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-keypad__header {
  border-bottom-color: rgb(255 255 255 / .06) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-keypad__header,
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder-label {
  color: #828282;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-keypad__readout {
  color: #e6e6e6;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-keypad__grid,
:is([data-jh-theme="dark"], .dark) .jh-tactile-console__bottom {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad {
  background: transparent !important;
  box-shadow: none !important;
  color: #a8a8a8;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-console__util-col .jh-tactile-pad {
  background: transparent !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad__cap {
  background: #171717 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .045),
    inset 0 0 0 .5px rgb(255 255 255 / .045),
    0 2px 4px -0.5px rgb(0 0 0 / .88),
    0 1px 1.5px rgb(0 0 0 / .72) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-shape="dish"] .jh-tactile-pad__cap::before {
  background: radial-gradient(circle at 50% 60%, #1d1d1d 0%, #161616 60%, #111111 100%) !important;
  box-shadow:
    inset 0 1.25px 2.5px rgb(0 0 0 / .72),
    inset 0 -0.5px 1px rgb(255 255 255 / .03) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-tone="contrast"] .jh-tactile-pad__cap {
  background: #202020 !important;
  color: #e8e8e8 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .055),
    inset 0 0 0 .5px rgb(255 255 255 / .05),
    0 2px 4px -0.5px rgb(0 0 0 / .9),
    0 1px 1.5px rgb(0 0 0 / .74) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-tone="contrast"][data-shape="dish"] .jh-tactile-pad__cap::before {
  background: radial-gradient(circle at 50% 60%, #242424 0%, #1c1c1c 62%, #151515 100%) !important;
  box-shadow:
    inset 0 1.25px 2px rgb(0 0 0 / .68),
    inset 0 -0.5px 1px rgb(255 255 255 / .035) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad__pin {
  background: rgb(255 255 255 / .16) !important;
  box-shadow: inset 0 .8px 1px #000, 0 .5px 0 rgb(255 255 255 / .045) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-tone="contrast"] .jh-tactile-pad__pin {
  background: rgb(255 255 255 / .22) !important;
  box-shadow: inset 0 .8px 1px #000, 0 .5px 0 rgb(255 255 255 / .06) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[aria-pressed="true"] .jh-tactile-pad__pin,
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-led="crimson"][aria-pressed="true"] .jh-tactile-pad__pin {
  opacity: 1 !important;
  background: var(--jh-tactile-led-color, oklch(100% 0 0)) !important;
  box-shadow:
    inset 0 0 1px rgb(255 255 255 / .45),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .6) color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) var(--jh-slider-glow-strength-mid, 52%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.1) color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) calc(var(--jh-slider-glow-strength-mid, 52%) * .65), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad:is(:active, [data-pressed="true"], [data-playhead="true"]) .jh-tactile-pad__pin,
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-led="crimson"]:is(:active, [data-pressed="true"]) .jh-tactile-pad__pin {
  opacity: 1 !important;
  background: color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) 98%, white 2%) !important;
  box-shadow:
    inset 0 0 1px rgb(255 255 255 / .55),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * .85) color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) var(--jh-slider-glow-strength, 70%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) * 1.4) color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) var(--jh-slider-glow-strength-mid, 52%), transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad:is(:active, [data-pressed="true"], [aria-pressed="true"]) .jh-tactile-pad__cap {
  transform: translateY(1.25px) scale(.965);
  background: #0d0d0d !important;
  color: #f4f4f4 !important;
  box-shadow:
    inset 0 1.5px 3px rgb(0 0 0 / .9),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) 38%, rgb(255 255 255 / .12)),
    0 .5px 0 rgb(255 255 255 / .02) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad:is(:active, [data-pressed="true"], [aria-pressed="true"])[data-shape="dish"] .jh-tactile-pad__cap::before {
  background: radial-gradient(circle at 50% 56%, #131313 0%, #0d0d0d 62%, #080808 100%) !important;
  box-shadow:
    inset 0 1.5px 3px rgb(0 0 0 / .88),
    inset 0 -0.5px 1px rgb(255 255 255 / .02) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-pad[data-tone="contrast"]:is(:active, [data-pressed="true"], [aria-pressed="true"]) .jh-tactile-pad__cap {
  background: #121212 !important;
  color: #ffffff !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-console__speaker {
  background: #070707 !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .58), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-console__speaker span {
  background: #030303 !important;
  box-shadow: inset 0 .5px 1px #000, 0 .5px 0 rgb(255 255 255 / .03) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-console__oled {
  background: #070707 !important;
  color: #ededed !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .58), inset 0 0 0 1px rgb(255 255 255 / .03), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-console__oled-head {
  color: #828282 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-oled__curve {
  stroke: color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) 85%, #d0d0d0) !important;
  opacity: .72 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-oled__rail {
  stroke: rgb(255 255 255 / .12) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-oled__bar {
  fill: rgb(255 255 255 / .14) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-oled__bar.is-active {
  fill: rgb(255 255 255 / .56) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-oled__bar.is-hit {
  fill: color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) 95%, white 5%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder {
  background: #060606 !important;
  box-shadow:
    inset 0 1.5px 3px rgb(0 0 0 / .88),
    inset 0 -0.5px 0 rgb(255 255 255 / .02),
    0 1px 0 rgb(255 255 255 / .015) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder__tick {
  stroke: rgb(255 255 255 / .18) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder__tick.is-active {
  stroke: color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) 92%, #ffffff) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder__ring {
  border-color: color-mix(in oklch, var(--jh-tactile-led-color, oklch(100% 0 0)) 42%, #242424) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-dragging="true"] .jh-tactile-encoder__ring,
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder:active .jh-tactile-encoder__ring {
  opacity: 1 !important;
  border-color: var(--jh-tactile-led-color, #e6e6e6) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder__cap {
  box-shadow: inset 0 1px rgb(255 255 255 / .06), 0 2px 6px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-encoder-tone="0"] .jh-tactile-encoder__cap {
  background: radial-gradient(circle at 40% 34%, #1e1e1e 0%, #141414 72%, #0c0c0c 100%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-encoder-tone="1"] .jh-tactile-encoder__cap {
  background: radial-gradient(circle at 40% 34%, #3c3c3c 0%, #2b2b2b 72%, #1f1f1f 100%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-encoder-tone="2"] .jh-tactile-encoder__cap {
  background: radial-gradient(circle at 40% 34%, #6a6a6a 0%, #525252 72%, #3f3f3f 100%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-encoder-tone="3"] .jh-tactile-encoder__cap {
  background: radial-gradient(circle at 40% 34%, #a8a8a8 0%, #8e8e8e 72%, #767676 100%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder__notch {
  background: rgb(255 255 255 / .64) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-encoder-tone="3"] .jh-tactile-encoder__notch {
  background: rgb(0 0 0 / .55) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder[data-dragging="true"] .jh-tactile-encoder__notch,
:is([data-jh-theme="dark"], .dark) .jh-tactile-encoder:active .jh-tactile-encoder__notch {
  opacity: 1 !important;
  background: var(--jh-tactile-led-color, #ffffff) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-glass-shape,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .jh-glass-shape {
  background: linear-gradient(175deg, #0e0e0e, #0a0a0a) !important;
  background-image: linear-gradient(175deg, #0e0e0e, #0a0a0a) !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .018), inset 0 -1px 1px rgb(0 0 0 / .68) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-glass-shape::before {
  background: radial-gradient(ellipse at 38% -65%, rgb(255 255 255 / .028) 30%, transparent 72%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .016), inset 0 -1px 1px rgb(0 0 0 / .45);
  opacity: .75;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-glass-shape {
  background: linear-gradient(175deg, rgb(16 16 16 / .86), rgb(10 10 10 / .78)) !important;
  background-image: linear-gradient(175deg, rgb(16 16 16 / .86), rgb(10 10 10 / .78)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .035), inset 0 0 0 1px rgb(255 255 255 / .025) !important;
  backdrop-filter: blur(18px) saturate(1.04) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.04) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-glass-shape::before {
  opacity: 0;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-glass-shape {
  background: linear-gradient(175deg, rgb(24 24 24 / .72), rgb(12 12 12 / .48)) !important;
  background-image: linear-gradient(175deg, rgb(24 24 24 / .72), rgb(12 12 12 / .48)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .045), inset 0 0 0 1px rgb(255 255 255 / .03) !important;
  backdrop-filter: blur(20px) saturate(1.14) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.14) !important;
}
:is([data-jh-theme="dark"], .dark) .library-demo-shape__outer { stroke: rgb(255 255 255 / .07) !important; }
:is([data-jh-theme="dark"], .dark) .library-demo-shape__specular { color: rgb(255 255 255 / .24) !important; }
:is([data-jh-theme="dark"], .dark) .library-demo-shape__inner { stroke: rgb(255 255 255 / .12) !important; }
:is([data-jh-theme="dark"], .dark) .library-demo-shape__readout { color: #b5b5b5 !important; }
:is([data-jh-theme="dark"], .dark) .library-demo-shape__readout small { color: #6e6e6e !important; }

/* Camera Scroll Wheel — Flat Obsidian Deck */
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel {
  --jh-camera-accent: var(--jh-slider-accent-color, var(--jh-accent, oklch(100% 0 0)));
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .015),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-camera-wheel,
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel[data-jh-material="liquid-glass"] {
  background: rgb(12 12 12 / .82) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .028),
    inset 0 0 0 1px rgb(255 255 255 / .035),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-camera-wheel,
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel[data-jh-material="liquid"] {
  background:
    linear-gradient(130deg, rgb(255 255 255 / .045), rgb(255 255 255 / .018) 45%, rgb(255 255 255 / .05)),
    linear-gradient(175deg, rgb(14 14 14 / .86), rgb(9 9 9 / .84)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    0 14px 30px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__meta {
  border-bottom-color: rgb(255 255 255 / .06) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__title { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__subtitle { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__readout {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__readout small { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__readout strong { color: #f2f2f2 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__body {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__body:focus-visible {
  box-shadow: 0 0 0 2px var(--jh-camera-accent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__window {
  background: rgb(255 255 255 / .018) !important;
  background-image: none !important;
  border-color: rgb(255 255 255 / .055) !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__window-glass {
  background:
    linear-gradient(90deg, #0a0a0a 0%, rgb(10 10 10 / .7) 12%, transparent 26%, transparent 74%, rgb(10 10 10 / .7) 88%, #0a0a0a 100%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel--vertical .jh-camera-wheel__window-glass {
  background:
    linear-gradient(180deg, #0a0a0a 0%, rgb(10 10 10 / .7) 12%, transparent 26%, transparent 74%, rgb(10 10 10 / .7) 88%, #0a0a0a 100%) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__needle::before,
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__needle::after {
  background: var(--jh-camera-accent) !important;
  box-shadow: 0 0 calc(var(--jh-slider-glow-blur, 5px) * .6) color-mix(in oklch, var(--jh-camera-accent) 52%, transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__stop { color: rgb(255 255 255 / .36) !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__stop[data-near="true"] { color: rgb(255 255 255 / .62) !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__stop.is-active { color: #f5f5f5 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__stop.is-zero .jh-camera-wheel__val {
  border-color: rgb(255 255 255 / .34) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__stop.is-active.is-fraction .jh-camera-wheel__val {
  color: var(--jh-camera-accent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__stop.is-active.is-zero .jh-camera-wheel__val {
  border-color: var(--jh-camera-accent) !important;
  color: #ffffff !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__knurl {
  background-color: #161616 !important;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .055),
    inset 0 -1px 1px rgb(0 0 0 / .75),
    0 0 0 1px rgb(255 255 255 / .045),
    0 2px 6px rgb(0 0 0 / .92) !important;
  background-image:
    linear-gradient(90deg, rgb(0 0 0 / .58) 0%, rgb(0 0 0 / .16) 8%, transparent 20%, transparent 80%, rgb(0 0 0 / .16) 92%, rgb(0 0 0 / .58) 100%),
    repeating-linear-gradient(
      90deg,
      transparent 0 4.5px,
      rgb(0 0 0 / .48) 4.5px 5.5px,
      rgb(255 255 255 / .065) 5.5px 6.5px,
      transparent 6.5px 7px
    ),
    linear-gradient(180deg, #141414 0%, #242424 28%, #2c2c2c 45%, #1e1e1e 74%, #111111 100%) !important;
  background-size: 100% 100%, 28px 100%, 100% 100% !important;
  background-position: 0 0, var(--jh-knurl-offset, 0px) 0, 0 0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel--vertical .jh-camera-wheel__knurl {
  background-image:
    linear-gradient(180deg, rgb(0 0 0 / .58) 0%, rgb(0 0 0 / .16) 8%, transparent 20%, transparent 80%, rgb(0 0 0 / .16) 92%, rgb(0 0 0 / .58) 100%),
    repeating-linear-gradient(
      180deg,
      transparent 0 4.5px,
      rgb(0 0 0 / .48) 4.5px 5.5px,
      rgb(255 255 255 / .065) 5.5px 6.5px,
      transparent 6.5px 7px
    ),
    linear-gradient(90deg, #141414 0%, #242424 28%, #2c2c2c 45%, #1e1e1e 74%, #111111 100%) !important;
  background-size: 100% 100%, 100% 28px, 100% 100% !important;
  background-position: 0 0, 0 var(--jh-knurl-offset, 0px), 0 0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__knurl-seam,
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel--vertical .jh-camera-wheel__knurl-seam {
  display: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__pip { background: rgb(255 255 255 / .14) !important; box-shadow: none !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__pip:hover { background: rgb(255 255 255 / .34) !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-wheel__pip.is-active {
  background: var(--jh-camera-accent) !important;
  box-shadow: 0 0 calc(var(--jh-slider-glow-blur, 5px) * .5) color-mix(in oklch, var(--jh-camera-accent) 52%, transparent) !important;
}

/* Camera Dial Turret — Flat Obsidian Deck + Tactile Dial Precision */
:is([data-jh-theme="dark"], .dark) .jh-camera-dial {
  --jh-camera-accent: var(--jh-slider-accent-color, var(--jh-accent, oklch(100% 0 0)));
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__plate {
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .015),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-camera-dial__plate,
:is([data-jh-theme="dark"], .dark) .jh-camera-dial[data-jh-material="liquid-glass"] .jh-camera-dial__plate {
  background: rgb(12 12 12 / .82) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .028),
    inset 0 0 0 1px rgb(255 255 255 / .035),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-camera-dial__plate,
:is([data-jh-theme="dark"], .dark) .jh-camera-dial[data-jh-material="liquid"] .jh-camera-dial__plate {
  background:
    linear-gradient(130deg, rgb(255 255 255 / .045), rgb(255 255 255 / .018) 45%, rgb(255 255 255 / .05)),
    linear-gradient(175deg, rgb(14 14 14 / .86), rgb(9 9 9 / .84)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    0 14px 30px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__head { border-bottom-color: rgb(255 255 255 / .06) !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__label,
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__status { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__sublabel { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__bezel-ticks line {
  stroke: rgb(255 255 255 / .16) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__bezel-ticks line.is-major {
  stroke: rgb(255 255 255 / .38) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__datum-pip {
  background: var(--jh-camera-accent) !important;
  box-shadow: 0 0 calc(var(--jh-slider-glow-blur, 5px) * .55) color-mix(in oklch, var(--jh-camera-accent) 52%, transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial[data-dragging="true"] .jh-camera-dial__datum-pip {
  box-shadow: 0 0 calc(var(--jh-slider-glow-blur, 5px) * .9) color-mix(in oklch, var(--jh-camera-accent) 78%, transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__ev-step {
  background: #141414 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .04), inset 0 0 0 1px rgb(255 255 255 / .055), 0 1.5px 3px rgb(0 0 0 / .7) !important;
  color: rgb(255 255 255 / .64) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__ev-step:hover {
  color: #ededed !important;
  background: #1a1a1a !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__ev-step.is-active {
  background: linear-gradient(175deg, #212121, #171717) !important;
  color: #f4f4f4 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .06),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-camera-accent) 45%, rgb(255 255 255 / .14)),
    0 2px 6px rgb(0 0 0 / .88) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__turret-wrap {
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__turret-wrap:focus-visible {
  box-shadow: 0 0 0 2px var(--jh-camera-accent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__knurled-rim {
  background: radial-gradient(circle at 38% 30%, #202020 0%, #151515 52%, #0e0e0e 88%, #090909 100%) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .03), inset 0 0 0 1px rgb(255 255 255 / .04), 0 4px 12px rgb(0 0 0 / .88) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__knurled-rim::before {
  border-color: rgb(255 255 255 / .14) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__stop-mark b { color: rgb(255 255 255 / .54) !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__stop-mark.is-auto b { color: var(--jh-camera-accent) !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__stop-mark.is-active b {
  color: #ffffff !important;
  text-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__hub {
  background: radial-gradient(circle at 36% 28%, #1e1e1e 0%, #131313 64%, #0c0c0c 100%) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .035), inset 0 0 0 1px rgb(255 255 255 / .04), 0 4px 12px rgb(0 0 0 / .86) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__cutout {
  background: #171717 !important;
  color: #ededed !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .05),
    inset 0 0 0 1px rgb(255 255 255 / .06),
    0 2px 4px rgb(0 0 0 / .72) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__cutout:hover {
  background: #1d1d1d !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .07),
    inset 0 0 0 1px rgb(255 255 255 / .09),
    0 2px 6px rgb(0 0 0 / .78) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__cutout[data-scrolling="true"] {
  background: #131313 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-camera-accent) 45%, rgb(255 255 255 / .14)),
    0 1px 2px rgb(0 0 0 / .7) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__cutout-label { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__cutout-value { color: #f2f2f2 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__film-tag { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__film-active { color: #ffffff !important; }
:is([data-jh-theme="dark"], .dark) .jh-camera-dial__spindle {
  background: radial-gradient(circle at 35% 30%, #4d4d4d, #262626 72%, #141414 100%) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .08), inset 0 0 0 1px rgb(255 255 255 / .06), 0 1px 3px rgb(0 0 0 / .9) !important;
}

/* Debossed 120 Filmstrip Gallery — Flat Obsidian Light-Table */
:is([data-jh-theme="dark"], .dark) .jh-filmstrip {
  --jh-camera-accent: var(--jh-slider-accent-color, var(--jh-accent, oklch(100% 0 0)));
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__chassis {
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .015),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-filmstrip__chassis,
:is([data-jh-theme="dark"], .dark) .jh-filmstrip[data-jh-material="liquid-glass"] .jh-filmstrip__chassis {
  background: rgb(12 12 12 / .82) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .028),
    inset 0 0 0 1px rgb(255 255 255 / .035),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-filmstrip__chassis,
:is([data-jh-theme="dark"], .dark) .jh-filmstrip[data-jh-material="liquid"] .jh-filmstrip__chassis {
  background:
    linear-gradient(130deg, rgb(255 255 255 / .045), rgb(255 255 255 / .018) 45%, rgb(255 255 255 / .05)),
    linear-gradient(175deg, rgb(14 14 14 / .86), rgb(9 9 9 / .84)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    0 14px 30px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__header { border-bottom-color: rgb(255 255 255 / .06) !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__brand { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__emulsion { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__counter {
  background: transparent !important;
  box-shadow: none !important;
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__well {
  padding: 2px 2px 0;
  border-radius: 0 !important;
  background: transparent !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: none !important;
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__frame-badge,
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__exif-pills { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__frame-meta { border-top-color: rgb(255 255 255 / .06) !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__frame-meta strong { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__artwork {
  background: #0e0e0e !important;
  border: 0 !important;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / .07),
    0 2px 8px -2px rgb(0 0 0 / .75) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__crosshair { color: rgb(255 255 255 / .24) !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__gate {
  background: #040404 !important;
  box-shadow: inset 2px 0 5px rgb(0 0 0 / .95), 1px 0 0 rgb(255 255 255 / .03) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__gate-led {
  background: var(--jh-camera-accent) !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip[data-dragging="true"] .jh-filmstrip__gate-led {
  box-shadow: 0 0 calc(var(--jh-slider-glow-blur, 5px) * .9) var(--jh-camera-accent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__ribbon {
  background: linear-gradient(180deg, #161616 0%, #101010 55%, #151515 100%) !important;
  color: #e4e4e4 !important;
  box-shadow:
    inset 18px 0 18px -10px rgb(0 0 0 / .9),
    inset 0 1px 0 rgb(255 255 255 / .035),
    0 12px 24px -12px rgb(0 0 0 / .92) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__start-tag { color: #828282 !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__num-step {
  color: rgb(255 255 255 / .52) !important;
  background: transparent !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__num-step:hover {
  color: #ededed !important;
  background: rgb(255 255 255 / .04) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__num-step.is-active {
  color: #ffffff !important;
  background: linear-gradient(175deg, #1d1d1d, #141414) !important;
  border-color: color-mix(in oklch, var(--jh-camera-accent) 45%, rgb(255 255 255 / .14)) !important;
  box-shadow: 0 1px 3px rgb(0 0 0 / .85) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__ribbon-badge {
  background: #0d0d0d !important;
  border-left-color: rgb(255 255 255 / .16) !important;
  box-shadow: inset 1px 0 0 rgb(255 255 255 / .025) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__exposed { color: #888888 !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip[data-exposed="true"] .jh-filmstrip__exposed { color: #f0f0f0 !important; }
:is([data-jh-theme="dark"], .dark) .jh-filmstrip__tab-seal {
  background: #191919 !important;
  border-color: rgb(255 255 255 / .12) !important;
  color: #ededed !important;
}

/* Image Inspector — Flat Obsidian Proofing Sheet */
:is([data-jh-theme="dark"], .dark) .jh-image-inspector {
  background: #0a0a0a !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .015),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
  color: #ededed !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-image-inspector,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector[data-jh-material="liquid-glass"] {
  background: rgb(12 12 12 / .82) !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .028),
    inset 0 0 0 1px rgb(255 255 255 / .035),
    0 12px 28px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-image-inspector,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector[data-jh-material="liquid"] {
  background:
    linear-gradient(130deg, rgb(255 255 255 / .045), rgb(255 255 255 / .018) 45%, rgb(255 255 255 / .05)),
    linear-gradient(175deg, rgb(14 14 14 / .86), rgb(9 9 9 / .84)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    0 14px 30px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__left {
  background: transparent !important;
  border-right-color: rgb(255 255 255 / .06) !important;
  border-bottom-color: rgb(255 255 255 / .06) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__topbar { color: #8a8a8a !important; }
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__exifbar { color: #e2e2e2 !important; }
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__cycle:hover {
  background: rgb(255 255 255 / .06) !important;
  color: #ffffff !important;
}
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__well {
  background: #0e0e0e !important;
  border: 0 !important;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / .07),
    0 2px 8px -2px rgb(0 0 0 / .75) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__eyebrow,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__key { color: #8a8a8a !important; }
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__frame-row,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__row { border-top-color: rgb(255 255 255 / .07) !important; }
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__frame-id,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__val strong { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__val strong.jh-image-inspector__status { color: #f2f2f2 !important; }
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__plate-index,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__val p,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__sub,
:is([data-jh-theme="dark"], .dark) .jh-image-inspector__footnote { color: #808080 !important; }

/* Dark ScrollArea multi-column, SimpleScroll, AccordionScroll & VerticalGallery */
:is([data-jh-theme="dark"], .dark) .jh-scroll-category__title { color: #8c8c8c !important; }
:is([data-jh-theme="dark"], .dark) .jh-scroll-option { color: #9c9c9c !important; }
:is([data-jh-theme="dark"], .dark) .jh-scroll-option small { color: #737373 !important; }
:is([data-jh-theme="dark"], .dark) .jh-scroll-option:hover {
  color: #ededed !important;
  background: rgb(255 255 255 / .045) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-scroll-option[aria-pressed="true"] {
  color: #f4f4f4 !important;
  background: #141414 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .05),
    inset 0 0 0 1px rgb(255 255 255 / .07),
    0 2px 6px -2px rgb(0 0 0 / .75) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-simple-scroll__item { color: #a0a0a0 !important; }
:is([data-jh-theme="dark"], .dark) .jh-simple-scroll__item:hover {
  color: #ededed !important;
  background: rgb(255 255 255 / .04) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-simple-scroll__item.is-selected {
  color: #f4f4f4 !important;
  background: #141414 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .05),
    inset 0 0 0 1px rgb(255 255 255 / .075),
    0 2px 8px -3px rgb(0 0 0 / .85) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-simple-scroll__copy strong { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-simple-scroll__copy span,
:is([data-jh-theme="dark"], .dark) .jh-simple-scroll__meta { color: #848484 !important; }

:is([data-jh-theme="dark"], .dark) .jh-accordion-scroll > .jh-scroll-area > .jh-accordion {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  width: 100% !important;
  max-width: none !important;
  padding: 2px 6px 2px 2px !important;
}

:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .jh-vertical-gallery,
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery[data-jh-material="solid"] {
  background: #0a0a0a !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .04),
    inset 0 0 0 1px rgb(255 255 255 / .05),
    0 18px 42px -18px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-vertical-gallery,
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery[data-jh-material="liquid-glass"] {
  background: rgb(14 14 14 / .78) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .06),
    inset 0 0 0 1px rgb(255 255 255 / .08),
    0 18px 42px -18px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-vertical-gallery,
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery[data-jh-material="liquid"] {
  background:
    linear-gradient(135deg, rgb(24 24 24 / .65), rgb(10 10 10 / .75)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .08),
    inset 0 0 0 1px rgb(255 255 255 / .09),
    0 18px 42px -18px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__eyebrow,
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__meta,
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__footer { color: #848484 !important; }
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__header strong { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__frame,
:is([data-jh-theme="dark"], .dark) .jh-scroll-frame.jh-vertical-gallery__frame {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 clamp(4px, .75vw, 6px) 0 0 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__viewport,
:is([data-jh-theme="dark"], .dark) .jh-scroll-frame > .jh-scroll-area.jh-vertical-gallery__viewport {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__item { background: #151516 !important; }
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__item.is-selected {
  box-shadow:
    0 0 0 1.5px #ededed,
    0 6px 14px -4px rgb(0 0 0 / .85) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__index {
  background: rgb(10 10 10 / .78) !important;
  color: #e6e6e6 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__title { color: #ededed !important; }
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__ratio-menu {
  background: #0e0e0e !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .04), inset 0 0 0 1px rgb(255 255 255 / .06), 0 14px 32px -12px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__ratio-option { color: #9c9c9c !important; }
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__ratio-option:hover { color: #ededed !important; background: rgb(255 255 255 / .045) !important; }
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__ratio-option[aria-selected="true"] {
  color: #f4f4f4 !important;
  background: #161616 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .05), inset 0 0 0 1px rgb(255 255 255 / .07) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-vertical-gallery__item {
  box-shadow: 0 1px 2px rgb(0 0 0 / .7), 0 4px 10px -5px rgb(0 0 0 / .9), inset 0 1px rgb(255 255 255 / .04) !important;
}

/* —— Wave 2 Part 1: Dark Obsidian Monochrome + OKLCH Light Accent (15 Instruments) —— */
:is([data-jh-theme="dark"], .dark) .jh-instrument-accent {
  stop-color: var(--jh-instrument-accent, oklch(100% 0 0));
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-attitude__well,
  .jh-attitude__readout > div,
  .jh-attitude__pill,
  .jh-navigation-instrument__well,
  .jh-navigation-instrument__readings > div,
  .jh-navigation-instrument__readings > div:last-of-type,
  .jh-navigation-instrument__mode,
  .jh-compass__well,
  .jh-compass__readout,
  .jh-compass__cardinal-pill,
  .jh-weather__well,
  .jh-weather__readings > div,
  .jh-weather__readings > div:last-child,
  .jh-race-telemetry__cell,
  .jh-financial-chart__plot-wrap,
  .jh-financial-chart__stats > div,
  .jh-metric-card__well,
  .jh-astronomy__sky,
  .jh-astronomy__scrubber,
  .jh-astronomy__readouts > div
) {
  background: #060606 !important;
  background-image: none !important;
  box-shadow:
    inset 0 1px 3px rgb(0 0 0 / .88),
    inset 0 0 0 1px rgb(255 255 255 / .04),
    inset 0 -1px rgb(255 255 255 / .022) !important;
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-attitude__title,
  .jh-attitude__pill,
  .jh-attitude__readout output,
  .jh-navigation-instrument__title,
  .jh-navigation-instrument__mode,
  .jh-navigation-instrument__readings strong,
  .jh-compass__title,
  .jh-compass__cardinal-pill,
  .jh-weather__title,
  .jh-weather__temp,
  .jh-financial-chart__stats strong,
  .jh-astronomy__scrubber output
) {
  color: #f0f0f0;
}
:is([data-jh-theme="dark"], .dark) :where(
  .jh-attitude__eyebrow,
  .jh-attitude__readout span,
  .jh-navigation-instrument__eyebrow,
  .jh-navigation-instrument__readings span,
  .jh-compass__eyebrow,
  .jh-weather__eyebrow,
  .jh-financial-chart__stats span,
  .jh-astronomy__scrubber
) {
  color: #848484;
}
:is([data-jh-theme="dark"], .dark) .jh-attitude__horizon { stroke: #6a6a6a; }
:is([data-jh-theme="dark"], .dark) .jh-attitude__pitch-mark path,
:is([data-jh-theme="dark"], .dark) .jh-attitude__bank-ticks path,
:is([data-jh-theme="dark"], .dark) .jh-attitude__ticks path { stroke: #787878; }
:is([data-jh-theme="dark"], .dark) .jh-attitude__pitch-mark text { fill: #989898; }
:is([data-jh-theme="dark"], .dark) .jh-attitude__bank-indicator,
:is([data-jh-theme="dark"], .dark) .jh-attitude__aircraft-pip {
  fill: var(--jh-instrument-accent, oklch(100% 0 0));
  stroke: #0a0a0a;
}
:is([data-jh-theme="dark"], .dark) .jh-attitude__aircraft path {
  fill: none;
  stroke: var(--jh-instrument-accent, oklch(100% 0 0));
}
:is([data-jh-theme="dark"], .dark) .jh-navigation-instrument__mode-dot,
:is([data-jh-theme="dark"], .dark) .jh-financial-chart__delta-pip,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__delta-pip,
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__pip,
:is([data-jh-theme="dark"], .dark) .jh-metric-card__delta-pip,
:is([data-jh-theme="dark"], .dark) .jh-market-picker__live i,
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__badge-dot,
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__pill-dot,
:is([data-jh-theme="dark"], .dark) .jh-race-telemetry__track span {
  background: var(--jh-instrument-accent, oklch(100% 0 0));
}
:is([data-jh-theme="dark"], .dark) .jh-navigation-instrument__cdi { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-navigation-instrument__lubber,
:is([data-jh-theme="dark"], .dark) .jh-navigation-instrument__needle-north { fill: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-compass__arc { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-compass__needle i { background: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-race-telemetry__grid { stroke: rgb(255 255 255 / .08); }
:is([data-jh-theme="dark"], .dark) .jh-race-telemetry__line { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-race-telemetry__dot {
  fill: var(--jh-instrument-accent, oklch(100% 0 0));
  stroke: #0a0a0a;
}
:is([data-jh-theme="dark"], .dark) .jh-weather__arc { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-weather__needle { fill: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-weather-conditions__spark-line { stroke: var(--jh-instrument-accent, oklch(100% 0 0)) !important; }
:is([data-jh-theme="dark"], .dark) .jh-weather-conditions__spark-halo {
  fill: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 22%, transparent);
  stroke: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 58%, transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-weather-conditions__spark-dot {
  fill: var(--jh-instrument-accent, oklch(100% 0 0));
  stroke: #0a0a0a;
}
:is([data-jh-theme="dark"], .dark) .jh-weather-conditions__slot[data-active="true"] {
  background: #141414 !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / .05),
    inset 0 0 0 1px color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 36%, transparent),
    0 4px 12px -4px rgb(0 0 0 / .9) !important;
  color: #f2f2f2 !important;
}
:is([data-jh-theme="dark"], .dark) .jh-wind-instrument__beaufort-arc { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-wind-instrument__head { fill: var(--jh-instrument-accent, oklch(100% 0 0)) !important; }
:is([data-jh-theme="dark"], .dark) .jh-wind-instrument__shaft { stroke: var(--jh-instrument-accent, oklch(100% 0 0)) !important; }
:is([data-jh-theme="dark"], .dark) .jh-wind-instrument__scale-track span[data-active="true"] { background: var(--jh-instrument-accent, oklch(100% 0 0)) !important; }
:is([data-jh-theme="dark"], .dark) .jh-tide-instrument__curve { stroke: var(--jh-instrument-accent, oklch(100% 0 0)) !important; }
:is([data-jh-theme="dark"], .dark) .jh-tide-instrument__cursor { stroke: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 48%, transparent) !important; }
:is([data-jh-theme="dark"], .dark) .jh-tide-instrument__marker-halo {
  fill: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 22%, transparent) !important;
  stroke: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 56%, transparent) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-tide-instrument__marker {
  fill: var(--jh-instrument-accent, oklch(100% 0 0)) !important;
  stroke: #0a0a0a !important;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-chart__line,
:is([data-jh-theme="dark"], .dark) .jh-metric-card__line,
:is([data-jh-theme="dark"], .dark) .jh-astronomy__arc { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-financial-chart__point-halo,
:is([data-jh-theme="dark"], .dark) .jh-metric-card__point-halo,
:is([data-jh-theme="dark"], .dark) .jh-astronomy__sun-halo {
  fill: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 22%, transparent);
  stroke: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 58%, transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-financial-chart__point,
:is([data-jh-theme="dark"], .dark) .jh-metric-card__point {
  fill: var(--jh-instrument-accent, oklch(100% 0 0));
  stroke: #0a0a0a;
}
:is([data-jh-theme="dark"], .dark) .jh-financial-chart__bar[data-selected="true"],
:is([data-jh-theme="dark"], .dark) .jh-astronomy__sun { fill: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-market-picker__check { color: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-market-picker__asset[aria-selected="true"] {
  box-shadow: inset 0 1px rgb(255 255 255 / .05), inset 0 0 0 1px color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 28%, transparent), 0 2px 6px rgb(0 0 0 / .85) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__ascendant {
  fill: var(--jh-instrument-accent, oklch(100% 0 0));
  stroke: #0a0a0a;
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__ascendant-axis { stroke: var(--jh-instrument-accent, oklch(100% 0 0)); }
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet[data-selected="true"] .jh-astrology-wheel__planet-halo {
  fill: color-mix(in oklch, var(--jh-instrument-accent, oklch(100% 0 0)) 20%, transparent);
  stroke: var(--jh-instrument-accent, oklch(100% 0 0));
}
:is([data-jh-theme="dark"], .dark) .jh-astrology-wheel__planet[data-selected="true"] circle.jh-astrology-wheel__planet-face {
  stroke: var(--jh-instrument-accent, oklch(100% 0 0));
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__age-pip {
  fill: var(--jh-instrument-accent, oklch(100% 0 0));
  stroke: #0a0a0a;
}
:is([data-jh-theme="dark"], .dark) .jh-lunar-ephemeris__light-source {
  fill: #0a0a0a;
  stroke: var(--jh-instrument-accent, oklch(100% 0 0));
}

/* Continuous custom surface transparency & backdrop blur (Dark / Obsidian — preserves outer shadows, text & SVG icons) */
:is([data-jh-theme="dark"], .dark):is(
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
):is(
  .jh-dialog,
  .jh-dialog.jh-command-dialog,
  .jh-dialog__content,
  .jh-command-dialog,
  .jh-date-popover,
  .jh-date-popover.jh-picker-overlay,
  .jh-date-time-popover,
  .jh-date-time-popover.jh-picker-overlay,
  .jh-date-time-picker,
  .jh-picker-overlay,
  [data-jh-material].jh-picker-overlay,
  .jh-combobox__popover,
  .jh-currency-picker__popover,
  .jh-ephemeris-picker__panel,
  .jh-menu,
  .jh-context-menu,
  .jh-toast,
  .jh-oklch-palette,
  .jh-oklch-palette[data-jh-material],
  .jh-spectrum-popover,
  .jh-spectrum,
  .jh-vertical-gallery__ratio-menu,
  .jh-theme-picker-popover,
  .jh-theme-picker-popover.jh-picker-overlay,
  .jh-calendar:not(.jh-date-popover .jh-calendar):not(.jh-date-time-popover .jh-calendar),
  .jh-data-form,
  .jh-data-table,
  .jh-metric-card,
  .jh-tabs,
  .jh-accordion:not(.jh-scroll-area > .jh-accordion),
  .jh-step-navigation,
  .jh-radio-group__options,
  .jh-scroll-frame:not(.jh-vertical-gallery__frame):not(.jh-picker-overlay .jh-scroll-frame):not(.jh-currency-picker .jh-scroll-frame):not(.jh-financial-order .jh-scroll-frame):not(.jh-market-picker .jh-scroll-frame),
  .jh-gallery,
  .jh-gallery__caption,
  .jh-image-frame,
  .jh-file-transfer,
  .jh-vertical-gallery,
  .jh-filmstrip__chassis,
  .jh-image-inspector,
  .jh-financial-chart,
  .jh-market-picker,
  .jh-financial-order:not(.jh-command-dialog > .jh-financial-order),
  .jh-financial-order[data-jh-material]:not(.jh-command-dialog > .jh-financial-order),
  .jh-finance-nav--sidebar,
  .jh-finance-nav--header,
  .jh-weather,
  .jh-weather-conditions,
  .jh-wind-instrument,
  .jh-tide-instrument,
  .jh-lunar-ephemeris,
  .jh-astronomy,
  .jh-astrology-wheel,
  .jh-navigation-instrument,
  .jh-attitude,
  .jh-compass,
  .jh-compass__dial,
  .jh-race-telemetry,
  .jh-tactile-keypad,
  .jh-tactile-console,
  .jh-camera-wheel,
  .jh-camera-dial__plate
) {
  background-color: rgb(10 10 10 / var(--jh-surface-alpha, 1)) !important;
  background-image: none !important;
  backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
  -webkit-backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
}
:is([data-jh-theme="dark"], .dark):is(
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
):is(
  .jh-button:not(.jh-button--ghost) .jh-button__face,
  .jh-button--glass:not(.jh-button--ghost) .jh-button__face,
  .jh-button--ghost:not(:disabled):is(:hover, :active) .jh-button__face,
  .jh-date-picker__trigger .jh-button__face,
  .jh-date-time-picker__trigger .jh-button__face,
  .jh-financial-order__launch .jh-button__face,
  .jh-slider__thumb,
  .jh-bar-slider__thumb,
  .jh-switch__thumb,
  .jh-tactile-lever__thumb,
  .jh-tactile-key__face,
  .jh-tactile-pad__cap,
  .jh-tactile-encoder__cap,
  .jh-dial__knob,
  .jh-radio-option,
  .jh-segmented__option[aria-checked="true"] span,
  .jh-segmented__thumb,
  .jh-tabs__thumb,
  .jh-context-menu__trigger,
  .jh-combobox__trigger,
  .jh-command-trigger,
  .jh-currency-picker__trigger,
  .jh-ephemeris-picker__trigger,
  .jh-oklch-trigger,
  .jh-oklch-trigger[data-jh-material],
  .jh-spectrum-trigger,
  .jh-dialog__close,
  .jh-toast__close,
  .jh-date-time-slots button,
  .jh-calendar__day-button[aria-selected="true"],
  .jh-calendar__selected .jh-calendar__day-button,
  .jh-financial-order__close,
  .jh-financial-order__confirm,
  .jh-financial-order[data-jh-material] .jh-financial-order__confirm,
  .jh-ephemeris-picker__panel-head > button,
  .jh-ephemeris-picker__submit,
  .jh-vertical-gallery__aspect-btn,
  .jh-github-star,
  .jh-theme-toggle,
  .jh-theme-picker-popover__modes button[aria-pressed="true"],
  .jh-theme-picker-popover__reset,
  .jh-financial-chart__periods button[aria-pressed="true"],
  .jh-financial-chart__modes button[aria-pressed="true"],
  .jh-market-picker__tabs button[aria-selected="true"],
  .jh-ephemeris-picker__targets button[aria-pressed="true"],
  .jh-step-navigation__step,
  .jh-spectrum__steppers button,
  .jh-combobox__option[aria-selected="true"],
  .jh-currency-picker__options button[aria-selected="true"],
  .jh-vertical-gallery__ratio-option[aria-selected="true"],
  .jh-glass-shape,
  [data-jh-material].jh-glass-shape
) {
  background-color: rgb(14 14 14 / var(--jh-surface-alpha, 1)) !important;
  background-image: none !important;
  backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
  -webkit-backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
}
:is([data-jh-theme="dark"], .dark):is(
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
):is(.jh-dial__top, .jh-date-popover .jh-calendar, .jh-date-time-popover .jh-calendar) {
  background: transparent !important;
  background-image: none !important;
}
:is([data-jh-theme="dark"], .dark):is(
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
):is(
  .jh-input,
  .jh-search-input,
  .jh-slider__track,
  .jh-bar-slider__track,
  .jh-tactile-lever__track,
  .jh-progress__track,
  .jh-switch::before,
  .jh-segmented,
  .jh-tabs__list,
  .jh-dial__bed,
  .jh-compass__bed,
  .jh-tactile-encoder,
  .jh-tactile-console__oled,
  .jh-tactile-console__speaker,
  .jh-dialog-summary,
  .jh-financial-order__asset,
  .jh-financial-order[data-jh-material] .jh-financial-order__asset,
  .jh-financial-order__side,
  .jh-financial-order__summary,
  .jh-financial-order[data-jh-material] .jh-financial-order__summary,
  .jh-financial-order__fields input,
  .jh-financial-order__fields select,
  .jh-ephemeris-picker__fields input,
  .jh-ephemeris-picker__fields select,
  .jh-command-dialog__search input,
  .jh-currency-picker__search input,
  .jh-picker-overlay__search input,
  .jh-picker-overlay .jh-search-input,
  .jh-date-picker__clear,
  .jh-financial-chart__periods,
  .jh-financial-chart__modes,
  .jh-market-picker__tabs,
  .jh-theme-picker-popover__modes,
  .jh-spectrum__modes,
  .jh-spectrum__library-picker,
  .jh-spectrum__hex-row,
  .jh-wind-instrument__well,
  .jh-wind-instrument__tile,
  .jh-compass__well,
  .jh-compass__readout,
  .jh-compass__cardinal-pill,
  .jh-attitude__pill,
  .jh-attitude__well,
  .jh-attitude__readout > div,
  .jh-navigation-instrument__mode,
  .jh-navigation-instrument__well,
  .jh-navigation-instrument__readings > div,
  .jh-weather__well,
  .jh-weather__readings > div,
  .jh-astronomy__sky,
  .jh-astronomy__scrubber,
  .jh-astronomy__readouts > div,
  .jh-astrology-wheel__details > div,
  .jh-financial-chart__plot-wrap,
  .jh-financial-chart__stats > div,
  .jh-metric-card__well,
  .jh-race-telemetry__cell,
  .jh-race-telemetry__sectors span
) {
  background-color: rgb(6 6 6 / var(--jh-surface-alpha, 1)) !important;
  background-image: none !important;
  backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
  -webkit-backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
}
:is([data-jh-theme="dark"], .dark):is(
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
  [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
):is(
  .jh-button:not(.jh-button--ghost) .jh-button__face::before,
  .jh-slider__thumb::after,
  .jh-bar-slider__thumb::after,
  .jh-tactile-lever__thumb::after
) {
  background: none !important;
  opacity: 0 !important;
}
@media (prefers-reduced-transparency: reduce) {
  :is([data-jh-theme="dark"], .dark):is(
    [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
    [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
  ):is(
    .jh-dialog,.jh-dialog__content,.jh-dialog-summary,.jh-command-dialog,.jh-date-popover,.jh-date-time-popover,
    .jh-date-time-picker,.jh-picker-overlay,.jh-currency-picker__popover,.jh-ephemeris-picker__panel,.jh-menu,
    .jh-context-menu,.jh-toast,.jh-oklch-palette,.jh-spectrum-popover,.jh-spectrum,.jh-vertical-gallery__ratio-menu,
    .jh-theme-picker-popover,.jh-calendar:not(.jh-date-popover .jh-calendar):not(.jh-date-time-popover .jh-calendar),
    .jh-data-form,.jh-data-table,.jh-metric-card,.jh-tabs,.jh-accordion:not(.jh-scroll-area > .jh-accordion),
    .jh-step-navigation,.jh-radio-group__options,
    .jh-scroll-frame:not(.jh-vertical-gallery__frame):not(.jh-picker-overlay .jh-scroll-frame):not(.jh-currency-picker .jh-scroll-frame):not(.jh-financial-order .jh-scroll-frame):not(.jh-market-picker .jh-scroll-frame),
    .jh-gallery,.jh-gallery__caption,.jh-image-frame,.jh-file-transfer,.jh-vertical-gallery,.jh-filmstrip__chassis,
    .jh-image-inspector,.jh-financial-chart,.jh-market-picker,.jh-financial-order:not(.jh-command-dialog > .jh-financial-order),
    .jh-finance-nav--sidebar,.jh-finance-nav--header,.jh-weather,.jh-weather-conditions,.jh-wind-instrument,
    .jh-tide-instrument,.jh-lunar-ephemeris,.jh-astronomy,.jh-astrology-wheel,.jh-navigation-instrument,.jh-attitude,
    .jh-compass,.jh-compass__dial,.jh-race-telemetry,.jh-tactile-keypad,.jh-tactile-console,.jh-camera-wheel,.jh-camera-dial__plate
  ) {
    background-color: #0a0a0a !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  :is([data-jh-theme="dark"], .dark):is(
    [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
    [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
  ):is(
    .jh-button:not(.jh-button--ghost) .jh-button__face,.jh-button--ghost:not(:disabled):is(:hover, :active) .jh-button__face,
    .jh-slider__thumb,.jh-bar-slider__thumb,.jh-switch__thumb,.jh-tactile-lever__thumb,.jh-tactile-key__face,
    .jh-tactile-pad__cap,.jh-tactile-encoder__cap,.jh-dial__knob,.jh-radio-option,
    .jh-segmented__option[aria-checked="true"] span,.jh-segmented__thumb,.jh-tabs__thumb,.jh-context-menu__trigger,
    .jh-combobox__trigger,.jh-command-trigger,.jh-currency-picker__trigger,.jh-ephemeris-picker__trigger,
    .jh-oklch-trigger,.jh-spectrum-trigger,.jh-dialog__close,.jh-toast__close,.jh-date-time-slots button,
    .jh-calendar__day-button[aria-selected="true"],.jh-calendar__selected .jh-calendar__day-button,
    .jh-financial-order__close,.jh-financial-order__confirm,.jh-ephemeris-picker__submit,
    .jh-vertical-gallery__aspect-btn,.jh-github-star,.jh-theme-toggle,
    .jh-theme-picker-popover__modes button[aria-pressed="true"],.jh-theme-picker-popover__reset,
    .jh-financial-chart__periods button[aria-pressed="true"],.jh-financial-chart__modes button[aria-pressed="true"],
    .jh-market-picker__tabs button[aria-selected="true"],.jh-ephemeris-picker__targets button[aria-pressed="true"],
    .jh-step-navigation__step,.jh-spectrum__steppers button,.jh-combobox__option[aria-selected="true"],
    .jh-currency-picker__options button[aria-selected="true"],.jh-vertical-gallery__ratio-option[aria-selected="true"],
    .jh-glass-shape
  ) {
    background-color: #0e0e0e !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  :is([data-jh-theme="dark"], .dark):is(
    [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"],
    [data-jh-surface-custom="true"][data-jh-surface-custom="true"][data-jh-surface-custom="true"] *
  ):is(
    .jh-input,.jh-search-input,.jh-slider__track,.jh-bar-slider__track,.jh-tactile-lever__track,
    .jh-progress__track,.jh-switch::before,.jh-segmented,.jh-tabs__list,.jh-dial__bed,.jh-compass__bed,
    .jh-tactile-encoder,.jh-tactile-console__oled,.jh-tactile-console__speaker,.jh-dialog-summary,
    .jh-financial-order__asset,.jh-financial-order__side,.jh-financial-order__summary,
    .jh-financial-order__fields input,.jh-financial-order__fields select,.jh-ephemeris-picker__fields input,
    .jh-ephemeris-picker__fields select,.jh-command-dialog__search input,.jh-currency-picker__search input,
    .jh-picker-overlay .jh-search-input,.jh-date-picker__clear,.jh-financial-chart__periods,
    .jh-financial-chart__modes,.jh-market-picker__tabs,.jh-theme-picker-popover__modes,
    .jh-spectrum__modes,.jh-spectrum__library-picker,.jh-spectrum__hex-row,.jh-wind-instrument__well,
    .jh-wind-instrument__tile,.jh-compass__well,.jh-compass__readout,.jh-compass__cardinal-pill,
    .jh-attitude__pill,.jh-attitude__well,.jh-attitude__readout > div,.jh-navigation-instrument__mode,
    .jh-navigation-instrument__well,.jh-navigation-instrument__readings > div,.jh-weather__well,
    .jh-weather__readings > div,.jh-astronomy__sky,.jh-astronomy__scrubber,.jh-astronomy__readouts > div,
    .jh-astrology-wheel__details > div,.jh-financial-chart__plot-wrap,.jh-financial-chart__stats > div,
    .jh-metric-card__well,.jh-race-telemetry__cell,.jh-race-telemetry__sectors span
  ) {
    background-color: #060606 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
`;

const DARK_LAB_POLISH = `
:is([data-jh-theme="dark"], .dark) .site {
  background: radial-gradient(ellipse at 75% 5%, #0c0c0c 0%, transparent 45%), #060606;
  color: #ededed;
}
:is([data-jh-theme="dark"], .dark) .relief-art {
  background: radial-gradient(ellipse at 50% 20%, #0d0d0d, #070707);
}
:is([data-jh-theme="dark"], .dark) .tactile-study__surface-head {
  color: #9c9c9c;
}
:is([data-jh-theme="dark"], .dark) .tactile-study__surface-head output {
  color: #ededed;
}
:is([data-jh-theme="dark"], .dark) .tactile-study__stage[data-jh-surface-custom="true"] .tactile-study__panel {
  background: rgb(12 12 12 / var(--jh-surface-alpha, 1)) !important;
  background-image: none !important;
  backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
  -webkit-backdrop-filter: blur(var(--jh-surface-blur, 0px)) !important;
}
`;

const DARK_SOLAR_POLISH = `
:is([data-jh-theme="dark"], .dark) .solar-page {
  --solar-muted: #8a8a8a;
  color: #ededed;
  background: radial-gradient(ellipse at 50% 28%, #0c0c0c 0%, #070707 55%, #040404 100%);
}
.solar-topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
:is([data-jh-theme="dark"], .dark) .solar-console {
  border-color: rgb(255 255 255 / .015);
  color: #ededed;
  background: linear-gradient(165deg, rgb(12 12 12 / .9), rgb(8 8 8 / .84));
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 18px 42px -14px rgb(0 0 0 / .95);
}
:is([data-jh-theme="dark"], .dark) .instrument-pedestal {
  background: linear-gradient(100deg, #070707 10%, #0e0e0e 28%, #0a0a0a 32%, #131313 34%, #0c0c0c 59%, #060606 77%, #101010 81%, #080808);
}
:is([data-jh-theme="dark"], .dark) .instrument-pedestal__flutes i {
  background: linear-gradient(#121212 26%, #242424 29%, #272727 32%, #0e0e0e 34%, #141414 90%);
  box-shadow: 1px 0 rgb(0 0 0 / .85), -1px 0 rgb(255 255 255 / .015);
}
`;

const targets = [
  { file: 'assets/ui/theme.css', extra: DARK_TOKENS + '\n' + DARK_COMPONENT_POLISH },
  { file: 'examples/lab/src/library/library.css', extra: DARK_LIBRARY_POLISH },
  { file: 'examples/lab/src/lab.css', extra: DARK_LAB_POLISH },
  { file: 'examples/lab/src/solar/solar.css', extra: DARK_SOLAR_POLISH },
];

for (const target of targets) {
  const fullPath = resolve(root, target.file);
  const baseCss = stripGeneratedBlock(await readFile(fullPath, 'utf8'));
  const generatedRules = extractDarkRules(baseCss);
  const nextCss = `${baseCss}\n${MARKER_START}\n${generatedRules}\n${target.extra.trim()}\n${MARKER_END}\n`;
  await writeFile(fullPath, nextCss, 'utf8');
  console.log(`Black theme generated in ${target.file} (+${generatedRules.split('\n').length} lines)`);
}
