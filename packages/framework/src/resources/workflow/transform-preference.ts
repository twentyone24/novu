import { ChannelTypeEnum } from '@novu/shared';
import type {
  WorkflowOptionsPreference,
  DiscoverWorkflowOutputPreference,
  ChannelPreferenceEditableSpaces,
  ChannelPreference,
} from '../../types';

export function transformPreference(preference?: WorkflowOptionsPreference): DiscoverWorkflowOutputPreference {
  const setChannel = (channelType: ChannelTypeEnum): ChannelPreference => {
    const enabled: boolean =
      preference?.channels?.[channelType]?.enabled !== undefined
        ? (preference?.channels?.[channelType]?.enabled as boolean)
        : true;
    let editable: ChannelPreferenceEditableSpaces[] = ['dashboard', 'subscriber'];

    if (preference?.channels?.[channelType]?.editable) {
      if (preference?.channels?.[channelType]?.editable === false) {
        editable = [];
      }

      if (Array.isArray(preference?.channels?.[channelType]?.editable)) {
        editable = preference?.channels?.[channelType]?.editable as ChannelPreferenceEditableSpaces[];
      }
    }

    return {
      enabled,
      editable,
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
