import {ParamOptions} from '../decorator-options/ParamOptions';
import {getMetadataArgsStorage} from '../index';

/**
 * Injects all request's query parameters to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function QueryParams(options?: ParamOptions): Function {
  return (object: Object, methodName: string, index: number) => {
    getMetadataArgsStorage().params.push({
      type: 'queries',
      object,
      method: methodName,
      index,
      name: '',
      parse: options ? options.parse : false,
      required: options ? options.required : undefined,
      classTransform: options ? options.transform : undefined,
      explicitType: options ? options.type : undefined,
      validate: options ? options.validate : undefined,
    });
  };
}
