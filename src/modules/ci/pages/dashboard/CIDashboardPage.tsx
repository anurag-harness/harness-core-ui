import React from 'react'
import { Container, Button, Heading, Text, Icon, Layout } from '@wings-software/uikit'
import { useHistory } from 'react-router-dom'
import { Page } from '@common/exports'
import { routeCIPipelineStudio } from 'navigation/ci/routes'
import { useRouteParams, useAppStoreReader } from 'framework/exports'
import i18n from './CIDashboardPage.i18n'

export const CIDashboardPage: React.FC = () => {
  const {
    params: { projectIdentifier }
  } = useRouteParams()
  const { projects } = useAppStoreReader()
  const project = projects.find(({ identifier }) => identifier === projectIdentifier)
  const history = useHistory()

  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{i18n.welcome}</Heading>
          <Text>{i18n.description}</Text>
          <Icon name="nav-cd" size={200} />
          <Button
            width={200}
            text={i18n.creatPipeline}
            intent="primary"
            onClick={() =>
              history.push(
                routeCIPipelineStudio.url({
                  orgIdentifier: project?.orgIdentifier as string,
                  projectIdentifier: projectIdentifier as string,
                  pipelineIdentifier: -1
                })
              )
            }
          />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CIDashboardPage
