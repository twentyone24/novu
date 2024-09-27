import { FC, useMemo } from 'react';
import { Prism } from '@mantine/prism';
import { Tabs } from '@novu/novui';
import { IconOutlineCode, IconVisibility } from '@novu/novui/icons';
import { VStack } from '@novu/novui/jsx';
import { ButtonTypeEnum, inAppMessageFromBridgeOutputs, StepTypeEnum } from '@novu/shared';
import { css } from '@novu/novui/css';
import { PreviewWeb } from '../../../../components/workflow/preview/email/PreviewWeb';
import { useActiveIntegrations } from '../../../../hooks';
import {
  ChatBasePreview,
  PushBasePreview,
  InAppBasePreview,
  SmsBasePreview,
} from '../../../../components/workflow/preview';
import { MobileSimulator } from '../../../../components/workflow/preview/common';
import { ErrorPrettyRender } from '../../../../components/workflow/preview/ErrorPrettyRender';

interface IWorkflowStepEditorContentPanelProps {
  preview: any;
  isLoadingPreview: boolean;
  error?: any;
  step: any;
  onlyPreviewView?: boolean;
  source?: 'studio' | 'playground' | 'dashboard';
}

export const WorkflowStepEditorContentPanel: FC<IWorkflowStepEditorContentPanelProps> = ({
  preview,
  isLoadingPreview,
  error,
  step,
  onlyPreviewView,
  source,
}) => {
  if (onlyPreviewView) {
    return (
      <VStack
        className={css({
          height: '100%',
          margin: '0 12px 8px 12px',
        })}
      >
        {error && <ErrorPrettyRender error={error} />}
        <PreviewStep
          source={source}
          channel={step?.template?.type || step?.type}
          preview={preview}
          loadingPreview={error || isLoadingPreview}
        />
      </VStack>
    );
  }

  const tabs = [
    {
      icon: <IconVisibility />,
      value: 'preview',
      label: 'Preview',
      content: (
        <VStack className={css({ width: '100%' })}>
          {error && <ErrorPrettyRender error={error} />}
          <PreviewStep
            source={source}
            channel={step?.template?.type || step?.type}
            preview={preview}
            loadingPreview={error || isLoadingPreview}
          />
        </VStack>
      ),
    },
  ];

  if (step?.code) {
    tabs.push({
      icon: <IconOutlineCode />,
      value: 'code',
      label: 'Code',
      content: (
        <Prism styles={prismStyles} withLineNumbers language="javascript">
          {step?.code || ''}
        </Prism>
      ),
    });
  }

  return <Tabs defaultValue="preview" tabConfigs={tabs} />;
};

export const PreviewStep = ({
  channel,
  preview,
  loadingPreview,
  source,
}: {
  channel: StepTypeEnum;
  preview: any;
  loadingPreview: boolean;
  source?: 'studio' | 'playground' | 'dashboard';
}) => {
  const { integrations = [] } = useActiveIntegrations({ enabled: source !== 'playground' });
  const integration = useMemo(() => {
    return integrations.find((item) => item.channel === 'email' && item.primary) || null;
  }, [integrations]);

  const props = { locales: [], loading: loadingPreview, onLocaleChange: () => {} };

  switch (channel) {
    case StepTypeEnum.EMAIL:
      return (
        <PreviewWeb
          source={source}
          integration={integration}
          content={preview?.outputs?.body}
          subject={preview?.outputs?.subject}
          classNames={{
            browser: css({ display: 'flex', flexDirection: 'column', gap: '0', flex: '1' }),
            content: css({ display: 'flex' }),
            frame: css({ flex: '1', height: 'auto !important' }),
            contentContainer: css({
              minHeight: '72vh',
              flex: '1',
            }),
            skeleton: css({
              width: '100%',
            }),
          }}
          {...props}
        />
      );

    case StepTypeEnum.SMS:
      return <SmsBasePreview content={preview?.outputs?.body} {...props} />;

    case StepTypeEnum.IN_APP: {
      const inAppMessage = inAppMessageFromBridgeOutputs(preview?.outputs);

      return (
        <InAppBasePreview
          content={{
            subject: inAppMessage.subject,
            content: inAppMessage.content,
            avatar: inAppMessage.avatar,
            ctaButtons: inAppMessage.cta.action.buttons,
          }}
          {...props}
        />
      );
    }

    case StepTypeEnum.CHAT:
      return <ChatBasePreview content={preview?.outputs?.body} {...props} />;

    case StepTypeEnum.PUSH:
      return (
        <MobileSimulator withBackground>
          <PushBasePreview title={preview?.outputs?.subject} content={preview?.outputs?.body} {...props} />
        </MobileSimulator>
      );

    case StepTypeEnum.DIGEST:
    case StepTypeEnum.DELAY:
    case StepTypeEnum.CUSTOM:
      return (
        <Prism styles={prismStyles} withLineNumbers language="javascript">
          {`${JSON.stringify(preview?.outputs, null, 2)}`}
        </Prism>
      );

    default:
      return <>Unknown Step</>;
  }
};
const prismStyles = (theme) => ({
  root: {
    width: '100%',
  },
  scrollArea: {
    border: ` 1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[5]}`,
    borderRadius: '7px',
  },
  code: {
    fontWeight: 400,
    backgroundColor: 'transparent !important',
  },
});
