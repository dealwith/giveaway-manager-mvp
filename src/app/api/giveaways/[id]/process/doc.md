### Process Giveaway Comments

This endpoint is responsible for processing comments on a specific giveaway post. It retrieves the comments from the Instagram Graph API and updates the giveaway in the database with the new comments.

#### Request

- **Method**: POST
- **URL**: `/api/giveaways/[id]/process`
- **Headers**:
  - `Authorization`: Bearer token
- **Body**:
  - `id`: The ID of the giveaway to process

#### Response

- **Status Code**: 200 OK
- **Body**:
  - `success`: Indicates if the operation was successful
  - `error`: Error message if the operation failed
