import type { IOptionProps } from '@blueprintjs/core'
import type { SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import {
  SLOForm,
  PeriodTypes,
  SLITypes,
  SLIMetricTypes,
  Comparators,
  SLOFormFields,
  CreateSLOTabs,
  SLIMissingDataTypes,
  PeriodLengthTypes,
  SLIEventTypes
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'

export const TabsOrder = [CreateSLOTabs.NAME, CreateSLOTabs.SLI, CreateSLOTabs.SLO_TARGET_BUDGET_POLICY]

export const initialValuesSLO: SLOForm = {
  [SLOFormFields.NAME]: '',
  [SLOFormFields.IDENTIFIER]: '',
  [SLOFormFields.USER_JOURNEY_REF]: '',
  [SLOFormFields.MONITORED_SERVICE_REF]: '',
  [SLOFormFields.HEALTH_SOURCE_REF]: '',
  [SLOFormFields.SLI_TYPE]: SLITypes.LATENCY,
  [SLOFormFields.SLI_METRIC_TYPE]: SLIMetricTypes.RATIO,
  [SLOFormFields.VALID_REQUEST_METRIC]: '',
  [SLOFormFields.SLI_MISSING_DATA_TYPE]: SLIMissingDataTypes.GOOD,
  [SLOFormFields.PERIOD_TYPE]: PeriodTypes.ROLLING,
  [SLOFormFields.SLO_TARGET_PERCENTAGE]: 0
}

export const comparatorOptions: SelectOption[] = [
  {
    label: Comparators.LESS,
    value: Comparators.LESS
  },
  {
    label: Comparators.GREATER,
    value: Comparators.GREATER
  },
  {
    label: Comparators.LESS_EQUAL,
    value: Comparators.LESS_EQUAL
  },
  {
    label: Comparators.GREATER_EQUAL,
    value: Comparators.GREATER_EQUAL
  }
]

export const defaultOption: SelectOption = {
  label: '',
  value: ''
}

export const getSLITypeOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.type.availability'), value: SLITypes.AVAILABILITY },
    { label: getString('cv.slos.slis.type.latency'), value: SLITypes.LATENCY }
  ]
}

// PickMetric

export const getSLIMetricOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.metricOptions.thresholdBased'), value: SLIMetricTypes.THRESHOLD },
    { label: getString('cv.slos.slis.metricOptions.ratioBased'), value: SLIMetricTypes.RATIO }
  ]
}

export const getEventTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.good'), value: SLIEventTypes.GOOD },
    { label: getString('cv.bad'), value: SLIEventTypes.BAD }
  ]
}

export const getMissingDataTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.good'), value: SLIMissingDataTypes.GOOD },
    { label: getString('cv.bad'), value: SLIMissingDataTypes.BAD },
    { label: getString('cv.ignore'), value: SLIMissingDataTypes.IGNORE }
  ]
}

export const getSLOFormValidationSchema = (getString: UseStringsReturn['getString']): any => {
  const REQUIRED = getString('cv.required')
  const METRIC_IS_REQUIRED = getString('cv.metricIsRequired')

  return Yup.object().shape({
    [SLOFormFields.NAME]: Yup.string().required(getString('cv.slos.validations.nameValidation')),
    [SLOFormFields.USER_JOURNEY_REF]: Yup.string().required(getString('cv.slos.validations.userJourneyRequired')),
    [SLOFormFields.MONITORED_SERVICE_REF]: Yup.string()
      .nullable()
      .required(getString('connectors.cdng.validations.monitoringServiceRequired')),
    [SLOFormFields.HEALTH_SOURCE_REF]: Yup.string()
      .nullable()
      .required(getString('cv.slos.validations.healthSourceRequired')),
    [SLOFormFields.EVENT_TYPE]: Yup.string().when(SLOFormFields.SLI_METRIC_TYPE, {
      is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
      then: Yup.string().nullable().required(REQUIRED)
    }),
    [SLOFormFields.GOOD_REQUEST_METRIC]: Yup.string().when(SLOFormFields.SLI_METRIC_TYPE, {
      is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
      then: Yup.string().nullable().required(METRIC_IS_REQUIRED)
    }),
    [SLOFormFields.VALID_REQUEST_METRIC]: Yup.string()
      .nullable()
      .required(METRIC_IS_REQUIRED)
      .test(
        'bothMetricsShouldBeDifferent',
        getString('cv.metricForGoodAndValidRequestsShouldBeDifferent'),
        function (validRequestMetric) {
          return validRequestMetric && this.parent.SLIMetricType === SLIMetricTypes.RATIO
            ? validRequestMetric !== this.parent.goodRequestMetric
            : true
        }
      ),
    [SLOFormFields.OBJECTIVE_VALUE]: Yup.number()
      .typeError(getString('common.validation.valueMustBeANumber'))
      .min(0, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 0 }))
      .when([SLOFormFields.SLI_METRIC_TYPE], {
        is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
        then: Yup.number().max(100, getString('common.validation.valueMustBeLessThanOrEqualToN', { n: 100 }))
      })
      .required(REQUIRED),
    [SLOFormFields.OBJECTIVE_COMPARATOR]: Yup.string().required(REQUIRED),
    [SLOFormFields.SLI_MISSING_DATA_TYPE]: Yup.string().required('SLI Missing data type is required'),
    [SLOFormFields.PERIOD_LENGTH]: Yup.string().when([SLOFormFields.PERIOD_TYPE], {
      is: periodType => periodType === PeriodTypes.ROLLING,
      then: Yup.string().nullable().required(getString('cv.periodLengthIsRequired'))
    }),
    [SLOFormFields.PERIOD_LENGTH_TYPE]: Yup.string().when([SLOFormFields.PERIOD_TYPE], {
      is: periodType => periodType === PeriodTypes.CALENDAR,
      then: Yup.string().nullable().required(getString('cv.periodLengthIsRequired'))
    }),
    [SLOFormFields.DAY_OF_WEEK]: Yup.string().when([SLOFormFields.PERIOD_LENGTH_TYPE], {
      is: periodLengthType => periodLengthType === PeriodLengthTypes.WEEKLY,
      then: Yup.string().nullable().required(getString('cv.windowsEndIsRequired'))
    }),
    [SLOFormFields.DAY_OF_MONTH]: Yup.string().when([SLOFormFields.PERIOD_LENGTH_TYPE], {
      is: periodLengthType => periodLengthType === PeriodLengthTypes.MONTHLY,
      then: Yup.string().nullable().required(getString('cv.windowsEndIsRequired'))
    }),
    [SLOFormFields.SLO_TARGET_PERCENTAGE]: Yup.number()
      .typeError(getString('common.validation.valueMustBeANumber'))
      .min(0, getString('common.validation.valueMustBeGreaterThanOrEqualToN', { n: 0 }))
      .max(100, getString('common.validation.valueMustBeLessThanOrEqualToN', { n: 100 }))
      .required(REQUIRED)
  })
}
