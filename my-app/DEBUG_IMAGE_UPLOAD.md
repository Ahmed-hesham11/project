# Supabase Image Upload System - Complete Debugging Guide

## Overview
This system handles the complete flow: Upload → Get URL → Save to DB → Display

## Files Created

### 1. Components/courses/UploadCourseImage.tsx
- **Handles:** File upload to Supabase Storage
- **Steps:**
  - File selection validation
  - Upload to "course-images" bucket
  - Get public URL
  - Return URL via callback
- **Logs Everything:**
  - STEP 1: FILE SELECTION
  - STEP 2: UPLOAD TO SUPABASE STORAGE
  - STEP 3: GET PUBLIC URL
  - STEP 4: CALLBACK EXECUTION

### 2. App/(main)/courses/add/page.tsx
- **Handles:** Course creation form
- **Steps:**
  - Accept title input
  - Accept image URL from UploadCourseImage
  - Validate both fields
  - Insert into "courses" database
  - Display created course with image
- **Logs Everything:**
  - FORM SUBMISSION
  - VALIDATION
  - STEP 3: SAVE TO DATABASE
  - INSERT RESULT
  - COURSE IMAGE IN DB

### 3. Components/courses/CourseImageDisplay.tsx
- **Handles:** Displaying course images with fallback
- **Features:**
  - Shows image from database
  - Falls back to default logo if no image
  - Logs success or failure
  - Safe error handling

### 4. Lib/debug/imageUploadDebug.ts
- **Provides:** Debug checklist and logging utilities
- **Usage:** Import and call `logDebugChecklist()` in console

---

## Complete Debug Flow

### STEP 1: File Selection
```
FILE: File object shown
FILE VALIDATION PASSED: {name, type, size}
PREVIEW GENERATED FROM FILE
```
✅ **Check:** Is file type "image/*"?

### STEP 2: Upload to Supabase Storage
```
UPLOADING FILE: {fileName, bucket, timestamp}
UPLOAD RESPONSE: Full API response
UPLOAD DATA: {path, id, ...}
UPLOAD ERROR: If any
UPLOAD SUCCESSFUL: ✓
UPLOADED FILE PATH: "course-{timestamp}.jpg"
```
✅ **Check:** Is uploadData non-null and error is null?

### STEP 3: Get Public URL
```
GETTING URL FOR PATH: "course-{timestamp}.jpg"
URL RESPONSE: Full API response
URL DATA: {publicUrl: "https://..."}
PUBLIC URL GENERATED: ✓
IMAGE URL: "https://ttfexcskbojumnwknmlc.supabase.co/storage/v1/object/public/..."
URL TYPE: string
URL LENGTH: 150
URL STARTS WITH HTTP: true
URL FORMAT VALID: ✓
```
✅ **Check:** Does URL start with "https://"?

### STEP 4: Callback Execution
```
CALLBACK EXECUTED WITH URL: "https://..."
IMAGE URL RECEIVED IN PARENT: "https://..."
URL TYPE: string
URL LENGTH: 150
URL STARTS WITH HTTP: true
```
✅ **Check:** Is URL passed correctly to parent?

### STEP 5: Form Submission
```
FORM SUBMISSION
SUBMIT BUTTON CLICKED
CURRENT STATE: {title: "...", imageUrl: "https://..."}
VALIDATION PASSED: ✓
```
✅ **Check:** Are both title and imageUrl present?

### STEP 6: Save to Database
```
INSERT DATA: {
  title: "...",
  image: "https://...",
  thumbnail_url: "https://..."
}
TABLE: courses
IMAGE FIELD VALUE: "https://..."
IMAGE FIELD LENGTH: 150
INSERT RESPONSE: Full API response
INSERT DATA: {id, title, image, thumbnail_url, ...}
INSERT ERROR: null
INSERT SUCCESSFUL: ✓
CREATED COURSE: {...}
COURSE ID: "uuid"
COURSE IMAGE IN DB: "https://..."
COURSE THUMBNAIL IN DB: "https://..."
IMAGE SAVED IN DB: ✓
```
✅ **Check:** Are `image` and `thumbnail_url` fields populated in response?

### STEP 7: Display Image
```
COURSE: {id, title, image, thumbnail_url}
COURSE IMAGE: "https://..."
COURSE THUMBNAIL: "https://..."
RESOLVED IMAGE URL: "https://..."
✓ IMAGE FOUND - DISPLAYING: "https://..."
IMAGE LOADED SUCCESSFULLY: "https://..."
```
✅ **Check:** Does image display without 404 error?

---

## Troubleshooting Checklist

### ❌ Images NOT Uploading
1. Check bucket name: Must be "course-images"
2. Check bucket is PUBLIC (RLS disabled in Supabase dashboard)
3. Check file is valid image (type.startsWith("image/"))
4. Check Supabase credentials are correct

**Console Log:** Look for `UPLOAD ERROR: {error.message}`

### ❌ URL is Undefined
1. Check getPublicUrl() is called AFTER upload succeeds
2. Check data.path exists in upload response
3. Check bucket is public
4. Check URL response: `URL DATA: {publicUrl: "..."}`

**Console Log:** Look for `PUBLIC URL DATA:` - if publicUrl is missing, bucket is not public

### ❌ Image NOT Saved in Database
1. Check INSERT DATA has correct field names
2. Check image URL is valid (not empty)
3. Check "courses" table has "image" or "thumbnail_url" column
4. Check database insert error

**Console Log:** Look for `INSERT ERROR:` or empty image in response

### ❌ Image NOT Displaying in UI
1. Paste image URL in new browser tab - does it load?
2. Check Supabase Storage bucket is PUBLIC
3. Check CORS settings if on different domain
4. Check CourseImageDisplay logs for onError events

**Console Log:** Look for `IMAGE FAILED TO LOAD:` errors

---

## How to Use in Your App

### 1. Add a Course with Image
- Navigate to `/courses/add`
- Enter title
- Click "Select Image"
- Image uploads and shows preview
- Click "Create Course"

### 2. Display Course Images
```tsx
import CourseImageDisplay from "@/components/courses/CourseImageDisplay";

export default function ShowCourse({ course }) {
  return (
    <CourseImageDisplay 
      course={course}
      fallback="/images/logo.jpg"
    />
  );
}
```

### 3. View Debug Logs
Open browser console (F12) and:
1. Look for logs prefixed with ✓, ❌, or emoji
2. Follow the numbered steps: STEP 1, STEP 2, etc.
3. Check for error messages

---

## Database Schema

The system expects "courses" table with:
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  -- other fields...
);
```

---

## Supabase Storage Setup

1. Create bucket: "course-images"
2. Make bucket PUBLIC:
   - Storage → course-images → Policies
   - Select "Public" or disable RLS
3. Verify bucket is accessible

---

## Common Success Indicators

✅ **File Selected**
- Console shows: `FILE: {File object}`
- Console shows: `FILE VALIDATION PASSED`
- Console shows: `PREVIEW GENERATED FROM FILE`

✅ **File Uploaded**
- Console shows: `UPLOAD SUCCESSFUL`
- Console shows: `UPLOADED FILE PATH: "course-..."`
- No `UPLOAD ERROR` messages

✅ **URL Generated**
- Console shows: `PUBLIC URL GENERATED`
- Console shows: `IMAGE URL: "https://..."`
- URL starts with "https://"

✅ **Saved to DB**
- Console shows: `INSERT SUCCESSFUL`
- Console shows: `CREATED COURSE: {...}`
- Course image field is not empty

✅ **Displaying**
- Console shows: `IMAGE LOADED SUCCESSFULLY`
- Image displays in browser
- No 404 errors

---

## Testing the System

### Test 1: File Upload
```
1. Open /courses/add
2. Click "📤 Select Image"
3. Choose an image file
4. Check console: Look for IMAGE URL log
5. Verify preview shows
```

### Test 2: Database Save
```
1. After upload, enter title
2. Click "✓ Create Course"
3. Check console: Look for COURSE IMAGE IN DB log
4. Should show URL in database
```

### Test 3: Image Display
```
1. Fetch created course from database
2. Pass to CourseImageDisplay component
3. Check console: Look for IMAGE LOADED SUCCESSFULLY
4. Image should display without errors
```

---

## Need Help?

1. **Open Console:** F12 → Console tab
2. **Check Logs:** Look for ✓, ❌, or 🐛 emojis
3. **Follow Steps:** STEP 1 → STEP 2 → ... → STEP 7
4. **Check Error:** Look for ❌ ERROR messages
5. **Verify Supabase:** Check bucket is public and credentials correct

Every step logs to console for easy debugging!
