/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceSpec } from 'services/cd-ng'

export const templateGithubPackageRegistry: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        org: '<+input>',
        packageName: '<+input>',
        version: '<+input>'
      },
      type: 'GithubPackageRegistry'
    }
  }
}

export const packagesData = {
  status: 'SUCCESS',
  data: {
    githubPackageResponse: [
      {
        packageId: '2244066',
        packageName: 'helloworld',
        packageType: 'container',
        visibility: 'private',
        packageUrl: 'https://github.com/orgs/org-vtxorxwitty/packages/container/package/helloworld'
      }
    ]
  },
  metaData: null,
  correlationId: '8b6291b9-3b68-4b0b-bde2-ca25147d100e'
}

export const versionsData = {
  status: 'SUCCESS',
  data: [
    {
      number: '100',
      revision: null,
      description: null,
      artifactPath: 'ghcr.io/vtxorxwitty/helloworld:100',
      buildUrl: 'https://github.com/users/vtxorxwitty/packages/container/helloworld/38299907',
      buildDisplayName: 'helloworld: 100',
      buildFullDisplayName: 'sha256:e987fb89e5455d7a465e50d88f4c1497e8947342acfab6cfd347ec201ed6885f',
      artifactFileSize: null,
      uiDisplayName: 'Tag# 100',
      status: 'SUCCESS',
      buildParameters: {},
      metadata: {
        '100': 'helloworld'
      },
      labels: {},
      artifactFileMetadataList: []
    }
  ],
  metaData: null,
  correlationId: '8b6291b9-3b68-4b0b-bde2-ca25147d100e'
}

export const digestData = {
  status: 'SUCCESS',
  data: {
    number: 'pr-13',
    revision: null,
    description: null,
    artifactPath: 'ghcr.io/docker/docker-index:pr-13',
    buildUrl: null,
    buildDisplayName: 'docker-index: pr-13',
    buildFullDisplayName: 'sha256:e598aa88997d5148a285e937c0ba21290660c3f26a97b51b6c4f2635f0935fbf',
    artifactFileSize: null,
    uiDisplayName: 'Tag# pr-13',
    status: 'SUCCESS',
    buildParameters: {},
    metadata: {
      SHAV2: 'sha256:e598aa88997d5148a285e937c0ba21290660c3f26a97b51b6c4f2635f0935fbf',
      SHA: 'sha256:e598aa88997d5148a285e937c0ba21290660c3f26a97b51b6c4f2635f0935fbf'
    },
    labels: {},
    artifactFileMetadataList: []
  },
  metaData: null,
  correlationId: '41a35cf7-7f51-4f55-9068-5879b95c0e19'
}

export const templateGithubPackageRegistryWithVersionRegex: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        org: '<+input>',
        packageName: '<+input>',
        versionRegex: '<+input>'
      },
      type: 'GithubPackageRegistry'
    }
  }
}

export const commonFormikInitialValues = {
  pipeline: {
    name: 'Pipeline 1',
    identifier: 'Pipeline_1',
    projectIdentifier: 'testProject',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          identifier: 'vivek',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceDefinition: {
                type: 'Kubernetes',
                spec: {
                  artifacts: {
                    primary: {
                      type: 'GithubPackageRegistry',
                      spec: {
                        connectorRef: '',
                        org: '',
                        packageName: '',
                        version: ''
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}
