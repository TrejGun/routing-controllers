import {AuthorizationChecker} from './AuthorizationChecker';
import {ClassTransformOptions} from 'class-transformer';
import {CurrentUserChecker} from './CurrentUserChecker';
import {ParamOptions} from './decorator-options/ParamOptions';
import {ValidatorOptions} from 'class-validator';

/**
 * Routing controller initialization options.
 */
export interface RoutingControllersOptions {
  /**
   * Special function used to check user authorization roles per request.
   * Must return true or promise with boolean true resolved for authorization to succeed.
   */
  authorizationChecker?: AuthorizationChecker;

  /**
   * Global class transformer options passed to class-transformer during classToPlain operation.
   * This operation is being executed when server returns response to user.
   */
  classToPlainTransformOptions?: ClassTransformOptions;

  /**
   * Indicates if class-transformer should be used to perform serialization / deserialization.
   */
  classTransformer?: boolean;

  /**
   * List of controllers to register in the framework or directories from where to import all your controllers.
   */
  controllers?: Array<Function> | Array<string>;

  /**
   * Indicates if cors are enabled.
   * This requires installation of additional module (cors for express and kcors for koa).
   */
  cors?: boolean | Object;

  /**
   * Special function used to get currently authorized user.
   */
  currentUserChecker?: CurrentUserChecker;

  /**
   * Indicates if default routing-controller's error handler is enabled or not.
   * Enabled by default.
   */
  defaultErrorHandler?: boolean;

  /**
   * Default settings
   */
  defaults?: {
    /**
     * If set, all null responses will return specified status code by default
     */
    nullResultCode?: number;

    /**
     * Default param options
     */
    paramOptions?: {
      /**
       * If true, all non-set parameters will be required by default
       */
      required?: boolean;
    };

    /**
     * If set, all undefined responses will return specified status code by default
     */
    undefinedResultCode?: number;
  };

  /**
   * Indicates if development mode is enabled.
   * By default its enabled if your NODE_ENV is not equal to "production".
   */
  development?: boolean;

  /**
   * Map of error overrides.
   */
  errorOverridingMap?: {[key: string]: any};

  /**
   * List of interceptors to register in the framework or directories from where to import all your interceptors.
   */
  interceptors?: Array<Function> | Array<string>;

  /**
   * List of middlewares to register in the framework or directories from where to import all your middlewares.
   */
  middlewares?: Array<Function> | Array<string>;

  /**
   * Global class transformer options passed to class-transformer during plainToClass operation.
   * This operation is being executed when parsing user parameters.
   */
  plainToClassTransformOptions?: ClassTransformOptions;

  /**
   * Global route prefix, for example '/api'.
   */
  routePrefix?: string;

  /**
   * Indicates if class-validator should be used to auto validate objects injected into params.
   * You can also directly pass validator options to enable validator with a given options.
   */
  validation?: boolean | ValidatorOptions;
}
