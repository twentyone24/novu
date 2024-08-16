import type { DiscoverWorkflowOutput } from '../../types';
import { EMOJI, log } from '../../utils';

export function prettyPrintDiscovery(discoveredWorkflow: DiscoverWorkflowOutput): void {
  // eslint-disable-next-line no-console
  console.log(`\n${log.bold(log.underline('Discovered workflowId:'))} '${discoveredWorkflow.workflowId}'`);
  discoveredWorkflow.steps.forEach((step, i) => {
    const prefix = i === discoveredWorkflow.steps.length - 1 ? '└' : '├';
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${EMOJI.STEP} Discovered stepId: '${step.stepId}'\tType: '${step.type}'`);
    step.providers.forEach((provider, providerIndex) => {
      const providerPrefix = providerIndex === step.providers.length - 1 ? '└' : '├';
      // eslint-disable-next-line no-console
      console.log(`  ${providerPrefix} ${EMOJI.PROVIDER} Discovered provider: '${provider.type}'`);
    });
  });
}
