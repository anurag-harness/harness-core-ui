import type { IconName } from '@wings-software/uicore'
import type { FormikErrors, FormikProps } from 'formik'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { UseStringsReturn } from 'framework/strings/String'
import type { AbstractStepFactory } from './AbstractStepFactory'
import type { StepType } from '../PipelineSteps/PipelineStepInterface'

export enum StepViewType {
  InputSet = 'InputSet',
  InputVariable = 'InputVariable',
  DeploymentForm = 'DeploymentForm',
  StageVariable = 'StageVariable',
  Edit = 'Edit'
}

export interface InputSetData<T> {
  template?: T
  allValues?: T
  path: string
  readonly?: boolean
}

export type StepFormikRef<T> = Pick<FormikProps<T>, 'submitForm' | 'errors'>

export type StepFormikFowardRef<T = unknown> =
  | ((instance: StepFormikRef<T> | null) => void)
  | React.MutableRefObject<StepFormikRef<T> | null>
  | null

export interface StepProps<T, U = unknown> {
  initialValues: T
  onUpdate?: (data: T) => void
  isNewStep?: boolean
  stepViewType?: StepViewType
  inputSetData?: InputSetData<T>
  factory: AbstractStepFactory
  path: string
  readonly?: boolean
  formikRef?: StepFormikFowardRef<T>
  customStepProps?: U
}

export function setFormikRef<T = unknown, U = unknown>(ref: StepFormikFowardRef<T>, formik: FormikProps<U>): void {
  if (!ref) return

  if (typeof ref === 'function') {
    return
  }

  ref.current = (formik as unknown) as FormikProps<T>
}

export abstract class Step<T> {
  protected abstract type: StepType
  protected abstract defaultValues: T
  protected abstract stepIcon: IconName
  protected abstract stepName: string
  protected _hasStepVariables = false
  protected _hasDelegateSelectionVisible = false
  protected isHarnessSpecific = false
  protected invocationMap?: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  >
  abstract validateInputSet(data: T, template?: T, getString?: UseStringsReturn['getString']): FormikErrors<T>

  protected stepPaletteVisible?: boolean // default to true

  getType(): string {
    return this.type
  }

  getDefaultValues(initialValues: T, _stepViewType: StepViewType): T {
    return { ...this.defaultValues, ...initialValues }
  }

  getIsHarnessSpecific(): boolean {
    return this.isHarnessSpecific
  }

  getIconName(): IconName {
    return this.stepIcon
  }

  getStepName(): string {
    return this.stepName
  }

  getInvocationMap():
    | Map<RegExp, (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>>
    | undefined {
    return this.invocationMap
  }

  getStepPaletteVisibility(): boolean {
    return this.stepPaletteVisible ?? true
  }

  get hasDelegateSelectionVisible(): boolean {
    return this._hasDelegateSelectionVisible
  }

  get hasStepVariables(): boolean {
    return this._hasStepVariables
  }

  abstract renderStep(props: StepProps<T>): JSX.Element
}
