import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'

export const dependentFlagsMock = [
  {
    archived: false,
    createdAt: 1689589483514,
    defaultOffVariation: 'false',
    defaultOnVariation: 'false',
    description: '',
    evaluation: '',
    evaluationIdentifier: '',
    identifier: 'qqq_identifier',
    kind: 'boolean' as const,
    modifiedAt: 1689675169378,
    name: 'qqq',
    owner: ['crystal.fong@harness.io'],
    permanent: false,
    prerequisites: [
      {
        feature: 'q',
        variations: ['true']
      },
      {
        feature: 'qq',
        variations: ['true']
      }
    ],
    project: 'crystaltest14july',
    services: [],
    tags: [],
    variations: []
  },
  {
    archived: false,
    createdAt: 1689334024268,
    defaultOffVariation: 'false',
    defaultOnVariation: 'false',
    description: '',
    evaluation: '',
    evaluationIdentifier: '',
    identifier: 'qq_identifier',
    kind: 'boolean' as const,
    modifiedAt: 1689334036715,
    name: 'qq',
    owner: ['crystal.fong@harness.io'],
    permanent: false,
    prerequisites: [
      {
        feature: 'q',
        variations: ['true']
      }
    ],
    project: 'crystaltest14july',
    services: [],
    tags: [],
    variations: []
  }
]

export const buildMockDependentFlags = (numberOfFlags: number, isDependentFlag: boolean) => ({
  features: Array(numberOfFlags)
    .fill({})
    .map((_, index) => ({
      archived: isDependentFlag ? false : true,
      createdAt: 1689334024268,
      defaultOffVariation: 'false',
      defaultOnVariation: 'false',
      description: '',
      evaluation: '',
      evaluationIdentifier: '',
      identifier: `flag_indentifier_${index}`,
      kind: 'boolean' as const,
      modifiedAt: 1689334036715,
      name: `Flag_${index}`,
      owner: ['user@harness.io'],
      permanent: false,
      prerequisites: [
        {
          feature: 'prereq_flag',
          variations: ['true']
        }
      ],
      project: 'test_project',
      services: [],
      tags: [],
      variations: []
    })),
  itemCount: numberOfFlags,
  pageCount: Math.ceil(numberOfFlags / CF_DEFAULT_PAGE_SIZE),
  pageIndex: 0,
  pageSize: CF_DEFAULT_PAGE_SIZE,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 0,
    totalFeatures: 2,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0,
    totalArchived: isDependentFlag ? numberOfFlags : 0
  }
})

export const dependentFlagsResponse = {
  itemCount: 0,
  pageCount: 0,
  pageIndex: 0,
  pageSize: 15,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 0,
    totalFeatures: 2,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0,
    totalArchived: 2
  },
  features: dependentFlagsMock
}

export const noDependentFlagsResponse = {
  itemCount: 0,
  pageCount: 0,
  pageIndex: 0,
  pageSize: 15,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 0,
    totalFeatures: 2,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0,
    totalArchived: 2
  },
  features: []
}
