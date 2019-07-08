import {ResponseHandlerType} from '../types/ResponseHandlerType';

/**
 * Storages information about registered response handlers.
 */
export interface ResponseHandlerMetadataArgs {
  /**
   * Method on which decorator is set.
   */
  method: string;

  /**
   * Secondary property value. Can be header value for example.
   */
  secondaryValue?: any;

  /**
   * Class on which's method decorator is set.
   */
  target: Function;

  /**
   * Property type. See ResponsePropertyMetadataType for possible values.
   */
  type: ResponseHandlerType;

  /**
   * Property value. Can be status code, content-type, header name, template name, etc.
   */
  value?: any;
}
