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
import { DetentDial } from '../../../../assets/ui/detent-dial';
import { TactileLever } from '../../../../assets/ui/tactile-lever';
import type { ComponentId, Settings } from './data';
import { dateFromValue, dateToValue } from './extra-data';

export function ExtraPreview({ id, settings: s, onChange, compact }: { id: ComponentId; settings: Settings; onChange: (patch: Partial<Settings>) => void; compact?: boolean }) {
  const inputId = useId();
  const [menuStatus, setMenuStatus] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  if (id === 'bar-slider') return <div className="library-extra-control"><BarSlider label="Intensity" value={s.value} onValueChange={value => onChange({ value })} disabled={s.disabled} /></div>;
  if (id === 'calendar') return <div className="library-extra-calendar"><Calendar mode="single" selected={dateFromValue(s.date)} onSelect={date => onChange({ date: dateToValue(date) })} showOutsideDays={s.showOutsideDays} weekStartsOn={s.mondayFirst ? 1 : 0} /></div>;
  if (id === 'date-picker') return <DatePicker label="Choose a date" value={dateFromValue(s.date)} onChange={date => onChange({ date: dateToValue(date) })} disabled={s.disabled} />;
  if (id === 'menu') return <div className="library-extra-menu"><Menu><MenuTrigger asChild><Button>Options <ChevronDown size={14} aria-hidden="true" /></Button></MenuTrigger><MenuContent align={s.align}><MenuLabel>Workspace</MenuLabel><MenuItem onSelect={() => setMenuStatus('New project selected')}><Plus size={15} aria-hidden="true" />New project</MenuItem><MenuItem onSelect={() => setMenuStatus('Duplicate selected')}><Copy size={15} aria-hidden="true" />Duplicate</MenuItem><MenuItem onSelect={() => setMenuStatus('Archive selected')}><Archive size={15} aria-hidden="true" />Archive</MenuItem></MenuContent></Menu><p role="status">{menuStatus}</p></div>;
  if (id === 'toast') return <><Button size={compact ? 'small' : 'default'} onClick={() => setToastOpen(true)}>Show notification <ArrowUpRight size={14} aria-hidden="true" /></Button><Toast open={toastOpen} onOpenChange={setToastOpen} title={s.title} description={s.description} duration={s.duration} /></>;
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
  if (id === 'scroll-area') return <div className="library-extra-scroll"><ScrollArea label="Recent locations" maxHeight={compact ? 135 : 220}><ul>{['North Shore', 'Stonebridge', 'West Market', 'Lake Road', 'Old Town', 'Harbor Point', 'Pine Terrace', 'South Ridge'].map(place => <li key={place}>{place}</li>)}</ul></ScrollArea></div>;
  if (id === 'context-menu') return <div className="library-extra-context"><ContextMenu actions={[{ label: 'Rename', onSelect: () => setMenuStatus('Rename selected') }, { label: 'Duplicate', onSelect: () => setMenuStatus('Duplicate selected') }, { label: 'Archive', onSelect: () => setMenuStatus('Archive selected') }]} /><span className="library-control-status" role="status">{menuStatus || 'More actions'}</span></div>;
  if (id === 'tactile-key') return <div className="library-extra-key"><TactileKey size={compact ? 'compact' : 'large'} pressed={s.keyPressed} onPressedChange={keyPressed => onChange({ keyPressed })}>{s.keyPressed ? 'Active' : 'Press'}</TactileKey><span className="library-control-status" role="status">{s.keyPressed ? 'Key held' : 'Ready'}</span></div>;
  if (id === 'compass') return <div className="library-extra-compass"><Compass heading={s.compassHeading} onHeadingChange={compassHeading => onChange({ compassHeading })} /></div>;
  if (id === 'spectrum-control') return <div className="library-extra-spectrum"><SpectrumControl hue={s.spectrumHue} saturation={s.spectrumSaturation} lightness={s.spectrumLightness} onHueChange={spectrumHue => onChange({ spectrumHue })} onSaturationChange={spectrumSaturation => onChange({ spectrumSaturation })} onLightnessChange={spectrumLightness => onChange({ spectrumLightness })} /></div>;
  if (id === 'step-navigation') return <div className="library-extra-steps"><StepNavigation currentStep={s.stepIndex} onStepChange={stepIndex => onChange({ stepIndex })} steps={[{ id: 'location', label: 'Location', description: 'Choose a place.' }, { id: 'time', label: 'Time', description: 'Set a moment.' }, { id: 'review', label: 'Review', description: 'Confirm the details.' }]} /><span className="library-control-status" role="status">Step {s.stepIndex + 1} of 3</span></div>;
  if (id === 'date-time-picker') return <div className="library-extra-date-time"><DateTimePicker value={s.dateTime ? new Date(s.dateTime) : undefined} onChange={date => onChange({ dateTime: date?.toISOString() ?? '' })} /></div>;
  if (id === 'audio-meter') return <div className="library-extra-audio"><AudioMeter label="Audio level" orientation={s.audioOrientation} barCount={compact ? 24 : 36} /></div>;
  if (id === 'weather-instrument') return <div className="library-extra-weather"><WeatherInstrument temperature={s.weatherTemperature} windSpeed={s.weatherWindSpeed} windDirection={s.weatherWindDirection} humidity={s.weatherHumidity} pressure={s.weatherPressure} /></div>;
  if (id === 'attitude-indicator') return <div className="library-extra-attitude"><AttitudeIndicator pitch={s.attitudePitch} roll={s.attitudeRoll} /></div>;
  if (id === 'navigation-instrument') return <div className="library-extra-navigation"><NavigationInstrument mode={s.navigationMode} heading={s.navigationHeading} speed={s.navigationSpeed} auxiliary={s.navigationAuxiliary} /></div>;
  if (id === 'progress-bar') return <div className="library-extra-progress"><div><span>Upload progress</span><output>{s.progressValue}%</output></div><ProgressBar label="Upload progress" value={s.progressValue} max={100} /></div>;
  if (id === 'file-transfer') return <div className="library-extra-transfer"><FileTransfer /></div>;
  if (id === 'image-frame') return <div className="library-extra-image"><ImageFrame src={s.imageSrc || undefined} alt={s.imageAlt || 'Image preview'} caption={compact ? undefined : s.imageCaption}><div className="library-image-art"><span /></div></ImageFrame></div>;
  if (id === 'accordion') return <div className="library-extra-accordion"><Accordion key={s.accordionOpen ? 'open' : 'closed'} label="Configuration details" type="single" defaultValue={s.accordionOpen ? 'layout' : undefined} items={[{ value: 'layout', title: 'Spacing and layout', content: 'A measured grid keeps each control in reach.' }, { value: 'materials', title: 'Light glass surfaces', content: 'Soft reflections and clear values keep the panel readable.' }]} /></div>;
  if (id === 'detent-dial') return <div className="library-extra-detent"><DetentDial label="Listening mode" value={s.detentIndex} onValueChange={detentIndex => onChange({ detentIndex })} options={[{ value: 'quiet', label: 'Quiet' }, { value: 'balanced', label: 'Balanced' }, { value: 'focus', label: 'Focus' }]} /></div>;
  if (id === 'tactile-lever') return <div className="library-extra-lever"><TactileLever label="Gain" value={s.leverValue} onValueChange={leverValue => onChange({ leverValue })} min={0} max={100} step={1} unit="%" /></div>;
  return null;
}
