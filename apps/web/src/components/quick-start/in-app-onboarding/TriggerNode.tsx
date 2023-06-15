import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Handle, Position } from 'reactflow';
import { createStyles, Group, Popover, Stack, useMantineColorScheme } from '@mantine/core';
import styled from '@emotion/styled';

import { ActorTypeEnum, INotificationTemplate, StepTypeEnum, SystemAvatarIconEnum } from '@novu/shared';

import { Button, colors, shadows, Text, Title } from '../../../design-system';
import { TurnOnGradient } from '../../../design-system/icons';
import { createTemplate, testTrigger } from '../../../api/notification-templates';
import { useNotificationGroup, useTemplates } from '../../../hooks';
import {
  inAppSandboxSubscriberId,
  notificationTemplateName,
  OnBoardingAnalyticsEnum,
} from '../../../pages/quick-start/consts';
import { NodeStep } from '../../workflow';
import { useSegment } from '../../providers/SegmentProvider';
import { errorMessage } from '../../../utils/notifications';
import { Playground } from '../../../design-system/icons';
import { TemplateCreationSourceEnum } from '../../../pages/templates/shared';

const useStyles = createStyles((theme) => ({
  dropdown: {
    padding: 24,
    maxHeight: 196,
    borderRadius: 7,
    boxShadow: theme.colorScheme === 'dark' ? shadows.dark : shadows.medium,
    border: 'none',
    backgroundColor: theme.colorScheme === 'dark' ? colors.B30 : colors.white,
  },
  arrow: {
    backgroundColor: theme.colorScheme === 'dark' ? colors.B30 : colors.white,
    border: 'none',
    boxShadow: theme.colorScheme === 'dark' ? shadows.dark : shadows.medium,
  },
}));

export function TriggerNode({ data }: { data: { label: string; email?: string } }) {
  const { framework } = useParams();

  return (
    <NodeStep
      data={data}
      Icon={TurnOnGradient}
      ActionItem={!framework && <TriggerPopover />}
      Handlers={() => {
        return (
          <>
            <Handle type="source" id="a" position={Position.Bottom} />
          </>
        );
      }}
    />
  );
}

function TriggerButton({ setOpened }: { setOpened: (value: boolean) => void }) {
  const [notificationNumber, setNotificationNumber] = useState(1);
  const { templates = [], loading: templatesLoading } = useTemplates();

  const segment = useSegment();

  const { groups, loading: notificationGroupLoading } = useNotificationGroup();

  const { mutateAsync: createNotificationTemplate, isLoading: createTemplateLoading } = useMutation<
    INotificationTemplate & { __source?: string },
    { error: string; message: string; statusCode: number },
    { template: ICreateNotificationTemplateDto; params: { __source?: string } }
  >((data) => createTemplate(data.template, data.params), {
    onError: (error) => {
      errorMessage(error?.message);
    },
  });

  const onboardingNotificationTemplate = templates.find((template) => template.name.includes(notificationTemplateName));

  useEffect(() => {
    async function createOnBoardingTemplate() {
      const payloadToCreate = {
        notificationGroupId: groups[0]._id,
        isBlueprint: false,
        name: notificationTemplateName,
        active: true,
        draft: false,
        steps: [
          {
            template: {
              type: StepTypeEnum.IN_APP,
              content: 'Test notification {{number}}',
              actor: {
                type: ActorTypeEnum.SYSTEM_ICON,
                data: SystemAvatarIconEnum.SUCCESS,
              },
            },
          },
        ],
      };

      await createNotificationTemplate({
        template: payloadToCreate as unknown as ICreateNotificationTemplateDto,
        params: { __source: TemplateCreationSourceEnum.ONBOARDING_IN_APP },
      });
    }

    if (!templatesLoading && !notificationGroupLoading && !createTemplateLoading && !onboardingNotificationTemplate) {
      createOnBoardingTemplate();
    }
  }, [templates, onboardingNotificationTemplate]);

  async function handleRunTrigger() {
    setOpened(false);
    if (!onboardingNotificationTemplate) {
      errorMessage('No onboarding workflow found, Try again later.');
    }
    await testTrigger({
      name: onboardingNotificationTemplate?.triggers[0].identifier,
      to: { subscriberId: inAppSandboxSubscriberId },
      payload: {
        __source: 'in-app-onboarding',
        number: notificationNumber,
      },
    });

    setNotificationNumber((prev) => prev + 1);
    segment.track(OnBoardingAnalyticsEnum.IN_APP_SANDBOX_RUN_TRIGGER_CLICK, { number: notificationNumber });
  }

  return (
    <Button variant="outline" onClick={handleRunTrigger}>
      Run Trigger
    </Button>
  );
}

function TriggerPopover() {
  const [opened, setOpened] = useState(false);

  const { classes } = useStyles();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOpened(true);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Popover
      withArrow
      withinPortal
      transition="rotate-left"
      transitionDuration={300}
      opened={opened}
      position="right"
      width={400}
      classNames={{
        dropdown: classes.dropdown,
        arrow: classes.arrow,
      }}
      middlewares={{ flip: false, shift: false }}
    >
      <Popover.Target>
        <div>
          <TriggerButton setOpened={setOpened} />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <PopoverContent setOpened={setOpened} />
      </Popover.Dropdown>
    </Popover>
  );
}

function PopoverContent({ setOpened }: { setOpened: (opened: boolean) => void }) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? colors.B80 : colors.B70;
  const fillColor = isDark ? colors.B40 : colors.B70;

  return (
    <ContentWrapper>
      <Stack>
        <Group align="center" noWrap>
          <div>
            <Playground fill={fillColor} />
          </div>
          <Stack spacing={8}>
            <Title size={2}>Trigger a Notification!</Title>
            <Text rows={3} size="lg" color={textColor}>
              Run a trigger as if it was sent from your API and see how it might work in your app!
            </Text>
          </Stack>
        </Group>
        <Group position="right">
          <Button
            variant="gradient"
            onClick={() => {
              setOpened(false);
            }}
          >
            Got it
          </Button>
        </Group>
      </Stack>
    </ContentWrapper>
  );
}

const ContentWrapper = styled.div`
  max-width: 356px;
`;
