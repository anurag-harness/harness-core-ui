import { useParams } from 'react-router-dom'
import React, { useEffect, useMemo } from 'react'
import { Button, ButtonVariation, Container, Layout, TableV2, Text, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { Column, Renderer, UseExpandedRowProps } from 'react-table'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NOTIFICATIONS_PAGE_SIZE } from '@cv/components/Notifications/NotificationsContainer.constants'
import { useGetNotificationRulesForMonitoredService } from 'services/cv'
import Card from '@cv/components/Card/Card'
import routes from '@common/RouteDefinitions'
import { getCVMonitoringServicesSearchParam, getErrorMessage } from '@cv/utils/CommonUtils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import { killEvent } from '@common/utils/eventUtils'
import { useStrings } from 'framework/strings'
import { MonitoredServiceConfigurationsTabsEnum } from '@cv/pages/monitored-service/components/Configurations/components/Service/components/CommonMonitoredServiceConfigurations/CommonMonitoredServiceConfigurations.constants'
import ConfigureMonitoredServiceDetails from '../ConfigureMonitoredServiceDetails/ConfigureMonitoredServiceDetails'
import DetailNotPresent from '../DetailNotPresent/DetailNotPresent'
import { AnalyseStepNotificationsData } from './AnalyseStepNotifications.types'
import NotificationDetails from './components/NotificationDetails'
import { INITIAL_PAGE_NUMBER } from './AnalyseStepNotifications.constants'
import { getValidNotifications } from './AnalyseStepNotifications.utils'
import css from './AnalyseStepNotifications.module.scss'

interface AnalyseStepNotificationsProps {
  identifier: string
}

export default function AnalyseStepNotifications(props: AnalyseStepNotificationsProps): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { identifier } = props
  const { showError } = useToaster()
  const { getString } = useStrings()

  const {
    data,
    loading,
    error,
    refetch: getNotifications
  } = useGetNotificationRulesForMonitoredService({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      pageNumber: INITIAL_PAGE_NUMBER,
      pageSize: NOTIFICATIONS_PAGE_SIZE
    },
    identifier,
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      getNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  useEffect(() => {
    if (error) {
      showError(getErrorMessage(error))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const notificationsData = useMemo(() => {
    const notifications = data?.data?.content || []
    return getValidNotifications(notifications)
  }, [data?.data?.content])

  const renderRowSubComponent = React.useCallback(
    ({ row }) => <NotificationDetails notificationDetails={row?.original} />,
    []
  )

  const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<AnalyseStepNotificationsData> }> = ({ row }) => {
    return (
      <Layout.Horizontal onClick={killEvent}>
        <Button
          {...row.getToggleRowExpandedProps()}
          color={Color.GREY_600}
          icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
          variation={ButtonVariation.ICON}
          iconProps={{ size: 19 }}
          className={css.toggleAccordion}
        />
      </Layout.Horizontal>
    )
  }

  const columns: Column<AnalyseStepNotificationsData>[] = React.useMemo(() => {
    return [
      {
        Header: '',
        id: 'rowSelectOrExpander',
        Cell: ToggleAccordionCell,
        width: '7%'
      },
      {
        Header: getString('name').toLocaleUpperCase(),
        accessor: 'name',
        Cell: ({ row }) => (
          <Text lineClamp={1} color={Color.BLACK}>
            {row.original.name}
          </Text>
        ),
        width: '46.5%'
      },
      {
        Header: getString('cv.analyzeStep.notifications.notificationMethod').toLocaleUpperCase(),
        accessor: 'notificationMethod',
        Cell: ({ row }) => (
          <Container
            border={{ radius: 4 }}
            background={Color.GREY_100}
            padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
            className={css.notificationMethod}
          >
            <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.GREY_700}>
              {row.original.notificationMethod.type}
            </Text>
          </Container>
        ),
        width: '46.5%'
      }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderNotifications = (): JSX.Element => {
    if (loading) {
      return <Text>{getString('cv.analyzeStep.notifications.fetchingNotifications')}</Text>
    } else if (isEmpty(notificationsData)) {
      return (
        <Layout.Vertical>
          <DetailNotPresent
            detailNotPresentMessage={getString('cv.analyzeStep.notifications.notificationsNotPresent')}
          />
          <ConfigureMonitoredServiceDetails
            linkTo={`${routes.toCVAddMonitoringServicesEdit({
              accountId,
              orgIdentifier,
              projectIdentifier,
              identifier,
              module: 'cv'
            })}${getCVMonitoringServicesSearchParam({
              tab: MonitoredServiceEnum.Configurations,
              subTab: MonitoredServiceConfigurationsTabsEnum.NOTIFICATIONS
            })}`}
            detailToConfigureText={getString('cv.analyzeStep.notifications.configureNotification')}
            refetchDetails={getNotifications}
          />
        </Layout.Vertical>
      )
    } else {
      return (
        <>
          <TableV2<AnalyseStepNotificationsData>
            className={css.table}
            columns={columns}
            data={notificationsData}
            renderRowSubComponent={renderRowSubComponent}
            autoResetExpanded={false}
          />
          <ConfigureMonitoredServiceDetails
            linkTo={`${routes.toCVAddMonitoringServicesEdit({
              accountId,
              orgIdentifier,
              projectIdentifier,
              identifier,
              module: 'cv'
            })}${getCVMonitoringServicesSearchParam({ tab: MonitoredServiceEnum.Configurations })}`}
            detailToConfigureText={getString('cv.analyzeStep.notifications.configureNotification')}
            refetchDetails={getNotifications}
          />
        </>
      )
    }
  }

  return (
    <Card>
      <>
        <Text font={{ weight: 'semi-bold' }} color={Color.BLACK} padding={{ bottom: 'small' }}>
          {'Notifications'}
        </Text>
        <Text color={Color.BLACK} padding={{ bottom: 'small' }}>
          {getString('cv.analyzeStep.notifications.notificationsTitle')}
        </Text>
        {renderNotifications()}
      </>
    </Card>
  )
}
