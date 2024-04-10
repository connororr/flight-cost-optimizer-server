import { AmadeusService } from "./amadeus-service.ts";

const mockAccessToken = 'mock-access-token';

global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({
        access_token: mockAccessToken
    })
});

describe('AmadeusService', () => {

    const mockEndpoint = '/mock-endpoint';
    const mockBody = { mockVal: 'mockVal' };
    const mockClientId = 'mock-client-id';
    const mockClientSecret = 'mock-client-secret';
    const mockHttpMethod = 'POST';

    beforeEach(() => {
        process.env = Object.assign(process.env, {
            client_id: mockClientId,
            client_secret: mockClientSecret
        });
    })

    it('should grab an access token if it doesn\'t exist', async () => {
        const testInstance = createTestInstance();
        const tokenRequest = {
            grant_type: 'client_credentials',
            client_id: mockClientId,
            client_secret: mockClientSecret,
        };

        const mockRequestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(tokenRequest).toString(),
        };

        await testInstance.request(mockEndpoint, mockBody, mockHttpMethod);

        expect(fetch).toHaveBeenCalledWith('https://test.api.amadeus.com/v1/security/oauth2/token', mockRequestOptions);
    });

    it('should grab an access token if it has expired after 20 minutes', () => {
        const elapsedAccessTokenTimestamp = Date.now() - (60 * 1000 * 21);
        const testInstance = createTestInstance(elapsedAccessTokenTimestamp);
        const tokenRequest = {
            grant_type: 'client_credentials',
            client_id: mockClientId,
            client_secret: mockClientSecret,
        };

        const mockRequestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(tokenRequest).toString(),
        };

        testInstance.request(mockEndpoint, mockBody, mockHttpMethod);

        expect(fetch).toHaveBeenCalledWith('https://test.api.amadeus.com/v1/security/oauth2/token', mockRequestOptions);
    })

    it('should make a request to amadeus with the correct body, endpoint and headers', async () => {
        const testInstance = createTestInstance();
        const mockGetMethod = 'GET';
        let headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`,
        };

        const mockRequestOptions = {
            method: mockGetMethod,
            headers: headers,
            body: JSON.stringify(mockBody)
        }

        await testInstance.request(mockEndpoint, mockBody, mockGetMethod);
        expect(fetch).toHaveBeenNthCalledWith(2, `https://test.api.amadeus.com${mockEndpoint}`, mockRequestOptions);
    });

    describe('when the request is a POST request', () => {
        it('should add a X-HTTP-Method-Override header', async () => {
            const testInstance = createTestInstance();

            let headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mockAccessToken}`,
                'X-HTTP-Method-Override': 'POST',
            };

            await testInstance.request(mockEndpoint, mockBody, mockHttpMethod);
            const postRequestBody = (global.fetch as jest.Mock).mock.calls[1][1];
            expect(postRequestBody).toStrictEqual(expect.objectContaining({ headers }))
        })

    });

    function createTestInstance(accessTokenTimestamp?: number) {
        return new AmadeusService(accessTokenTimestamp);
    }
})