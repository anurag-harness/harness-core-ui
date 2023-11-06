/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Link } from 'react-router-dom'
import { defaultTo, isArray, isEmpty, isNil, isUndefined } from 'lodash-es'
import { Duration } from '@common/exports'
import { useDelegateSelectionLogsModal } from '@common/components/DelegateSelectionLogs/DelegateSelectionLogs'
import type { DelegateInfo, ExecutableResponse, ExecutionGraph, ExecutionNode } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  ExecutionStatusEnum,
  isExecutionComplete,
  isExecutionCompletedWithBadState
} from '@pipeline/utils/statusHelpers'
import { TaskContext } from '@common/components/DelegateTaskLogs/DelegateTaskLogs'
import DelegateTaskLogsButton from '@common/components/DelegateTaskLogs/DelegateTaskLogsButton'
import { encodeURIWithReservedChars } from './utils'

import css from './StepDetails.module.scss'

interface Task {
  taskId: string
  taskName: string
}
export interface StepLabels {
  label: string
  value: React.ReactNode
}

export interface StepDetailsProps {
  step: ExecutionNode
  executionMetadata: ExecutionGraph['executionMetadata']
  labels?: StepLabels[]
  progressData?: {
    [key: string]: string
  }
  ticketStatus?: string
}

export function StepDetails(props: StepDetailsProps): React.ReactElement {
  const { step, executionMetadata, labels = [], progressData, ticketStatus } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = defaultTo(executionMetadata, {})
  //TODO - types will modified when the backend swagger docs are updated
  const deploymentTag = step?.stepParameters?.deploymentTag as any
  const serviceIdentifier = step?.stepParameters?.serviceIdentifier as any
  const activityId = step?.progressData?.activityId as any
  const estimatedRemainingTime = step?.progressData?.estimatedRemainingTime
  const progressPercentage = step?.progressData?.progressPercentage
  const timeout = step?.stepParameters?.timeout as any
  const [taskList, setTaskList] = React.useState<Array<ExecutableResponse>>([])
  const { openDelegateSelectionLogsModal } = useDelegateSelectionLogsModal()

  React.useEffect(() => {
    let tasks: Task[] = defaultTo(
      step.executableResponses?.map(item => item.taskChain || item.task).filter(item => item !== undefined),
      []
    )
    if (step?.stepDetails && !isEmpty(step?.stepDetails) && isEmpty(tasks)) {
      tasks = []
      const stepDetailsKeys = Object.keys(step?.stepDetails)
      stepDetailsKeys.forEach(stepDetailsKey => {
        const stepDelegateInfos = step.stepDetails?.[stepDetailsKey]?.stepDelegateInfos?.filter(
          (item: Task) => item !== undefined
        )
        stepDelegateInfos?.forEach((stepDelegateInfo: Task) => {
          tasks.push(stepDelegateInfo)
        })
      })
    }
    if (tasks) {
      setTaskList(tasks)
    }
  }, [step.executableResponses])

  const showDelegateRow = (delegateList: DelegateInfo[] | undefined, tasks: ExecutableResponse[]): boolean => {
    return (
      (delegateList && delegateList?.length > 0) ||
      tasks?.length > 0 ||
      !isUndefined(progressData?.latestDelegateTaskId)
    )
  }

  const delegateListContainsTask = (delegateList: DelegateInfo[] | undefined, taskId: string): boolean => {
    return !!delegateList?.find((item: DelegateInfo) => item.taskId === taskId)
  }

  const delegateInfoList = !isEmpty(step.delegateInfoList) ? step.delegateInfoList : taskList
  const delegateLogsAvailable =
    (step.startTs !== undefined && !isEmpty(delegateInfoList)) ||
    (step.startTs !== undefined && step.stepDetails && Object.keys(step.stepDetails).length > 0)
  const timePadding = 60 * 5 // 5 minutes
  const taskIds = delegateInfoList?.map(delegate => delegate.taskId || '')?.filter(a => a)
  const startTime = Math.floor((step?.startTs as number) / 1000) - timePadding
  const endTime = Math.floor((step?.endTs || Date.now()) / 1000) + timePadding

  return (
    <table className={css.detailsTable}>
      <tbody>
        <tr>
          <th>{`${getString('startedAt')}:`}</th>
          <td>{step?.startTs ? new Date(step.startTs).toLocaleString() : '-'}</td>
        </tr>
        <tr>
          <th>{`${getString('endedAt')}:`}</th>
          <td>{step?.endTs ? new Date(step.endTs).toLocaleString() : '-'}</td>
        </tr>

        <tr>
          <th>{`${getString('pipeline.duration')}:`}</th>
          <td>
            <Duration
              className={css.timer}
              durationText=""
              startTime={step?.startTs}
              endTime={step?.endTs}
              showZeroSecondsResult
            />
          </td>
        </tr>
        {!!timeout && (
          <tr>
            <th>{`${getString('pipelineSteps.timeoutLabel')}:`}</th>
            <td>{timeout}</td>
          </tr>
        )}
        {ticketStatus && (
          <tr>
            <th>{`${getString('pipeline.ticketStatus')}:`}</th>
            <td>{ticketStatus}</td>
          </tr>
        )}
        {labels.map((label, index) => (
          <tr key={index}>
            <th>{`${label.label}:`}</th>
            <td>
              {isArray(label.value)
                ? label.value.map((outcome, idx) => {
                    if (!isNil(outcome) && !isEmpty(outcome)) {
                      return <div key={idx}>{outcome}</div>
                    }
                  })
                : label.value}
            </td>
          </tr>
        ))}
        {(showDelegateRow(delegateInfoList, taskList) || step.stepDetails?.initStepV2DelegateTaskInfo) && (
          <tr className={css.delegateRow}>
            <th>
              {isExecutionCompletedWithBadState(step.status) && (
                <Icon className={css.iconLabel} size={12} name="warning-sign" color={Color.ORANGE_500} />
              )}
              {`${getString('delegate.delegates')}:`}
            </th>
            <td>
              <Layout.Vertical spacing="small">
                {delegateInfoList &&
                  delegateInfoList.length > 0 &&
                  delegateInfoList.map((item, index) => (
                    <div key={`${item.id}-${index}`}>
                      <Text font={{ size: 'small', weight: 'bold' }}>
                        <String
                          stringID="common.delegateForTask"
                          vars={{ delegate: item.name, taskName: item.taskName }}
                          useRichText
                        />
                      </Text>{' '}
                      (
                      <Text
                        font={{ size: 'small' }}
                        onClick={() =>
                          openDelegateSelectionLogsModal({
                            taskId: item.taskId as string,
                            taskName: item.taskName as string,
                            delegateName: item.name as string
                          })
                        }
                        style={{ cursor: 'pointer' }}
                        color={Color.PRIMARY_7}
                      >
                        {getString('common.logs.delegateSelectionLogs')}
                      </Text>
                      )
                    </div>
                  ))}
                {step.stepDetails?.initStepV2DelegateTaskInfo && (
                  <div key={`${step.stepDetails?.initStepV2DelegateTaskInfo.taskID}`}>
                    <Text font={{ size: 'small', weight: 'bold' }}>
                      <String
                        stringID="common.delegateForTask"
                        vars={{ taskName: step.stepDetails?.initStepV2DelegateTaskInfo.taskName }}
                        useRichText
                      />
                    </Text>{' '}
                    (
                    <Text
                      font={{ size: 'small' }}
                      onClick={() =>
                        openDelegateSelectionLogsModal({
                          taskId: step.stepDetails?.initStepV2DelegateTaskInfo.taskID as unknown as string,
                          taskName: step.stepDetails?.initStepV2DelegateTaskInfo.taskName as unknown as string
                        })
                      }
                      style={{ cursor: 'pointer' }}
                      color={Color.PRIMARY_7}
                    >
                      {getString('common.logs.delegateSelectionLogs')}
                    </Text>
                    )
                  </div>
                )}
                {taskList &&
                  taskList.length > 0 &&
                  taskList.map((item, index) =>
                    delegateListContainsTask(delegateInfoList, item.taskId) ? null : (
                      <div key={`${item.taskId}-${index}`}>
                        {isExecutionComplete(step.status) ? (
                          <Text font={{ size: 'small', weight: 'bold' }} color={Color.ORANGE_500}>
                            <String
                              stringID="common.noDelegateForTask"
                              vars={{ taskName: item.taskName }}
                              useRichText
                            />
                          </Text>
                        ) : (
                          <Text font={{ size: 'small', weight: 'bold' }}>
                            <String
                              stringID="common.delegateForTask"
                              vars={{ delegate: item.name, taskName: item.taskName }}
                              useRichText
                            />
                          </Text>
                        )}{' '}
                        (
                        <Text
                          font={{ size: 'small' }}
                          onClick={() =>
                            openDelegateSelectionLogsModal({
                              taskId: item.taskId as string,
                              taskName: item.taskName as string
                            })
                          }
                          style={{ cursor: 'pointer' }}
                          color={Color.PRIMARY_7}
                        >
                          {getString('common.logs.delegateSelectionLogs')}
                        </Text>
                        )
                      </div>
                    )
                  )}
                {progressData?.latestDelegateTaskId && (
                  <div key={progressData.latestDelegateTaskId}>
                    <Text font={{ size: 'small', weight: 'bold' }}>
                      <String
                        stringID="common.delegateForTask"
                        vars={{ taskName: progressData?.taskName }}
                        useRichText
                      />
                    </Text>{' '}
                    (
                    <Text
                      font={{ size: 'small' }}
                      onClick={() =>
                        openDelegateSelectionLogsModal({
                          taskId: progressData.latestDelegateTaskId,
                          taskName: progressData?.taskName
                        })
                      }
                      style={{ cursor: 'pointer' }}
                      color={Color.PRIMARY_7}
                    >
                      {getString('common.logs.delegateSelectionLogs')}
                    </Text>
                    )
                  </div>
                )}
                <DelegateTaskLogsButton
                  startTime={startTime}
                  endTime={endTime}
                  taskIds={taskIds || []}
                  telemetry={{
                    taskContext: TaskContext.PipelineStep,
                    hasError: isExecutionCompletedWithBadState(step.status)
                  }}
                  areLogsAvailable={delegateLogsAvailable}
                />
              </Layout.Vertical>
            </td>
          </tr>
        )}
        {/* TODO - this will be moved to step level once the support is added in pipeline factory */}
        {step.stepType === StepType.Verify &&
          deploymentTag &&
          serviceIdentifier &&
          step?.status !== ExecutionStatusEnum.Queued && (
            <>
              {estimatedRemainingTime && (
                <tr>
                  <th>{`${getString('pipeline.estimatedTimeRemaining')}:`}</th>
                  <td>{estimatedRemainingTime}</td>
                </tr>
              )}
              {(progressPercentage || progressPercentage === 0) && (
                <tr>
                  <th>{`${getString('pipeline.progressPercentage')}:`}</th>
                  <td>{progressPercentage}</td>
                </tr>
              )}
              <tr>
                <th>{`${getString('pipeline.verificationResult')}:`}</th>
                <td>
                  <Link
                    to={routes.toCVDeploymentPage({
                      accountId,
                      projectIdentifier,
                      orgIdentifier,
                      deploymentTag: encodeURIWithReservedChars(deploymentTag),
                      serviceIdentifier,
                      ...(activityId && { activityId })
                    })}
                    target="_blank"
                  >
                    {getString('pipeline.clickHere')}
                  </Link>
                </td>
              </tr>
            </>
          )}
      </tbody>
    </table>
  )
}
