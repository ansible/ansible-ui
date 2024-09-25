# API Contract

We need API contracts for AAP.

There are a couple of ways we can get API contracts.
1. The API teams can deliver Swagger/OpenAPI schema for the API.
2. The UI team can hand code the interfaces and write code to validate that API calls match.

Questions:

- For services like AWX would the Swagger/OpenAPI be able to support generated fields like `summary_fields`.

From the UI perspective

- We can generate client SDKs from Swagger/OpenAPI
- We get strongly types interfaces for the resources

That would mean that the UI would only support APIs and fields that were in Swagger/OpenAPI.

What's the likelihood that there would be a complete API contract for the services?


## Related JIRA

- `Feature` [Design for mocking/testing for AWX Modernization](https://issues.redhat.com/browse/ANSTRAT-845)