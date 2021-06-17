import type { ResponseBoolean } from 'services/cd-ng'

export const mockedConnectors = {
  content: [
    {
      connector: {
        name: 'rishabhk8s',
        identifier: 'rishabhk8s',
        description: '',
        orgIdentifier: null,
        projectIdentifier: null,
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'InheritFromDelegate',
            spec: null
          },
          delegateSelectors: ['ce-dev']
        }
      },
      createdAt: 1622101072534,
      lastModifiedAt: 1622101072435,
      status: {
        status: 'SUCCESS',
        errorSummary: null,
        errors: null,
        testedAt: 1622101077020,
        lastTestedAt: 0,
        lastConnectedAt: 1622101077020
      },
      activityDetails: {
        lastActivityTime: 1622101072589
      },
      harnessManaged: false,
      gitDetails: {
        objectId: null,
        branch: null,
        repoIdentifier: null,
        rootFolder: null,
        filePath: null
      }
    }
  ]
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: jest.fn(),
  onClose: jest.fn(),
  onSuccess: jest.fn()
}
