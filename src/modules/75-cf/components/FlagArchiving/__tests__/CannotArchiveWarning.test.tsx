import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { Features } from 'services/cf'
import CannotArchiveWarning, { CannotArchiveWarningProps } from '../CannotArchiveWarning'
import { buildMockDependentFlags } from './__data__/dependentFlagsMock'

const isDependentFlagsResponse = true
const dependentFlagsResponse = buildMockDependentFlags(6, isDependentFlagsResponse)

const renderComponent = (props: Partial<CannotArchiveWarningProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <CannotArchiveWarning
        flagName="my_new_flag"
        dependentFlagsResponse={dependentFlagsResponse as Features}
        {...props}
      />
    </TestWrapper>
  )
}
describe('CannotArchiveWarning', () => {
  test('it should render the list of flags the current flag is dependent on and take the user to the detail page of the prereq flag', async () => {
    renderComponent()

    expect(screen.getByText('cf.featureFlags.archiving.cannotArchive')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.archiving.removeFlag')).toBeInTheDocument()
    expect(screen.getAllByTestId('dependent-flag-row')).toHaveLength(dependentFlagsResponse.features.length)

    dependentFlagsResponse.features.forEach(dependentFlag =>
      expect(screen.getByRole('link', { name: dependentFlag.name })).toBeInTheDocument()
    )

    userEvent.click(screen.getByRole('link', { name: dependentFlagsResponse.features[0].name }))

    // directing to the feature flag detail page
    expect(await screen.findByTestId('location')).toHaveTextContent(
      `/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/${dependentFlagsResponse.features[0].identifier}`
    )
  })
})
