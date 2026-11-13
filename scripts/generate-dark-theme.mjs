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

const CONTROL_FACE_RE = /(__face|__thumb|__knob|__top|__handle|__cap|__key-face|__tile|__symbol|__toast__icon|button|badge|key|pill|tab\b|switch__thumb|accordion__trigger|context-menu__trigger|option\[aria-checked|aria-selected="?true"?|menu\b|dialog\b|popover\b|tooltip\b|toast\b)/i;
const WELL_SURFACE_RE = /(__track|__rail|__well|__bed|__seat|__tray|__slot|__channel|input|textarea|select(?!-trigger)|search-input|segmented\b|tabs__list|scroll-area|hex-row|tactile-key(?!__face)|audio-meter__segments|slider(?!__thumb))/i;
const INPUT_WELL_RE = /(?:__fields\s+(?:input|select)|\.jh-input\b|\.jh-textarea\b|\.jh-search-input\b|__search\s+\.jh-input|__search\s+input|__type-trigger\b|currency-picker__trigger\b|ephemeris-picker__trigger\b|market-picker__trigger\b|date-picker__trigger\b|date-time-picker__trigger\b|combobox__trigger\b|spectrum-trigger\b|oklch-trigger\b|command-trigger\b)/i;
const SPECULAR_RE = /(::before|::after|__glow|ripple|__glass\b|shine|glare)/i;
const LIGHT_EMITTER_RE = /(\.jh-slider__range\b|\.jh-tactile-lever__range\b|\.jh-bar-slider__bars\s+span\[data-active|\.jh-audio-meter__segments\s+span\[data-active|\.jh-audio-meter__bars\s+rect\[data-active|\.jh-dial(?!.*detent).*__tick\.is-active|\.jh-dial__mark\b|\.jh-instrument__bar\.is-active|\.jh-progress__fill\b)/i;
const DETENT_NOTCH_RE = /\.jh-detent-dial\s+\.jh-dial__tick/i;
const DYNAMIC_ACCENT_VAL_RE = /(--jh-slider-|--jh-bar-cell-|--jh-audio-cell-|color-mix\()/i;

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

  if (SPECULAR_RE.test(selector) || (/rgb\([^)]*\/\s*0?\.\d+\s*\)/i.test(rawValue) && /transparent|#ffffff00|#00000000/i.test(rawValue))) {
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
:is([data-jh-theme="dark"], .dark) .jh-slider__track,
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__track,
:is([data-jh-theme="dark"], .dark) .jh-progress__track {
  border: 0 !important;
  background: #060606 !important;
  background-image: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-slider:not(.jh-spectrum__hue .jh-slider):not(.jh-spectrum__saturation .jh-slider):not(.jh-spectrum__lightness .jh-slider) .jh-slider__track,
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__track {
  overflow: visible;
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__track {
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  overflow: visible;
}

/* Thumbs: contour-free obsidian relief with whisper-subtle catchlight and deep drop shadow */
:is([data-jh-theme="dark"], .dark) :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb),
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb) {
  border: 0 !important;
  background: linear-gradient(175deg, #101010, #0b0b0b) !important;
  background-image: linear-gradient(175deg, #101010, #0b0b0b) !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .018), inset 0 -1px 1px rgb(0 0 0 / .72), 0 3px 8px -2px rgb(0 0 0 / .95) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb) {
  border: 0 !important;
  background: rgb(16 16 16 / .88) !important;
  background-image: none !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .022), 0 3px 8px -2px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb) {
  border: 0 !important;
  background: linear-gradient(175deg, rgb(18 18 18 / .82), rgb(11 11 11 / .74)) !important;
  background-image: linear-gradient(175deg, rgb(18 18 18 / .82), rgb(11 11 11 / .74)) !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .024), 0 3px 8px -2px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb)::after {
  border: 0 !important;
  background: linear-gradient(180deg, rgb(255 255 255 / .024), transparent) !important;
  opacity: .35 !important;
}
:is([data-jh-theme="dark"], .dark) :where(.jh-slider__thumb, .jh-bar-slider__thumb, .jh-tactile-lever__thumb):active {
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .85), 0 1px 3px rgb(0 0 0 / .92) !important;
}

/* Active accent light emitters: genuinely translucent frosted glass over dark tracks with vivid OKLCH halo glow */
:is([data-jh-theme="dark"], .dark) .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] :where(.jh-slider__range),
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] :where(.jh-slider__range) {
  background: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 42%, transparent);
  backdrop-filter: blur(2px);
  box-shadow:
    inset 0 1px rgb(255 255 255 / .24),
    0 0 1px color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 2.5px color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-slider[data-accent-gradient="true"] .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-slider[data-accent-gradient="true"] .jh-slider__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-slider[data-accent-gradient="true"] .jh-slider__range {
  background: linear-gradient(90deg, color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 30%, transparent), color-mix(in oklch, var(--jh-slider-accent-color-end, oklch(92% 0.035 250)) 52%, transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-lever__range {
  background: color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 42%, transparent);
  backdrop-filter: blur(2px);
  box-shadow:
    inset 0 1px rgb(255 255 255 / .24),
    0 0 1px color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 2.5px color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-slider-glow-color, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-tactile-lever__slider[data-accent-gradient="true"] .jh-tactile-lever__range {
  background: linear-gradient(180deg, color-mix(in oklch, var(--jh-slider-accent-color-end, oklch(92% 0.035 250)) 52%, transparent), color-mix(in oklch, var(--jh-slider-accent-color, oklch(100% 0 0)) 30%, transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars span {
  background: #141414;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .6), inset 0 -1px rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-bar-slider__bars span[data-active="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-bar-slider__bars span[data-active="true"] {
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 44%, transparent);
  box-shadow:
    inset 0 1px rgb(255 255 255 / .22),
    0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 2.5px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-bar-slider__bars span[data-active="true"][data-lead="true"] {
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 60%, transparent);
  box-shadow:
    inset 0 1px rgb(255 255 255 / .36),
    0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 3px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent),
    0 0 calc(var(--jh-slider-glow-blur, 5px) + 1.5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent);
}

/* Dial relief & translucent accent tick/mark emitters */
:is([data-jh-theme="dark"], .dark) .jh-dial__bed {
  background: #060606;
  background-image: none;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / .58), inset 0 -1px 0 rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__knob {
  background: linear-gradient(125deg, #0f0f0f, #0a0a0a 48%, #0d0d0d 75%);
  box-shadow: 0 5px 0 #030303, 2px 10px 14px -3px rgb(0 0 0 / .95), inset 0 1px rgb(255 255 255 / .018);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__top {
  background: radial-gradient(ellipse at 30% 15%, #101010, #0b0b0b 55%, #080808);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .018), 0 1px 3px rgb(0 0 0 / .75);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__bed {
  background: rgb(6 6 6 / .86);
  background-image: none;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / .55), inset 0 -1px rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__knob {
  background: rgb(14 14 14 / .9);
  box-shadow: 0 5px 0 #030303, inset 0 1px rgb(255 255 255 / .02), 0 8px 16px rgb(0 0 0 / .9);
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__top {
  background: rgb(16 16 16 / .92);
  box-shadow: inset 0 1px rgb(255 255 255 / .02);
}
:is([data-jh-theme="dark"], .dark) .jh-dial__tick {
  stroke: #222222;
}
:is([data-jh-theme="dark"], .dark) .jh-dial:not(.jh-detent-dial) .jh-dial__tick.is-active {
  stroke: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 56%, transparent);
  filter:
    drop-shadow(0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent))
    drop-shadow(0 0 2.5px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent))
    drop-shadow(0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-dial:not(.jh-detent-dial) .jh-dial__tick.is-active[data-lead="true"] {
  stroke: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 72%, transparent);
  filter:
    brightness(1.03)
    drop-shadow(0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent))
    drop-shadow(0 0 3px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent))
    drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) + 1.5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-dial__mark,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-dial__mark,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-dial__mark {
  background: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 52%, transparent);
  box-shadow:
    inset 0 1px rgb(255 255 255 / .24),
    0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent),
    0 0 2.5px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent),
    0 0 var(--jh-slider-glow-blur, 5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-detent-dial .jh-dial__tick {
  stroke: #222222;
}
:is([data-jh-theme="dark"], .dark) .jh-detent-dial .jh-dial__tick.is-active {
  stroke: #e2e2e2;
  filter: drop-shadow(0 0 2.5px rgb(255 255 255 / .36));
}

/* Instrument arcs & AudioMeter keep translucent accent light cells and halo */
:is([data-jh-theme="dark"], .dark) .jh-instrument__bar {
  fill: #1b1b1b;
  stroke: none;
}
:is([data-jh-theme="dark"], .dark) .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-instrument__bar.is-active,
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-instrument__bar.is-active {
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 50%, transparent);
  filter:
    drop-shadow(0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent))
    drop-shadow(0 0 2.5px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-instrument__bar.is-active[data-lead="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-instrument__bar.is-active[data-lead="true"],
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-instrument__bar.is-active[data-lead="true"] {
  fill: color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) 68%, transparent);
  filter:
    brightness(1.03)
    drop-shadow(0 0 1px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength, 68%), transparent))
    drop-shadow(0 0 2.5px color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-mid, 42%), transparent))
    drop-shadow(0 0 calc(var(--jh-slider-glow-blur, 5px) + 1.5px) color-mix(in oklch, var(--jh-bar-cell-accent, var(--jh-slider-accent-color, oklch(100% 0 0))) var(--jh-slider-glow-strength-edge, 20%), transparent));
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__segments span {
  background: #141414;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .6), inset 0 -1px rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) .jh-audio-meter__segments span[data-active="true"] {
  background: color-mix(in oklch, var(--jh-audio-cell-color, oklch(92% 0.02 250)) 52%, transparent);
  box-shadow:
    inset 0 1px rgb(255 255 255 / .24),
    0 0 1px color-mix(in oklch, var(--jh-audio-cell-color, oklch(92% 0.02 250)) 85%, transparent),
    0 0 3.5px color-mix(in oklch, var(--jh-audio-cell-color, oklch(92% 0.02 250)) 46%, transparent);
}
:is([data-jh-theme="dark"], .dark) .jh-progress__fill {
  background: linear-gradient(180deg, rgb(228 228 228 / .58), rgb(168 168 168 / .42));
  box-shadow: inset 0 1px rgb(255 255 255 / .28), 0 0 4px rgb(255 255 255 / .16);
}

/* Inputs & Search wells: flat solid baixo-relevo (no gradient), darker than #0a0a0a card background */
:is([data-jh-theme="dark"], .dark) .jh-input,
:is([data-jh-theme="dark"], .dark) .jh-search-input {
  background: #070707;
  background-image: none;
  color: #e8e8e8;
  border: 0;
  outline: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012);
}
:is([data-jh-theme="dark"], .dark) .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-input:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-search-input:focus-within,
:is([data-jh-theme="dark"], .dark) .jh-search-input input:focus,
:is([data-jh-theme="dark"], .dark) .jh-search-input input:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  background: #090909;
  background-image: none;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .48), inset 0 0 0 1px rgb(255 255 255 / .02);
}
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__trigger,
:is([data-jh-theme="dark"], .dark) .jh-financial-order .jh-currency-picker__trigger,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-trigger,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__fields .jh-input {
  background: #070707 !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  outline: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-currency-picker__trigger:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__type-trigger:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__fields .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-financial-order__fields .jh-input:focus-visible {
  background: #090909 !important;
  background-image: none !important;
  outline: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .48), inset 0 0 0 1px rgb(255 255 255 / .02) !important;
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
  background: #070707 !important;
  background-image: none !important;
  color: #e8e8e8;
  border: 0 !important;
  outline: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search input:focus,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search input:focus-visible,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search .jh-input:focus,
:is([data-jh-theme="dark"], .dark) .jh-picker-overlay__search .jh-input:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  background: #090909 !important;
  background-image: none !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .48), inset 0 0 0 1px rgb(255 255 255 / .02) !important;
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
:is([data-jh-theme="dark"], .dark) .jh-calendar__next {
  color: #8a8a8a;
  background: transparent;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__previous:hover,
:is([data-jh-theme="dark"], .dark) .jh-calendar__next:hover {
  background: #141414;
  color: #ededed;
}
:is([data-jh-theme="dark"], .dark) .jh-calendar__selected .jh-calendar__day-button {
  background: #0e0e0e;
  color: #ededed;
  box-shadow: inset 0 1px rgb(255 255 255 / .018), 0 2px 6px rgb(0 0 0 / .88);
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
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results))::-webkit-scrollbar {
  width: 9px !important;
  height: 9px !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-track,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results))::-webkit-scrollbar-track {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-thumb,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results))::-webkit-scrollbar-thumb {
  min-height: 28px !important;
  border: 2.5px solid transparent !important;
  border-radius: 99px !important;
  background: #282828 padding-box !important;
  box-shadow: none !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-thumb:hover,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results))::-webkit-scrollbar-thumb:hover {
  background: #3d3d3d padding-box !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-button,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results))::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
:is([data-jh-theme="dark"], .dark)::-webkit-scrollbar-corner,
:is([data-jh-theme="dark"], .dark) :where(*:not(.jh-gallery__viewport):not(.jh-command-dialog__results))::-webkit-scrollbar-corner {
  background: transparent !important;
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
  background-color: #070707 !important;
  background-image: none !important;
  color: #9a9a9a !important;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-step-navigation__step[data-state="complete"] .jh-step-navigation__marker {
  background: linear-gradient(175deg, #141414, #0e0e0e) !important;
  color: #d8d8d8 !important;
  box-shadow: inset 0 1px rgb(255 255 255 / .02), 0 2px 5px rgb(0 0 0 / .9) !important;
}
:is([data-jh-theme="dark"], .dark) .jh-step-navigation__step[data-state="current"] .jh-step-navigation__marker {
  background: #e6e6e6 !important;
  color: #090909 !important;
  box-shadow: 0 2px 8px -2px rgb(0 0 0 / .88) !important;
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
:is([data-jh-theme="dark"], .dark) .jh-glass-shape,
:is([data-jh-theme="dark"], .dark) [data-jh-material="solid"] .jh-glass-shape {
  background: linear-gradient(175deg, #0e0e0e, #0a0a0a) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid-glass"] .jh-glass-shape {
  background: rgb(12 12 12 / .82) !important;
}
:is([data-jh-theme="dark"], .dark) [data-jh-material="liquid"] .jh-glass-shape {
  background: linear-gradient(130deg, rgb(255 255 255 / .045), rgb(255 255 255 / .018) 45%, rgb(255 255 255 / .05)), linear-gradient(175deg, rgb(14 14 14 / .86), rgb(9 9 9 / .84)) !important;
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
