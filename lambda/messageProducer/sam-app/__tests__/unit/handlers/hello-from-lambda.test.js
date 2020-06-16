// Import all functions from getUrisFromDhsAndProduceMessages.js
const lambda = require('../../../src/handlers/getUrisFromDhsAndProduceMessages.js');

// This includes all tests for handler()
describe('Test for getUrisFromDhsAndProduceMessages', function () {
    // This test invokes handler() and compare the result 
    it('Verifies successful response', async () => {
        // Invoke handler()
        const result = await lambda.handler();
        /* 
            The expected result should match the return from your Lambda function.
            e.g. 
            if you change from `const message = 'Hello from Lambda!';` to `const message = 'Hello World!';` in getUrisFromDhsAndProduceMessages.js
            you should change the following line to `const expectedResult = 'Hello World!';`
        */
        const expectedResult = 'Hello from Lambda!';
        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
