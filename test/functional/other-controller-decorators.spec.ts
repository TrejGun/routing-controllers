import 'reflect-metadata';
import {strictEqual} from 'assert';
import {Controller} from '../../src/decorator/Controller';
import {Get} from '../../src/decorator/Get';
import {Param} from '../../src/decorator/Param';
import {Post} from '../../src/decorator/Post';
import {createExpressServer, createKoaServer, getMetadataArgsStorage, OnNull} from '../../src/index';
import {assertRequest} from './test-utils';
import {HttpCode} from '../../src/decorator/HttpCode';
import {ContentType} from '../../src/decorator/ContentType';
import {Header} from '../../src/decorator/Header';
import {Redirect} from '../../src/decorator/Redirect';
import {Location} from '../../src/decorator/Location';
import {OnUndefined} from '../../src/decorator/OnUndefined';
import {HttpError} from '../../src/http-error/HttpError';
import {Action} from '../../src/Action';
import {JsonController} from '../../src/decorator/JsonController';

describe('other controller decorators', () => {
  before(() => {
    // reset metadata args storage
    getMetadataArgsStorage().reset();

    class QuestionNotFoundError extends HttpError {
      constructor(action: Action) {
        super(404, `Question was not found!`);
        Object.setPrototypeOf(this, QuestionNotFoundError.prototype);
      }
    }

    @Controller()
    class OtherDectoratorsController {
      @Get('/admin')
      @HttpCode(403)
      public getAdmin() {
        return '<html><body>Access is denied</body></html>';
      }

      @Get('/homepage')
      @ContentType('text/html; charset=utf-8')
      public getHomepage() {
        return '<html><body>Hello world</body></html>';
      }

      @Get('/photos/:id')
      @OnUndefined(201)
      public getPhoto(@Param('id') id: number) {
        if (id === 4) {
          return undefined;
        }

        return new Promise((ok, fail) => {
          if (id === 1) {
            ok('Photo');
          } else if (id === 2) {
            ok('');
          } else if (id === 3) {
            ok(null);
          } else {
            ok(undefined);
          }
        });
      }

      @Get('/posts/:id')
      @OnNull(404)
      public getPost(@Param('id') id: number) {
        return new Promise((ok, fail) => {
          if (id === 1) {
            ok('Post');
          } else if (id === 2) {
            ok('');
          } else if (id === 3) {
            ok(null);
          } else {
            ok(undefined);
          }
        });
      }

      @Get('/textpage')
      @ContentType('text/plain; charset=utf-8')
      public getTextpage() {
        return 'Hello text';
      }

      @Get('/github')
      @Location('http://github.com')
      public getToGithub() {
        return '<html><body>Hello, github</body></html>';
      }

      @Get('/userdash')
      @Header('authorization', 'Barer abcdefg')
      @Header('development-mode', 'enabled')
      public getUserdash() {
        return '<html><body>Hello, User</body></html>';
      }

      @Post('/users')
      @HttpCode(201)
      public getUsers() {
        return '<html><body>User has been created</body></html>';
      }

      @Get('/github-redirect')
      @Redirect('http://github.com')
      public goToGithub() {
        // todo: need test for this one
        return '<html><body>Hello, github</body></html>';
      }
    }

    @JsonController()
    class JsonOtherDectoratorsController {
      @Get('/questions/:id')
      @OnUndefined(QuestionNotFoundError)
      public getPosts(@Param('id') id: number) {
        return new Promise((ok, fail) => {
          if (id === 1) {
            ok('Question');
          } else {
            ok(undefined);
          }
        });
      }
    }
  });

  let expressApp: any, koaApp: any;
  before(done => (expressApp = createExpressServer().listen(3001, done)));
  after(done => expressApp.close(done));
  before(done => (koaApp = createKoaServer().listen(3002, done)));
  after(done => koaApp.close(done));

  describe('should return httpCode set by @HttpCode decorator', () => {
    assertRequest([3001, 3002], 'post', 'users', {name: 'Umed'}, response => {
      strictEqual(response.response.statusCode, 201);
      strictEqual(response.body, '<html><body>User has been created</body></html>');
    });

    assertRequest([3001, 3002], 'get', 'admin', response => {
      strictEqual(response.response.statusCode, 403);
      strictEqual(response.body, '<html><body>Access is denied</body></html>');
    });
  });

  describe('should return custom code when @OnNull', () => {
    assertRequest([3001, 3002], 'get', 'posts/1', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.body, 'Post');
    });
    assertRequest([3001, 3002], 'get', 'posts/2', response => {
      strictEqual(response.response.statusCode, 200);
    });
    assertRequest([3001, 3002], 'get', 'posts/3', response => {
      strictEqual(response.response.statusCode, 404);
    });
    assertRequest([3001, 3002], 'get', 'posts/4', response => {
      strictEqual(response.response.statusCode, 404); // this is expected because for undefined 404 is given by default
    });
    assertRequest([3001, 3002], 'get', 'posts/5', response => {
      strictEqual(response.response.statusCode, 404); // this is expected because for undefined 404 is given by default
    });
  });

  describe('should return custom error message and code when @OnUndefined is used with Error class', () => {
    assertRequest([3001, 3002], 'get', 'questions/1', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.body, 'Question');
    });
    assertRequest([3001, 3002], 'get', 'questions/2', response => {
      strictEqual(response.response.statusCode, 404);
      strictEqual(response.body.name, 'QuestionNotFoundError');
      strictEqual(response.body.message, 'Question was not found!');
    });
    assertRequest([3001, 3002], 'get', 'questions/3', response => {
      strictEqual(response.response.statusCode, 404); // because of null
      strictEqual(response.body.name, 'QuestionNotFoundError');
      strictEqual(response.body.message, 'Question was not found!');
    });
  });

  describe('should return custom code when @OnUndefined', () => {
    assertRequest([3001, 3002], 'get', 'photos/1', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.body, 'Photo');
    });
    assertRequest([3001, 3002], 'get', 'photos/2', response => {
      strictEqual(response.response.statusCode, 200);
    });
    assertRequest([3001, 3002], 'get', 'photos/3', response => {
      strictEqual(response.response.statusCode, 204); // because of null
    });
    assertRequest([3001, 3002], 'get', 'photos/4', response => {
      strictEqual(response.response.statusCode, 201);
    });
    assertRequest([3001, 3002], 'get', 'photos/5', response => {
      strictEqual(response.response.statusCode, 201);
    });
  });

  describe('should return content-type in the response when @ContentType is used', () => {
    assertRequest([3001, 3002], 'get', 'homepage', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.response.headers['content-type'], 'text/html; charset=utf-8');
      strictEqual(response.body, '<html><body>Hello world</body></html>');
    });
  });

  describe('should return content-type in the response when @ContentType is used', () => {
    assertRequest([3001, 3002], 'get', 'textpage', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.response.headers['content-type'], 'text/plain; charset=utf-8');
      strictEqual(response.body, 'Hello text');
    });
  });

  describe('should return response with custom headers when @Header is used', () => {
    assertRequest([3001, 3002], 'get', 'userdash', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.response.headers['authorization'], 'Barer abcdefg');
      strictEqual(response.response.headers['development-mode'], 'enabled');
      strictEqual(response.body, '<html><body>Hello, User</body></html>');
    });
  });

  describe('should relocate to new location when @Location is used', () => {
    assertRequest([3001, 3002], 'get', 'github', response => {
      strictEqual(response.response.statusCode, 200);
      strictEqual(response.response.headers['location'], 'http://github.com');
    });
  });
});
