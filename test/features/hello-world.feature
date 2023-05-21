@hello
Feature: Hello world

    Scenario: Welcome message
        When make a GET request to "/api/v1"
        Then The response status code should be 200
        And The response-text should contain "Hello World!"