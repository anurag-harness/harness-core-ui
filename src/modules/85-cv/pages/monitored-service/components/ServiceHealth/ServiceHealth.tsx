/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  Container,
  Layout,
  Select,
  SelectOption,
  Text,
  Icon,
  useToaster,
  Button,
  ButtonVariation,
  Dialog,
  Heading
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import Card from '@cv/components/Card/Card'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks/useQueryParams'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import TimelineSlider from '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import type { RiskData } from 'services/cv'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import ServiceDependencyGraph from '@cv/pages/monitored-service/CVMonitoredService/components/MonitoredServiceGraphView/MonitoredServiceGraphView'

import {
  calculateLowestHealthScoreBar,
  calculateStartAndEndTimes,
  getDimensionsAsPerContainerWidth,
  getTimeFormat,
  getTimePeriods,
  getTimestampsForPeriod,
  limitMaxSliderWidth,
  updateFilterByNotificationTime
} from './ServiceHealth.utils'
import {
  DEFAULT_MAX_SLIDER_WIDTH,
  DEFAULT_MIN_SLIDER_WIDTH,
  ServiceDependencyDialogProps,
  TimePeriodEnum
} from './ServiceHealth.constants'
import type { ServiceHealthProps } from './ServiceHealth.types'
import HealthScoreChart from './components/HealthScoreChart/HealthScoreChart'
import MetricsAndLogs from './components/MetricsAndLogs/MetricsAndLogs'
import AnomaliesCard from './components/AnomaliesCard/AnomaliesCard'
import ChangesSourceCard from './components/ChangesSourceCard/ChangesSourceCard'
import ChangesTable from './components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import ReportsTableCard from './components/ReportsTable/ReportsTableCard'
import css from './ServiceHealth.module.scss'

export default function ServiceHealth({
  monitoredServiceIdentifier,
  serviceIdentifier,
  environmentIdentifier,
  hasChangeSource
}: ServiceHealthProps): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const { showError } = useToaster()
  const { getString } = useStrings()

  useDocumentTitle([getString('cv.srmTitle'), getString('cv.monitoredServices.title')])

  const { notificationTime } = useQueryParams<{ notificationTime?: number }>()
  const [defaultOffset, setDefaultOffset] = useState(0)

  const [selectedTimePeriod, setSelectedTimePeriod] = useState<SelectOption>({
    value: TimePeriodEnum.TWENTY_FOUR_HOURS,
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
  })

  const [timestamps, setTimestamps] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [showTimelineSlider, setShowTimelineSlider] = useState(false)
  const [changeTimelineSummary, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)
  const [healthScoreData, setHealthScoreData] = useState<RiskData[]>()
  const containerRef = useRef<HTMLElement>(null)
  const [openServiceDepedencyModal, hideServiceDepedencyModal] = useModalHook(() => (
    <Dialog
      enforceFocus={false}
      {...ServiceDependencyDialogProps}
      onClose={hideServiceDepedencyModal}
      title={getString('pipeline.serviceDependenciesText')}
    >
      <Layout.Vertical height={458} spacing={'large'}>
        <ServiceDependencyGraph monitoredServiceIdentifier={monitoredServiceIdentifier} />
        <Button
          width={68}
          text={getString('close')}
          variation={ButtonVariation.SECONDARY}
          onClick={hideServiceDepedencyModal}
        />
      </Layout.Vertical>
    </Dialog>
  ))

  useEffect(() => {
    if (notificationTime) {
      const { defaultOffset: updatedDefaultOffset, defaultSelectedTimePeriod: updatedDefaultSelectedTimePeriod } =
        updateFilterByNotificationTime({
          getString,
          notificationTime,
          defaultOffset,
          defaultSelectedTimePeriod: selectedTimePeriod,
          showError,
          location,
          history
        })

      if (
        defaultOffset !== updatedDefaultOffset &&
        selectedTimePeriod.value !== updatedDefaultSelectedTimePeriod.value
      ) {
        setDefaultOffset(updatedDefaultOffset)
        setSelectedTimePeriod(updatedDefaultSelectedTimePeriod)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedTimePeriod?.value) {
      setShowTimelineSlider(true)
    }
  }, [selectedTimePeriod.value, timestamps])

  // calculating the min and max width for the the timeline slider
  const sliderDimensions = useMemo(() => {
    // This is temporary change , will be removed once BE fix is done.
    const defaultMaxSliderWidth = limitMaxSliderWidth(selectedTimePeriod?.value as string)
      ? DEFAULT_MIN_SLIDER_WIDTH
      : DEFAULT_MAX_SLIDER_WIDTH

    return getDimensionsAsPerContainerWidth(
      defaultMaxSliderWidth,
      selectedTimePeriod,
      containerRef?.current?.offsetWidth
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef?.current, selectedTimePeriod?.value])

  const timeFormat = useMemo(() => {
    return getTimeFormat(selectedTimePeriod?.value as string)
  }, [selectedTimePeriod?.value])

  const lowestHealthScoreBarForTimeRange = useMemo(() => {
    return calculateLowestHealthScoreBar(timeRange?.startTime, timeRange?.endTime, healthScoreData)
  }, [timeRange?.startTime, timeRange?.endTime, healthScoreData])

  useEffect(() => {
    setTimestamps(getTimestampsForPeriod(healthScoreData))
  }, [healthScoreData])

  const onFocusTimeRange = useCallback((startTime: number, endTime: number) => {
    setTimeRange({ startTime, endTime })
  }, [])

  const onSliderDragEnd = useCallback(
    ({ startXPercentage, endXPercentage }) => {
      const startAndEndtime = calculateStartAndEndTimes(startXPercentage, endXPercentage, timestamps)
      if (startAndEndtime) onFocusTimeRange?.(startAndEndtime[0], startAndEndtime[1])
    },
    [onFocusTimeRange, timestamps]
  )

  const renderInfoCard = useCallback(() => {
    return (
      <AnomaliesCard
        timeRange={timeRange}
        changeTimelineSummary={changeTimelineSummary || []}
        lowestHealthScoreBarForTimeRange={lowestHealthScoreBarForTimeRange}
        timeFormat={timeFormat}
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
        monitoredServiceIdentifier={monitoredServiceIdentifier}
      />
    )
  }, [
    environmentIdentifier,
    lowestHealthScoreBarForTimeRange,
    monitoredServiceIdentifier,
    serviceIdentifier,
    timeFormat,
    timeRange,
    changeTimelineSummary
  ])

  const changesTableAndSourceCardStartAndEndtime = useMemo(
    () => calculateStartAndEndTimes(0, 1, timestamps) || [],
    [timestamps]
  )

  const changesTableAndSourceCardStartAndEndtimeWithSlider = useMemo(
    () => (showTimelineSlider ? Object.values(timeRange || {}) : changesTableAndSourceCardStartAndEndtime),
    [showTimelineSlider, timeRange, changesTableAndSourceCardStartAndEndtime]
  )

  const resetSlider = useCallback(() => {
    setTimeRange({ startTime: 0, endTime: 0 })
    setShowTimelineSlider(false)
    setDefaultOffset(0)
  }, [])

  return (
    <>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Select
          value={selectedTimePeriod}
          items={getTimePeriods(getString)}
          className={css.timePeriods}
          onChange={option => {
            resetSlider()
            setSelectedTimePeriod(option)
          }}
        />
        <Button
          className={css.serviceDepedencyButton}
          text={getString('pipeline.serviceDependenciesText')}
          variation={ButtonVariation.LINK}
          onClick={openServiceDepedencyModal}
        />
      </Layout.Horizontal>
      <Container className={css.serviceHealthCard}>
        <Card>
          <>
            <Container className={css.tickerContainer}>
              {changesTableAndSourceCardStartAndEndtime[0] && changesTableAndSourceCardStartAndEndtime[1] && (
                <>
                  <ChangesSourceCard
                    monitoredServiceIdentifier={monitoredServiceIdentifier}
                    startTime={changesTableAndSourceCardStartAndEndtimeWithSlider[0]}
                    endTime={changesTableAndSourceCardStartAndEndtimeWithSlider[1]}
                  />
                  <Layout.Horizontal margin={{ top: 'small', bottom: 'large' }}>
                    <Icon margin={{ right: 'small' }} name="main-issue" color={Color.PRIMARY_7} />
                    <Text color={Color.GREY_400} font={{ variation: FontVariation.SMALL }}>
                      {getString('cv.monitoredServices.serviceHealth.userMessage')}
                    </Text>
                  </Layout.Horizontal>
                </>
              )}
            </Container>
            <Container
              onClick={() => {
                if (!showTimelineSlider) {
                  setShowTimelineSlider(true)
                }
              }}
              className={css.main}
              data-testid={'HealthScoreChartContainer'}
              ref={containerRef}
            >
              <HealthScoreChart
                hasTimelineIntegration
                duration={selectedTimePeriod}
                setHealthScoreData={setHealthScoreData}
                monitoredServiceIdentifier={monitoredServiceIdentifier}
                timeFormat={timeFormat}
              />
              <TimelineSlider
                resetFocus={resetSlider}
                initialSliderWidth={sliderDimensions.minWidth}
                leftContainerOffset={90}
                hideSlider={!showTimelineSlider}
                className={css.slider}
                minSliderWidth={sliderDimensions.minWidth}
                maxSliderWidth={sliderDimensions.maxWidth}
                infoCard={renderInfoCard()}
                onSliderDragEnd={onSliderDragEnd}
                setDefaultSlider
                defaultOffSetPercentage={isFinite(defaultOffset) ? defaultOffset : 0}
              />
              <ChangeTimeline
                duration={selectedTimePeriod}
                useMonitoredServiceChangeTimeline
                monitoredServiceIdentifier={monitoredServiceIdentifier}
                startTime={timeRange?.startTime as number}
                endTime={timeRange?.endTime as number}
                selectedTimePeriod={selectedTimePeriod}
                onSliderMoved={setChangeTimelineSummary}
              />
            </Container>
          </>
        </Card>

        <Layout.Horizontal spacing="medium">
          <Container width="50%">
            <ChangesTable
              startTime={changesTableAndSourceCardStartAndEndtimeWithSlider[0]}
              endTime={changesTableAndSourceCardStartAndEndtimeWithSlider[1]}
              hasChangeSource={hasChangeSource}
              monitoredServiceIdentifier={monitoredServiceIdentifier}
            />
          </Container>
          <Container width="50%">
            <Heading level={2} font={{ variation: FontVariation.H6 }} padding={{ bottom: 'medium' }}>
              {getString('ce.perspectives.reports.title', { count: 0 })}
            </Heading>
            <ReportsTableCard
              startTime={changesTableAndSourceCardStartAndEndtimeWithSlider[0]}
              endTime={changesTableAndSourceCardStartAndEndtimeWithSlider[1]}
            />
          </Container>
        </Layout.Horizontal>

        <MetricsAndLogs
          monitoredServiceIdentifier={monitoredServiceIdentifier}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
          startTime={timeRange?.startTime}
          endTime={timeRange?.endTime}
          showTimelineSlider={showTimelineSlider}
        />
      </Container>
    </>
  )
}
