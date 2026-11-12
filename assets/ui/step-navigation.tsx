export interface NavigationStep { id: string; label: string; description?: string }

export function StepNavigation({ steps, currentStep, onStepChange, label = 'Progress' }: {
  steps: NavigationStep[]; currentStep: number; onStepChange: (index: number) => void; label?: string;
}) {
  return <nav className="jh-step-navigation" aria-label={label}>
    {steps.map((step, index) => <button type="button" key={step.id} className="jh-step-navigation__step" data-state={index < currentStep ? 'complete' : index === currentStep ? 'current' : 'upcoming'} aria-current={index === currentStep ? 'step' : undefined} onClick={() => onStepChange(index)}>
      <span className="jh-step-navigation__marker">{index < currentStep ? '✓' : String(index + 1).padStart(2, '0')}</span><span className="jh-step-navigation__copy"><strong>{step.label}</strong>{step.description && <small>{step.description}</small>}</span>
    </button>)}
  </nav>;
}
