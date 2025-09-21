import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { gtmPlugin } from '../../../src/analytics/plugins/gtm.js';

interface GTMEvent {
  event?: string;
  event_id?: string;
  [key: string]: unknown;
}

type GTMPluginInstance = ReturnType<typeof gtmPlugin>;

type AnalyticsTestWindow = Window & {
  dataLayer?: GTMEvent[];
  __analyticsActivated?: boolean;
};

describe('gtmPlugin activation guard', () => {
  let testWindow: AnalyticsTestWindow;
  let intervalSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    testWindow = window as AnalyticsTestWindow;
    testWindow.dataLayer = [];
    delete testWindow.__analyticsActivated;

    intervalSpy = vi
      .spyOn(window, 'setInterval')
      .mockImplementation(() => 0 as unknown as number);
  });

  afterEach(() => {
    intervalSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('queues events before activation and flushes them once analytics activates', () => {
    const plugin: GTMPluginInstance = gtmPlugin();
    void plugin.initialize();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const eventId = plugin.pushToDataLayerWithEventId({ event: 'test_event', foo: 'bar' }) as string;

    expect(eventId).toMatch(/^test_event_/);
    expect(testWindow.dataLayer?.length).toBe(0);

    testWindow.__analyticsActivated = true;
    void window.dispatchEvent(
      new CustomEvent('analytics:activated', {
        detail: { source: 'test', timestamp: new Date().toISOString() }
      })
    );

    expect(testWindow.dataLayer?.length).toBe(1);
    const flushedEvent = testWindow.dataLayer?.[0];
    expect(flushedEvent?.event).toBe('test_event');
    expect(flushedEvent?.event_id).toBe(eventId);
  });

  it('flushes queued events synchronously when activation flag is already set', () => {
    const plugin: GTMPluginInstance = gtmPlugin();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const queuedEventId = plugin.pushToDataLayerWithEventId({ event: 'queued_before_init' }) as string;

    expect((testWindow.dataLayer ?? []).length).toBe(0);

    testWindow.__analyticsActivated = true;
    testWindow.dataLayer = [];
    void plugin.initialize();

    expect(testWindow.dataLayer?.length).toBe(1);
    const firstEvent = testWindow.dataLayer?.[0];
    expect(firstEvent?.event_id).toBe(queuedEventId);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const postActivationId = plugin.pushToDataLayerWithEventId({ event: 'post_activation' }) as string;
    expect(testWindow.dataLayer?.length).toBe(2);
    const secondEvent = testWindow.dataLayer?.[1];
    expect(secondEvent?.event_id).toBe(postActivationId);
  });
});
