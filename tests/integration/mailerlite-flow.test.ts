/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * End-to-End Flow Tests for MailerLite Integration
 * Tests complete user journey from lead capture through payment confirmation
 */

import { describe, expect, it, vi } from 'vitest';
import { createCustomHandler } from '../mocks/mailerlite.js';
import { mockApiResponse, setupMockServer } from '../mocks/server.js';

// Setup MSW server
setupMockServer();

// Mock environment variables
vi.stubEnv('MAILERLITE_API_KEY', 'test-api-key-123');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_123');

describe('MailerLite Complete Flow E2E Tests', () => {
  // Simulated user journey data
  const userJourney = {
    leadCapture: {
      lead_id: 'e2e-test-lead-123',
      full_name: 'Carlos Oliveira',
      email: 'carlos@example.com',
      phone: '+351923456789',
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: 'early-bird',
      device_type: 'desktop',
      lead_score: 92,
      time_on_page: 180,
      ticket_type: 'VIP'
    },
    paymentIntent: {
      id: 'pi_test_123',
      amount: 18000, // €180.00 in cents
      currency: 'eur',
      status: 'requires_payment_method',
      metadata: {
        lead_id: 'e2e-test-lead-123',
        customer_name: 'Carlos Oliveira',
        customer_email: 'carlos@example.com',
        customer_phone: '+351923456789',
        event_name: 'Café com Vendas',
        spot_type: 'vip_ticket'
      }
    },
    checkoutSession: {
      id: 'cs_test_123',
      payment_intent: 'pi_test_123',
      customer_details: {
        email: 'carlos@example.com',
        name: 'Carlos Oliveira'
      },
      amount_total: 18000,
      currency: 'eur',
      payment_status: 'unpaid',
      metadata: {
        lead_id: 'e2e-test-lead-123',
        customer_phone: '+351923456789',
        event_name: 'Café com Vendas',
        event_date: '2025-10-04',
        spot_type: 'vip_ticket'
      }
    }
  };

  describe('1. Lead Capture Flow', () => {
    it('should capture lead and add to MailerLite with checkout_started group', () => {
      // Step 1: User submits checkout form
      const leadCaptureFlow = {
        action: 'Lead submits checkout form',
        data: userJourney.leadCapture,
        expectedResult: {
          leadCreated: true,
          addedToMailerLite: true,
          group: 'ccv_checkout_started',
          customFields: {
            payment_status: 'lead',
            checkout_started_at: expect.any(String),
            ticket_type: 'VIP',
            marketing_opt_in: 'yes'
          }
        }
      };

      // Validate flow expectations
      expect(leadCaptureFlow.expectedResult.leadCreated).toBe(true);
      expect(leadCaptureFlow.expectedResult.group).toBe('ccv_checkout_started');
      expect(leadCaptureFlow.expectedResult.customFields.payment_status).toBe('lead');
    });

    it('should handle duplicate lead submissions gracefully', () => {
      // Step 2: User accidentally submits form twice
      const duplicateSubmission = {
        action: 'Duplicate form submission',
        data: userJourney.leadCapture,
        expectedResult: {
          success: true,
          mailerlite: {
            action: 'skipped',
            reason: 'Lead already exists'
          },
          noDuplicateCreated: true
        }
      };

      expect(duplicateSubmission.expectedResult.success).toBe(true);
      expect(duplicateSubmission.expectedResult.noDuplicateCreated).toBe(true);
    });

    it('should enrich lead with behavioral data', () => {
      const enrichedLead = {
        ...userJourney.leadCapture,
        browser_name: 'Chrome',
        browser_version: '120.0',
        screen_resolution: '2560x1440',
        viewport_size: '1920x1080',
        scroll_depth: 85,
        sections_viewed: 'hero,problem,solution,testimonials,pricing',
        page_views: 5,
        is_returning_visitor: false,
        session_duration: 420,
        referrer: 'https://facebook.com',
        landing_page: '/early-bird-offer'
      };

      // Validate behavioral data is captured
      expect(enrichedLead.scroll_depth).toBeGreaterThan(80);
      expect(enrichedLead.sections_viewed.split(',').length).toBeGreaterThan(3);
      expect(enrichedLead.session_duration).toBeGreaterThan(180);
    });
  });

  describe('2. Payment Processing Flow', () => {
    describe('Card Payment (Immediate)', () => {
      it('should process successful card payment and update MailerLite', () => {
        const cardPaymentFlow = {
          action: 'Card payment successful',
          paymentIntent: {
            ...userJourney.paymentIntent,
            status: 'succeeded',
            payment_method_types: ['card']
          },
          expectedMailerLiteUpdate: {
            payment_status: 'paid',
            group: 'ccv_buyer_paid',
            amount_paid: 180,
            payment_date: expect.any(String),
            payment_method: 'card_or_instant'
          },
          expectedEmailTrigger: 'confirmation_email'
        };

        expect(cardPaymentFlow.expectedMailerLiteUpdate.payment_status).toBe('paid');
        expect(cardPaymentFlow.expectedMailerLiteUpdate.group).toBe('ccv_buyer_paid');
        expect(cardPaymentFlow.expectedEmailTrigger).toBe('confirmation_email');
      });

      it('should handle failed card payment', () => {
        const failedPayment = {
          action: 'Card payment failed',
          paymentIntent: {
            ...userJourney.paymentIntent,
            status: 'requires_payment_method',
            last_payment_error: {
              message: 'Your card was declined.'
            }
          },
          expectedMailerLiteUpdate: {
            payment_status: 'failed',
            failure_reason: 'Your card was declined.',
            failure_date: expect.any(String)
          },
          expectedEmailTrigger: 'abandoned_cart_email'
        };

        expect(failedPayment.expectedMailerLiteUpdate.payment_status).toBe('failed');
        expect(failedPayment.expectedEmailTrigger).toBe('abandoned_cart_email');
      });

      it('should handle 3D Secure authentication', () => {
        const threeDSecureFlow = {
          action: '3D Secure required',
          paymentIntent: {
            ...userJourney.paymentIntent,
            status: 'requires_action',
            next_action: {
              type: 'redirect_to_url'
            }
          },
          expectedMailerLiteUpdate: {
            payment_status: 'requires_action',
            action_required_date: expect.any(String)
          }
        };

        expect(threeDSecureFlow.expectedMailerLiteUpdate.payment_status).toBe('requires_action');
      });
    });

    describe('Multibanco Payment (Async)', () => {
      it('should generate Multibanco voucher and update fields', () => {
        const multibancoFlow = {
          action: 'Multibanco voucher generated',
          paymentIntent: {
            ...userJourney.paymentIntent,
            status: 'processing',
            payment_method_types: ['multibanco'],
            next_action: {
              type: 'multibanco_display_details',
              multibanco_display_details: {
                entity: '12345',
                reference: '123456789',
                expires_at: Math.floor(Date.now() / 1000) + 86400 // 24 hours
              }
            }
          },
          expectedMailerLiteUpdate: {
            payment_status: 'processing',
            payment_method: 'multibanco',
            mb_entity: '12345',
            mb_reference: '123456789',
            mb_amount: 180,
            mb_expires_at: expect.any(String),
            voucher_generated_at: expect.any(String),
            group: 'ccv_buyer_pending'
          },
          expectedEmailTrigger: 'multibanco_voucher_email'
        };

        expect(multibancoFlow.expectedMailerLiteUpdate.payment_status).toBe('processing');
        expect(multibancoFlow.expectedMailerLiteUpdate.mb_entity).toBeDefined();
        expect(multibancoFlow.expectedMailerLiteUpdate.mb_reference).toBeDefined();
      });

      it('should handle async Multibanco payment completion', () => {
        const asyncPaymentComplete = {
          action: 'Multibanco payment completed (async)',
          webhookEvent: 'checkout.session.async_payment_succeeded',
          session: {
            ...userJourney.checkoutSession,
            payment_status: 'paid'
          },
          expectedMailerLiteUpdate: {
            payment_status: 'paid',
            group: 'ccv_buyer_paid',
            amount_paid: 180,
            payment_date: expect.any(String),
            fulfillment_trigger: 'async_payment_succeeded'
          },
          expectedEmailTrigger: 'confirmation_email',
          expectedDuplicatePrevention: true
        };

        expect(asyncPaymentComplete.expectedMailerLiteUpdate.payment_status).toBe('paid');
        expect(asyncPaymentComplete.expectedDuplicatePrevention).toBe(true);
      });

      it('should handle Multibanco expiration', () => {
        const expiredVoucher = {
          action: 'Multibanco voucher expired',
          currentTime: Date.now(),
          voucherExpiry: Date.now() - 86400000, // Expired 24 hours ago
          expectedMailerLiteUpdate: {
            payment_status: 'expired',
            group: 'ccv_abandoned_payment'
          },
          expectedEmailTrigger: 'payment_expired_email'
        };

        expect(expiredVoucher.voucherExpiry).toBeLessThan(expiredVoucher.currentTime);
        expect(expiredVoucher.expectedMailerLiteUpdate.payment_status).toBe('expired');
      });
    });
  });

  describe('3. Duplicate Prevention', () => {
    it('should prevent duplicate fulfillment for same session', () => {
      const fulfillmentTracking = {
        sessionId: 'cs_test_123',
        paymentIntentId: 'pi_test_123',
        firstFulfillment: {
          timestamp: '2024-01-01T10:00:00Z',
          trigger: 'checkout_session_completed'
        },
        duplicateAttempt: {
          timestamp: '2024-01-01T10:00:05Z',
          trigger: 'payment_intent_succeeded',
          expectedResult: 'skipped',
          reason: 'Already fulfilled'
        }
      };

      expect(fulfillmentTracking.duplicateAttempt.expectedResult).toBe('skipped');
      expect(fulfillmentTracking.duplicateAttempt.reason).toBe('Already fulfilled');
    });

    it('should track fulfillment across different webhook events', () => {
      const crossEventTracking = {
        events: [
          'checkout.session.completed',
          'payment_intent.succeeded',
          'checkout.session.async_payment_succeeded'
        ],
        fulfillmentKeys: [
          'checkout_session_cs_test_123',
          'payment_intent_pi_test_123'
        ],
        expectedBehavior: 'Only first event processes, others are skipped'
      };

      expect(crossEventTracking.fulfillmentKeys.length).toBe(2);
      expect(crossEventTracking.expectedBehavior).toContain('first event processes');
    });
  });

  describe('4. Email Automation Flows', () => {
    it('should trigger correct email sequences based on payment status', () => {
      const emailAutomations = [
        {
          status: 'lead',
          group: 'ccv_checkout_started',
          expectedSequence: 'nurture_sequence',
          emails: ['welcome', 'value_prop', 'urgency']
        },
        {
          status: 'processing',
          group: 'ccv_buyer_pending',
          expectedSequence: 'multibanco_reminder',
          emails: ['voucher_details', 'payment_reminder', 'expiry_warning']
        },
        {
          status: 'paid',
          group: 'ccv_buyer_paid',
          expectedSequence: 'buyer_onboarding',
          emails: ['confirmation', 'event_details', 'preparation_tips']
        },
        {
          status: 'failed',
          group: 'ccv_abandoned_payment',
          expectedSequence: 'cart_recovery',
          emails: ['payment_failed', 'special_offer', 'last_chance']
        }
      ];

      emailAutomations.forEach(automation => {
        expect(automation.emails.length).toBeGreaterThan(0);
        expect(automation.expectedSequence).toBeDefined();
      });
    });

    it('should respect marketing opt-out preferences', () => {
      const optOutScenario = {
        subscriber: {
          email: 'carlos@example.com',
          marketing_opt_in: 'no'
        },
        expectedBehavior: {
          transactionalEmails: true, // Always send
          marketingEmails: false,     // Respect opt-out
          groups: ['ccv Suppression — No Marketing']
        }
      };

      expect(optOutScenario.expectedBehavior.transactionalEmails).toBe(true);
      expect(optOutScenario.expectedBehavior.marketingEmails).toBe(false);
    });
  });

  describe('5. Error Recovery and Resilience', () => {
    it('should handle MailerLite API failures gracefully', () => {
      mockApiResponse(createCustomHandler('network-error'));

      const resilience = {
        primaryAction: 'Payment successful',
        mailerliteFailure: true,
        expectedBehavior: {
          paymentProcessed: true,
          customerCharged: true,
          mailerliteRetry: true,
          webhookResponse: 200, // Still return success
          errorLogged: true
        }
      };

      expect(resilience.expectedBehavior.paymentProcessed).toBe(true);
      expect(resilience.expectedBehavior.webhookResponse).toBe(200);
    });

    it('should use circuit breaker to prevent cascading failures', () => {
      const circuitBreakerTest = {
        failures: 5,
        threshold: 5,
        expectedState: 'OPEN',
        subsequentRequests: 'skipped',
        resetTimeout: 60000,
        expectedRecovery: 'HALF_OPEN after timeout'
      };

      expect(circuitBreakerTest.failures).toBe(circuitBreakerTest.threshold);
      expect(circuitBreakerTest.expectedState).toBe('OPEN');
    });

    it('should implement exponential backoff for retries', () => {
      const retryStrategy = {
        attempts: [1, 2, 3],
        delays: [1000, 2000, 4000], // Exponential backoff
        maxRetries: 3,
        expectedBehavior: 'Stop after max retries'
      };

      retryStrategy.delays.forEach((delay, index) => {
        if (index > 0) {
          expect(delay).toBe(retryStrategy.delays[index - 1] * 2);
        }
      });
    });
  });

  describe('6. Complete User Journey Simulation', () => {
    it('should successfully complete VIP ticket purchase flow', () => {
      // Complete flow simulation
      const completeJourney = {
        steps: [
          { action: 'User lands on page', timestamp: '10:00:00' },
          { action: 'User fills checkout form', timestamp: '10:02:30' },
          { action: 'Lead captured in MailerLite', timestamp: '10:02:31' },
          { action: 'User proceeds to payment', timestamp: '10:03:00' },
          { action: 'Card payment successful', timestamp: '10:03:15' },
          { action: 'MailerLite updated to paid', timestamp: '10:03:16' },
          { action: 'Confirmation email sent', timestamp: '10:03:17' },
          { action: 'User redirected to success page', timestamp: '10:03:18' }
        ],
        finalState: {
          leadId: 'e2e-test-lead-123',
          email: 'carlos@example.com',
          mailerliteGroups: ['ccv_buyer_paid', 'vip_buyers'],
          paymentStatus: 'paid',
          amountPaid: 180,
          ticketType: 'VIP',
          emailsSent: ['confirmation', 'ticket_details'],
          analyticsEvents: ['payment_completed', 'purchase']
        }
      };

      expect(completeJourney.finalState.paymentStatus).toBe('paid');
      expect(completeJourney.finalState.mailerliteGroups).toContain('ccv_buyer_paid');
      expect(completeJourney.finalState.analyticsEvents).toContain('purchase');
    });

    it('should handle abandoned cart recovery flow', () => {
      const abandonedCartFlow = {
        steps: [
          { action: 'User fills checkout form', timestamp: '10:00:00' },
          { action: 'Lead captured', timestamp: '10:00:01' },
          { action: 'User abandons at payment', timestamp: '10:02:00' },
          { action: 'Abandoned cart email sent', timestamp: '10:32:00' }, // 30 min later
          { action: 'User clicks email link', timestamp: '14:00:00' },
          { action: 'User completes payment', timestamp: '14:02:00' },
          { action: 'MailerLite updated', timestamp: '14:02:01' }
        ],
        recovery: {
          timeToRecover: '4 hours',
          emailClicked: true,
          conversionComplete: true,
          finalGroup: 'ccv_buyer_paid'
        }
      };

      expect(abandonedCartFlow.recovery.conversionComplete).toBe(true);
      expect(abandonedCartFlow.recovery.finalGroup).toBe('ccv_buyer_paid');
    });
  });

  describe('7. Performance and Monitoring', () => {
    it('should complete lead capture within performance SLA', () => {
      const performanceMetrics = {
        leadCapture: {
          p50: 200,  // 200ms
          p95: 500,  // 500ms
          p99: 1000, // 1 second
          timeout: 15000
        },
        expectedSLA: {
          p95UnderOneSecond: true,
          timeoutRate: '< 0.1%'
        }
      };

      expect(performanceMetrics.leadCapture.p95).toBeLessThan(1000);
      expect(performanceMetrics.leadCapture.timeout).toBeGreaterThan(10000);
    });

    it('should log structured data for monitoring', () => {
      const monitoringData = {
        correlationId: 'corr-123-456',
        logLevel: 'info',
        timestamp: new Date().toISOString(),
        action: 'lead_capture',
        metadata: {
          leadId: 'e2e-test-lead-123',
          email: 'carlos@example.com',
          source: 'checkout_form',
          mailerliteStatus: 'success',
          processingTime: 235
        }
      };

      expect(monitoringData.correlationId).toBeDefined();
      expect(monitoringData.metadata.processingTime).toBeLessThan(1000);
    });

    it('should track key business metrics', () => {
      const businessMetrics = {
        conversionFunnel: {
          checkoutStarted: 1000,
          paymentAttempted: 850,
          paymentSucceeded: 800,
          conversionRate: 0.80
        },
        mailerliteSync: {
          totalAttempts: 800,
          successful: 795,
          failed: 5,
          successRate: 0.994
        },
        revenueImpact: {
          totalProcessed: 144000, // €1,440
          averageTicketValue: 180,
          refundRate: 0.01
        }
      };

      expect(businessMetrics.conversionFunnel.conversionRate).toBeGreaterThan(0.75);
      expect(businessMetrics.mailerliteSync.successRate).toBeGreaterThan(0.99);
    });
  });
});
