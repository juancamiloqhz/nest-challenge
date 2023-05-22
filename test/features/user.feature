@User

Feature: User Module
    Scenario: Sign Up a User
        And make a POST request to "/api/v1/users/sign_up" with:
            | email           | "admin@example.com"   |
            | password        | "password"            |
        Then The response status code should be 201

    Scenario: Sign In a User
        Given I Sign Up a new User
        And make a POST request to "/api/v1/users/sign_in" with:
            | email           | "admin@example.com"   |
            | password        | "password"            |
        Then The response status code should be 200
    
    Scenario: Only ADMIN users can get all users
        Given I Sign Up a new User
        And make a GET request to "/api/v1/users"
        Then The response status code should be 403

    Scenario: Get the current User details
        Given I Sign Up a new User
        And make a GET request to "/api/v1/users/me"
        Then The response status code should be 200

    Scenario: Update the current User details
        Given I Sign Up a new User
        And make a PATCH request to "/api/v1/users" with:
            | firstName       | "newFirstName"           |
            | lastName        | "newLastName"            |
            | email           | "newemail@example.com"   |
        Then The response status code should be 200
    
    Scenario: Update the current User password
        Given I Sign Up a new User
        And make a PATCH request to "/api/v1/users/change_password" with:
            | oldPassword     | "password"           |
            | newPassword     | "newPassword"        |
        Then The response status code should be 200

    Scenario: Only ADMIN users can update other users ROLE
        Given I Sign Up a new User
        And make a PATCH request to "/api/v1/users/change_role" with:
            | role     | "ADMIN"           |
        Then The response status code should be 403

    Scenario: Delete the current User
        Given I Sign Up a new User
        And make a DELETE request to "/api/v1/users"
        Then The response status code should be 200