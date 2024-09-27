import { Exclude } from 'class-transformer';
import { ChannelTypeEnum, IMessageCTA, IActor } from '@novu/shared';

import { IEmailBlock } from '../message-template';
import { SubscriberEntity } from '../subscriber';
import { NotificationTemplateEntity } from '../notification-template';
import type { OrganizationId } from '../organization';
import type { EnvironmentId } from '../environment';
import type { ChangePropsValueType } from '../../types/helpers';

export class MessageEntity {
  _id: string;

  _templateId: string;

  _environmentId: string;

  _messageTemplateId: EnvironmentId;

  _organizationId: OrganizationId;

  _notificationId: string;

  _jobId: string;

  _subscriberId: string;

  subscriber?: SubscriberEntity;

  actorSubscriber?: SubscriberEntity;

  template?: NotificationTemplateEntity;

  templateIdentifier: string;

  createdAt: string;

  expireAt: string;

  updatedAt: string;

  archivedAt?: string;

  content: string | IEmailBlock[];

  transactionId: string;

  subject?: string;

  channel: ChannelTypeEnum;

  seen: boolean;

  read: boolean;

  archived: boolean;

  deleted: boolean;

  email?: string;

  phone?: string;

  chatWebhookUrl?: string;

  directWebhookUrl?: string;

  providerId: string;

  deviceTokens?: string[];

  title?: string;

  lastSeenDate: string;

  lastReadDate: string;

  cta: IMessageCTA;

  _feedId: string;

  status: 'sent' | 'error' | 'warning';

  errorId: string;

  errorText: string;

  @Exclude()
  providerResponse: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  payload: Record<string, unknown>;

  data?: Record<string, unknown>;

  overrides: Record<string, unknown>;

  identifier?: string;

  actor?: IActor;

  _actorId?: string;

  tags?: string[];

  avatar?: string;
}

export type MessageDBModel = ChangePropsValueType<
  MessageEntity,
  | '_templateId'
  | '_environmentId'
  | '_messageTemplateId'
  | '_organizationId'
  | '_notificationId'
  | '_jobId'
  | '_subscriberId'
  | '_feedId'
  | '_actorId'
>;
