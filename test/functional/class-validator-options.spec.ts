import 'reflect-metadata';
import {strictEqual, deepStrictEqual, ok} from 'assert';
import {Length} from 'class-validator';
import {JsonController} from '../../src/decorator/JsonController';
import {createExpressServer, createKoaServer, getMetadataArgsStorage} from '../../src/index';
import {assertRequest} from './test-utils';
import {defaultMetadataStorage} from 'class-transformer/storage';
import {Get} from '../../src/decorator/Get';
import {QueryParam} from '../../src/decorator/QueryParam';
import {ResponseClassTransformOptions} from '../../src/decorator/ResponseClassTransformOptions';
import {RoutingControllersOptions} from '../../src/RoutingControllersOptions';

describe('parameters auto-validation', () => {
  class UserFilter {
    @Length(5, 15)
    public keyword: string;
  }

  class UserModel {
    get name(): string {
      return this._firstName + ' ' + this._lastName;
    }
    public _firstName: string;
    public _lastName: string;
    public id: number;
  }

  after(() => {
    defaultMetadataStorage.clear();
  });

  describe('should apply global validation enable', () => {
    let requestFilter: any;
    beforeEach(() => {
      requestFilter = undefined;
    });

    before(() => {
      getMetadataArgsStorage().reset();

      @JsonController()
      class ClassTransformUserController {
        @Get('/user')
        public getUsers(@QueryParam('filter') filter: UserFilter): any {
          requestFilter = filter;
          const user = new UserModel();
          user.id = 1;
          user._firstName = 'Umed';
          user._lastName = 'Khudoiberdiev';
          return user;
        }
      }
    });

    const options: RoutingControllersOptions = {
      validation: true,
    };

    let expressApp: any, koaApp: any;
    before(done => (expressApp = createExpressServer(options).listen(3001, done)));
    after(done => expressApp.close(done));
    before(done => (koaApp = createKoaServer(options).listen(3002, done)));
    after(done => koaApp.close(done));

    assertRequest([3001, 3002], 'get', 'user?filter={"keyword": "Um", "__somethingPrivate": "blablabla"}', response => {
      strictEqual(response.response.statusCode, 400);
      strictEqual(requestFilter, void 0);
    });
  });

  describe('should apply local validation enable', () => {
    let requestFilter: any;
    beforeEach(() => {
      requestFilter = undefined;
    });

    before(() => {
      getMetadataArgsStorage().reset();

      @JsonController()
      class ClassTransformUserController {
        @Get('/user')
        @ResponseClassTransformOptions({excludePrefixes: ['_']})
        public getUsers(@QueryParam('filter', {validate: true}) filter: UserFilter): any {
          requestFilter = filter;
          const user = new UserModel();
          user.id = 1;
          user._firstName = 'Umed';
          user._lastName = 'Khudoiberdiev';
          return user;
        }
      }
    });

    let expressApp: any, koaApp: any;
    before(done => (expressApp = createExpressServer().listen(3001, done)));
    after(done => expressApp.close(done));
    before(done => (koaApp = createKoaServer().listen(3002, done)));
    after(done => koaApp.close(done));

    assertRequest([3001, 3002], 'get', 'user?filter={"keyword": "Um", "__somethingPrivate": "blablabla"}', response => {
      strictEqual(response.response.statusCode, 400);
      strictEqual(requestFilter, void 0);
    });
  });

  describe('should apply global validation options', () => {
    let requestFilter: any;
    beforeEach(() => {
      requestFilter = undefined;
    });

    before(() => {
      getMetadataArgsStorage().reset();

      @JsonController()
      class ClassTransformUserController {
        @Get('/user')
        public getUsers(@QueryParam('filter') filter: UserFilter): any {
          requestFilter = filter;
          const user = new UserModel();
          user.id = 1;
          user._firstName = 'Umed';
          user._lastName = 'Khudoiberdiev';
          return user;
        }
      }
    });

    const options: RoutingControllersOptions = {
      validation: {
        skipMissingProperties: true,
      },
    };

    let expressApp: any, koaApp: any;
    before(done => (expressApp = createExpressServer(options).listen(3001, done)));
    after(done => expressApp.close(done));
    before(done => (koaApp = createKoaServer(options).listen(3002, done)));
    after(done => koaApp.close(done));

    assertRequest(
      [3001, 3002],
      'get',
      'user?filter={"notKeyword": "Um", "__somethingPrivate": "blablabla"}',
      response => {
        strictEqual(response.response.statusCode, 200);
        strictEqual(requestFilter.notKeyword, 'Um');
      },
    );
  });

  describe('should pass the valid param after validation', () => {
    let requestFilter: any;
    beforeEach(() => {
      requestFilter = undefined;
    });

    before(() => {
      getMetadataArgsStorage().reset();

      @JsonController()
      class UserController {
        @Get('/user')
        public getUsers(@QueryParam('filter') filter: UserFilter): any {
          requestFilter = filter;
          const user = new UserModel();
          user.id = 1;
          user._firstName = 'Umed';
          user._lastName = 'Khudoiberdiev';
          return user;
        }
      }
    });

    const options: RoutingControllersOptions = {
      validation: true,
    };

    let expressApp: any, koaApp: any;
    before(done => (expressApp = createExpressServer(options).listen(3001, done)));
    after(done => expressApp.close(done));
    before(done => (koaApp = createKoaServer(options).listen(3002, done)));
    after(done => koaApp.close(done));

    assertRequest(
      [3001, 3002],
      'get',
      'user?filter={"keyword": "Umedi", "__somethingPrivate": "blablabla"}',
      response => {
        strictEqual(response.response.statusCode, 200);
        deepStrictEqual(response.body, {
          id: 1,
          _firstName: 'Umed',
          _lastName: 'Khudoiberdiev',
        });
        ok(requestFilter instanceof UserFilter);
        deepStrictEqual(JSON.parse(JSON.stringify(requestFilter)), {
          keyword: 'Umedi',
          __somethingPrivate: 'blablabla',
        });
      },
    );
  });

  describe('should contain param name on validation failed', () => {
    let requestFilter: any;
    beforeEach(() => {
      requestFilter = undefined;
    });

    before(() => {
      getMetadataArgsStorage().reset();

      @JsonController()
      class UserController {
        @Get('/user')
        public getUsers(@QueryParam('filter') filter: UserFilter): any {
          requestFilter = filter;
          const user = new UserModel();
          user.id = 1;
          user._firstName = 'Umed';
          user._lastName = 'Khudoiberdiev';
          return user;
        }
      }
    });

    const options: RoutingControllersOptions = {
      validation: true,
    };

    let expressApp: any, koaApp: any;
    before(done => (expressApp = createExpressServer(options).listen(3001, done)));
    after(done => expressApp.close(done));
    before(done => (koaApp = createKoaServer(options).listen(3002, done)));
    after(done => koaApp.close(done));

    const invalidFilter = {
      keyword: 'aa',
    };

    assertRequest([3001, 3002], 'get', `user?filter=${JSON.stringify(invalidFilter)}`, response => {
      strictEqual(response.response.statusCode, 400);
      strictEqual(response.body.paramName, 'filter');
    });
  });
});
