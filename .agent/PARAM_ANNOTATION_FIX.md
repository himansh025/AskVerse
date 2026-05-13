# Fixed Parameter Name Resolution Errors

## Problem
When clicking on a question, the application was making 4 API calls but 2 were returning errors:
```json
{
    "success": false,
    "message": "An error occurred",
    "data": null,
    "error": "Name for argument of type [int] not specified, and parameter name information not available via reflection. Ensure that the compiler uses the '-parameters' flag."
}
```

## Root Cause
Spring Data JPA repository methods with parameters need explicit `@Param` annotations when the `-parameters` compiler flag is not enabled. Without these annotations, Spring cannot determine the parameter names at runtime.

## Files Fixed

### 1. AnswerRepository.java
**Issue**: `findByQuestionId` method missing `@Param` annotation

**Fixed:**
```java
Page<Answer> findByQuestionId(@Param("questionId") Long questionId, Pageable pageable);
```

### 2. CommentRepository.java
**Issues**: Both methods missing `@Param` annotations

**Fixed:**
```java
Page<Comment> findByAnswerId(@Param("answerId") Long answerId, Pageable pageable);
Page<Comment> findByParentCommentId(@Param("parentCommentId") Long parentCommentId, Pageable pageable);
```

### 3. QuestionRepository.java (Previously Fixed)
All query methods already have `@Param` annotations:
- `findWithUserAndTags(@Param("ids") Set<Long> ids)`
- `findQuestionsByTags(@Param("tagIds") Set<Long> tagIds, Pageable pageable)`
- `findQuestionsByTagId(@Param("tagId") Long tagId, Pageable pageable)`

## API Calls When Clicking a Question

When you click on a question, the QuestionDetailsPage makes these calls:

1. ✅ `GET /api/v1/questions/{id}` - Get question details
2. ✅ `GET /api/v1/answers/question/{id}` - Get answers for the question
3. ✅ `GET /api/v1/comments/answer/{answerId}` - Get comments (when expanded)
4. ✅ `POST /api/v1/comments` - Post new comment (when submitted)

All should now work without errors!

## Why This Happens

Spring Data JPA uses reflection to determine parameter names. When the Java compiler doesn't include parameter names in the bytecode (which requires the `-parameters` flag), Spring cannot automatically map method parameters to query parameters.

The solution is to explicitly name each parameter using `@Param("paramName")`.

## Prevention

For all future repository methods with parameters:
- Always use `@Param("paramName")` annotation
- Match the annotation name with the actual parameter name
- This ensures compatibility regardless of compiler flags

## Testing

After this fix:
1. Click on any question - should load without errors
2. Expand comments on an answer - should load without errors
3. Post a new answer - should work without errors
4. Post a new comment - should work without errors

All 4 API calls should return status 200 with proper data!
