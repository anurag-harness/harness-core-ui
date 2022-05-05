/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Heading, Layout, Text, Container, Card, CardBody } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Link } from 'react-router-dom'
import { Classes, Menu } from '@blueprintjs/core'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import routes from '@common/RouteDefinitions'
import useDeleteFolder from '@dashboards/pages/folders/useDeleteFolder'
import { FolderType } from '@dashboards/constants/FolderType'
import { useStrings } from 'framework/strings'
import type { FolderModel } from 'services/custom-dashboards'
import css from '@dashboards/pages/home/HomePage.module.scss'

export interface FolderCardProps {
  accountId: string
  folder: FolderModel
  onFolderDeleted: () => void
}

const FolderCard: React.FC<FolderCardProps> = ({ accountId, folder, onFolderDeleted }) => {
  const { getString } = useStrings()
  const { openDialog } = useDeleteFolder(folder, onFolderDeleted)
  const [menuOpen, setMenuOpen] = useState(false)

  const folderPath = routes.toCustomDashboardHome({
    folderId: folder?.id ?? 'shared',
    accountId
  })

  const onCardMenuInteraction = (nextOpenState: boolean, e?: React.SyntheticEvent<HTMLElement>): void => {
    e?.preventDefault()
    setMenuOpen(nextOpenState)
  }

  const onDeleteCard = (): void => {
    setMenuOpen(false)
    openDialog()
  }

  return (
    <Link to={folderPath}>
      <Card interactive className={cx(css.dashboardCard)}>
        <Container data-testid={'container'}>
          {folder?.type !== FolderType.SHARED && (
            <CardBody.Menu
              data-testid={'folder-card-menu'}
              menuContent={
                <Menu>
                  <RbacMenuItem
                    text={getString('delete')}
                    onClick={onDeleteCard}
                    permission={{
                      permission: PermissionIdentifier.EDIT_DASHBOARD,
                      resource: {
                        resourceType: ResourceType.DASHBOARDS
                      }
                    }}
                  />
                </Menu>
              }
              menuPopoverProps={{
                className: Classes.DARK,
                isOpen: menuOpen,
                onInteraction: onCardMenuInteraction
              }}
            />
          )}

          <Layout.Vertical spacing="large">
            <Heading level={5} color={Color.GREY_800}>
              {folder.name}
            </Heading>
            <Text
              icon="dashboard"
              data-testid={'folder-child-count'}
              iconProps={{ color: Color.GREY_300, size: 22 }}
              color={Color.PRIMARY_7}
              font={{ variation: FontVariation.H5 }}
            >
              {folder.child_count || 0}
            </Text>
          </Layout.Vertical>
        </Container>
      </Card>
    </Link>
  )
}

export default FolderCard
