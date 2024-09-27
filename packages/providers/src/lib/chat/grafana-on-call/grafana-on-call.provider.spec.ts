import { expect, test } from 'vitest';
import { GrafanaOnCallChatProvider } from './grafana-on-call.provider';
import { axiosSpy } from '../../../utils/test/spy-axios';

test('should trigger grafana-on-call library correctly', async () => {
  const date = new Date();

  const { mockPost } = axiosSpy({
    headers: { Date: date },
  });

  const provider = new GrafanaOnCallChatProvider({
    alertUid: '123',
    externalLink: 'link',
    imageUrl: 'url',
    state: 'ok',
    title: 'title',
  });

  const testWebhookUrl = 'https://mycompany.webhook.grafana.com/';
  const testContent = 'warning!!';
  const res = await provider.sendMessage({
    webhookUrl: testWebhookUrl,
    content: testContent,
  });

  expect(mockPost).toHaveBeenCalled();
  expect(mockPost).toHaveBeenCalledWith(
    testWebhookUrl,
    {
      alert_uid: '123',
      link_to_upstream_details: 'link',
      image_url: 'url',
      state: 'ok',
      title: 'title',
      message: testContent,
    },
    undefined,
  );
  expect(res).toEqual({ id: expect.any(String), date: date.toISOString() });
});

test('should trigger grafana-on-call library correctly with _passthrough', async () => {
  const date = new Date();

  const { mockPost } = axiosSpy({
    headers: { Date: date },
  });

  const provider = new GrafanaOnCallChatProvider({
    alertUid: '123',
    externalLink: 'link',
    imageUrl: 'url',
    state: 'ok',
    title: 'title',
  });

  const testWebhookUrl = 'https://mycompany.webhook.grafana.com/';
  const testContent = 'warning!!';
  const res = await provider.sendMessage(
    {
      webhookUrl: testWebhookUrl,
      content: testContent,
    },
    {
      _passthrough: {
        body: {
          message: 'passthrough',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
    },
  );

  expect(mockPost).toHaveBeenCalled();
  expect(mockPost).toHaveBeenCalledWith(
    testWebhookUrl,
    {
      alert_uid: '123',
      link_to_upstream_details: 'link',
      image_url: 'url',
      state: 'ok',
      title: 'title',
      message: 'passthrough',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  expect(res).toEqual({ id: expect.any(String), date: date.toISOString() });
});
