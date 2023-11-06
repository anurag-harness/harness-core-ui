import React from 'react'
import { CellProps, Renderer } from 'react-table'
import { FormInput, Icon, Layout, TableV2, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { RowData } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import {
  getIconBySourceType,
  getTypeByFeature
} from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import { useStrings } from 'framework/strings'
import { HealthSource } from 'services/cv'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { MonitoredServiceConfigurationsTabsEnum } from '@cv/pages/monitored-service/components/Configurations/components/Service/components/CommonMonitoredServiceConfigurations/CommonMonitoredServiceConfigurations.constants'
import ConfigureMonitoredServiceDetails from '../ConfigureMonitoredServiceDetails/ConfigureMonitoredServiceDetails'
import DetailNotPresent from '../DetailNotPresent/DetailNotPresent'
import css from './AnalyseStepHealthSourceList.module.scss'

interface AnalyseStepHealthSourcesListProps {
  healthSourcesList: HealthSource[]
  identifier: string
  fetchMonitoredServiceData: () => Promise<void>
}

export default function AnalyseStepHealthSourcesList(props: AnalyseStepHealthSourcesListProps): JSX.Element {
  const { healthSourcesList, fetchMonitoredServiceData, identifier } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const RenderTypeByFeature: Renderer<CellProps<RowData>> = ({ row }): JSX.Element => {
    const { type } = row.original
    return <Text color={Color.BLACK}>{getTypeByFeature(type as string, getString)}</Text>
  }

  const RenderNameWithIcon: Renderer<CellProps<RowData>> = ({ row }): JSX.Element => {
    const { type, name } = row.original
    return (
      <Layout.Horizontal>
        <Icon name={getIconBySourceType(type as string)} size={18} padding={{ right: 'small' }} />
        <Text color={Color.BLACK}>{name}</Text>
      </Layout.Horizontal>
    )
  }

  return (
    <>
      <Text padding={{ bottom: 'small', top: 'small' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
        {'Health Source'}
      </Text>
      {isEmpty(healthSourcesList) ? (
        <>
          <FormInput.CustomRender
            name={'spec.healthSources'}
            render={() => (
              <>
                <DetailNotPresent
                  detailNotPresentMessage={getString('cv.analyzeStep.healthSources.healthSourceNotPresent')}
                />
              </>
            )}
          />
        </>
      ) : (
        <>
          <TableV2<HealthSource>
            columns={[
              {
                Header: '',
                accessor: 'spec',
                width: '0%',
                Cell: <></>
              },
              {
                Header: getString('source'),
                accessor: 'name',
                width: '60%',
                Cell: RenderNameWithIcon
              },
              {
                Header: getString('typeLabel'),
                width: '27%',
                Cell: RenderTypeByFeature
              }
            ]}
            data={healthSourcesList as HealthSource[]}
            className={css.table}
            rowDataTestID={originalData => `healthSourceTable_${originalData.name}`}
          />
        </>
      )}
      <ConfigureMonitoredServiceDetails
        linkTo={`${routes.toCVAddMonitoringServicesEdit({
          accountId,
          orgIdentifier,
          projectIdentifier,
          identifier,
          module: 'cv'
        })}${getCVMonitoringServicesSearchParam({
          tab: MonitoredServiceEnum.Configurations,
          subTab: MonitoredServiceConfigurationsTabsEnum.HEALTH_SOURCE
        })}`}
        detailToConfigureText={'Configure Health Source'}
        refetchDetails={fetchMonitoredServiceData}
      />
    </>
  )
}
