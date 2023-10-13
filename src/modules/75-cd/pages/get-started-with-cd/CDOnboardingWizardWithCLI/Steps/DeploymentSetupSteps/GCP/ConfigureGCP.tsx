import React from 'react'
import { Button, ButtonVariation, Label, Layout, Text, TextInput } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'

export default function ConfigureGCP(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical margin={{ top: 'large', bottom: 'xlarge' }}>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }} font={{ variation: FontVariation.FORM_TITLE }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.configureGcp"
        />
      </Text>

      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.getPermissions"
        />
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.createBucket"
        />
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.downloadArtifact"
        />
      </Text>
      <Button
        margin={{ bottom: 'xlarge', left: 'xlarge' }}
        variation={ButtonVariation.PRIMARY}
        width={180}
        icon="arrow-down"
        text={getString('cd.getStartedWithCD.downloadZipFile')}
      />
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        <String
          useRichText
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.createBucket"
        />
      </Text>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.uploadSVCKey')}
        </Label>
        <TextInput
          id="gcpservicekeyfile"
          name="gcpservicekeyfile"
          defaultValue={''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.placholders.bucketName'
          )}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          //   const value = e.target.value
          //   // onUpdate({ ...state, githubUsername: value })
          // }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.gcpProjectName')}
        </Label>
        <TextInput
          id="gcpproject"
          name="gcpproject"
          defaultValue={''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.placholders.projectName'
          )}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          //   const value = e.target.value
          //   // onUpdate({ ...state, githubUsername: value })
          // }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.gcpRegion')}
        </Label>
        <TextInput
          id="gcpproject"
          name="gcpproject"
          defaultValue={''}
          placeholder={getString('regionLabel')}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          //   const value = e.target.value
          //   // onUpdate({ ...state, githubUsername: value })
          // }}
        />
      </Layout.Vertical>
      <Layout.Vertical width={400} margin={{ left: 'xlarge' }}>
        <Label>
          {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.gcpBucketName')}
        </Label>
        <TextInput
          id="gcpbucket"
          name="gcpbucket"
          defaultValue={''}
          placeholder={getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.configureGCPStep.placholders.bucketName'
          )}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          //   const value = e.target.value
          //   // onUpdate({ ...state, githubUsername: value })
          // }}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
