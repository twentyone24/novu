import styled from '@emotion/styled';
import { Box, Center, Group } from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { Button, Check, colors, Copy, Input, Sidebar, Text } from '@novu/design-system';
import {
  CHANNELS_WITH_PRIMARY,
  CredentialsKeyEnum,
  EmailProviderIdEnum,
  IConfigCredentials,
  IConstructIntegrationDto,
  ICredentialsDto,
  InAppProviderIdEnum,
  SmsProviderIdEnum,
} from '@novu/shared';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import slugify from 'slugify';
import { useWebhookSupportStatus } from '../../../../../api/hooks';
import { useUpdateIntegration } from '../../../../../api/hooks/useUpdateIntegration';
import { Conditions, IConditions } from '../../../../../components/conditions';
import { When } from '../../../../../components/utils/When';
import { useEnvironment } from '../../../../../hooks';
import { successMessage } from '../../../../../utils/notifications';
import { Faq } from '../../../../quick-start/components/QuickStartWrapper';
import { SetupTimeline } from '../../../../quick-start/components/SetupTimeline';
import { FrameworkEnum } from '../../../../quick-start/consts';
import { defaultIntegrationConditionsProps } from '../../../constants';
import type { IIntegratedProvider } from '../../../types';
import { useProviders } from '../../../useProviders';
import { IntegrationInput } from '../../IntegrationInput';
import { ShareableUrl } from '../../Modal/ConnectIntegrationForm';
import { NovuInAppFrameworkHeader } from '../../NovuInAppFrameworkHeader';
import { NovuInAppRemoveBranding } from '../../NovuInAppRemoveBranding';
import { SetupWarning } from '../../SetupWarning';
import { UpdateIntegrationCommonFields } from '../../UpdateIntegrationCommonFields';
import { UpdateIntegrationSidebarHeader } from '../../UpdateIntegrationSidebarHeader';
import { NovuInAppFrameworks } from '../../v2';
import { NovuProviderSidebarContent } from '../NovuProviderSidebarContent';
import { useSelectPrimaryIntegrationModal } from '../useSelectPrimaryIntegrationModal';

interface IProviderForm {
  name: string;
  credentials: ICredentialsDto;
  active: boolean;
  identifier: string;
  conditions: IConditions[];
  removeNovuBranding?: boolean;
}

enum SidebarStateEnum {
  NORMAL = 'normal',
  EXPANDED = 'expanded',
}

export function UpdateProviderSidebar({
  isOpened,
  integrationId,
  onClose,
}: {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
}) {
  const { isLoaded: isEnvironmentLoaded } = useEnvironment();
  const [sidebarState, setSidebarState] = useState<SidebarStateEnum>(SidebarStateEnum.NORMAL);
  const [framework, setFramework] = useState<FrameworkEnum | null>(null);
  const { providers, isLoading: areProvidersLoading } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<IIntegratedProvider | null>(() => {
    const provider = providers.find((el) => el.integrationId === integrationId);

    return provider ?? null;
  });
  const isNovuInAppProvider = selectedProvider?.providerId === InAppProviderIdEnum.Novu;
  const { openModal: openSelectPrimaryIntegrationModal, SelectPrimaryIntegrationModal } =
    useSelectPrimaryIntegrationModal();
  const [conditionsFormOpened, { close: closeConditionsForm, open: openConditionsForm }] = useDisclosure(false);
  const webhookUrlClipboard = useClipboard({ timeout: 1000 });

  const { updateIntegration, isLoadingUpdate } = useUpdateIntegration(selectedProvider?.integrationId || '');

  const { isWebhookEnabled, webhookUrl } = useWebhookSupportStatus({
    hasCredentials: selectedProvider?.hasCredentials,
    integrationId: selectedProvider?.integrationId,
    channel: selectedProvider?.channel,
  });

  const methods = useForm<IProviderForm>({
    shouldUseNativeValidation: false,
    shouldFocusError: false,
    defaultValues: {
      name: '',
      credentials: {},
      active: false,
      identifier: '',
      conditions: [],
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty, dirtyFields },
  } = methods;

  const credentials = watch('credentials');
  const isActive = watch('active');
  const isSidebarOpened = !!selectedProvider && isOpened;

  const haveAllCredentials = useMemo(() => {
    if (selectedProvider === null) {
      return false;
    }
    const missingCredentials = selectedProvider.credentials
      .filter((credential) => credential.required)
      .filter((credential) => {
        const value = credentials[credential.key];

        return !value;
      });

    return missingCredentials.length === 0;
  }, [selectedProvider, credentials]);

  useEffect(() => {
    if (selectedProvider && !selectedProvider?.identifier) {
      const newIdentifier = slugify(selectedProvider?.displayName, {
        lower: true,
        strict: true,
      });

      setValue('identifier', newIdentifier);
    }
  }, [setValue, selectedProvider]);

  useEffect(() => {
    if (integrationId === undefined || providers.length === 0) {
      return;
    }
    const foundProvider = providers.find((provider) => provider.integrationId === integrationId);
    if (!foundProvider) {
      return;
    }

    setSelectedProvider(foundProvider);
    reset({
      name: foundProvider.name ?? foundProvider.displayName,
      identifier: foundProvider.identifier,
      credentials: foundProvider.credentials.reduce((prev, credential) => {
        prev[credential.key] = credential.value;

        return prev;
      }, {} as any),
      conditions: foundProvider.conditions,
      active: foundProvider.active,
      removeNovuBranding: foundProvider.removeNovuBranding,
    });
  }, [reset, integrationId, providers]);

  const onFrameworkClickCallback = (newFramework: FrameworkEnum) => {
    setSidebarState(SidebarStateEnum.EXPANDED);
    setFramework(newFramework);
  };

  const onBack = () => {
    if (sidebarState === SidebarStateEnum.EXPANDED) {
      setSidebarState(SidebarStateEnum.NORMAL);
      setFramework(null);
    }
  };

  const onSidebarClose = () => {
    if (sidebarState === SidebarStateEnum.EXPANDED) {
      setSidebarState(SidebarStateEnum.NORMAL);
    }
    onClose();
  };

  const updateAndSelectPrimaryIntegration = async (data: IConstructIntegrationDto) => {
    if (!selectedProvider) {
      return;
    }

    const { channel: selectedChannel, environmentId, primary, conditions } = selectedProvider;
    const isActiveFieldChanged = dirtyFields.active;
    const hasSameChannelActiveIntegration = !!providers
      .filter((el) => el.integrationId !== selectedProvider.integrationId)
      .find((el) => el.active && el.channel === selectedChannel && el.environmentId === environmentId);
    const isChannelSupportPrimary = CHANNELS_WITH_PRIMARY.includes(selectedChannel);

    const isChangedToActive =
      isActiveFieldChanged && isChannelSupportPrimary && isActive && hasSameChannelActiveIntegration;

    const isChangedToInactiveAndIsPrimary =
      isActiveFieldChanged && isChannelSupportPrimary && !isActive && primary && hasSameChannelActiveIntegration;

    const isPrimaryAndHasConditionsApplied =
      primary && conditions && conditions.length > 0 && hasSameChannelActiveIntegration;

    const hasNoConditions = !conditions || conditions.length === 0;

    const hasUpdatedConditions = data.conditions && data.conditions.length > 0;

    const hasConditionsAndIsPrimary = hasUpdatedConditions && primary && dirtyFields.conditions;

    if (
      (hasNoConditions && isChangedToActive) ||
      isChangedToInactiveAndIsPrimary ||
      isPrimaryAndHasConditionsApplied ||
      hasConditionsAndIsPrimary
    ) {
      openSelectPrimaryIntegrationModal({
        environmentId: selectedProvider?.environmentId,
        channelType: selectedProvider?.channel,
        exclude: !isActive || hasConditionsAndIsPrimary ? (el) => el._id === selectedProvider.integrationId : undefined,
        onClose: () => {
          updateIntegration(data);
        },
      });

      return;
    }

    updateIntegration(data);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    handleSubmit(updateAndSelectPrimaryIntegration)(e);
  };

  const hmacEnabled = useWatch({
    control,
    name: `credentials.${CredentialsKeyEnum.Hmac}`,
  });

  const updateConditions = (conditions: IConditions[]) => {
    setValue('conditions', conditions, { shouldDirty: true });
  };

  if (conditionsFormOpened) {
    const [conditions, name] = getValues(['conditions', 'name']);

    return (
      <Conditions
        conditions={conditions}
        name={name}
        isOpened={conditionsFormOpened}
        updateConditions={updateConditions}
        onClose={closeConditionsForm}
        {...defaultIntegrationConditionsProps}
      />
    );
  }

  if (
    SmsProviderIdEnum.Novu === selectedProvider?.providerId ||
    EmailProviderIdEnum.Novu === selectedProvider?.providerId
  ) {
    return (
      <FormProvider {...methods}>
        <Sidebar
          isOpened={isSidebarOpened}
          isLoading={areProvidersLoading || !isEnvironmentLoaded}
          onClose={onSidebarClose}
          onSubmit={onSubmit}
          customHeader={
            <UpdateIntegrationSidebarHeader
              openConditions={openConditionsForm}
              provider={selectedProvider}
              onSuccessDelete={onSidebarClose}
            >
              <Free>Test Provider</Free>
            </UpdateIntegrationSidebarHeader>
          }
          data-test-id="update-provider-sidebar-novu"
          customFooter={
            <Group position="right" w="100%">
              <Button
                disabled={!isDirty || isLoadingUpdate}
                submit
                loading={isLoadingUpdate}
                data-test-id="update-provider-sidebar-update"
              >
                Update
              </Button>
            </Group>
          }
        >
          <NovuProviderSidebarContent provider={selectedProvider} />
          <UpdateIntegrationCommonFields provider={selectedProvider} />
        </Sidebar>
        <SelectPrimaryIntegrationModal />
      </FormProvider>
    );
  }

  return (
    <FormProvider {...methods}>
      <Sidebar
        isOpened={isSidebarOpened}
        isLoading={areProvidersLoading || !isEnvironmentLoaded}
        isExpanded={sidebarState === SidebarStateEnum.EXPANDED}
        onSubmit={onSubmit}
        onClose={onSidebarClose}
        onBack={onBack}
        customHeader={
          sidebarState === SidebarStateEnum.NORMAL ? (
            <UpdateIntegrationSidebarHeader
              openConditions={openConditionsForm}
              provider={selectedProvider}
              onSuccessDelete={onSidebarClose}
            />
          ) : (
            <>
              <When truthy={isNovuInAppProvider}>
                <NovuInAppFrameworkHeader framework={framework} />
              </When>
            </>
          )
        }
        customFooter={
          <Group position="apart" w="100%">
            <Center inline>
              <Text mr={5}>Explore our</Text>
              <Text gradient>
                <a href={selectedProvider?.docReference} target="_blank" rel="noopener noreferrer">
                  set-up guide
                </a>
              </Text>
            </Center>
            <Button
              disabled={!isDirty || isLoadingUpdate}
              submit
              loading={isLoadingUpdate}
              data-test-id="update-provider-sidebar-update"
            >
              Update
            </Button>
          </Group>
        }
        data-test-id="update-provider-sidebar"
      >
        <When truthy={sidebarState === SidebarStateEnum.NORMAL}>
          <SetupWarning
            show={!haveAllCredentials}
            message="Set up credentials to start sending notifications."
            docReference={selectedProvider?.docReference}
          />
          <UpdateIntegrationCommonFields provider={selectedProvider} />
          {selectedProvider?.credentials.map((credential: IConfigCredentials) => (
            <InputWrapper key={credential.key}>
              <Controller
                name={`credentials.${credential.key}`}
                control={control}
                {...(credential.type === 'boolean' || credential.type === 'switch' ? { defaultValue: false } : {})}
                rules={{
                  required: credential.required ? `Please enter a ${credential.displayName.toLowerCase()}` : undefined,
                }}
                render={({ field }) => (
                  <IntegrationInput credential={credential} errors={errors?.credentials ?? {}} field={field} />
                )}
              />
            </InputWrapper>
          ))}
          {isNovuInAppProvider && <NovuInAppRemoveBranding control={control} />}
          {isWebhookEnabled && (
            <InputWrapper>
              <Input
                label="Webhook URL"
                value={webhookUrl}
                readOnly
                rightSection={
                  <CopyWrapper onClick={() => webhookUrlClipboard.copy(webhookUrl)}>
                    {webhookUrlClipboard.copied ? <Check /> : <Copy />}
                  </CopyWrapper>
                }
                data-test-id="provider-webhook-url"
              />
            </InputWrapper>
          )}
          <ShareableUrl provider={selectedProvider?.providerId} hmacEnabled={!!hmacEnabled} />
          {isNovuInAppProvider && <NovuInAppFrameworks onFrameworkClick={onFrameworkClickCallback} />}
        </When>
        <When truthy={isNovuInAppProvider && sidebarState === SidebarStateEnum.EXPANDED}>
          <SetupTimeline
            framework={framework?.toString() ?? ''}
            onDone={() => {
              setSidebarState(SidebarStateEnum.NORMAL);
              successMessage('Successfully configured Inbox');
            }}
            onConfigureLater={() => {
              setSidebarState(SidebarStateEnum.NORMAL);
            }}
          />
          <Box ml={70}>
            <Faq />
          </Box>
        </When>
      </Sidebar>
      <SelectPrimaryIntegrationModal />
    </FormProvider>
  );
}

const InputWrapper = styled.div`
  > div {
    width: 100%;
  }
`;

const Free = styled.span`
  color: ${colors.success};
  font-size: 14px;
  min-width: fit-content;
  margin-left: -4px;
`;

const CopyWrapper = styled.div`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;
