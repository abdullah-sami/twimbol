# Twimbol Backend — REST API Documentation

> **Base URL:** `https://rafidabdullahsamiweb.pythonanywhere.com`
> **Authentication:** JWT (Bearer Token)
> **API Prefix:** `/user/api/`, `/create/api/`, `/api/`, `/api/notifications/`, `/api/parent/`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Registration & Profile](#2-user-registration--profile)
3. [Password Management](#3-password-management)
4. [Posts](#4-posts)
5. [Reels](#5-reels)
6. [Videos](#6-videos)
7. [Post Interactions](#7-post-interactions)
8. [Comments](#8-comments)
9. [Creator Content Management](#9-creator-content-management)
10. [Creator Analytics](#10-creator-analytics)
11. [Creator Application](#11-creator-application)
12. [Notifications](#12-notifications)
13. [Parental Controls](#13-parental-controls)
14. [Search](#14-search)
15. [Follow & Block](#15-follow--block)
16. [Data Models](#16-data-models)
17. [Error Reference](#17-error-reference)

---

## 1. Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

---

### `POST /user/login/`

Obtain JWT access and refresh tokens.

**Auth required:** No

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response `200 OK`:**
```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### `POST /api/token/refresh`

Refresh an expired access token.

**Auth required:** No

**Request Body:**
```json
{
  "refresh": "<jwt_refresh_token>"
}
```

**Response `200 OK`:**
```json
{
  "access": "<new_jwt_access_token>"
}
```

---

### `POST /user/logout/`

Log out the current user.

**Auth required:** Yes

**Response:** Redirect to login page.

---

## 2. User Registration & Profile

---

### `POST /user/api/register/`

Register a new user account.

**Auth required:** No

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "birthday": "1995-06-15"
}
```

**Response `201 Created`:**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "email_sent": true
}
```

**Response `400 Bad Request`:**
```json
{
  "username": ["Username already exists."],
  "email": ["Email already exists."]
}
```

> **Note:** A welcome email is sent automatically on successful registration. The `birthday` field defaults to `2000-01-01` if not provided. All new users are assigned to the `visitor` group.

---

### `GET /user/api/profile/`

Get the authenticated user's own profile.

**Auth required:** Yes

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "profile_pic": "/media/img/profile_pics/john.jpg",
      "user_phone": "+1234567890",
      "user_address": "New York, USA",
      "user_type": "regular",
      "user_social_fb": "facebook.com/john",
      "user_social_twt": "twitter.com/john",
      "user_social_yt": "youtube.com/john",
      "user_status": true,
      "user_banned": false,
      "user_group": ["visitor"]
    },
    "followed_by_user": false,
    "blocked_by_user": false
  }
]
```

---

### `PATCH /user/api/update/{id}/`

Update the authenticated user's profile.

**Auth required:** Yes
**Content-Type:** `multipart/form-data`

**Request Fields (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| `first_name` | string | User's first name |
| `last_name` | string | User's last name |
| `profile_pic` | file | Profile picture image |
| `user_phone` | string | Phone number |
| `user_address` | string | Address |
| `user_social_fb` | string | Facebook profile URL |
| `user_social_twt` | string | Twitter/X profile URL |
| `user_social_yt` | string | YouTube channel URL |

**Response `200 OK`:**
```json
{
  "userId": 1,
  "first_name": "John",
  "last_name": "Doe",
  "profile_pic": "/media/img/profile_pics/john.jpg",
  "user_phone": "+1234567890",
  "user_address": "New York, USA",
  "user_social_fb": "facebook.com/john",
  "user_social_twt": "twitter.com/john",
  "user_social_yt": "youtube.com/john"
}
```

---

### `POST /user/api/deactivate/{id}/`

Deactivate the authenticated user's account (sets `user_status` to `false`).

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "detail": "Profile deactivated successfully"
}
```

---

### `POST /user/delete/`

Permanently delete the authenticated user's account.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "detail": "Account deleted successfully."
}
```

---

## 3. Password Management

---

### `PUT /user/change-password/`

Change password for authenticated user.

**Auth required:** Yes

**Request Body:**
```json
{
  "old_password": "currentpassword",
  "new_password": "newpassword123"
}
```

**Response `200 OK`:**
```json
{
  "detail": "Password updated successfully"
}
```

**Response `400 Bad Request`:**
```json
{
  "old_password": ["Wrong password."]
}
```

> **Note:** A password change confirmation email is sent automatically.

---

### `POST /user/forgot-password/`

Request a 6-digit password reset code sent to email.

**Auth required:** No

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response `200 OK`:**
```json
{
  "detail": "Password reset code sent to email."
}
```

**Response `400 Bad Request`:**
```json
{
  "email": ["No account with this email."]
}
```

---

### `POST /user/reset-password-confirm/`

Reset password using the 6-digit code received via email.

**Auth required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "482910",
  "new_password": "newpassword123"
}
```

**Response `200 OK`:**
```json
{
  "detail": "Password reset successful."
}
```

**Response `400 Bad Request`:**
```json
{
  "detail": "Invalid or expired reset code."
}
```

> **Note:** Reset codes expire after **10 minutes**. All codes for the user are deleted after a successful reset.

---

## 4. Posts

---

### `GET /api/posts/`

List all text/image posts (paginated). Excludes posts hidden, reported, or from blocked users.

**Auth required:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by title or description |
| `ordering` | string | Order by `post_type` or `created_at` |
| `page` | integer | Page number |
| `page_size` | integer | Results per page (max 100, default 10) |

**Response `200 OK`:**
```json
{
  "count": 50,
  "page_size": 10,
  "page": 1,
  "total_pages": 5,
  "next": "https://.../api/posts/?page=2",
  "previous": null,
  "results": [
    {
      "id": 42,
      "post_type": "post",
      "post_title": "My First Post",
      "post_description": "Hello world!",
      "created_at": "2025-01-15T10:30:00Z",
      "like_count": 24,
      "post_banner": "/media/img/posts/banner.jpg",
      "created_by": 1,
      "user_profile": { "..." : "..." },
      "username": { "username": "john_doe" },
      "comments": [{ "comment": "Great post!" }],
      "liked_by_user": false,
      "hidden_by_user": false,
      "reported_by_user": false
    }
  ]
}
```

---

### `POST /api/posts/`

Create a new text/image post.

**Auth required:** Yes
**Content-Type:** `multipart/form-data`

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `post_title` | string | Yes | Post title |
| `post_description` | string | No | Post body text |
| `post_banner` | file | No | Banner image |

**Response `201 Created`:** Returns the created post object.

---

### `GET /api/posts/{id}/`

Get a single post by ID.

**Auth required:** Optional

**Response `200 OK`:** Returns a single post object.

---

## 5. Reels

> **Upload flow change:** Reels are now uploaded directly to Cloudinary from the **frontend**. The backend only receives and stores the resulting Cloudinary URLs. Do not send video files to the backend.

---

### `GET /api/reels/`

List all reels (paginated). Excludes hidden, reported, or blocked-user reels.

**Auth required:** No

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `page_size` | integer | Results per page (max 100, default 30) |

**Response `200 OK`:**
```json
{
  "count": 120,
  "page_size": 30,
  "page": 1,
  "total_pages": 4,
  "next": "https://.../api/reels/?page=2",
  "previous": null,
  "results": [
    {
      "title": "My Cool Reel",
      "video_url": "https://res.cloudinary.com/.../reel.mp4",
      "created_at": "2025-01-15T10:30:00Z",
      "post": 88,
      "reel_description": "Check this out!",
      "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
      "view_count": 1500,
      "like_count": 85,
      "comments": 12,
      "created_by": 1,
      "user_profile": { "..." : "..." },
      "liked_by_user": false,
      "hidden_by_user": false,
      "reported_by_user": false
    }
  ]
}
```

---

### `POST /create/api/reel/`

Save a new reel record after the frontend has uploaded the video to Cloudinary.

**Auth required:** Yes (Creator or Admin role required)
**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video_url` | string | **Yes** | Cloudinary secure URL of the uploaded video |
| `thumbnail_url` | string | No | Cloudinary URL of the thumbnail image |
| `title` | string | No | Reel title |
| `reel_description` | string | No | Reel description |

```json
{
  "title": "My Cool Reel",
  "video_url": "https://res.cloudinary.com/.../reel.mp4",
  "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
  "reel_description": "Check this out!"
}
```

**Response `201 Created`:**
```json
{
  "title": "My Cool Reel",
  "video_url": "https://res.cloudinary.com/.../reel.mp4",
  "reel_description": "Check this out!",
  "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
  "view_count": 0,
  "like_count": 0,
  "created_by": 1,
  "post": 88,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Response `400 Bad Request`:**
```json
{
  "detail": "video_url is required. Upload the video to Cloudinary from the frontend first."
}
```

**Response `403 Forbidden`:**
```json
{
  "detail": "Only creators and admins can upload reels."
}
```

> **Note:** A `Post` record (type `reel`) and a notification are created automatically on success.

---

### `GET /create/api/reel/{id}/`

Retrieve a single reel record.

**Auth required:** Yes

---

### `PUT /create/api/reel/{id}/` · `PATCH /create/api/reel/{id}/`

Update a reel. Only the original creator or an admin may update.

**Auth required:** Yes

---

### `DELETE /create/api/reel/{id}/`

Delete a reel and its parent post. Only the original creator or an admin may delete.

**Auth required:** Yes

**Response `204 No Content`**

---

## 6. Videos

> **Upload flow change:** Videos are now uploaded directly to Cloudinary from the **frontend**. The backend only receives and stores the resulting Cloudinary URLs. Do not send video files to the backend.

---

### `POST /create/api/video/`

Save a new video record after the frontend has uploaded the video to Cloudinary.

**Auth required:** Yes (Creator or Admin role required)
**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video_url` | string | **Yes** | Cloudinary secure URL of the uploaded video |
| `thumbnail_url` | string | No | Cloudinary URL of the thumbnail image |
| `title` | string | No | Video title |
| `video_description` | string | No | Video description |

```json
{
  "title": "My Long-Form Video",
  "video_url": "https://res.cloudinary.com/.../video.mp4",
  "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
  "video_description": "Full walkthrough of my project."
}
```

**Response `201 Created`:**
```json
{
  "post": 91,
  "video_url": "https://res.cloudinary.com/.../video.mp4",
  "title": "My Long-Form Video",
  "video_description": "Full walkthrough of my project.",
  "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
  "created_by": 1,
  "created_at": "2025-01-15T11:00:00Z",
  "user_profile": { "..." : "..." }
}
```

**Response `400 Bad Request`:**
```json
{
  "detail": "video_url is required. Upload the video to Cloudinary from the frontend first."
}
```

**Response `403 Forbidden`:**
```json
{
  "detail": "Only creators and admins can upload videos."
}
```

---

### `GET /create/api/video/` · `GET /create/api/video/{id}/`

List all videos or retrieve a single video record.

**Auth required:** Yes

---

### `PUT /create/api/video/{id}/` · `PATCH /create/api/video/{id}/`

Update a video. Only the original creator or an admin may update.

**Auth required:** Yes

---

### `DELETE /create/api/video/{id}/`

Delete a video and its parent post. Only the original creator or an admin may delete.

**Auth required:** Yes

**Response `204 No Content`**

---

## 7. Post Interactions

---

### `GET /api/post_likes/{post_id}/`

List all likes on a post.

**Auth required:** No

**Response `200 OK`:** Returns a list of like objects.

---

### `POST /api/post_likes/{post_id}/`

Like a post.

**Auth required:** Yes

**Response `201 Created`:** Returns the created like object.

**Response `400 Bad Request`:**
```json
{
  "detail": "You already liked this post."
}
```

---

### `DELETE /api/post_likes/{post_id}/`

Unlike a post.

**Auth required:** Yes

**Response `204 No Content`**

---

### `POST /api/post_hide/{post_id}/`

Hide a post from your feed.

**Auth required:** Yes

**Response `201 Created`**

---

### `DELETE /api/post_hide/{post_id}/`

Unhide a post.

**Auth required:** Yes

**Response `204 No Content`**

---

### `POST /api/post_report/{post_id}/`

Report a post.

**Auth required:** Yes

**Request Body:**
```json
{
  "reason": "spam",
  "description": "This post is spam."
}
```

**Reason choices:** `spam`, `abuse`, `false`, `hate`, `nsfw`, `other`

**Response `201 Created`**

---

### `DELETE /api/post_report/{post_id}/`

Remove your report on a post.

**Auth required:** Yes

**Response `204 No Content`**

---

## 8. Comments

---

### `GET /api/posts/{post_id}/comments/`

List all comments on a post (paginated).

**Auth required:** No

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `page_size` | integer | Results per page (max 30, default 10) |

**Response `200 OK`:**
```json
{
  "count": 5,
  "page_size": 10,
  "page": 1,
  "total_pages": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "post": 42,
      "comment": "Great content!",
      "created_by": {
        "id": 3,
        "user": { "username": "jane_doe", "profile_pic": "..." }
      },
      "created_at": "2025-01-16T09:00:00Z"
    }
  ]
}
```

---

### `POST /api/posts/{post_id}/comments/`

Add a comment to a post.

**Auth required:** Yes

**Request Body:**
```json
{
  "comment": "This is amazing!"
}
```

**Response `201 Created`:** Returns the created comment object.

---

### `DELETE /api/posts/{post_id}/comments/`

Delete your comment on a post.

**Auth required:** Yes

**Request Body:**
```json
{
  "comment_id": 12
}
```

**Response `204 No Content`**

---

## 9. Creator Content Management

These endpoints replace the previous template-rendered dashboard. All routes are REST API only under `/create/api/`.

---

### `POST /create/api/post/`

Create a new text/image post as a creator.

**Auth required:** Yes (Creator or Admin role required)
**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `post_type` | string | Yes | `post`, `reel`, `video`, `youtube_video` |
| `post_title` | string | Yes | Post title |
| `post_description` | string | No | Post description |
| `post_banner` | string | No | URL of banner image (externally hosted) |

**Response `201 Created`:** Returns the created post object.

---

### `GET /create/api/post/`

List the authenticated creator's own posts.

**Auth required:** Yes

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `page_size` | integer | Results per page (max 100, default 20) |

**Response `200 OK`:** Paginated list of the creator's posts.

---

### `GET /create/api/post/{id}/`

Retrieve a specific post.

**Auth required:** Yes

---

### `PUT /create/api/post/{id}/` · `PATCH /create/api/post/{id}/`

Update a post. Only the original creator or admin may update.

**Auth required:** Yes

---

### `DELETE /create/api/post/{id}/`

Delete a post. Only the original creator or admin may delete.

**Auth required:** Yes

**Response `204 No Content`**

---

### `GET /create/api/manage-contents/`

List all of the authenticated creator's posts with aggregate totals.

**Auth required:** Yes (Creator or Admin role required)

**Response `200 OK`:**
```json
{
  "total_posts": 18,
  "total_likes": 420,
  "posts": [ { "..." : "..." } ]
}
```

---

### `DELETE /create/api/manage-contents/{post_id}/`

Delete a specific post from the creator's content library.

**Auth required:** Yes

**Response `204 No Content`:**
```json
{
  "detail": "Post deleted successfully."
}
```

---

### `GET /create/api/creator/{user_id}/posts/`

Return all posts published by a specific creator (public).

**Auth required:** No

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `post_type` | string | Filter by `post`, `reel`, or `video` |
| `page` | integer | Page number |
| `page_size` | integer | Results per page (max 100, default 20) |

**Response `200 OK`:** Paginated list of the creator's posts.

---

### `GET /create/api/creator/my-posts/`

Return all posts published by the currently authenticated creator.

**Auth required:** Yes

**Query Parameters:** Same as above (`post_type`, `page`, `page_size`)

**Response `200 OK`:** Paginated list of the authenticated creator's posts.

---

## 10. Creator Analytics

Returns aggregated performance statistics for a creator. All four metrics are resolved in **4 database queries** regardless of post volume — no per-post loops.

---

### `GET /create/api/analytics/me/`

Return stats for the currently authenticated creator.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "user_id": 12,
  "username": "jane_doe",
  "total_posts": 42,
  "total_likes": 1380,
  "total_views": 29500,
  "total_followers": 834
}
```

---

### `GET /create/api/analytics/{user_id}/`

Return stats for any creator by user ID (public).

**Auth required:** No

**Response `200 OK`:** Same shape as above.

**Response `404 Not Found`:**
```json
{
  "detail": "Not found."
}
```

**Field descriptions:**

| Field | Source | Description |
|-------|--------|-------------|
| `total_posts` | `Post` table | All posts of any type created by this user |
| `total_likes` | `Post_Stat_like` table | Total likes across all the creator's posts |
| `total_views` | `ReelCloudinary` + `VideoCloudinary` | Sum of `view_count` stored on reel and video records |
| `total_followers` | `Follower` table | Number of users following this creator |

---

## 11. Creator Application

---

### `POST /create/api/apply-for-creator/`

Submit a creator application.

**Auth required:** Yes

**Response `201 Created`:**
```json
{
  "detail": "Application submitted successfully.",
  "data": {
    "id": 5,
    "user": 1,
    "application_status": "0",
    "created_at": "2025-01-10T08:00:00Z"
  }
}
```

**Response `400 Bad Request`:**
```json
{
  "detail": "You already have a pending application."
}
```

---

### `GET /user/api/creator-application/`

Check the current user's creator application status.

**Auth required:** Yes

**Response `200 OK`:**
```json
[
  {
    "id": 5,
    "user": 1,
    "application_status": "0",
    "created_at": "2025-01-10T08:00:00Z"
  }
]
```

**Application Status Values:**

| Value | Meaning |
|-------|---------|
| `0` | Pending review |
| `1` | Approved |

---

### `GET /create/api/apply-for-creator/by-user/{user_id}/`

Get all applications by a specific user. Only the user themselves or an admin may access this.

**Auth required:** Yes

**Response `200 OK`:** List of application objects.

**Response `403 Forbidden`:**
```json
{
  "detail": "You do not have permission to view this user's applications."
}
```

---

## 12. Notifications

---

### `GET /api/notifications/`

List all notifications for the authenticated user.

**Auth required:** Yes

**Response `200 OK`:**
```json
[
  {
    "id": 10,
    "message": "Your reel 'Dance Move' was published!",
    "created_at": "2025-01-15T10:00:00Z",
    "is_read": false,
    "page": "reel",
    "page_item_id": 88,
    "notification_type": "general"
  }
]
```

---

### `POST /api/notifications/{id}/mark-read/`

Mark a single notification as read.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "status": "notification marked as read"
}
```

---

### `POST /api/notifications/mark-all-read/`

Mark all notifications as read.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "status": "3 notifications marked as read"
}
```

---

### `GET /api/notifications/preferences/`

Get the user's notification preferences.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "user": 1,
  "all_notifications": true,
  "email_notifications": true,
  "push_notifications": true,
  "follow_notifications": true,
  "likes_notifications": true,
  "comments_notifications": false,
  "new_events_notifications": true,
  "event_reminders_notifications": true
}
```

---

### `PATCH /api/notifications/preferences/`

Update notification preferences.

**Auth required:** Yes

**Request Body (all fields optional):**
```json
{
  "all_notifications": true,
  "email_notifications": false,
  "likes_notifications": true,
  "comments_notifications": true
}
```

> **Note:** If `all_notifications` is set to `false`, all other notification flags are automatically set to `false`.

**Response `200 OK`:** Returns the updated preferences object.

---

## 13. Parental Controls

---

### `POST /api/parent/request-otp/`

Send a 6-digit OTP to a parent's email to initiate account linking.

**Auth required:** No

**Request Body:**
```json
{
  "child_id": 5,
  "parent_email": "parent@example.com"
}
```

**Response `200 OK`:**
```json
{
  "message": "OTP sent to parent email."
}
```

---

### `POST /api/parent/verify-otp/`

Verify the OTP and complete parent account linking.

**Auth required:** No

**Request Body:**
```json
{
  "child_id": 5,
  "parent_email": "parent@example.com",
  "otp_code": "483920"
}
```

**Response `200 OK`:**
```json
{
  "message": "OTP verified successfully."
}
```

---

## 14. Search

---

### `GET /api/search/?query={query}`

Search for reels by title, description, or creator username. Results are ranked by relevance and trending score.

**Auth required:** No

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term |

**Response `200 OK`:**
```json
{
  "query": "dance",
  "results": [
    {
      "id": 88,
      "post_title": "Epic Dance Reel",
      "post_type": "reel",
      "post_description": "Check out my moves",
      "created_by": "john_doe",
      "created_at": "2025-01-14T12:00:00Z",
      "priority": 1,
      "trending_score": 3200,
      "reels_data": { "..." : "..." },
      "user_profile": { "..." : "..." }
    }
  ]
}
```

**Priority Ranking Logic:**

| Priority | Condition |
|----------|-----------|
| 1 | Post title matches query |
| 2 | Post type is `reel` |
| 3 | Creator username matches query |
| 4 | Description matches query |

---

## 15. Follow & Block

---

### `POST /user/profile/follow/`

Follow or unfollow a user (toggles the follow state).

**Auth required:** Yes

**Request Body:**
```json
{
  "user_id": 7
}
```

**Response `200 OK`:**
```json
{
  "detail": "Successfully followed jane_doe."
}
```

---

### `POST /user/profile/block/`

Block or unblock a user (toggles the block state).

**Auth required:** Yes

**Request Body:**
```json
{
  "user_id": 7
}
```

**Response `200 OK`:**
```json
{
  "detail": "Successfully blocked jane_doe."
}
```

---

## 16. Data Models

### User Roles (Groups)

| Group | Description |
|-------|-------------|
| `visitor` | Default role for all registered users |
| `creator` | Approved content creators — can upload reels and videos |
| `admin` | Platform administrators |

### Post Types

| Type | Description |
|------|-------------|
| `post` | Standard text/image post |
| `reel` | Short video — URL received from frontend Cloudinary upload |
| `video` | Long-form video — URL received from frontend Cloudinary upload |
| `youtube_video` | YouTube video (linked by ID) |
| `youtube_reel` | YouTube short (linked by ID) |

### Notification Types

| Type | Trigger |
|------|---------|
| `general` | Default / system messages |
| `follow` | Someone followed you |
| `like` | Someone liked your post |
| `comment` | Someone commented on your post |
| `new_event` | A new event was created |
| `event_reminder` | Upcoming event reminder |

---

## 17. Error Reference

| Status Code | Meaning |
|-------------|---------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `204 No Content` | Resource deleted successfully |
| `400 Bad Request` | Validation error or bad input |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource does not exist |
| `500 Internal Server Error` | Server-side error (check logs) |

### Common Error Shapes

**Validation Error:**
```json
{
  "field_name": ["Error message here."]
}
```

**Permission / Logic Error:**
```json
{
  "detail": "Human-readable error message."
}
```

---

## Pages Reference

| Page | Primary Endpoints Used |
|------|----------------------|
| Landing | — |
| Login | `POST /user/login/` |
| Signup | `POST /user/api/register/` |
| Forgot Password | `POST /user/forgot-password/` → `POST /user/reset-password-confirm/` |
| User Profile | `GET /user/api/profile/` |
| Edit Profile | `PATCH /user/api/update/{id}/` |
| Account Settings | `PUT /user/change-password/`, `POST /user/api/deactivate/`, `POST /user/delete/` |
| Notification Settings | `GET/PATCH /api/notifications/preferences/` |
| Parental Controls | `POST /api/parent/request-otp/`, `POST /api/parent/verify-otp/` |
| Home (Reels) | `GET /api/reels/` |
| Reels Watch Page | `GET /api/reels/`, `POST /api/post_likes/{id}/`, `POST /api/posts/{id}/comments/` |
| Posts | `GET /api/posts/` |
| Read Post | `GET /api/posts/{id}/`, `POST /api/post_likes/{id}/`, `GET/POST /api/posts/{id}/comments/` |
| Creator Dashboard | `GET /create/api/manage-contents/`, `GET /create/api/analytics/me/` |
| Upload Reel | `POST /create/api/reel/` (after Cloudinary upload from frontend) |
| Upload Video | `POST /create/api/video/` (after Cloudinary upload from frontend) |
| Create Post | `POST /create/api/post/` |
| My Posts | `GET /create/api/creator/my-posts/` |
| Creator Public Profile | `GET /create/api/creator/{user_id}/posts/`, `GET /create/api/analytics/{user_id}/` |
| Apply for Creator | `POST /create/api/apply-for-creator/` |
