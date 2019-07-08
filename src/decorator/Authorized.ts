import {getMetadataArgsStorage} from '../index';

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function Authorized(): Function;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function Authorized(role: any): Function;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function Authorized(roles: Array<any>): Function;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function Authorized(role: Function): Function;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function Authorized(roleOrRoles?: string | Array<string> | Function): Function {
  return (clsOrObject: Function | Object, method?: string) => {
    getMetadataArgsStorage().responseHandlers.push({
      type: 'authorized',
      target: method ? clsOrObject.constructor : (clsOrObject as Function),
      method,
      value: roleOrRoles,
    });
  };
}
