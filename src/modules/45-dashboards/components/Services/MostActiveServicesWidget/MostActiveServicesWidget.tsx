import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import cx from 'classnames'
import { Card, Color, Container, LabelPosition, Layout, Text, WeightedStack } from '@wings-software/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { DeploymentsTimeRangeContext } from '@dashboards/components/Services/common'
import { DashboardWorkloadDeployment, GetWorkloadsQueryParams, useGetWorkloads } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FAIL_COLORS, SUCCESS_COLORS } from '@dashboards/constants'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import MostActiveServicesEmptyState from '@dashboards/icons/MostActiveServicesEmptyState.svg'
import css from '@dashboards/components/Services/MostActiveServicesWidget/MostActiveServicesWidget.module.scss'

interface MostActiveServicesWidgetData {
  label: string
  value: number
  color: string
  change: number
}

export interface MostActiveServicesWidget {
  environmentTypes?: Record<string, GetWorkloadsQueryParams['environmentType']>
  types?: {
    [key: string]: {
      label: string
      colors?: string[]
    }
  }
  title?: string
  parseByType?: (data: DashboardWorkloadDeployment | []) => MostActiveServicesWidgetData[]
}

enum DEFAULT_TYPES_ENUM {
  DEPLOYMENTS = 'DEFAULT_TYPES_ENUM.DEPLOYMENTS',
  ERRORS = 'DEFAULT_TYPES_ENUM.ERRORS'
}

const getDefaultEnvironments = (
  getString: UseStringsReturn['getString']
): { [key: string]: GetWorkloadsQueryParams['environmentType'] } => {
  return {
    [getString('all')]: undefined,
    [getString('dashboards.serviceDashboard.prod')]: 'Production',
    [getString('dashboards.serviceDashboard.nonProd')]: 'PreProduction'
  }
}

const getDefaultTypes = (getString: UseStringsReturn['getString']) => {
  return {
    [DEFAULT_TYPES_ENUM.DEPLOYMENTS]: {
      label: getString('deploymentsText'),
      colors: SUCCESS_COLORS
    },
    [DEFAULT_TYPES_ENUM.ERRORS]: {
      label: getString('errors'),
      colors: FAIL_COLORS
    }
  }
}

export const MostActiveServicesWidget: React.FC<MostActiveServicesWidget> = props => {
  const { getString } = useStrings()

  const defaultParseByType = useCallback(
    (data: DashboardWorkloadDeployment | [], selectedType: string): MostActiveServicesWidgetData[] => {
      const items = ((data as DashboardWorkloadDeployment)?.workloadDeploymentInfoList || []).map(
        workloadDeploymentInfo => {
          const {
            totalDeployments = 0,
            failureRate = 0,
            percentSuccess = 0,
            failureRateChangeRate,
            rateSuccess
          } = workloadDeploymentInfo
          let value = (workloadDeploymentInfo as any)?.totalSuccess || (totalDeployments * percentSuccess) / 100
          if (selectedType === DEFAULT_TYPES_ENUM.ERRORS) {
            value = (workloadDeploymentInfo as any)?.totalFailure || (totalDeployments * failureRate) / 100
          }
          const change = selectedType === DEFAULT_TYPES_ENUM.DEPLOYMENTS ? rateSuccess : failureRateChangeRate
          return {
            label: workloadDeploymentInfo.serviceName || '',
            value,
            change: change || 0
          }
        }
      )
      items.sort((itemA, itemB) => (itemA.value > itemB.value ? -1 : 1))
      const colorList = types[selectedType].colors || [Color.BLACK]
      return items
        .map((item, index) => ({ ...item, color: colorList[Math.min(index, colorList.length - 1)] }))
        .filter(item => item.value)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )

  const DEFAULT_ENVIRONMENT_TYPES = useMemo(
    () => getDefaultEnvironments(getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const DEFAULT_TYPES = useMemo(
    () => getDefaultTypes(getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const {
    environmentTypes = DEFAULT_ENVIRONMENT_TYPES,
    types = DEFAULT_TYPES,
    title,
    parseByType = defaultParseByType
  } = props
  const [selectedEnvironmentType, setSelectedEnvironmentType] = useState(Object.keys(environmentTypes)[0])
  const [selectedType, setSelectedType] = useState(Object.keys(types)[0])
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { timeRange } = useContext(DeploymentsTimeRangeContext)

  const queryParams: GetWorkloadsQueryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1] ? moment(timeRange.range[1]).add(1, 'days').toDate().getTime() : 0,
      environmentType: environmentTypes[selectedEnvironmentType]
    }
  }, [accountId, orgIdentifier, projectIdentifier, timeRange, environmentTypes, selectedEnvironmentType])

  const { loading, error, data: workloadsData, refetch } = useGetWorkloads({ queryParams })

  const data = useMemo(
    () => parseByType(workloadsData?.data || [], selectedType),
    [workloadsData?.data, selectedType, parseByType]
  )

  const EnvironmentTypeComponent = useMemo(
    () => (
      <Layout.Horizontal>
        {Object.keys(environmentTypes).map(environmentTypeKey => (
          <Text
            key={environmentTypeKey}
            font={{ size: 'small', weight: 'semi-bold' }}
            intent={environmentTypeKey === selectedEnvironmentType ? 'primary' : 'none'}
            className={css.environmentType}
            onClick={() => setSelectedEnvironmentType(environmentTypeKey)}
            data-test="mostActiveServicesWidgetEnvironmentType"
          >
            {environmentTypeKey}
          </Text>
        ))}
      </Layout.Horizontal>
    ),
    [environmentTypes, selectedEnvironmentType]
  )

  const Tickers = useMemo(() => {
    return data.map((service, index) => {
      const { change } = service
      const [color, tickerValueStyle] =
        change > 0 ? [Color.RED_500, css.tickerValueRed] : [Color.GREEN_600, css.tickerValueGreen]
      return (
        <div className={css.tickerContainer} key={index}>
          {change !== undefined ? (
            <Ticker
              value={`${Math.abs(change)}%`}
              color={color}
              tickerValueStyles={cx(css.tickerValueStyles, tickerValueStyle)}
              verticalAlign={TickerVerticalAlignment.CENTER}
            />
          ) : (
            <></>
          )}
        </div>
      )
    })
  }, [data])

  const weightedStackData = useMemo(
    () =>
      data.map(service => ({
        label: service.label,
        value: service.value,
        color: service.color
      })),
    [data]
  )

  const TypeComponent = useMemo(
    () =>
      Object.keys(types).map(typeKey => (
        <div
          key={typeKey}
          onClick={() => setSelectedType(typeKey)}
          className={cx(css.typeContainer, { [css.typeSelected]: typeKey === selectedType })}
          data-test={`mostActiveServicesWidgetType${typeKey === selectedType ? 'Selected' : ''}`}
        >
          <Text
            font={{ size: 'xsmall', weight: 'semi-bold' }}
            color={typeKey === selectedType ? Color.WHITE : Color.BLACK}
          >
            {types[typeKey].label}
          </Text>
        </div>
      )),
    [types, selectedType]
  )

  const MostActiveServicesWidgetContainer: React.FC = ({ children }) => {
    return (
      <Card className={css.card}>
        <Layout.Vertical height={'100%'}>
          {title && (
            <Text font={{ weight: 'bold' }} color={Color.GREY_600}>
              {title}
            </Text>
          )}
          <Container margin={{ bottom: 'xlarge' }}>{EnvironmentTypeComponent}</Container>
          <Layout.Horizontal margin={{ bottom: 'large' }}>{TypeComponent}</Layout.Horizontal>
          {children}
        </Layout.Vertical>
      </Card>
    )
  }

  if (loading || error || !data || !data.length) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="mostActiveServicesWidgetLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="mostActiveServicesWidgetError" height={'100%'}>
            <PageError onClick={() => refetch()} width={230} />
          </Container>
        )
      }
      return (
        <Layout.Vertical
          flex={{ align: 'center-center' }}
          data-test="mostActiveServicesWidgetEmpty"
          className={css.mostActiveServicesWidgetEmpty}
        >
          <Container margin={{ bottom: 'medium' }}>
            <img width="50" height="50" src={MostActiveServicesEmptyState} style={{ alignSelf: 'center' }} />
          </Container>
          <Text color={Color.GREY_400}>
            {getString('dashboards.serviceDashboard.noServiceInstances', {
              timeRange: timeRange?.label
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return <MostActiveServicesWidgetContainer>{component}</MostActiveServicesWidgetContainer>
  }

  return (
    <MostActiveServicesWidgetContainer>
      <Layout.Horizontal
        flex={{ distribution: 'space-between', alignItems: 'flex-start' }}
        height={150}
        className={css.stackTickerContainer}
        data-test="mostActiveServicesWidgetContent"
      >
        <div className={css.weightedStackContainer}>
          <WeightedStack
            data={weightedStackData}
            labelPosition={LabelPosition.INSIDE}
            stackStyles={css.stack}
            progressBarStyles={css.progressBar}
            labelStyles={css.label}
          />
        </div>
        <Layout.Vertical>{Tickers}</Layout.Vertical>
      </Layout.Horizontal>
    </MostActiveServicesWidgetContainer>
  )
}
