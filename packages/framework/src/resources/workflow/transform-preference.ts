import { ChannelTypeEnum } from '@novu/shared';
import type { WorkflowOptionsPreference, DiscoverWorkflowOutputPreference, ChannelPreference } from '../../types';

export function transformPreference(preference?: WorkflowOptionsPreference): DiscoverWorkflowOutputPreference {
  const setChannel = (channelType: ChannelTypeEnum): ChannelPreference => {
    const defaultValue: boolean =
      preference?.channels?.[channelType]?.default !== undefined
        ? (preference?.channels?.[channelType]?.default as boolean)
        : true;
    const readOnly: ChannelPreference['readOnly'] = {
      editor: false,
      subscriber: false,
    };

    if (preference?.channels?.[channelType]?.readOnly) {
      if (preference?.channels?.[channelType]?.readOnly?.editor !== undefined) {
        readOnly.editor = preference?.channels?.[channelType]?.readOnly?.editor as boolean;
      }

      if (preference?.channels?.[channelType]?.readOnly?.subscriber !== undefined) {
        readOnly.subscriber = preference?.channels?.[channelType]?.readOnly?.subscriber as boolean;
      }
    }

    return {
      default: defaultValue,
      readOnly,
    };
  };

  return {
    channels: {
      [ChannelTypeEnum.EMAIL]: setChannel(ChannelTypeEnum.EMAIL),
      [ChannelTypeEnum.SMS]: setChannel(ChannelTypeEnum.SMS),
      [ChannelTypeEnum.PUSH]: setChannel(ChannelTypeEnum.PUSH),
      [ChannelTypeEnum.IN_APP]: setChannel(ChannelTypeEnum.IN_APP),
      [ChannelTypeEnum.CHAT]: setChannel(ChannelTypeEnum.CHAT),
    },
  };
}
