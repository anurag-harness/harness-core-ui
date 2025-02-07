/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import css from '../CreateCeGcpConnector.module.scss'

export const renderBillingExportExtension = (getString: UseStringsReturn['getString']): JSX.Element => {
  return (
    <Container className={css.extention}>
      <Layout.Vertical spacing="medium">
        <h2>{getString('platform.connectors.ceGcp.billingExtention.heading')}</h2>
        <div>
          <span className={css.prereq}>{getString('platform.connectors.ceGcp.billingExtention.prerequisite')}</span>{' '}
          <a>{getString('platform.connectors.readMore')}</a>{' '}
        </div>
        <ol>
          <li>{getString('platform.connectors.ceGcp.billingExtention.step1')}</li>
          <li>{getString('platform.connectors.ceGcp.billingExtention.step2')}</li>
          <li>
            {getString('platform.connectors.ceGcp.billingExtention.step3.p1')}{' '}
            <span className={css.gray}>{getString('platform.connectors.ceGcp.billingExtention.step3.p2')}</span>
            {getString('platform.connectors.ceGcp.billingExtention.step3.p3')}
          </li>
          <li>{getString('platform.connectors.ceGcp.billingExtention.step4')}</li>
          <li>{getString('platform.connectors.ceGcp.billingExtention.step5')}</li>
          <li>{getString('platform.connectors.ceGcp.billingExtention.step6')}</li>
          <li>{getString('platform.connectors.ceGcp.billingExtention.step7')}</li>
        </ol>
        <div>
          <div>{getString('platform.connectors.ceGcp.billingExtention.otherLinks')}</div>
          <ul>
            <li>
              <a>{getString('platform.connectors.ceGcp.billingExtention.link1')}</a>
            </li>
            <li>
              <a>{getString('platform.connectors.ceGcp.billingExtention.link2')}</a>
            </li>
          </ul>
        </div>
      </Layout.Vertical>
    </Container>
  )
}
