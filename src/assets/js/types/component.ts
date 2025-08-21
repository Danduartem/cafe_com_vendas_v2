/**
 * Base component interface that all components must implement
 */
export interface Component {
  /**
   * Initialize the component - called once when the app starts
   */
  init(): void;

  // Allow additional properties for component-specific methods
  [key: string]: any;
}

/**
 * Component with optional cleanup capability
 */
export interface ComponentWithCleanup extends Component {
  /**
   * Cleanup component resources
   */
  destroy(): void;
}

/**
 * Component registration for the main app
 */
export interface ComponentRegistration {
  name: string;
  component: Component;
}

/**
 * Component initialization status for debugging
 */
export interface ComponentStatus {
  name: string;
  initialized: boolean;
  hasInit: boolean;
  error?: Error;
}

/**
 * Component health check result
 */
export interface ComponentHealthStatus {
  status: 'not_initialized' | 'initialized';
  components?: ComponentStatus[];
  total: number;
  healthy: number;
}