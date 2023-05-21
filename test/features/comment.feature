@Comment

Feature: Post Module

    Scenario: Create a Comment
        Given I Sign Up a new User
        Given I Create a new Post
        Given I Create a new Comment
        Then the response status code should be 201
    
    Scenario: Get all COMMENTS for a PUBLISHED Post
        Given I Sign Up a new User
        Given I Create a new Post
        Given I Create a new Comment
        And make a GET request to GET all COMMENTS for a POST Id to "/api/v1/comments"
        Then the response status code should be 200

    Scenario: Update a comment
        Given I Sign Up a new User
        Given I Create a new Post
        Given I Create a new Comment
        And make a PATCH request to UPDATE a Comment to "/api/v1/comments" with:
            | content     | "newContent"         |
        Then the response status code should be 200

    Scenario: Delete a Comment
        Given I Sign Up a new User
        Given I Create a new Post
        Given I Create a new Comment
        And make a DELETE request to DELETE a Comment to "/api/v1/comments":
        Then the response status code should be 200