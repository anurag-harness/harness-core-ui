/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { InputSetViewValidateFieldsConfig, SecurityStepData, SecurityStepSpec } from './types'
import type { SecurityFieldProps } from './SecurityField'

type getStringProp = UseStringsReturn['getString']

export const dividerBottomMargin = 'var(--spacing-6)'

export const ORCHESTRATION_SCAN_MODE = {
  value: 'orchestration',
  label: 'Orchestration'
}
export const EXTRACTION_SCAN_MODE = {
  value: 'extraction',
  label: 'Extraction'
}
export const INGESTION_SCAN_MODE = {
  value: 'ingestion',
  label: 'Ingestion'
}
export const REPOSITORY_TARGET_TYPE = {
  value: 'repository',
  label: 'Repository'
}
export const CONTAINER_TARGET_TYPE = {
  value: 'container',
  label: 'Container Image'
}
export const INSTANCE_TARGET_TYPE = {
  value: 'instance',
  label: 'Instance'
}
export const CONFIGURATION_TARGET_TYPE = {
  value: 'configuration',
  label: 'Configuration'
}
export const LOCAL_IMAGE_CONTAINER_TYPE = {
  value: 'local_image',
  label: 'Local Image'
}
export const DOCKER_V2_CONTAINER_TYPE = {
  value: 'docker_v2',
  label: 'Docker v2'
}
export const JFROG_ARTIFACTORY_CONTAINER_TYPE = {
  value: 'jfrog_artifactory',
  label: 'Jfrog Artifactory'
}
export const AWS_ECR_CONTAINER_TYPE = {
  value: 'aws_ecr',
  label: 'AWS ECR'
}

export const API_KEY_AUTH_TYPE = {
  value: 'apiKey',
  label: 'API Key'
}
export const USER_PASSWORD_AUTH_TYPE = {
  value: 'usernamePassword',
  label: 'Username & Password'
}

export const API_VERSION_5_0_2 = {
  value: '5.0.2',
  label: '5.0.2'
}
export const API_VERSION_4_1_0 = {
  value: '4.1.0',
  label: '4.1.0'
}

export const API_VERSION_4_2_0 = {
  value: '4.2.0',
  label: '4.2.0'
}

export const CUSTOM_INGEST_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}

export const CUSTOM_INGEST_SARIF_CONFIG = {
  value: 'sarif',
  label: 'SARIF'
}

export const ZAP_STANDARD_CONFIG = {
  value: 'standard',
  label: 'Standard'
}
export const ZAP_ATTACK_CONFIG = {
  value: 'attack',
  label: 'Attack'
}
export const ZAP_QUICK_CONFIG = {
  value: 'quick',
  label: 'Quick'
}
export const ZAP_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}

export const NIKTO_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}

export const NMAP_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}
export const NMAP_FIREWALL_BYPASS_CONFIG = {
  value: 'firewall-bypass',
  label: 'Firewall Bypass'
}
export const NMAP_UNUSUAL_PORT_CONFIG = {
  value: 'unusual-port',
  label: 'Unusual Port'
}
export const NMAP_SMB_SECURITY_MODE_CONFIG = {
  value: 'smb-security-mode',
  label: 'SMB Security Mode'
}
export const NMAP_VULN_CONFIG = {
  value: 'vuln',
  label: 'Vuln'
}
export const NMAP_EXPLOIT_CONFIG = {
  value: 'exploit',
  label: 'Exploit'
}

export const NMAP_NO_DEFAULT_CLI_FLAGS = {
  value: 'no-default-cli-flags',
  label: 'No Default CLI Flags'
}

export const PROWLER_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}
export const PROWLER_HIPAA_CONFIG = {
  value: 'hipaa',
  label: 'Hipaa'
}
export const PROWLER_GDPR_CONFIG = {
  value: 'gdpr',
  label: 'GDPR'
}
export const PROWLER_EXCLUDE_EXTRAS_CONFIG = {
  value: 'exclude_extras',
  label: 'Exclude Extras'
}

export const METASPLOIT_DEFAULT_CONFIG = {
  value: 'default',
  label: 'Default'
}

export const METASPLOIT_WEAK_SSH_CONFIG = {
  value: 'metasploit-weak-ssh',
  label: 'Weak SSH'
}
export const METASPLOIT_OPEN_SSL_HEARTBLEED_CONFIG = {
  value: 'metasploit-openssl-heartbleed',
  label: 'Open SSL Heartbleed'
}
export const METASPLOIT_DYNAMIC_BY_CVE_CONFIG = {
  value: 'dynamic-by-cve',
  label: 'Dynamic by CVE'
}
export const AWS_ACCOUNT_AUTH_TYPE = { value: 'aws', label: 'AWS Account' }

export const SBOM_SPDX = { value: 'spdx-json', label: 'SPDX' }
export const SBOM_CYCLONEDX = { value: 'cyclonedx-json', label: 'CycloneDX' }

export const instanceProtocolSelectItems = [
  {
    value: 'https',
    label: 'https'
  },
  {
    value: 'http',
    label: 'http'
  }
]

export const logLevelOptions = (getString: getStringProp) => [
  {
    label: getString('sto.stepField.optionLabels.logLevel.debug'),
    value: 'debug'
  },
  {
    label: getString('sto.Info'),
    value: 'info'
  },
  {
    label: getString('common.warning'),
    value: 'warning'
  },
  {
    label: getString('error'),
    value: 'error'
  }
]

export const severityOptions = (getString: getStringProp) => [
  {
    label: getString('sto.Critical'),
    value: 'critical'
  },
  {
    label: getString('platform.connectors.cdng.verificationSensitivityLabel.high'),
    value: 'high'
  },
  {
    label: getString('platform.connectors.cdng.verificationSensitivityLabel.medium'),
    value: 'medium'
  },
  {
    label: getString('platform.connectors.cdng.verificationSensitivityLabel.low'),
    value: 'low'
  },
  {
    label: getString('none'),
    value: 'none'
  }
]

export const specPrivileged = 'spec.privileged'
export const specSettings = 'spec.settings'
export const specRunAsUser = 'spec.runAsUser'

export const authFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.access_token',
          type: TransformValuesTypes.Text
        }
      ]
    : []

export const commonFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) => {
  const transformValuesFieldsConfigValues = [
    {
      name: 'identifier',
      type: TransformValuesTypes.Text
    },
    {
      name: 'name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'description',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.mode',
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.config',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.type',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.target.variant',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.level',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.log.serializer',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.fail_on_severity',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.advanced.include_raw',
      type: TransformValuesTypes.Text
    },
    {
      name: specSettings,
      type: TransformValuesTypes.Map
    },
    {
      name: 'spec.limitMemory',
      type: TransformValuesTypes.LimitMemory
    },
    {
      name: 'spec.limitCPU',
      type: TransformValuesTypes.LimitCPU
    },
    {
      name: 'timeout',
      type: TransformValuesTypes.Text
    },
    {
      name: specPrivileged,
      type: TransformValuesTypes.Boolean
    },
    {
      name: specRunAsUser,
      type: TransformValuesTypes.Boolean
    },
    {
      name: 'spec.imagePullPolicy',
      type: TransformValuesTypes.ImagePullPolicy
    }
  ]

  if (
    data.spec.target.type === 'container' &&
    data.spec.image?.type === 'aws_ecr' &&
    data.spec.mode === 'orchestration'
  ) {
    transformValuesFieldsConfigValues.push({
      name: 'spec.image.region',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.target.type === 'container' && data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push(
      {
        name: 'spec.image.type',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.name',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.domain',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.access_id',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.access_token',
        type: TransformValuesTypes.Text
      },
      {
        name: 'spec.image.tag',
        type: TransformValuesTypes.Text
      }
    )
  }

  if (data.spec.mode === 'ingestion') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.ingestion.file',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.mode !== 'ingestion') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.advanced.args.cli',
      type: TransformValuesTypes.Text
    })
  }

  if (data.spec.mode === 'orchestration') {
    transformValuesFieldsConfigValues.push({
      name: 'spec.target.workspace',
      type: TransformValuesTypes.Text
    })
  }

  return transformValuesFieldsConfigValues
}

export const instanceFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) =>
  data.spec.mode === 'orchestration'
    ? [
        {
          name: 'spec.instance.domain',
          type: TransformValuesTypes.Text,
          label: 'platform.secrets.winRmAuthFormFields.domain'
        },
        {
          name: 'spec.instance.protocol',
          type: TransformValuesTypes.Text,
          label: 'ce.common.protocol'
        },
        {
          name: 'spec.instance.port',
          type: TransformValuesTypes.Numeric,
          label: 'common.smtp.port'
        },
        {
          name: 'spec.instance.path',
          type: TransformValuesTypes.Text,
          label: 'common.path'
        }
      ]
    : []

export const authFieldsValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.auth.access_token',
    type: ValidationFieldTypes.Text,
    label: 'common.getStarted.accessTokenLabel',
    isRequired: stepViewType === StepViewType.InputSet || data.spec.mode !== 'ingestion'
  }
]

export const ingestionFieldValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.ingestion.file',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.ingestion.file',
    isRequired: stepViewType === StepViewType.InputSet || data.spec.mode === 'ingestion'
  }
]

export const imageFieldsValidationConfig = (
  data: SecurityStepData<SecurityStepSpec>,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.image.type',
    type: ValidationFieldTypes.Text,
    label: 'typeLabel',
    isRequired:
      stepViewType === StepViewType.InputSet ||
      (data.spec.target?.type === 'container' && data.spec.mode === 'orchestration')
  },
  {
    name: 'spec.image.name',
    type: ValidationFieldTypes.Text,
    label: 'imageNameLabel',
    isRequired:
      stepViewType === StepViewType.InputSet ||
      (data.spec.target?.type === 'container' && data.spec.mode === 'orchestration')
  },
  {
    name: 'spec.image.domain',
    type: ValidationFieldTypes.Text,
    label: 'platform.secrets.winRmAuthFormFields.domain'
  },
  {
    name: 'spec.image.access_token',
    type: ValidationFieldTypes.Text,
    label: 'common.getStarted.accessTokenLabel'
  },
  {
    name: 'spec.image.region',
    type: ValidationFieldTypes.Text,
    label: 'regionLabel',
    isRequired: stepViewType === StepViewType.InputSet || data.spec.image?.type === 'aws_ecr'
  },
  {
    name: 'spec.image.access_id',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.authAccessId'
  },
  {
    name: 'spec.image.tag',
    type: ValidationFieldTypes.Text,
    label: 'tagLabel',
    isRequired:
      stepViewType === StepViewType.InputSet ||
      (data.spec.target?.type === 'container' && data.spec.mode === 'orchestration')
  }
]

export const instanceFieldsValidationConfig = (data: SecurityStepData<SecurityStepSpec>, stepViewType?: StepViewType) =>
  data.spec.mode === 'orchestration' || stepViewType === StepViewType.InputSet
    ? ([
        {
          name: 'spec.instance.domain',
          type: ValidationFieldTypes.Text,
          label: 'platform.secrets.winRmAuthFormFields.domain',
          isRequired: true
        },
        {
          name: 'spec.instance.protocol',
          type: ValidationFieldTypes.Text,
          label: 'ce.common.protocol',
          isRequired: true
        },
        {
          name: 'spec.instance.port',
          type: ValidationFieldTypes.Numeric,
          label: 'common.smtp.port'
        },
        {
          name: 'spec.instance.path',
          type: ValidationFieldTypes.Text,
          label: 'common.path'
        }
      ] as InputSetViewValidateFieldsConfig[])
    : []

export const commonFieldsValidationConfig: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.mode',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.mode',
    isRequired: true
  },
  {
    name: 'spec.config',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.config',
    isRequired: true
  },
  {
    name: 'spec.target.name',
    type: ValidationFieldTypes.Text,
    label: 'name',
    isRequired: true
  },
  {
    name: 'spec.target.type',
    type: ValidationFieldTypes.Text,
    label: 'typeLabel',
    isRequired: true
  },
  {
    name: 'spec.target.variant',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.target.variant',
    isRequired: true
  },
  {
    name: 'spec.target.workspace',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.workspace'
  },
  {
    name: 'spec.advanced.log.level',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.logLevel'
  },
  {
    name: 'spec.advanced.log.serializer',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.serializer'
  },
  {
    name: 'spec.advanced.args.cli',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.cli'
  },
  {
    name: 'spec.advanced.fail_on_severity',
    type: ValidationFieldTypes.Text,
    label: 'sto.stepField.advanced.failOnSeverity'
  },
  {
    name: 'spec.advanced.include_raw',
    type: ValidationFieldTypes.Boolean,
    label: 'sto.stepField.advanced.includeRaw'
  },
  {
    name: specSettings,
    type: ValidationFieldTypes.Map
  },
  {
    name: specRunAsUser,
    type: ValidationFieldTypes.Numeric
  },
  {
    name: specPrivileged,
    type: ValidationFieldTypes.Boolean,
    label: 'pipeline.buildInfra.privileged'
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  },
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export const additionalFieldsValidationConfigEitView = [
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  }
]

export const additionalFieldsValidationConfigInputSet: InputSetViewValidateFieldsConfig[] = [
  {
    name: 'spec.resources.limits.memory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.resources.limits.cpu',
    type: ValidationFieldTypes.LimitCPU
  }
]

export function getInputSetFieldName(prefix: string, field: string): string {
  return `${prefix}${field}`
}

export const inputSetScanFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        ...(shouldRenderRunTimeInputView(template?.spec.mode) && {
          [getInputSetFieldName(prefix, 'spec.mode')]: {
            label: 'sto.stepField.mode',
            tooltipId: tooltipIds.mode
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.config) && {
          [getInputSetFieldName(prefix, 'spec.config')]: {
            label: 'sto.stepField.config',
            tooltipId: tooltipIds.config
          }
        })
      }
    : {}

export const inputSetTargetFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Target fields
        ...(shouldRenderRunTimeInputView(template?.spec.target?.name) && {
          [getInputSetFieldName(prefix, 'spec.target.name')]: {
            label: 'name',
            tooltipId: tooltipIds.targetName
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.target?.type) && {
          [getInputSetFieldName(prefix, 'spec.target.type')]: {
            label: 'typeLabel',
            tooltipId: tooltipIds.targetType
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.target?.variant) && {
          [getInputSetFieldName(prefix, 'spec.target.variant')]: {
            label: 'sto.stepField.target.variant',
            tooltipId: tooltipIds.targetVariant
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.target?.workspace) && {
          [getInputSetFieldName(prefix, 'spec.target.workspace')]: {
            label: 'pipelineSteps.workspace',
            tooltipId: tooltipIds.targetWorkspace
          }
        })
      }
    : {}

export const inputSetIngestionFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Ingestion fields
        ...(shouldRenderRunTimeInputView(template?.spec.ingestion?.file) && {
          [getInputSetFieldName(prefix, 'spec.ingestion.file')]: {
            label: 'sto.stepField.ingestion.file',
            tooltipId: tooltipIds.ingestionFile
          }
        })
      }
    : {}

export const inputSetImageFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Image fields
        ...(shouldRenderRunTimeInputView(template?.spec.image?.name) && {
          [getInputSetFieldName(prefix, 'spec.image.name')]: {
            label: 'imageNameLabel',
            tooltipId: tooltipIds.imageName
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.domain) && {
          [getInputSetFieldName(prefix, 'spec.image.domain')]: {
            label: 'platform.secrets.winRmAuthFormFields.domain',
            tooltipId: tooltipIds.imageDomain,
            optional: true
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.access_token) && {
          [getInputSetFieldName(prefix, 'spec.image.access_token')]: {
            label: 'common.getStarted.accessTokenLabel',
            tooltipId: tooltipIds.imageAccessToken
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.access_id) && {
          [getInputSetFieldName(prefix, 'spec.image.access_id')]: {
            label: 'sto.stepField.authAccessId',
            tooltipId: tooltipIds.imageAccessId
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.region) && {
          [getInputSetFieldName(prefix, 'spec.image.region')]: {
            label: 'regionLabel',
            tooltipId: tooltipIds.imageRegion
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.type) && {
          [getInputSetFieldName(prefix, 'spec.image.type')]: {
            label: 'typeLabel',
            tooltipId: tooltipIds.imageType
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.image?.tag) && {
          [getInputSetFieldName(prefix, 'spec.image.tag')]: {
            label: 'tagLabel',
            tooltipId: tooltipIds.imageTag
          }
        })
      }
    : {}

export const inputSetInstanceFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Instance fields
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.domain) && {
          [getInputSetFieldName(prefix, 'spec.instance.domain')]: {
            label: 'platform.secrets.winRmAuthFormFields.domain',
            tooltipId: tooltipIds.instanceDomain
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.protocol) && {
          [getInputSetFieldName(prefix, 'spec.instance.protocol')]: {
            label: 'ce.common.protocol',
            tooltipId: tooltipIds.instanceProtocol,
            selectItems: instanceProtocolSelectItems,
            fieldType: 'dropdown'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.port) && {
          [getInputSetFieldName(prefix, 'spec.instance.port')]: {
            label: 'common.smtp.port',
            tooltipId: tooltipIds.instancePort,
            optional: true
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.path) && {
          [getInputSetFieldName(prefix, 'spec.instance.path')]: {
            label: 'common.path',
            tooltipId: tooltipIds.instancePath,
            optional: true
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.username) && {
          [getInputSetFieldName(prefix, 'spec.instance.username')]: {
            label: 'username',
            tooltipId: tooltipIds.instanceUsername,
            optional: true
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.instance?.password) && {
          [getInputSetFieldName(prefix, 'spec.instance.password')]: {
            label: 'password',
            tooltipId: tooltipIds.instancePassword,
            optional: true
          }
        })
      }
    : {}

export const inputSetToolFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Tool fields
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_key) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_key')]: {
            label: 'sto.stepField.tool.projectKey',
            tooltipId: tooltipIds.toolProjectKey
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.include) && {
          [getInputSetFieldName(prefix, 'spec.tool.include')]: {
            label: 'sto.stepField.toolInclude',
            tooltipId: tooltipIds.toolInclude
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.java?.libraries) && {
          [getInputSetFieldName(prefix, 'spec.tool.java.libraries')]: {
            label: 'sto.stepField.tool.javaLibraries',
            tooltipId: tooltipIds.toolJavaLibraries
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.java?.binaries) && {
          [getInputSetFieldName(prefix, 'spec.tool.java.binaries')]: {
            label: 'sto.stepField.tool.javaBinaries',
            tooltipId: tooltipIds.toolJavaBinaries
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.context) && {
          [getInputSetFieldName(prefix, 'spec.tool.context')]: {
            label: 'sto.stepField.tool.context',
            tooltipId: tooltipIds.toolContext
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.port) && {
          [getInputSetFieldName(prefix, 'spec.tool.port')]: {
            label: 'common.smtp.port',
            tooltipId: tooltipIds.toolPort
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.image_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.image_name')]: {
            label: 'imageNameLabel',
            tooltipId: tooltipIds.toolImageName
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_name')]: {
            label: 'projectCard.projectName',
            tooltipId: tooltipIds.toolProjectName
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_version) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_version')]: {
            label: 'sto.stepField.tool.projectVersion',
            tooltipId: tooltipIds.toolProjectVersion
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.team_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.team_name')]: {
            label: 'sto.stepField.tool.teamName',
            tooltipId: tooltipIds.toolTeamName
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.product_token) && {
          [getInputSetFieldName(prefix, 'spec.tool.product_token')]: {
            label: 'sto.stepField.tool.productToken',
            tooltipId: tooltipIds.toolProductToken
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.product_name) && {
          [getInputSetFieldName(prefix, 'spec.tool.product_name')]: {
            label: 'name',
            tooltipId: tooltipIds.toolProductName
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.project_token) && {
          [getInputSetFieldName(prefix, 'spec.tool.project_token')]: {
            label: 'sto.stepField.tool.projectToken',
            tooltipId: tooltipIds.toolProjectToken
          }
        }),
        // TODO get feedback on multiple having multiple ways to extract burp data
        // ...(shouldRenderRunTimeInputView(template?.spec.tool?.scan_id) && {
        //   [getInputSetFieldName(prefix, 'spec.tool.scan_id')]: {
        //     label: 'sto.stepField.tool.scanId',
        //     tooltipId: tooltipIds.toolScanId
        //   }
        // }),
        ...(shouldRenderRunTimeInputView(template?.spec.tool?.site_id) && {
          [getInputSetFieldName(prefix, 'spec.tool.site_id')]: {
            label: 'sto.stepField.tool.siteId',
            tooltipId: tooltipIds.toolSiteId
          }
        })
      }
    : {}

export const inputSetAuthFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Auth fields
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.access_token) && {
          [getInputSetFieldName(prefix, 'spec.auth.access_token')]: {
            label: 'common.getStarted.accessTokenLabel',
            tooltipId: tooltipIds.authAccessToken
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.domain) && {
          [getInputSetFieldName(prefix, 'spec.auth.domain')]: {
            label: 'platform.secrets.winRmAuthFormFields.domain',
            tooltipId: tooltipIds.authDomain
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.access_id) && {
          [getInputSetFieldName(prefix, 'spec.auth.access_id')]: {
            label: 'sto.stepField.authAccessId',
            tooltipId: tooltipIds.authAccessId
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.region) && {
          [getInputSetFieldName(prefix, 'spec.auth.region')]: {
            label: 'sto.stepField.authRegion',
            tooltipId: tooltipIds.authAccessRegion
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.type) && {
          [getInputSetFieldName(prefix, 'spec.auth.type')]: {
            label: 'typeLabel',
            tooltipId: tooltipIds.authType
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.version) && {
          [getInputSetFieldName(prefix, 'spec.auth.version')]: {
            label: 'sto.stepField.authVersion',
            tooltipId: tooltipIds.authVersion
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.auth?.ssl) && {
          [getInputSetFieldName(prefix, 'spec.auth.ssl')]: {
            label: 'sto.stepField.authSsl',
            fieldType: 'checkbox',
            tooltipId: tooltipIds.authSSL
          }
        })
      }
    : {}

export const inputSetAdvancedFields = (
  getString: getStringProp,
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Advanced fields
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.log?.level) && {
          [getInputSetFieldName(prefix, 'spec.advanced.log.level')]: {
            label: 'sto.stepField.advanced.logLevel',
            fieldType: 'dropdown',
            selectItems: logLevelOptions(getString),
            tooltipId: tooltipIds.logLevel
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.log?.serializer) && {
          [getInputSetFieldName(prefix, 'spec.advanced.log.serializer')]: {
            label: 'ce.common.protocol',
            tooltipId: tooltipIds.logSerializer
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.args?.cli) && {
          [getInputSetFieldName(prefix, 'spec.advanced.args.cli')]: {
            label: 'sto.stepField.advanced.cli',
            tooltipId: tooltipIds.argsCli
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.fail_on_severity) && {
          [getInputSetFieldName(prefix, 'spec.advanced.fail_on_severity')]: {
            label: 'sto.stepField.advanced.failOnSeverity',
            selectItems: severityOptions(getString),
            fieldType: 'dropdown',
            tooltipId: tooltipIds.failOnSeverity
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.advanced?.include_raw) && {
          [getInputSetFieldName(prefix, 'spec.advanced.include_raw')]: {
            label: 'sto.stepField.advanced.includeRaw',
            tooltipId: tooltipIds.includeRaw
          }
        })
      }
    : {}

const tooltipPrefix = 'securityStep'
function getTooltipName(tooltipName: string) {
  return `${tooltipPrefix}${tooltipName}`
}

export const sbomFieldsTransformConfig = (data: SecurityStepData<SecurityStepSpec>) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.sbom.generate',
          type: TransformValuesTypes.Boolean,
          label: 'ssca.orchestrationStep.sbomGeneration'
        },
        {
          name: 'spec.sbom.format',
          type: TransformValuesTypes.Text,
          label: 'ssca.orchestrationStep.sbomFormat'
        }
      ]
    : []

export const sbomFieldValidationConfig = (): InputSetViewValidateFieldsConfig[] => [
  {
    name: 'spec.sbom.generate',
    type: ValidationFieldTypes.Boolean,
    label: 'ssca.orchestrationStep.sbomGeneration'
  },
  {
    name: 'spec.sbom.format',
    type: ValidationFieldTypes.Text,
    label: 'ssca.orchestrationStep.sbomFormat'
  }
]

export const inputSetSbomFields = (
  prefix: string,
  template?: SecurityStepData<SecurityStepSpec>
): SecurityFieldProps<SecurityStepSpec>['enableFields'] =>
  template?.spec
    ? {
        // Instance fields
        ...(shouldRenderRunTimeInputView(template?.spec.sbom?.generate) && {
          [getInputSetFieldName(prefix, 'spec.sbom.generate')]: {
            label: 'ssca.orchestrationStep.sbomGeneration',
            fieldType: 'checkbox'
          }
        }),
        ...(shouldRenderRunTimeInputView(template?.spec.sbom?.format) && {
          [getInputSetFieldName(prefix, 'spec.sbom.format')]: {
            label: 'ssca.orchestrationStep.sbomFormat',
            selectItems: [SBOM_SPDX, SBOM_CYCLONEDX],
            fieldType: 'dropdown'
          }
        })
      }
    : {}

export const tooltipIds = {
  mode: getTooltipName('Mode'),
  config: getTooltipName('Config'),
  targetType: getTooltipName('TargetType'),
  targetName: getTooltipName('TargetName'),
  targetVariant: getTooltipName('TargetVariant'),
  targetWorkspace: getTooltipName('TargetWorkspace'),
  ingestionFile: getTooltipName('IngestionFile'),
  logLevel: getTooltipName('LogLevel'),
  logSerializer: getTooltipName('LogSerializer'),
  argsCli: getTooltipName('ArgsCli'),
  failOnSeverity: getTooltipName('FailOnSeverity'),
  includeRaw: getTooltipName('IncludeRaw'),
  authDomain: getTooltipName('AuthDomain'),
  authSSL: getTooltipName('AuthSSL'),
  authVersion: getTooltipName('AuthVersion'),
  authType: getTooltipName('AuthType'),
  authAccessId: getTooltipName('AuthAccessId'),
  authAccessToken: getTooltipName('AuthAccessToken'),
  authAccessRegion: getTooltipName('AuthAccessRegion'),
  imageType: getTooltipName('ImageType'),
  imageDomain: getTooltipName('ImageDomain'),
  imageName: getTooltipName('ImageName'),
  imageTag: getTooltipName('ImageTag'),
  imageAccessId: getTooltipName('ImageAccessId'),
  imageAccessToken: getTooltipName('ImageAccessToken'),
  imageRegion: getTooltipName('ImageRegion'),
  instanceDomain: getTooltipName('InstanceDomain'),
  instanceProtocol: getTooltipName('InstanceProtocol'),
  instancePort: getTooltipName('InstancePort'),
  instancePath: getTooltipName('InstancePath'),
  instanceUsername: getTooltipName('InstanceUsername'),
  instancePassword: getTooltipName('InstancePassword'),
  toolContext: getTooltipName('ToolContext'),
  toolPort: getTooltipName('ToolPort'),
  toolInclude: getTooltipName('ToolInclude'),
  toolJavaLibraries: getTooltipName('ToolJavaLibraries'),
  toolJavaBinaries: getTooltipName('ToolJavaBinaries'),
  toolImageName: getTooltipName('ToolImageName'),
  toolProductLookupType: getTooltipName('ToolProductLookupType'),
  toolProductName: getTooltipName('ToolProductName'),
  toolProductToken: getTooltipName('ToolProductToken'),
  toolProjectName: getTooltipName('ToolProjectName'),
  toolProjectToken: getTooltipName('ToolProjectToken'),
  toolProjectVersion: getTooltipName('ToolProjectVersion'),
  toolExclude: getTooltipName('ToolExclude'),
  toolTeamName: getTooltipName('ToolTeamName'),
  toolProjectKey: getTooltipName('ToolProjectKey'),
  toolScanId: getTooltipName('ToolScanId'),
  toolSiteId: getTooltipName('ToolSiteId')
}

export function getCustomTooltipPrefix(step: StepType): StepType {
  return StepType[step as keyof typeof StepType]
}
