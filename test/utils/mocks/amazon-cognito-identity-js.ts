import * as CognitoService from 'amazon-cognito-identity-js';

const mock = jest.spyOn(CognitoService, 'CognitoUserPool');

mock.mockImplementation(() => CognitoService.CognitoUserPool.prototype);

export default mock;
