import { useId, useState } from 'react';
import { Archive, ArrowUpRight, Check, ChevronDown, Copy, Plus, Search } from 'lucide-react';
import { Button } from '../../../../assets/ui/button';
import { BarSlider } from '../../../../assets/ui/bar-slider';
import { Calendar } from '../../../../assets/ui/calendar';
import { DatePicker } from '../../../../assets/ui/date-picker';
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from '../../../../assets/ui/menu';
import { Toast } from '../../../../assets/ui/toast';
import { Gallery } from '../../../../assets/ui/gallery';
import { Input } from '../../../../assets/ui/input';
import { SearchInput } from '../../../../assets/ui/search-input';
import { DataForm } from '../../../../assets/ui/data-form';
import { RadioGroup } from '../../../../assets/ui/radio-group';
import { SegmentedControl } from '../../../../assets/ui/segmented-control';
import { ScrollArea } from '../../../../assets/ui/scroll-area';
import { ContextMenu } from '../../../../assets/ui/context-menu';
import { TactileKey } from '../../../../assets/ui/tactile-key';
import { TactileKeypad } from '../../../../assets/ui/tactile-keypad';
import { TactileConsole } from '../../../../assets/ui/tactile-console';
import { CameraWheel } from '../../../../assets/ui/camera-wheel';
import { CameraDial } from '../../../../assets/ui/camera-dial';
import { FilmstripGallery } from '../../../../assets/ui/filmstrip-gallery';
import { ImageInspector } from '../../../../assets/ui/image-inspector';
import { Compass } from '../../../../assets/ui/compass';
import { SpectrumControl } from '../../../../assets/ui/spectrum-control';
import { StepNavigation } from '../../../../assets/ui/step-navigation';
import { DateTimePicker } from '../../../../assets/ui/date-time-picker';
import { Accordion } from '../../../../assets/ui/accordion';
import { AttitudeIndicator } from '../../../../assets/ui/attitude-indicator';
import { AudioMeter } from '../../../../assets/ui/audio-meter';
import { FileTransfer } from '../../../../assets/ui/file-transfer';
import { ImageFrame } from '../../../../assets/ui/image-frame';
import { NavigationInstrument } from '../../../../assets/ui/navigation-instrument';
import { ProgressBar } from '../../../../assets/ui/progress-bar';
import { WeatherInstrument } from '../../../../assets/ui/weather-instrument';
import { FinancialChart } from '../../../../assets/ui/financial-chart';
import { MarketPicker } from '../../../../assets/ui/market-picker';
import { CurrencyPicker } from '../../../../assets/ui/currency-picker';
import { FinancialOrderModal } from '../../../../assets/ui/financial-order-modal';
import { AstronomyInstrument } from '../../../../assets/ui/astronomy-instrument';
import { EphemerisPicker } from '../../../../assets/ui/ephemeris-picker';
import { AstrologyWheel } from '../../../../assets/ui/astrology-wheel';
import { RaceTelemetry } from '../../../../assets/ui/race-telemetry';
import { FinanceNavigation } from '../../../../assets/ui/finance-navigation';
import { DetentDial } from '../../../../assets/ui/detent-dial';
import { TactileLever } from '../../../../assets/ui/tactile-lever';
import { OklchPalette } from '../../../../assets/ui/oklch-palette';
import { WeatherConditions } from '../../../../assets/ui/weather-conditions';
import { WindInstrument } from '../../../../assets/ui/wind-instrument';
import { TideInstrument } from '../../../../assets/ui/tide-instrument';
import { LunarEphemeris } from '../../../../assets/ui/lunar-ephemeris';
import { Combobox } from '../../../../assets/ui/combobox';
import { Tabs } from '../../../../assets/ui/tabs';
import { DataTable } from '../../../../assets/ui/data-table';
import { CommandPalette } from '../../../../assets/ui/command-palette';
import { MetricCard } from '../../../../assets/ui/metric-card';
import type { ComponentId, Settings } from './data';
import { dateFromValue, dateToValue } from './extra-data';

export function ExtraPreview({ id, settings: s, onChange, compact }: { id: ComponentId; settings: Settings; onChange: (patch: Partial<Settings>) => void; compact?: boolean }) {
  const inputId = useId();
  const [menuStatus, setMenuStatus] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const surfaceMaterial = s.material === 'liquid' ? 'liquid-glass' : s.material;
  const menuMaterial = s.material === 'liquid-glass' ? 'glass' : s.material;
  if (id === 'bar-slider') return <div className="library-extra-control"><BarSlider label="Intensity" value={s.value} onValueChange={value => onChange({ value })} thumbThickness={s.thumbThickness} thumbHeight={s.thumbHeight} thumbRadius={s.thumbRadius} accentColor={s.accentColor} accentColorEnd={s.accentColorEnd} accentGradient={s.accentGradient} glowIntensity={s.glowIntensity} glowBlur={s.glowBlur} disabled={s.disabled} /></div>;
  if (id === 'oklch-palette') return <div className="library-extra-palette"><div><span>Accent color</span><OklchPalette label="Choose a color" value={s.fillColor} onValueChange={fillColor => onChange({ fillColor })} material={s.material} /></div><output>{s.fillColor}</output></div>;
  if (id === 'calendar') return <div className="library-extra-calendar"><Calendar mode="single" selected={dateFromValue(s.date)} onSelect={date => onChange({ date: dateToValue(date) })} showOutsideDays={s.showOutsideDays} weekStartsOn={s.mondayFirst ? 1 : 0} /></div>;
  if (id === 'date-picker') return <DatePicker material={s.material} label="Choose a date" value={dateFromValue(s.date)} onChange={date => onChange({ date: dateToValue(date) })} disabled={s.disabled} />;
  if (id === 'menu') return <div className="library-extra-menu"><Menu><MenuTrigger asChild><Button>Options <ChevronDown size={14} aria-hidden="true" /></Button></MenuTrigger><MenuContent material={menuMaterial} align={s.align}><MenuLabel>Workspace</MenuLabel><MenuItem onSelect={() => setMenuStatus('New project selected')}><Plus size={15} aria-hidden="true" />New project</MenuItem><MenuItem onSelect={() => setMenuStatus('Duplicate selected')}><Copy size={15} aria-hidden="true" />Duplicate</MenuItem><MenuItem onSelect={() => setMenuStatus('Archive selected')}><Archive size={15} aria-hidden="true" />Archive</MenuItem></MenuContent></Menu><p role="status">{menuStatus}</p></div>;
  if (id === 'toast') return <><Button size={compact ? 'small' : 'default'} onClick={() => setToastOpen(true)}>Show notification <ArrowUpRight size={14} aria-hidden="true" /></Button><Toast open={toastOpen} onOpenChange={setToastOpen} material={surfaceMaterial} title={s.title} description={s.description} duration={s.duration} /></>;
  if (id === 'gallery') return <div className="library-extra-gallery"><Gallery showCaptions={s.showCaptions} showIndicators={s.showIndicators} items={[
    { id: 'one', title: 'Light and form', description: 'A study in quiet volume.', content: <div className="library-gallery-object library-gallery-object--sphere" /> },
    { id: 'two', title: 'Room to breathe', description: 'Space is part of the material.', content: <div className="library-gallery-object library-gallery-object--slab" /> },
    { id: 'three', title: 'A quiet rhythm', description: 'Every edge has a purpose.', content: <div className="library-gallery-object library-gallery-object--column" /> },
  ]} /></div>;
  if (id === 'input') return <div className="library-extra-input"><label htmlFor={inputId}>{s.inputLabel}</label><Input id={inputId} value={s.text} onChange={event => onChange({ text: event.target.value })} placeholder={s.placeholder} disabled={s.disabled} /><span>A little room for your next thought.</span></div>;
  if (id === 'search-input') return <div className="library-extra-input"><SearchInput label="Search the demo" value={s.text} onValueChange={text => onChange({ text })} placeholder={s.placeholder} disabled={s.disabled} /><div className="library-demo-search-results" role="status">{s.text ? ['Glass Button', 'Glass Slider', 'Calendar'].filter(name => name.toLowerCase().includes(s.text.toLowerCase())).map(name => <span key={name}><Search size={12} aria-hidden="true" />{name}</span>) : <span>Try “glass” or “calendar”.</span>}{s.text && !['Glass Button', 'Glass Slider', 'Calendar'].some(name => name.toLowerCase().includes(s.text.toLowerCase())) && <span>No results for “{s.text}”.</span>}</div></div>;
  if (id === 'data-form') return <div className="library-extra-form"><DataForm title={s.title} description={s.description} onSubmit={async () => { /* Local preview: no data is sent or stored. */ }} />{!compact && <p className="library-form-disclaimer">Local demo. No data is sent or stored.</p>}</div>;
  if (id === 'radio-group') return <div className="library-extra-radio"><RadioGroup label="Billing frequency" value={s.radioValue} onValueChange={radioValue => onChange({ radioValue })} options={[{ value: 'monthly', label: 'Monthly', description: 'Billed each month.' }, { value: 'yearly', label: 'Yearly', description: 'Two months included.' }]} />{s.radioValue && <span className="library-control-status" role="status">{s.radioValue === 'yearly' ? 'Yearly billing selected' : 'Monthly billing selected'}</span>}</div>;
  if (id === 'segmented-control') return <div className="library-extra-segment"><SegmentedControl label="Map views" value={s.segmentValue} onValueChange={segmentValue => onChange({ segmentValue })} options={[{ value: 'map', label: 'Map' }, { value: 'list', label: 'List' }, { value: 'saved', label: 'Saved' }]} /><span className="library-control-status" role="status">Showing {s.segmentValue}</span></div>;
  if (id === 'scroll-area') return <div className="library-extra-scroll"><ScrollArea label="Recent locations" maxHeight={compact ? 135 : 220}><ul>{['North Shore', 'Stonebridge', 'West Market', 'Lake Road', 'Old Town', 'Harbor Point', 'Pine Terrace', 'South Ridge', 'Cedar Walk', 'Riverbend', 'Elmwood', 'Glassworks', 'East Pier', 'Highland Park', 'Observatory Hill', 'South Quay'].map(place => <li key={place}>{place}</li>)}</ul></ScrollArea></div>;
  if (id === 'context-menu') return <div className="library-extra-context"><ContextMenu material={menuMaterial} actions={[{ label: 'Rename', onSelect: () => setMenuStatus('Rename selected') }, { label: 'Duplicate', onSelect: () => setMenuStatus('Duplicate selected') }, { label: 'Archive', onSelect: () => setMenuStatus('Archive selected') }]} /><span className="library-control-status" role="status">{menuStatus || 'More actions'}</span></div>;
  if (id === 'tactile-key') return <div className="library-extra-key"><TactileKey size={compact ? 'compact' : 'large'} shape={s.keyShape} tone={s.keyTone} ledPosition={s.keyLedPosition} accentColor={s.keyAccentColor} material={s.material} pressed={s.keyPressed} onPressedChange={keyPressed => onChange({ keyPressed })}>{s.keyPressed ? 'Active' : 'Press'}</TactileKey><span className="library-control-status" role="status">{s.keyPressed ? 'Key held' : 'Ready'}</span></div>;
  if (id === 'tactile-keypad') return <div className="library-extra-keypad" data-compact={compact ? 'true' : undefined}><TactileKeypad layout={compact ? 'command' : s.keypadLayout} accentColor={s.keyAccentColor} material={s.material} /></div>;
  if (id === 'tactile-console') return <div className="library-extra-console" data-compact={compact ? 'true' : undefined}><TactileConsole accentColor={s.keyAccentColor} material={s.material} /></div>;
  if (id === 'camera-wheel') return <div className="library-extra-camera-wheel" data-compact={compact ? 'true' : undefined}><CameraWheel mode={s.cameraMode} orientation={compact ? 'horizontal' : s.cameraOrientation} accentColor={s.keyAccentColor} material={s.material} /></div>;
  if (id === 'camera-dial') return <div className="library-extra-camera-dial" data-compact={compact ? 'true' : undefined}><CameraDial variant={s.cameraDialVariant} accentColor={s.keyAccentColor} material={s.material} /></div>;
  if (id === 'filmstrip-gallery') return <div className="library-extra-filmstrip" data-compact={compact ? 'true' : undefined}><FilmstripGallery accentColor={s.keyAccentColor} material={s.material} /></div>;
  if (id === 'image-inspector') return <div className="library-extra-inspector" data-compact={compact ? 'true' : undefined}><ImageInspector material={s.material} /></div>;
  if (id === 'compass') return <div className="library-extra-compass"><Compass heading={s.compassHeading} onHeadingChange={compassHeading => onChange({ compassHeading })} /></div>;
  if (id === 'spectrum-control') return <div className="library-extra-spectrum"><SpectrumControl mode={compact ? 'inline' : 'popover'} side={s.spectrumSide} showPicker={!compact} material={s.material} hue={s.spectrumHue} saturation={s.spectrumSaturation} lightness={s.spectrumLightness} onHueChange={spectrumHue => onChange({ spectrumHue })} onSaturationChange={spectrumSaturation => onChange({ spectrumSaturation })} onLightnessChange={spectrumLightness => onChange({ spectrumLightness })} /></div>;
  if (id === 'step-navigation') return <div className="library-extra-steps"><StepNavigation currentStep={s.stepIndex} onStepChange={stepIndex => onChange({ stepIndex })} steps={[{ id: 'location', label: 'Location', description: 'Choose a place.' }, { id: 'time', label: 'Time', description: 'Set a moment.' }, { id: 'review', label: 'Review', description: 'Confirm the details.' }]} /><span className="library-control-status" role="status">Step {s.stepIndex + 1} of 3</span></div>;
  if (id === 'date-time-picker') return <div className="library-extra-date-time"><DateTimePicker material={s.material} value={s.dateTime ? new Date(s.dateTime) : undefined} onChange={date => onChange({ dateTime: date?.toISOString() ?? '' })} /></div>;
  if (id === 'audio-meter') return <div className="library-extra-audio"><AudioMeter label="Audio level" orientation={s.audioOrientation} barCount={compact ? 24 : 36} colorScale={s.audioColorScale} accentColor={s.accentColor} accentColorEnd={s.accentColorEnd} accentGradient={s.accentGradient} glowIntensity={s.glowIntensity} glowBlur={s.glowBlur} /></div>;
  if (id === 'weather-instrument') return <div className="library-extra-weather"><WeatherInstrument temperature={s.weatherTemperature} windSpeed={s.weatherWindSpeed} windDirection={s.weatherWindDirection} humidity={s.weatherHumidity} pressure={s.weatherPressure} /></div>;
  if (id === 'attitude-indicator') return <div className="library-extra-attitude"><AttitudeIndicator pitch={s.attitudePitch} roll={s.attitudeRoll} /></div>;
  if (id === 'navigation-instrument') return <div className="library-extra-navigation"><NavigationInstrument mode={s.navigationMode} heading={s.navigationHeading} speed={s.navigationSpeed} auxiliary={s.navigationAuxiliary} /></div>;
  if (id === 'progress-bar') return <div className="library-extra-progress"><div><span>Upload progress</span><output>{s.progressValue}%</output></div><ProgressBar label="Upload progress" value={s.progressValue} max={100} /></div>;
  if (id === 'file-transfer') return <div className="library-extra-transfer"><FileTransfer /></div>;
  if (id === 'image-frame') return <div className="library-extra-image"><ImageFrame src={s.imageSrc || undefined} alt={s.imageAlt || 'Image preview'} caption={compact ? undefined : s.imageCaption}><div className="library-image-art"><span /></div></ImageFrame></div>;
  if (id === 'accordion') return <div className="library-extra-accordion"><Accordion key={s.accordionOpen ? 'open' : 'closed'} label="Configuration details" type="single" material={s.material} defaultValue={s.accordionOpen ? 'layout' : undefined} items={[{ value: 'layout', title: 'Spacing and layout', content: 'A measured grid keeps each control in reach.' }, { value: 'materials', title: 'Light glass surfaces', content: 'Soft reflections and clear values keep the panel readable.' }]} /></div>;
  if (id === 'detent-dial') return <div className="library-extra-detent"><DetentDial label="Listening mode" value={s.detentIndex} onValueChange={detentIndex => onChange({ detentIndex })} options={[{ value: 'quiet', label: 'Quiet' }, { value: 'balanced', label: 'Balanced' }, { value: 'focus', label: 'Focus' }]} /></div>;
  if (id === 'tactile-lever') return <div className="library-extra-lever"><TactileLever label="Gain" value={s.leverValue} onValueChange={leverValue => onChange({ leverValue })} min={0} max={100} step={1} unit="%" accentColor={s.accentColor} accentColorEnd={s.accentColorEnd} accentGradient={s.accentGradient} glowIntensity={s.glowIntensity} glowBlur={s.glowBlur} /></div>;
  if (id === 'financial-chart') return <div className="library-extra-market-chart"><FinancialChart initialPeriod="1D" /></div>;
  if (id === 'market-picker') return <div className="library-extra-market-picker"><MarketPicker /></div>;
  if (id === 'currency-picker') return <div className="library-extra-currency"><CurrencyPicker /></div>;
  if (id === 'financial-order-modal') return <div className="library-extra-order"><FinancialOrderModal material={menuMaterial} /></div>;
  if (id === 'astronomy-instrument') return <div className="library-extra-astronomy"><AstronomyInstrument latitude={-3.7319} longitude={-38.5267} location="Fortaleza" material={s.material} /></div>;
  if (id === 'ephemeris-picker') return <div className="library-extra-ephemeris"><EphemerisPicker material={s.material} /></div>;
  if (id === 'astrology-wheel') return <div className="library-extra-astrology"><AstrologyWheel material={s.material} /></div>;
  if (id === 'race-telemetry') return <div className="library-extra-race"><RaceTelemetry /></div>;
  if (id === 'finance-navigation') return <div className="library-extra-finance-nav"><FinanceNavigation layout="sidebar" /></div>;
  if (id === 'weather-conditions') return <div className="library-extra-weather-conditions"><WeatherConditions material={s.material} /></div>;
  if (id === 'wind-instrument') return <div className="library-extra-wind"><WindInstrument material={s.material} /></div>;
  if (id === 'tide-instrument') return <div className="library-extra-tide"><TideInstrument material={s.material} /></div>;
  if (id === 'lunar-ephemeris') return <div className="library-extra-lunar"><LunarEphemeris material={s.material} /></div>;
  if (id === 'combobox') return <div className="library-extra-combobox"><Combobox material={s.material} /></div>;
  if (id === 'tabs') return (
    <div className="library-extra-tabs">
      <Tabs
        material={s.material}
        items={[
          { value: 'overview', label: 'Overview', content: 'Ambient conditions, coastal wind vector, and barometric pressure updated on a unified monochrome surface.' },
          { value: 'ephemeris', label: 'Ephemeris', badge: 7, content: 'Solar elevation, lunar phase terminator angle, and observatory horizon coordinates ready for external API feeds.' },
          { value: 'tides', label: 'Tides', content: 'Harmonic tidal heights referenced to MLLW with interactive hour inspection.' },
        ]}
      />
    </div>
  );
  if (id === 'data-table') return (
    <div className="library-extra-table">
      <DataTable
        caption="Observatory telemetry"
        material={s.material}
        columns={[
          { key: 'station', label: 'Station', sortable: true },
          { key: 'elevation', label: 'Elev.', align: 'right', numeric: true, sortable: true },
          { key: 'temp', label: 'Temp (°C)', align: 'right', numeric: true, sortable: true },
          { key: 'wind', label: 'Wind (km/h)', align: 'right', numeric: true, sortable: true },
          { key: 'humidity', label: 'Humidity', align: 'right', numeric: true, sortable: true },
          { key: 'pressure', label: 'Pressure', align: 'right', numeric: true, sortable: true },
        ]}
        rows={[
          { station: 'Fortaleza', elevation: '24 m', temp: 27.6, wind: 22.4, humidity: '68%', pressure: '1014 hPa' },
          { station: 'Atacama', elevation: '5058 m', temp: 14.2, wind: 11.8, humidity: '18%', pressure: '1019 hPa' },
          { station: 'Mauna Kea', elevation: '4205 m', temp: 4.5, wind: 31.0, humidity: '24%', pressure: '1022 hPa' },
          { station: 'La Palma', elevation: '2396 m', temp: 16.8, wind: 18.5, humidity: '41%', pressure: '1016 hPa' },
          { station: 'Paranal', elevation: '2635 m', temp: 13.4, wind: 15.2, humidity: '22%', pressure: '1018 hPa' },
          { station: 'Pic du Midi', elevation: '2877 m', temp: 2.8, wind: 26.7, humidity: '52%', pressure: '1020 hPa' },
          { station: 'Sutherland', elevation: '1798 m', temp: 15.9, wind: 19.3, humidity: '34%', pressure: '1017 hPa' },
          { station: 'Haleakala', elevation: '3055 m', temp: 9.6, wind: 24.1, humidity: '39%', pressure: '1021 hPa' },
        ]}
      />
    </div>
  );
  if (id === 'command-palette') return <div className="library-extra-command"><CommandPalette material={s.material} /></div>;
  if (id === 'metric-card') return <div className="library-extra-metric"><MetricCard material={s.material} /></div>;
  return null;
}
