/**
 * Multibanco Payment Utility
 * Shared logic for handling Multibanco voucher display and processing
 */

export interface MultibancoDetails {
  entity?: string | null;
  reference?: string | null;
  amount?: number;
  paymentIntent?: string | null;
  sessionId?: string | null;
  paymentMethod?: string | null;
}

export interface MultibancoDisplayOptions {
  showCopyButtons?: boolean;
  containerSelector?: string;
  theme?: 'light' | 'dark' | 'warning';
}

/**
 * Format Multibanco reference for better readability
 */
export function formatMultibancoReference(reference: string): string {
  return reference.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/**
 * Generate standardized Multibanco instructions HTML
 */
export function generateMultibancoInstructions(
  details: MultibancoDetails,
  options: MultibancoDisplayOptions = {}
): string {
  const { entity, reference, amount = 180 } = details;
  const { showCopyButtons = true, theme = 'warning' } = options;

  const themeClasses = {
    light: {
      container: 'from-blue-50 to-blue-100/50 border-blue-200 text-blue-700',
      icon: 'bg-blue-600',
      title: 'text-blue-900',
      instructions: 'bg-blue-600',
      important: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    warning: {
      container: 'from-amber-50 to-amber-100/50 border-amber-200 text-amber-700',
      icon: 'bg-amber-600',
      title: 'text-amber-900',
      instructions: 'bg-amber-600',
      important: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    dark: {
      container: 'from-navy-50 to-navy-100/50 border-navy-200 text-navy-700',
      icon: 'bg-navy-600',
      title: 'text-navy-900',
      instructions: 'bg-navy-600',
      important: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  };

  const colors = themeClasses[theme];

  return `
    <div class="mb-8 p-6 rounded-2xl bg-gradient-to-br ${colors.container} border-2 shadow-md">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center text-white shadow-md">
          🏦
        </div>
        <div class="flex-1">
          <h3 class="font-lora text-xl font-bold ${colors.title} mb-3">Complete o seu pagamento Multibanco</h3>
          <p class="${colors.title} mb-4">Para finalizar a sua inscrição, efetue o pagamento usando os dados abaixo:</p>
          
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div class="space-y-3">
              ${entity ? `
                <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span class="text-sm font-medium text-gray-600">Entidade:</span>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-lg text-navy-900">${entity}</span>
                    ${showCopyButtons ? `
                      <button type="button" onclick="copyMultibancoValue('${entity}', 'Entidade copiada!')" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Copiar entidade">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
              ${reference ? `
                <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span class="text-sm font-medium text-gray-600">Referência:</span>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-lg text-navy-900 tracking-wider">${formatMultibancoReference(reference)}</span>
                    ${showCopyButtons ? `
                      <button type="button" onclick="copyMultibancoValue('${reference}', 'Referência copiada!')" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Copiar referência">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600">Valor:</span>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-lg text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">€${amount.toFixed(2)}</span>
                  ${showCopyButtons ? `
                    <button type="button" onclick="copyMultibancoValue('€${amount.toFixed(2)}', 'Valor copiado!')" class="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Copiar valor">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 p-4 ${colors.instructions} text-white rounded-xl">
            <h6 class="font-semibold mb-2 flex items-center gap-2">
              <span>⚡</span>
              Como proceder:
            </h6>
            <ol class="text-sm space-y-1 list-decimal list-inside">
              <li>Aceda à sua aplicação bancária ou ATM</li>
              <li>Selecione "Pagamentos" → "Referência Multibanco"</li>
              <li>Insira a Entidade e Referência acima</li>
              <li>Confirme o valor e finalize o pagamento</li>
            </ol>
          </div>
          
          <div class="flex items-center gap-2 mt-4 p-3 ${colors.important} rounded-lg">
            <span class="text-amber-600 text-lg">⏰</span>
            <p class="text-sm">
              <strong>Importante:</strong> Esta referência é válida por 3 dias. Receberá confirmação por email após o pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Check if payment should be treated as Multibanco based on various indicators
 */
export function isMultibancoPayment(params: {
  paymentMethod?: string | null;
  multibancoEntity?: string | null;
  multibancoReference?: string | null;
  redirectStatus?: string | null;
  paymentStatus?: string | null;
  paymentIntent?: string | null;
  sessionId?: string | null;
}): boolean {
  const {
    paymentMethod,
    multibancoEntity,
    multibancoReference,
    redirectStatus,
    paymentStatus,
    paymentIntent,
    sessionId
  } = params;

  return (
    // Primary: explicit payment method
    paymentMethod === 'multibanco' ||
    // Secondary: presence of Multibanco voucher details
    !!(multibancoEntity && multibancoReference) ||
    // Tertiary: processing status with payment intent (likely async payment)
    (redirectStatus === 'processing' && !!paymentIntent) ||
    // Quaternary: payment status processing (direct from checkout)
    (paymentStatus === 'processing' && !!paymentIntent) ||
    // Fallback: session ID with processing status (webhook redirect scenario)
    !!(sessionId && (redirectStatus === 'processing' || paymentStatus === 'processing'))
  );
}

/**
 * Global copy function for Multibanco values (to be used in onclick handlers)
 */
declare global {
  interface Window {
    copyMultibancoValue: (value: string, message: string) => void;
    showMultibancoNotification: (message: string) => void;
  }
}

// Initialize global copy functions when this module loads
if (typeof window !== 'undefined') {
  window.copyMultibancoValue = function(value: string, message: string) {
    if (value && value !== '-----' && value !== '--- --- ---') {
      navigator.clipboard.writeText(value).then(() => {
        window.showMultibancoNotification(message);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        window.showMultibancoNotification(message);
      });
    }
  };

  window.showMultibancoNotification = function(message: string) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('multibancoNotification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'multibancoNotification';
      notification.className = 'hidden fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span id="multibancoNotificationText">Copiado!</span>
        </div>
      `;
      document.body.appendChild(notification);
    }

    const notificationText = notification.querySelector('#multibancoNotificationText');
    if (notificationText) {
      notificationText.textContent = message;
    }

    notification.classList.remove('hidden');
    notification.classList.add('animate-in');

    setTimeout(() => {
      notification?.classList.add('hidden');
      notification?.classList.remove('animate-in');
    }, 2000);
  };
}