@Post

Feature: Post Module

    Scenario: Create a Post
        Given I Sign Up a new User
        Given I Create a new Post
        Then the response status code should be 201

    Scenario: Get a Post by Id
        Given I Sign Up a new User
        Given I Create a new Post
        And make a GET request to GET a POST by Id to "/api/v1/posts"
        Then the response status code should be 200
    
    Scenario: Get all PUBLISHED Posts
        Given I Sign Up a new User
        And make a GET request to "/api/v1/posts"
        Then the response status code should be 200

    Scenario: Update a Post
        Given I Sign Up a new User
        Given I Create a new Post
        And make a PATCH request to UPDATE a Post to "/api/v1/posts" with:
            | title       | "newTitle"           |
            | content     | "newContent"         |
            | status      | "PUBLISHED"          |
        Then the response status code should be 200

    Scenario: Delete a Post
        Given I Sign Up a new User
        Given I Create a new Post
        And make a DELETE request to DELETE a Post to "/api/v1/posts":
        Then the response status code should be 200